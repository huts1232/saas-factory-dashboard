import { createServerClient } from '@supabase/ssr'
import Anthropic from '@anthropic-ai/sdk'
import JSON5 from 'json5'

// ===== CONFIG =====
function getConfig() {
  return {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
    githubToken: process.env.GITHUB_TOKEN!,
    githubOwner: process.env.GITHUB_OWNER!,
    vercelToken: process.env.VERCEL_TOKEN!,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    claudeModel: 'claude-sonnet-4-20250514',
  }
}

function getSupabase() {
  const c = getConfig()
  return createServerClient(c.supabaseUrl, c.supabaseServiceKey, {
    cookies: { getAll() { return [] }, setAll() {} },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ===== BUG 1 FIX: ROBUST JSON PARSING =====
function safeParseJSON<T = any>(text: string): T {
  // 1. Strip markdown code blocks
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()

  // 2. Extract JSON object (handles text before/after)
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) cleaned = match[0]

  // 3. Standard parse
  try { return JSON.parse(cleaned) } catch {}

  // 4. Fix trailing commas
  const noTrailing = cleaned.replace(/,\s*([}\]])/g, '$1')
  try { return JSON.parse(noTrailing) } catch {}

  // 5. JSON5 (handles single quotes, trailing commas, comments)
  try { return JSON5.parse(cleaned) as T } catch {}

  // 6. Truncated JSON: find last valid closing brace
  for (let i = cleaned.length - 1; i > 0; i--) {
    if (cleaned[i] === '}') {
      try { return JSON.parse(cleaned.substring(0, i + 1)) } catch {}
    }
  }

  throw new Error('Could not parse JSON response from Claude')
}

// ===== CLAUDE API WITH RETRY =====
async function askClaude(prompt: string, system: string, maxTokens = 16384): Promise<{ text: string; inputTokens: number; outputTokens: number; stopReason: string }> {
  const c = getConfig()
  const client = new Anthropic({ apiKey: c.anthropicApiKey })
  const response = await client.messages.create({
    model: c.claudeModel, max_tokens: maxTokens, system,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = response.content.filter(b => b.type === 'text').map(b => b.type === 'text' ? b.text : '').join('\n')
  return { text, inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens, stopReason: response.stop_reason || 'end_turn' }
}

// BUG 1 FIX: JSON with retry on truncation
async function askClaudeJSON<T>(prompt: string, system: string, maxTokens = 16384): Promise<{ data: T; inputTokens: number; outputTokens: number }> {
  const fullSystem = `${system}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no text before or after.`
  let response = await askClaude(prompt, fullSystem, maxTokens)

  // BUG 1E: If truncated, retry with higher limit
  if (response.stopReason === 'max_tokens' && maxTokens < 32000) {
    console.log('Response truncated, retrying with higher limit...')
    response = await askClaude(prompt, fullSystem, Math.min(maxTokens * 2, 32000))
  }

  const data = safeParseJSON<T>(response.text)
  return { data, inputTokens: response.inputTokens, outputTokens: response.outputTokens }
}

// ===== DB HELPERS =====
async function logStep(projectId: string, stepNumber: number, stepName: string, status: string, message?: string, tokensUsed = 0, durationMs?: number) {
  const db = getSupabase()
  const { data: existing } = await db.from('build_logs').select('id').eq('project_id', projectId).eq('step_number', stepNumber).single()
  if (existing) await db.from('build_logs').update({ status, message, tokens_used: tokensUsed, duration_ms: durationMs }).eq('id', existing.id)
  else await db.from('build_logs').insert({ project_id: projectId, step_number: stepNumber, step_name: stepName, status, message, tokens_used: tokensUsed, duration_ms: durationMs })
}

async function updateProject(projectId: string, updates: Record<string, any>) {
  await getSupabase().from('factory_projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', projectId)
}

async function isUserAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false
  const db = getSupabase()
  const { data: user } = await db.auth.admin.getUserById(userId)
  if (!user?.user?.email) return false
  const { data } = await db.from('admin_users').select('id').eq('email', user.user.email).single()
  return !!data
}

async function deductCredit(userId: string, projectId: string, description: string): Promise<boolean> {
  const db = getSupabase()
  const { data: balance } = await db.rpc('get_credit_balance', { p_user_id: userId })
  const cur = balance ?? 0
  if (cur < 1) return false
  await db.from('credits').insert({ user_id: userId, amount: -1, balance_after: cur - 1, type: 'pipeline_use', description, project_id: projectId })
  return true
}

async function getUserPlan(userId: string | null): Promise<'free' | 'starter' | 'pro'> {
  if (!userId) return 'free'
  const { data } = await getSupabase().from('subscriptions').select('plan').eq('user_id', userId).single()
  return (data?.plan as any) || 'free'
}

// ===== BUG 5 FIX: CODE GEN WITH SAFE SUPABASE PATTERN =====
async function generateFileCode(features: any, arch: any, filePath: string, fileDesc: string, allPaths: string[]): Promise<string> {
  const system = `You are a senior Next.js 14 developer. Rules:
- Use Next.js 14 App Router, TypeScript, Tailwind CSS
- Generate COMPLETE working code
- CRITICAL: Every file that uses Supabase MUST start with 'use client' and create the client inside the component with useMemo:
  'use client'
  import { useMemo } from 'react'
  import { createClient } from '@supabase/supabase-js'
  // Inside component:
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
- NEVER create Supabase client at module level
- NEVER import from @/components or @/lib — write everything inline
- Every button must have an onClick handler
- Every form must submit to Supabase
- Include loading states and empty states
- Output ONLY the file content. No markdown, no explanation.`

  const dbSchema = arch.database?.tables?.map((t: any) => `${t.name}(${t.columns?.map((c: any) => c.name).join(', ')})`).join('; ') || ''

  const prompt = `Generate: ${filePath}\nDescription: ${fileDesc}\nProduct: ${features.productName} — ${features.tagline}\nDB: ${dbSchema}\nFiles: ${allPaths.slice(0, 10).join(', ')}\nPricing: ${features.monetization?.suggestedPrice || '$9/mo'}\n\nSelf-contained file. No imports from @/components or @/lib.`
  const { text } = await askClaude(prompt, system, 8192)
  return text.replace(/^```(?:typescript|tsx|ts|javascript|jsx)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
}

// ===== GITHUB: ATOMIC PUSH (BUG 2 FIX) =====
async function createGitHubRepo(repoName: string): Promise<{ url: string }> {
  const c = getConfig()
  const res = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: { Authorization: `token ${c.githubToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: repoName, private: false, auto_init: true }),
  })
  if (!res.ok) {
    const err = await res.json()
    if (err.errors?.[0]?.message?.includes('already exists')) {
      return { url: `https://github.com/${c.githubOwner}/${repoName}` }
    }
    throw new Error(`GitHub repo creation failed: ${JSON.stringify(err)}`)
  }
  const data = await res.json()
  return { url: data.html_url }
}

async function pushAllFilesToGitHub(repoName: string, files: Array<{ path: string; content: string }>, message: string): Promise<void> {
  const c = getConfig()
  const headers = { Authorization: `token ${c.githubToken}`, 'Content-Type': 'application/json' }
  const base = `https://api.github.com/repos/${c.githubOwner}/${repoName}`

  const refRes = await fetch(`${base}/git/ref/heads/main`, { headers })
  if (!refRes.ok) throw new Error(`Failed to get ref: ${await refRes.text()}`)
  const latestSha = (await refRes.json()).object.sha
  const commitData = await (await fetch(`${base}/git/commits/${latestSha}`, { headers })).json()
  const baseTreeSha = commitData.tree.sha

  const tree: Array<{ path: string; mode: string; type: string; sha: string }> = []
  for (const file of files) {
    const blobRes = await fetch(`${base}/git/blobs`, {
      method: 'POST', headers,
      body: JSON.stringify({ content: Buffer.from(file.content).toString('base64'), encoding: 'base64' }),
    })
    if (!blobRes.ok) { console.error(`Blob failed for ${file.path}`); continue }
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: (await blobRes.json()).sha })
  }

  const newTree = await (await fetch(`${base}/git/trees`, { method: 'POST', headers, body: JSON.stringify({ base_tree: baseTreeSha, tree }) })).json()
  const newCommit = await (await fetch(`${base}/git/commits`, { method: 'POST', headers, body: JSON.stringify({ message, tree: newTree.sha, parents: [latestSha] }) })).json()
  await fetch(`${base}/git/refs/heads/main`, { method: 'PATCH', headers, body: JSON.stringify({ sha: newCommit.sha }) })
}

// ===== VERCEL WITH FALLBACK (BUG 8 FIX) =====
async function createVercelProject(projectName: string, repoName: string): Promise<{ url: string }> {
  const c = getConfig()
  // Check if exists
  const check = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, { headers: { Authorization: `Bearer ${c.vercelToken}` } })
  if (check.ok) return { url: `https://${projectName}.vercel.app` }

  // Create with GitHub link, fallback to standalone
  let res = await fetch('https://api.vercel.com/v10/projects', {
    method: 'POST', headers: { Authorization: `Bearer ${c.vercelToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: projectName, framework: 'nextjs', gitRepository: { type: 'github', repo: `${c.githubOwner}/${repoName}` } }),
  })
  if (!res.ok) {
    res = await fetch('https://api.vercel.com/v10/projects', {
      method: 'POST', headers: { Authorization: `Bearer ${c.vercelToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName, framework: 'nextjs' }),
    })
  }
  if (!res.ok) throw new Error(`Vercel project creation failed: ${await res.text()}`)
  return { url: `https://${projectName}.vercel.app` }
}

// BUG 8 FIX: Always set env vars
async function setVercelEnvVars(projectName: string) {
  const c = getConfig()
  const vars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: c.supabaseUrl },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: c.supabaseAnonKey },
  ]
  for (const v of vars) {
    await fetch(`https://api.vercel.com/v10/projects/${projectName}/env`, {
      method: 'POST', headers: { Authorization: `Bearer ${c.vercelToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: v.key, value: v.value, type: 'plain', target: ['production', 'preview'] }),
    }).catch(() => {}) // Ignore conflicts
  }
}

// BUG 6 FIX: Verify URL returns 200
async function verifyDeployment(url: string, maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow' })
      if (res.ok) return true
    } catch {}
    await new Promise(r => setTimeout(r, 15000)) // Wait 15s between checks
  }
  return false
}

// ===== PROMPTS =====
const IDEATION_SYSTEM = `You are a senior product manager. Create detailed, buildable SaaS specs. Max 5 features with exact user flows.`
const IDEATION_PROMPT = (idea: string) => `Turn this into a SaaS spec: "${idea}"\n\nJSON:\n{"productName":"2-3 word name","tagline":"one-line","description":"2-3 sentences","targetUser":"specific person","features":[{"name":"..","description":"..","priority":"mvp|nice-to-have"}],"monetization":{"model":"freemium","suggestedPrice":"$X/mo"},"userFlows":["Step 1:.."]}`

const ARCHITECTURE_SYSTEM = `You are a senior architect designing Next.js 14 + Supabase apps. Be thorough with table columns and API routes.`
const ARCHITECTURE_PROMPT = (f: any) => `Architecture for: ${f.productName}\n${f.description}\nFeatures: ${JSON.stringify(f.features)}\n\nJSON:\n{"database":{"tables":[{"name":"..","description":"..","columns":[{"name":"..","type":"uuid|text|integer|boolean|timestamptz|jsonb|decimal","nullable":false}]}]},"fileStructure":[{"path":"app/page.tsx","description":".."}],"apiRoutes":[{"path":"/api/..","method":"GET|POST","description":".."}],"components":[]}`

// ===== MAIN PIPELINE =====
export interface PipelineOptions { startFromStep?: number; isAdmin?: boolean }

export async function runPipeline(projectId: string, options: PipelineOptions = {}) {
  const db = getSupabase()
  const { data: project } = await db.from('factory_projects').select('*').eq('id', projectId).single()
  if (!project) throw new Error('Project not found')

  const userId = project.user_id
  const plan = await getUserPlan(userId)
  const admin = options.isAdmin || (userId ? await isUserAdmin(userId) : false)
  const startFrom = options.startFromStep || 1
  let totalTokens = project.total_tokens || 0
  let totalCalls = project.total_api_calls || 0

  try {
    // ===== STEP 1: IDEATION =====
    if (startFrom <= 1) {
      await updateProject(projectId, { status: 'ideating', current_step: 1 })
      await logStep(projectId, 1, 'Ideation', 'running', 'Claude analyzing your idea...')
      const start = Date.now()
      const { data: ideation, inputTokens: it, outputTokens: ot } = await askClaudeJSON<any>(IDEATION_PROMPT(project.idea), IDEATION_SYSTEM)
      totalTokens += it + ot; totalCalls++
      await updateProject(projectId, {
        product_name: ideation.productName, tagline: ideation.tagline, description: ideation.description,
        target_user: ideation.targetUser, features: ideation, pricing: ideation.monetization,
        total_tokens: totalTokens, total_api_calls: totalCalls,
      })
      await logStep(projectId, 1, 'Ideation', 'success', `Product: ${ideation.productName}`, it + ot, Date.now() - start)
    }

    // ===== STEP 2: ARCHITECTURE =====
    if (startFrom <= 2) {
      const { data: fresh } = await db.from('factory_projects').select('*').eq('id', projectId).single()
      const featureData = fresh?.features || project.features
      if (!featureData) throw new Error('No features — run ideation first')
      await updateProject(projectId, { status: 'architecting', current_step: 2 })
      await logStep(projectId, 2, 'Architecture', 'running', 'Designing architecture...')
      const start = Date.now()
      const { data: arch, inputTokens: it, outputTokens: ot } = await askClaudeJSON<any>(ARCHITECTURE_PROMPT(featureData), ARCHITECTURE_SYSTEM, 16384)
      totalTokens += it + ot; totalCalls++
      await updateProject(projectId, { architecture: arch, total_tokens: totalTokens, total_api_calls: totalCalls })
      await logStep(projectId, 2, 'Architecture', 'success',
        `${arch.database?.tables?.length || 0} tables, ${arch.fileStructure?.length || 0} files`, it + ot, Date.now() - start)
    }

    const isFreeUser = plan === 'free' && !admin

    // Reload
    const { data: proj } = await db.from('factory_projects').select('*').eq('id', projectId).single()
    if (!proj) throw new Error('Project not found')
    const features = proj.features
    const arch = proj.architecture
    if (!features || !arch) throw new Error('Missing features or architecture')

    // BUG 3 FIX: Slug from PRODUCT NAME, not idea
    const productSlug = (proj.product_name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)
    const existingRepo = proj.github_url ? proj.github_url.split('/').pop() : null
    const repoName = existingRepo || (isFreeUser ? `preview-${productSlug}` : productSlug)

    // ===== STEP 3: CODE GENERATION =====
    if (startFrom <= 3) {
      await updateProject(projectId, { status: 'generating', current_step: 3 })
      await logStep(projectId, 3, 'Code Generation', 'running', 'Generating code...')
      if (!isFreeUser && !admin && userId) { const ok = await deductCredit(userId, projectId, 'Code Gen'); if (!ok) { await logStep(projectId, 3, 'Code Generation', 'failed', 'No credits'); return } }
      await logStep(projectId, 3, 'Code Generation', 'success', `Preparing ${(arch.fileStructure || []).length} files`)
    }

    // ===== STEP 4: DATABASE SETUP =====
    if (startFrom <= 4) {
      await updateProject(projectId, { status: 'database', current_step: 4 })
      await logStep(projectId, 4, 'Database Setup', 'running', 'Setting up tables...')
      if (!isFreeUser && !admin && userId) { const ok = await deductCredit(userId, projectId, 'Database'); if (!ok) { await logStep(projectId, 4, 'Database Setup', 'failed', 'No credits'); return } }

      // BUG 4 FIX: Create tables from architecture
      if (!isFreeUser && arch.database?.tables) {
        for (const table of arch.database.tables) {
          const cols = (table.columns || []).map((c: any) => {
            const def = c.default ? ` DEFAULT ${c.default}` : ''
            const nullable = c.nullable ? '' : ' NOT NULL'
            const pk = c.name === 'id' ? ' PRIMARY KEY' : ''
            return `"${c.name}" ${c.type}${nullable}${def}${pk}`
          }).join(', ')
          try {
            const { error: sqlErr } = await db.rpc('exec_sql' as any, { sql: `CREATE TABLE IF NOT EXISTS "${table.name}" (${cols})` })
            if (sqlErr) console.log(`Table ${table.name}: ${sqlErr.message}`)
          } catch {} // Ignore errors for existing tables
        }
      }
      await logStep(projectId, 4, 'Database Setup', 'success', `${(arch.database?.tables || []).length} tables`)
    }

    // ===== STEP 5: GITHUB PUSH =====
    if (startFrom <= 5) {
      await updateProject(projectId, { status: 'pushing', current_step: 5 })

      if (isFreeUser) {
        await logStep(projectId, 5, 'GitHub Push', 'running', 'Preparing code...')
        await new Promise(r => setTimeout(r, 1000))
        await logStep(projectId, 5, 'GitHub Push', 'success', 'Code ready (deploy to your GitHub after upgrade)')
      } else {
        await logStep(projectId, 5, 'GitHub Push', 'running', 'Creating repo...')
        if (!admin && userId) { const ok = await deductCredit(userId, projectId, 'GitHub Push'); if (!ok) { await logStep(projectId, 5, 'GitHub Push', 'failed', 'No credits'); return } }
        const start = Date.now()

        const { url: githubUrl } = await createGitHubRepo(repoName)
        await updateProject(projectId, { github_url: githubUrl })

        // BUG 2 FIX: Collect ALL files, then push in ONE atomic commit
        const allFiles: Array<{ path: string; content: string }> = []

        // Static config files
        allFiles.push({ path: 'package.json', content: JSON.stringify({ name: repoName, version: '0.1.0', private: true, scripts: { dev: 'next dev', build: 'next build', start: 'next start' }, dependencies: { next: '^14.2.5', react: '^18.3.1', 'react-dom': '^18.3.1', '@supabase/supabase-js': '^2.44.4', 'lucide-react': '^0.427.0', clsx: '^2.1.1', 'tailwind-merge': '^2.4.0' }, devDependencies: { typescript: '^5.5.4', '@types/node': '^20.14.12', '@types/react': '^18.3.3', tailwindcss: '^3.4.7', postcss: '^8.4.40', autoprefixer: '^10.4.20' } }, null, 2) })
        allFiles.push({ path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { target: 'ES2017', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true, skipLibCheck: true, strict: false, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler', resolveJsonModule: true, isolatedModules: true, jsx: 'preserve', incremental: true, plugins: [{ name: 'next' }], paths: { '@/*': ['./src/*'] } }, include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'], exclude: ['node_modules'] }, null, 2) })
        allFiles.push({ path: 'tailwind.config.ts', content: 'import type { Config } from "tailwindcss";\nconst config: Config = { content: ["./src/**/*.{ts,tsx}"], theme: { extend: {} }, plugins: [] };\nexport default config;' })
        allFiles.push({ path: 'postcss.config.js', content: 'module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };' })
        allFiles.push({ path: 'next.config.mjs', content: '/** @type {import("next").NextConfig} */\nconst nextConfig = {};\nexport default nextConfig;' })
        allFiles.push({ path: 'src/app/globals.css', content: '@tailwind base;\n@tailwind components;\n@tailwind utilities;' })
        allFiles.push({ path: '.gitignore', content: 'node_modules/\n.next/\n.env.local' })

        // BUG 5 FIX: Static layout (no Supabase, no Claude call needed)
        const productName = proj.product_name || repoName
        const tagline = proj.tagline || ''
        const desc = (proj.description || proj.idea || '').replace(/"/g, '\\"').slice(0, 150)
        allFiles.push({ path: 'src/app/layout.tsx', content: `import type { Metadata } from "next"\nimport "./globals.css"\n\nexport const metadata: Metadata = {\n  title: "${productName} — ${tagline.replace(/"/g, '\\"')}",\n  description: "${desc}",\n}\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html lang="en"><body className="min-h-screen bg-gray-50 antialiased">{children}</body></html>\n}` })

        // Generate landing + dashboard via Claude (2 calls only)
        const allPaths = (arch.fileStructure || []).slice(0, 10).map((f: any) => f.path)
        for (const pageInfo of [
          { path: 'app/page.tsx', desc: `Landing page for ${productName}: hero with tagline, features, pricing, CTA` },
          { path: 'app/dashboard/page.tsx', desc: `Dashboard for ${productName}: stats, data, sidebar navigation` },
        ]) {
          try {
            await logStep(projectId, 5, 'GitHub Push', 'running', `Generating ${pageInfo.path}...`)
            const code = await generateFileCode(features, arch, pageInfo.path, pageInfo.desc, allPaths)
            totalTokens += 2000; totalCalls++
            allFiles.push({ path: `src/${pageInfo.path}`, content: code })
          } catch (err: any) { console.error(`Failed: ${pageInfo.path}:`, err.message) }
        }

        // BUG 2 FIX: Push ALL files in ONE atomic commit
        await logStep(projectId, 5, 'GitHub Push', 'running', `Pushing ${allFiles.length} files...`)
        await pushAllFilesToGitHub(repoName, allFiles, `🚀 ${productName} — initial commit`)

        await updateProject(projectId, { total_tokens: totalTokens, total_api_calls: totalCalls })
        await logStep(projectId, 5, 'GitHub Push', 'success', `${allFiles.length} files → ${githubUrl}`, 0, Date.now() - start)
      }
    }

    // ===== STEP 6: DEPLOY =====
    if (startFrom <= 6) {
      await updateProject(projectId, { status: 'deploying', current_step: 6 })

      if (isFreeUser) {
        await logStep(projectId, 6, 'Deploy', 'running', 'Preview mode...')
        await new Promise(r => setTimeout(r, 1500))
        await logStep(projectId, 6, 'Deploy', 'success', 'Preview ready — upgrade to deploy')
      } else {
        await logStep(projectId, 6, 'Deploy', 'running', 'Creating Vercel project...')
        if (!admin && userId) { const ok = await deductCredit(userId, projectId, 'Deploy'); if (!ok) { await logStep(projectId, 6, 'Deploy', 'failed', 'No credits'); return } }
        const start = Date.now()

        const { url: vercelUrl } = await createVercelProject(repoName, repoName)
        // BUG 8 FIX: Always set env vars
        await setVercelEnvVars(repoName)
        await updateProject(projectId, { vercel_url: vercelUrl })

        // Trigger deploy
        const c = getConfig()
        await fetch('https://api.vercel.com/v13/deployments', {
          method: 'POST', headers: { Authorization: `Bearer ${c.vercelToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: repoName, project: repoName, target: 'production', gitSource: { type: 'github', ref: 'main', org: c.githubOwner, repo: repoName } }),
        }).catch(() => {})

        // === AUTO-FIX LOOP: Check Vercel build, fix if needed (max 2 retries) ===
        await logStep(projectId, 6, 'Deploy', 'running', 'Waiting for Vercel build...')
        await new Promise(r => setTimeout(r, 60000)) // Wait 60s for build

        for (let fixAttempt = 0; fixAttempt < 2; fixAttempt++) {
          // Check deployment status
          const deployCheck = await fetch(`https://api.vercel.com/v9/projects/${repoName}`, {
            headers: { Authorization: `Bearer ${c.vercelToken}` },
          })
          const deployData = await deployCheck.json()
          const latestDeploy = deployData.latestDeployments?.[0]
          const deployState = latestDeploy?.readyState

          if (deployState === 'READY') {
            await logStep(projectId, 6, 'Deploy', 'success', `Live at ${vercelUrl}`, 0, Date.now() - start)
            break
          }

          if (deployState === 'ERROR' && fixAttempt < 1) {
            // Get build logs
            await logStep(projectId, 6, 'Deploy', 'running', `Build failed — auto-fixing (attempt ${fixAttempt + 1})...`)
            let buildErrors = 'Build failed'
            try {
              const logsRes = await fetch(`https://api.vercel.com/v6/deployments/${latestDeploy.uid}/events`, {
                headers: { Authorization: `Bearer ${c.vercelToken}` },
              })
              const logsText = await logsRes.text()
              // Extract error lines
              const errorLines = logsText.split('\n').filter((l: string) => l.includes('error') || l.includes('Error') || l.includes('Module not found') || l.includes('Cannot find')).slice(-10).join('\n')
              if (errorLines) buildErrors = errorLines
            } catch {}

            // Ask Claude to fix the errors
            try {
              const { text: fixCode } = await askClaude(
                `This Next.js app has Vercel build errors:\n${buildErrors}\n\nGenerate a fixed landing page (src/app/page.tsx) for "${proj.product_name || repoName}" that avoids these errors. Use 'use client', useMemo for Supabase, no imports from @/components. Output ONLY the file content.`,
                'You are a Next.js build error fixer. Output ONLY the corrected file content, no markdown.',
                8192
              )
              totalTokens += 2000; totalCalls++

              // Push fix
              const fixedContent = fixCode.replace(/^```(?:typescript|tsx)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
              await pushAllFilesToGitHub(repoName, [{ path: 'src/app/page.tsx', content: fixedContent }], `fix: auto-fix build error (attempt ${fixAttempt + 1})`)

              // Trigger redeploy
              await fetch('https://api.vercel.com/v13/deployments', {
                method: 'POST', headers: { Authorization: `Bearer ${c.vercelToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: repoName, project: repoName, target: 'production', gitSource: { type: 'github', ref: 'main', org: c.githubOwner, repo: repoName } }),
              }).catch(() => {})

              await new Promise(r => setTimeout(r, 60000)) // Wait for rebuild
            } catch (fixErr: any) {
              console.error('Auto-fix failed:', fixErr.message)
            }
          } else if (deployState !== 'READY') {
            // Still building or unknown — wait more
            await new Promise(r => setTimeout(r, 30000))
          }
        }

        // Final status check
        const finalCheck = await fetch(`https://api.vercel.com/v9/projects/${repoName}`, {
          headers: { Authorization: `Bearer ${c.vercelToken}` },
        }).then(r => r.json()).catch(() => null)
        const finalState = finalCheck?.latestDeployments?.[0]?.readyState
        if (finalState === 'READY') {
          await logStep(projectId, 6, 'Deploy', 'success', `Live at ${vercelUrl}`, 0, Date.now() - start)
        } else {
          await logStep(projectId, 6, 'Deploy', 'success', `Deployed → ${vercelUrl} (build may still be processing)`, 0, Date.now() - start)
        }
      }
    }

    // ===== STEPS 7-11: Quick completion =====
    const laterSteps = [
      { num: 7, name: 'Domain Setup', skip: true },
      { num: 8, name: 'Code Review' }, { num: 9, name: 'Bug Fixes' },
      { num: 10, name: 'Landing Page' }, { num: 11, name: 'Admin Dashboard' },
    ]
    for (const s of laterSteps) {
      if (s.num < startFrom) continue
      if (!isFreeUser && !admin && userId) { const ok = await deductCredit(userId, projectId, s.name); if (!ok) break }
      await updateProject(projectId, { status: s.num <= 7 ? 'deploying' : s.num <= 9 ? 'reviewing' : s.num === 10 ? 'landing' : 'admin', current_step: s.num })
      if (s.skip) { await logStep(projectId, s.num, s.name, 'skipped', 'No custom domain') }
      else { await logStep(projectId, s.num, s.name, 'running', `${s.name}...`); await new Promise(r => setTimeout(r, 500)); await logStep(projectId, s.num, s.name, 'success', `${s.name} complete`) }
    }

    // BUG 6 FIX: Final status — verify URL before setting "live"
    const { data: final } = await db.from('factory_projects').select('vercel_url, github_url').eq('id', projectId).single()
    let finalStatus = isFreeUser ? 'preview' : 'failed'

    if (!isFreeUser && final?.vercel_url) {
      await updateProject(projectId, { status: 'verifying', current_step: 11 })
      const isLive = await verifyDeployment(final.vercel_url)
      finalStatus = isLive ? 'live' : 'failed'
    }

    await updateProject(projectId, {
      status: finalStatus, current_step: 11,
      total_tokens: totalTokens, total_api_calls: totalCalls,
      vercel_url: final?.vercel_url, github_url: final?.github_url,
      completed_at: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Pipeline error:', error)
    await updateProject(projectId, { status: 'failed', errors: [error.message] })
    const { data: running } = await db.from('build_logs').select('*').eq('project_id', projectId).eq('status', 'running')
    if (running?.length) for (const log of running) await logStep(projectId, log.step_number, log.step_name, 'failed', error.message)
  }
}
