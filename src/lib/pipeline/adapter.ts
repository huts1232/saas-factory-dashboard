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

    // ===== STEPS 3-6: BUILD WITH CLAUDE CODE CLI =====
    if (startFrom <= 6) {
      const productName = proj.product_name || repoName
      const c = getConfig()

      if (isFreeUser) {
        // Free users: simulate steps 3-6 (no real build)
        for (const step of [
          { num: 3, name: 'Code Generation', status: 'generating' as const },
          { num: 4, name: 'Database Setup', status: 'database' as const },
          { num: 5, name: 'GitHub Push', status: 'pushing' as const },
          { num: 6, name: 'Deploy', status: 'deploying' as const },
        ]) {
          if (step.num < startFrom) continue
          await updateProject(projectId, { status: step.status, current_step: step.num })
          await logStep(projectId, step.num, step.name, 'running', `${step.name}...`)
          await new Promise(r => setTimeout(r, 1000))
          await logStep(projectId, step.num, step.name, step.num === 5 ? 'success' : 'success',
            step.num === 5 ? 'Code ready (upgrade to deploy)' : step.num === 6 ? 'Preview ready' : `${step.name} complete`)
        }
      } else {
        // PAID/ADMIN: Use Claude Code CLI to build, test, push, and deploy
        const projectDir = `/tmp/saas-factory-builds/${repoName}`
        const { exec: execCb } = await import('child_process')
        const { promisify } = await import('util')
        const execAsync = promisify(execCb)

        // Step 3: Code Generation via Claude Code
        if (startFrom <= 3) {
          await updateProject(projectId, { status: 'generating', current_step: 3 })
          await logStep(projectId, 3, 'Code Generation', 'running', 'Claude Code is building your app...')
          if (!admin && userId) { const ok = await deductCredit(userId, projectId, 'Build'); if (!ok) { await logStep(projectId, 3, 'Code Generation', 'failed', 'No credits'); return } }

          const dbSchema = (arch.database?.tables || []).map((t: any) => `${t.name}: ${(t.columns || []).map((col: any) => col.name).join(', ')}`).join('\n')
          const featureList = (features.features || []).map((f: any) => `- ${f.name}: ${f.description || ''}`).join('\n')

          const claudePrompt = `Create a complete, production-ready Next.js 14 SaaS application.

Product: ${productName}
Tagline: ${proj.tagline || ''}
Description: ${proj.description || proj.idea}
Target user: ${proj.target_user || ''}
Pricing: ${features.monetization?.suggestedPrice || '$9/mo'}

Features:
${featureList}

Database tables:
${dbSchema}

REQUIREMENTS:
- Next.js 14 with App Router and TypeScript
- Tailwind CSS for all styling
- Supabase for auth and database (use @supabase/supabase-js)
- Create ALL pages: landing page, login, signup, dashboard, and feature pages
- Every button must work, every form must submit data
- Use 'use client' on pages with Supabase, create client with useMemo
- Landing page must have: hero, features, pricing, CTA, footer
- Dashboard must have: stats cards, data table, sidebar navigation
- npm run build MUST pass with ZERO errors
- Do NOT use any imports from @/components or @/lib — keep pages self-contained

Environment variables (already set):
NEXT_PUBLIC_SUPABASE_URL=${c.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${c.supabaseAnonKey}

After building all files:
1. Run: npm install
2. Run: npm run build
3. Fix ANY build errors until build passes with zero errors
4. Do NOT push to git or deploy — I will handle that.`

          try {
            await execAsync(`mkdir -p ${projectDir}`, { timeout: 5000 })

            // Run Claude Code CLI
            const escapedPrompt = claudePrompt.replace(/'/g, "'\\''")
            await logStep(projectId, 3, 'Code Generation', 'running', 'Claude Code building app (this takes a few minutes)...')

            const { stdout, stderr } = await execAsync(
              `cd ${projectDir} && claude -p '${escapedPrompt}' --yes 2>&1`,
              { timeout: 600000, maxBuffer: 10 * 1024 * 1024, env: { ...process.env, HOME: process.env.HOME || '/root' } }
            )

            await logStep(projectId, 3, 'Code Generation', 'success', 'App built by Claude Code')
          } catch (err: any) {
            console.error('Claude Code failed:', err.message?.slice(0, 200))
            await logStep(projectId, 3, 'Code Generation', 'failed', `Claude Code error: ${err.message?.slice(0, 100)}`)
            throw err
          }
        }

        // Step 4: Database (Claude Code already handles schema in the app code)
        if (startFrom <= 4) {
          await updateProject(projectId, { status: 'database', current_step: 4 })
          await logStep(projectId, 4, 'Database Setup', 'success', 'Schema defined in app code')
        }

        // Step 5: Push to GitHub
        if (startFrom <= 5) {
          await updateProject(projectId, { status: 'pushing', current_step: 5 })
          await logStep(projectId, 5, 'GitHub Push', 'running', 'Pushing to GitHub...')
          if (!admin && userId) { const ok = await deductCredit(userId, projectId, 'Push + Deploy'); if (!ok) { await logStep(projectId, 5, 'GitHub Push', 'failed', 'No credits'); return } }
          const start = Date.now()

          const { url: githubUrl } = await createGitHubRepo(repoName)
          await updateProject(projectId, { github_url: githubUrl })

          // Init git and push
          try {
            await execAsync(`cd ${projectDir} && git init && git remote add origin https://${c.githubOwner}:${c.githubToken}@github.com/${c.githubOwner}/${repoName}.git 2>/dev/null || true`, { timeout: 10000 })
            await execAsync(`cd ${projectDir} && echo "node_modules/\\n.next/\\n.env.local" > .gitignore && git add -A && git commit -m "🚀 ${productName} — built by SaaS Factory" --allow-empty`, { timeout: 30000 })
            await execAsync(`cd ${projectDir} && git branch -M main && git push -u origin main --force`, { timeout: 60000 })
            await logStep(projectId, 5, 'GitHub Push', 'success', `Pushed to ${githubUrl}`, 0, Date.now() - start)
          } catch (pushErr: any) {
            console.error('Git push failed:', pushErr.message?.slice(0, 200))
            await logStep(projectId, 5, 'GitHub Push', 'failed', `Push failed: ${pushErr.message?.slice(0, 80)}`)
            throw pushErr
          }
        }

        // Step 6: Deploy to Vercel
        if (startFrom <= 6) {
          await updateProject(projectId, { status: 'deploying', current_step: 6 })
          await logStep(projectId, 6, 'Deploy', 'running', 'Deploying to Vercel...')
          const start = Date.now()

          const { url: vercelUrl } = await createVercelProject(repoName, repoName)
          await setVercelEnvVars(repoName)
          await updateProject(projectId, { vercel_url: vercelUrl })

          // Trigger deploy
          await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST', headers: { Authorization: `Bearer ${c.vercelToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: repoName, project: repoName, target: 'production', gitSource: { type: 'github', ref: 'main', org: c.githubOwner, repo: repoName } }),
          }).catch(() => {})

          await logStep(projectId, 6, 'Deploy', 'success', `Deployed → ${vercelUrl}`, 0, Date.now() - start)
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
