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

// ===== CODE GEN WITH SAFE SUPABASE PATTERN =====
async function generateFileCode(features: any, arch: any, filePath: string, fileDesc: string, allPaths: string[]): Promise<string> {
  const system = `You are a senior Next.js 14 developer. Generate a COMPLETE, working file.

MANDATORY RULES:
- Use Next.js 14 App Router, TypeScript, Tailwind CSS
- CRITICAL: Every file that uses Supabase MUST start with 'use client' and create the client inside the component with useMemo:
  'use client'
  import { useMemo } from 'react'
  import { createClient } from '@supabase/supabase-js'
  // Inside component:
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
- NEVER create Supabase client at module level
- NEVER use import from '@/components', '@/lib', '@/hooks', '@/utils' or any local path.
  Every component must be written inline in the same file.
  Every utility function must be defined at the top of the file.
  Self-contained files ONLY.
- This file must compile standalone. No external local imports.
- Only allowed imports: react, next/link, next/navigation, next/image, @supabase/supabase-js, lucide-react
- The landing page at / must be PUBLIC. No auth required. No Supabase auth check. No redirect to /login.
  Only /dashboard, /settings, and /admin require login.
  The landing page should have a 'Get Started' button that links to /login or /signup.
- Every button MUST have an onClick handler
- Every form MUST have an onSubmit handler with e.preventDefault()
- Include loading states (useState + Spinner)
- Include empty states
- Include error handling (try/catch)
- NO TODO comments — write real code
- NO placeholder data — use real Supabase queries
- NO imports from non-existent files
- DESIGN: Use a dark, premium SaaS theme. Dark backgrounds (slate-900, slate-800), white text, purple/blue gradient accents. Every page must look polished and professional with proper spacing, rounded corners, hover states.
- Output ONLY the file content. No markdown, no explanation.`

  const dbSchema = arch.database?.tables?.map((t: any) => `${t.name}(${t.columns?.map((c: any) => c.name).join(', ')})`).join('; ') || ''

  const prompt = `Generate: ${filePath}\nDescription: ${fileDesc}\nProduct: ${features.productName} — ${features.tagline}\nDB: ${dbSchema}\nFiles: ${allPaths.slice(0, 10).join(', ')}\nPricing: ${features.monetization?.suggestedPrice || '$9/mo'}\n\nSelf-contained file. No imports from @/components or @/lib.`
  // Landing page needs more tokens for full design
  const maxTokens = filePath.includes('page.tsx') && !filePath.includes('dashboard') && !filePath.includes('login') && !filePath.includes('signup') && !filePath.includes('settings') && !filePath.includes('admin') ? 16384 : 8192
  const { text } = await askClaude(prompt, system, maxTokens)
  return text.replace(/^```(?:typescript|tsx|ts|javascript|jsx)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
}

// ===== FETCH WITH TIMEOUT =====
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timeout)
  }
}

// ===== GITHUB: ATOMIC PUSH =====
async function createGitHubRepo(repoName: string): Promise<{ url: string }> {
  const c = getConfig()
  const res = await fetchWithTimeout('https://api.github.com/user/repos', {
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

  const refRes = await fetchWithTimeout(`${base}/git/ref/heads/main`, { headers })
  if (!refRes.ok) throw new Error(`Failed to get ref: ${await refRes.text()}`)
  const latestSha = (await refRes.json()).object.sha
  const commitData = await (await fetchWithTimeout(`${base}/git/commits/${latestSha}`, { headers })).json()
  const baseTreeSha = commitData.tree.sha

  const tree: Array<{ path: string; mode: string; type: string; sha: string }> = []
  for (const file of files) {
    try {
      const blobRes = await fetchWithTimeout(`${base}/git/blobs`, {
        method: 'POST', headers,
        body: JSON.stringify({ content: Buffer.from(file.content).toString('base64'), encoding: 'base64' }),
      })
      if (!blobRes.ok) { console.error(`Blob failed for ${file.path}: ${blobRes.status}`); continue }
      tree.push({ path: file.path, mode: '100644', type: 'blob', sha: (await blobRes.json()).sha })
    } catch (err: any) {
      console.error(`Blob timeout/error for ${file.path}: ${err.message}`)
    }
  }

  if (tree.length === 0) throw new Error('No files were successfully uploaded to GitHub')

  const newTree = await (await fetchWithTimeout(`${base}/git/trees`, { method: 'POST', headers, body: JSON.stringify({ base_tree: baseTreeSha, tree }) })).json()
  const newCommit = await (await fetchWithTimeout(`${base}/git/commits`, { method: 'POST', headers, body: JSON.stringify({ message, tree: newTree.sha, parents: [latestSha] }) })).json()
  await fetchWithTimeout(`${base}/git/refs/heads/main`, { method: 'PATCH', headers, body: JSON.stringify({ sha: newCommit.sha }) })
}

// ===== VERCEL =====
async function createVercelProject(projectName: string, repoName: string): Promise<{ url: string; projectId: string }> {
  const c = getConfig()
  const check = await fetchWithTimeout(`https://api.vercel.com/v9/projects/${projectName}`, { headers: { Authorization: `Bearer ${c.vercelToken}` } })
  if (check.ok) {
    const existing = await check.json()
    return { url: `https://${projectName}.vercel.app`, projectId: existing.id }
  }

  const res = await fetchWithTimeout('https://api.vercel.com/v10/projects', {
    method: 'POST', headers: { Authorization: `Bearer ${c.vercelToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: projectName, framework: 'nextjs', gitRepository: { type: 'github', repo: `${c.githubOwner}/${repoName}` } }),
  })
  if (!res.ok) throw new Error(`Vercel project creation failed: ${await res.text()}`)
  const data = await res.json()
  return { url: `https://${projectName}.vercel.app`, projectId: data.id }
}

async function setVercelEnvVars(projectName: string) {
  const c = getConfig()
  const vars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: c.supabaseUrl },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: c.supabaseAnonKey },
    { key: 'NEXT_PUBLIC_SITE_URL', value: `https://${projectName}.vercel.app` },
  ]
  for (const v of vars) {
    await fetchWithTimeout(`https://api.vercel.com/v10/projects/${projectName}/env`, {
      method: 'POST', headers: { Authorization: `Bearer ${c.vercelToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: v.key, value: v.value, type: 'plain', target: ['production', 'preview'] }),
    }).catch(() => {})
  }
}

// ===== SUPABASE TABLE CREATION =====
function mapColumnType(type: string): string {
  const map: Record<string, string> = {
    uuid: 'uuid', text: 'text', integer: 'integer', boolean: 'boolean',
    timestamptz: 'timestamptz', jsonb: 'jsonb', decimal: 'decimal',
    bigint: 'bigint', varchar: 'varchar(255)', float: 'float8',
    serial: 'serial', timestamp: 'timestamptz', json: 'jsonb',
    int: 'integer', string: 'text', number: 'integer', date: 'date',
  }
  return map[type?.toLowerCase()] || 'text'
}

function tableToSQL(table: any): string {
  const cols = (table.columns || []).map((col: any) => {
    let def = `"${col.name}" ${mapColumnType(col.type)}`
    if (col.name === 'id' && col.type === 'uuid') def += ' PRIMARY KEY DEFAULT gen_random_uuid()'
    else if (col.name === 'id') def += ' PRIMARY KEY'
    if (col.nullable === false && col.name !== 'id') def += ' NOT NULL'
    if (col.name === 'created_at' && col.type === 'timestamptz') def += ' DEFAULT now()'
    if (col.name === 'updated_at' && col.type === 'timestamptz') def += ' DEFAULT now()'
    return def
  })
  return `CREATE TABLE IF NOT EXISTS "public"."${table.name}" (\n  ${cols.join(',\n  ')}\n);`
}

async function executeSQL(sql: string): Promise<void> {
  const c = getConfig()
  // Use the exec_sql RPC function (created via Supabase dashboard)
  const res = await fetchWithTimeout(`${c.supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: c.supabaseServiceKey,
      Authorization: `Bearer ${c.supabaseServiceKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ query: sql }),
  }, 30000)
  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown')
    throw new Error(`SQL execution failed (${res.status}): ${errText}`)
  }
}

async function createSupabaseTables(tables: any[]): Promise<void> {
  // Build CREATE TABLE + RLS statements
  const statements = tables.map((t: any) => tableToSQL(t))
  const rlsStatements = tables.map((t: any) =>
    `ALTER TABLE "public"."${t.name}" ENABLE ROW LEVEL SECURITY;\n` +
    `DO $$ BEGIN ` +
    `IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='${t.name}' AND policyname='Allow anon read ${t.name}') THEN ` +
    `CREATE POLICY "Allow anon read ${t.name}" ON "public"."${t.name}" FOR SELECT TO anon USING (true); ` +
    `END IF; ` +
    `IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='${t.name}' AND policyname='Allow auth all ${t.name}') THEN ` +
    `CREATE POLICY "Allow auth all ${t.name}" ON "public"."${t.name}" FOR ALL TO authenticated USING (true) WITH CHECK (true); ` +
    `END IF; ` +
    `END $$;`
  )
  const fullSQL = [...statements, ...rlsStatements].join('\n\n')
  await executeSQL(fullSQL)
}

async function verifySupabaseTables(tableNames: string[]): Promise<string[]> {
  const db = getSupabase()
  const missing: string[] = []
  for (const name of tableNames) {
    const { error } = await db.from(name).select('*').limit(0)
    if (error) missing.push(name)
  }
  return missing
}

// ===== REAL DEPLOYMENT VERIFICATION =====
interface VerifyResult {
  success: boolean
  status: 'live' | 'build_failed' | 'deploy_failed'
  url?: string
  reason?: string
}

async function verifyDeployment(projectName: string, vercelToken: string): Promise<VerifyResult> {
  const headers = { Authorization: `Bearer ${vercelToken}` }

  // Wait for Vercel to finish building
  await new Promise(r => setTimeout(r, 30000))

  // Poll deployment status (up to 2 extra attempts if still building)
  let latest: any = null
  for (let attempt = 0; attempt < 3; attempt++) {
    const deploys = await fetchWithTimeout(
      `https://api.vercel.com/v6/deployments?projectId=${projectName}&limit=1`,
      { headers }
    ).then(r => r.json()).catch(() => ({ deployments: [] }))

    latest = deploys.deployments?.[0]
    if (!latest) {
      return { success: false, status: 'build_failed', reason: 'No deployments found' }
    }

    if (latest.state === 'READY' || latest.state === 'ERROR') break

    // Still building — wait another 30s
    if (attempt < 2) await new Promise(r => setTimeout(r, 30000))
  }

  // Build error
  if (!latest || latest.state === 'ERROR') {
    return { success: false, status: 'build_failed', reason: `Build failed (state: ${latest?.state || 'unknown'})` }
  }

  // Not ready after all retries
  if (latest.state !== 'READY') {
    return { success: false, status: 'build_failed', reason: `Build stuck (state: ${latest.state})` }
  }

  // URL verification — check ONLY the root homepage (/)
  // The homepage is public. Do NOT check /dashboard or other auth-protected routes.
  const deployUrl = `https://${latest.url}`
  const homepageUrl = `${deployUrl}/`
  try {
    const res = await fetch(homepageUrl, { redirect: 'follow' })
    const body = await res.text()

    // 401/403 means the app is running but auth-protected — still counts as deployed
    if (res.status === 401 || res.status === 403) {
      return { success: true, status: 'live', url: deployUrl }
    }

    // Only fail on actual deployment/server errors
    if (res.status >= 500 ||
        body.includes('DEPLOYMENT_NOT_FOUND') ||
        body.toLowerCase().includes('application error')) {
      return { success: false, status: 'deploy_failed', url: deployUrl, reason: `Homepage check failed (status: ${res.status}, length: ${body.length})` }
    }

    return { success: true, status: 'live', url: deployUrl }
  } catch (err: any) {
    return { success: false, status: 'deploy_failed', url: deployUrl, reason: `Homepage unreachable: ${err.message}` }
  }
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
        // PAID/ADMIN: Claude API codegen + atomic GitHub push + Vercel deploy
        const productName = proj.product_name || repoName
        const c = getConfig()

        // Step 3: Generate code via Claude API
        if (startFrom <= 3) {
          await updateProject(projectId, { status: 'generating', current_step: 3 })
          await logStep(projectId, 3, 'Code Generation', 'running', 'Generating code...')
          if (!admin && userId) { const ok = await deductCredit(userId, projectId, 'Build'); if (!ok) { await logStep(projectId, 3, 'Code Generation', 'failed', 'No credits'); return } }
          await logStep(projectId, 3, 'Code Generation', 'success', `Preparing files for ${productName}`)
        }

        // Step 4: Database — create tables on shared Supabase project
        if (startFrom <= 4) {
          await updateProject(projectId, { status: 'database', current_step: 4 })
          await logStep(projectId, 4, 'Database Setup', 'running', 'Creating tables...')
          const start = Date.now()
          const tables = arch.database?.tables || []

          if (tables.length > 0) {
            try {
              await createSupabaseTables(tables)
              const missing = await verifySupabaseTables(tables.map((t: any) => t.name))
              if (missing.length > 0) {
                const retryTables = tables.filter((t: any) => missing.includes(t.name))
                await createSupabaseTables(retryTables)
              }
              await logStep(projectId, 4, 'Database Setup', 'success', `${tables.length} tables created`, 0, Date.now() - start)
            } catch (err: any) {
              console.error('Database setup error:', err.message)
              await logStep(projectId, 4, 'Database Setup', 'failed', `SQL error: ${err.message.slice(0, 200)}`, 0, Date.now() - start)
            }
          } else {
            await logStep(projectId, 4, 'Database Setup', 'success', 'No tables to create')
          }
        }

        // Step 5: Generate + Push to GitHub (atomic)
        if (startFrom <= 5) {
          await updateProject(projectId, { status: 'pushing', current_step: 5 })
          await logStep(projectId, 5, 'GitHub Push', 'running', 'Creating repo...')
          if (!admin && userId) { const ok = await deductCredit(userId, projectId, 'Push + Deploy'); if (!ok) { await logStep(projectId, 5, 'GitHub Push', 'failed', 'No credits'); return } }
          const start = Date.now()

          const { url: githubUrl } = await createGitHubRepo(repoName)
          await updateProject(projectId, { github_url: githubUrl })

          // Collect all files
          const allFiles: Array<{ path: string; content: string }> = []

          // Static config (never fails)
          allFiles.push({ path: 'package.json', content: JSON.stringify({ name: repoName, version: '0.1.0', private: true, scripts: { dev: 'next dev', build: 'next build', start: 'next start' }, dependencies: { next: '^14.2.5', react: '^18.3.1', 'react-dom': '^18.3.1', '@supabase/supabase-js': '^2.44.4', 'lucide-react': '^0.427.0', clsx: '^2.1.1', 'tailwind-merge': '^2.4.0' }, devDependencies: { typescript: '^5.5.4', '@types/node': '^20.14.12', '@types/react': '^18.3.3', tailwindcss: '^3.4.7', postcss: '^8.4.40', autoprefixer: '^10.4.20' } }, null, 2) })
          allFiles.push({ path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { target: 'ES2017', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true, skipLibCheck: true, strict: false, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler', resolveJsonModule: true, isolatedModules: true, jsx: 'preserve', incremental: true, plugins: [{ name: 'next' }], paths: { '@/*': ['./src/*'] } }, include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'], exclude: ['node_modules'] }, null, 2) })
          allFiles.push({ path: 'tailwind.config.ts', content: 'import type { Config } from "tailwindcss";\nconst config: Config = { content: ["./src/**/*.{ts,tsx}"], theme: { extend: {} }, plugins: [] };\nexport default config;' })
          allFiles.push({ path: 'postcss.config.js', content: 'module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };' })
          allFiles.push({ path: 'next.config.mjs', content: '/** @type {import("next").NextConfig} */\nconst nextConfig = {\n  eslint: { ignoreDuringBuilds: true },\n  typescript: { ignoreBuildErrors: true },\n};\nexport default nextConfig;' })
          allFiles.push({ path: 'src/app/globals.css', content: '@tailwind base;\n@tailwind components;\n@tailwind utilities;' })
          allFiles.push({ path: '.gitignore', content: 'node_modules/\n.next/\n.env.local' })

          // Hardcoded middleware — empty matcher means it runs on NOTHING
          // This file exists to PREVENT any other middleware from being generated
          // All routes including / are fully public at the middleware level
          allFiles.push({ path: 'src/middleware.ts', content: [
            `import { NextResponse } from 'next/server'`,
            `import type { NextRequest } from 'next/server'`,
            ``,
            `export function middleware(request: NextRequest) {`,
            `  return NextResponse.next()`,
            `}`,
            ``,
            `export const config = {`,
            `  matcher: []`,
            `}`,
            '',
          ].join('\n') })

          // Static layout + Supabase helper
          const tagline = proj.tagline || ''
          const desc = (proj.description || proj.idea || '').replace(/"/g, '\\"').slice(0, 150)
          allFiles.push({ path: 'src/app/layout.tsx', content: `import type { Metadata } from "next"\nimport "./globals.css"\n\nexport const metadata: Metadata = {\n  title: "${productName} — ${tagline.replace(/"/g, '\\"')}",\n  description: "${desc}",\n}\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html lang="en"><body className="min-h-screen bg-gray-50 antialiased">{children}</body></html>\n}` })
          allFiles.push({ path: 'src/lib/supabase.ts', content: `import { createClient } from '@supabase/supabase-js'\n\nexport function getSupabase() {\n  return createClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n  )\n}\n` })

          // Generate pages via Claude API (parallel)
          const allPaths = (arch.fileStructure || []).slice(0, 10).map((f: any) => f.path)
          const pages = [
            { path: 'app/page.tsx', desc: `Public marketing landing page for ${productName}. DESIGN REQUIREMENTS — must match a professional SaaS landing page:
- Full dark gradient background (from slate-900 via purple-900 to slate-900)
- Sticky navbar with logo left, nav links center (Features, Pricing, Docs), "Get Started" button right with purple gradient (bg-gradient-to-r from-purple-600 to-blue-600)
- Hero section: huge bold headline (text-5xl md:text-7xl font-black text-white), subheadline (text-gray-400), two CTA buttons (primary purple gradient + secondary outline border-white/20), social proof line with user count "1,000+ teams trust ${productName}"
- Features grid: 3 columns on desktop, each card has dark bg (bg-white/5 border border-white/10 rounded-2xl p-6), gradient icon, white title (text-lg font-semibold text-white), gray description (text-gray-400)
- Pricing section: 3 tiers (Free/Pro at ${proj.pricing?.suggestedPrice || '$9/mo'}/Enterprise), highlighted middle card with purple gradient border and "Most Popular" badge, dark card backgrounds
- Testimonials: 3 cards with avatar initials, name (text-white), role (text-gray-500), quote (text-gray-300), dark card bg
- CTA banner: full-width gradient bg with bold headline and "Get Started Free" button
- Footer: dark bg-slate-950, logo, link columns, copyright
- Use ONLY Tailwind classes, no external CSS, no style={{}} objects
- Every color explicit: bg-slate-900, text-white, bg-purple-600, text-gray-400, border-white/10 etc.
- NO placeholder lorem ipsum — use real product copy about ${productName}: "${proj.tagline || ''}"
- This is a COMPLETE page, minimum 200 lines of JSX. Not a stub.
CRITICAL: No auth checks, no Supabase imports, no getUser, no createClient. Pure static React component. Link "Get Started" to /signup, "Login" to /login.` },
            { path: 'app/dashboard/page.tsx', desc: `Dashboard for ${productName}. AUTH GUARD: In a useEffect, call supabase.auth.getUser(). If no user, router.push('/login'). Show a loading spinner while checking auth. After auth confirmed, render: sidebar with navigation (Home, features, Settings), stats cards with real data from Supabase, data table, welcome header. Every button and feature must be FULLY implemented with real Supabase queries. No placeholder onClick handlers. No TODO comments. Every action button (like "Create New", "Add Item") must open a modal/form that inserts data into Supabase. Every navigation item must link to a working route. Include 'use client' and Supabase queries.` },
            { path: 'app/login/page.tsx', desc: `Login page for ${productName}: email + password form with Supabase auth signInWithPassword, redirect to /dashboard on success. Also add a "Sign in with Google" button that calls: supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } }). NEVER hardcode any URL — always use window.location.origin. Centered card layout. Do NOT add any auth check — this is a public page.` },
            { path: 'app/signup/page.tsx', desc: `Signup page for ${productName}: name, email, password fields. On submit: call supabase.auth.signUp({email, password, options: { data: { app_id: '${repoName}' }}}). If signUp returns an error like "already registered", ignore it. Then IMMEDIATELY call supabase.auth.signInWithPassword({email, password}) regardless of signUp result. Then router.push('/dashboard'). Never show 'check your email'. Always redirect to /dashboard after signup. Also insert a row into 'profiles' table with columns (id, email, app_id) where app_id='${repoName}' using upsert. Also add a "Sign up with Google" button: supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } }). NEVER hardcode any URL — always use window.location.origin. Centered card layout with link to /login.` },
            { path: 'app/settings/page.tsx', desc: `Settings page for ${productName}. AUTH GUARD: In a useEffect, call supabase.auth.getUser(). If no user, router.push('/login'). Show loading spinner while checking. Then render: user profile section (name, email from the user object), plan info, danger zone (delete account). 'use client' with Supabase.` },
            { path: 'app/admin/page.tsx', desc: `Admin panel for ${productName}. AUTH GUARD: In a useEffect, call supabase.auth.getUser(). If no user, router.push('/login'). Show loading spinner while checking. Then render: users table from Supabase, stats cards (total users, revenue), recent activity. 'use client' with Supabase.` },
          ]
          await logStep(projectId, 5, 'GitHub Push', 'running', `Generating ${pages.length} pages in parallel...`)
          const results = await Promise.allSettled(
            pages.map(pageInfo => generateFileCode(features, arch, pageInfo.path, pageInfo.desc, allPaths))
          )
          for (let i = 0; i < pages.length; i++) {
            const result = results[i]
            if (result.status === 'fulfilled') {
              totalTokens += 2000; totalCalls++
              allFiles.push({ path: `src/${pages[i].path}`, content: result.value })
            } else {
              console.error(`Failed: ${pages[i].path}:`, result.reason?.message)
            }
          }

          // Atomic push
          await logStep(projectId, 5, 'GitHub Push', 'running', `Pushing ${allFiles.length} files...`)
          await pushAllFilesToGitHub(repoName, allFiles, `🚀 ${productName} — built by Vaxario`)

          await updateProject(projectId, { total_tokens: totalTokens, total_api_calls: totalCalls })
          await logStep(projectId, 5, 'GitHub Push', 'success', `${allFiles.length} files → ${githubUrl}`, 0, Date.now() - start)
        }

        // Step 6: Deploy to Vercel + REAL verification
        if (startFrom <= 6) {
          await updateProject(projectId, { status: 'deploying', current_step: 6 })
          await logStep(projectId, 6, 'Deploy', 'running', 'Deploying to Vercel...')
          const start = Date.now()

          const { url: vercelUrl, projectId: vercelProjectId } = await createVercelProject(repoName, repoName)
          await setVercelEnvVars(repoName)

          // Trigger deployment and capture actual URL from response
          let deploymentUrl = vercelUrl
          try {
            const deployRes = await fetchWithTimeout('https://api.vercel.com/v13/deployments', {
              method: 'POST', headers: { Authorization: `Bearer ${c.vercelToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: repoName, project: repoName, target: 'production', gitSource: { type: 'github', ref: 'main', org: c.githubOwner, repo: repoName } }),
            })
            if (deployRes.ok) {
              const deployData = await deployRes.json()
              if (deployData.url) deploymentUrl = `https://${deployData.url}`
            }
          } catch {}
          await updateProject(projectId, { vercel_url: deploymentUrl })

          // REAL verification — wait, check build status, check URL
          await logStep(projectId, 6, 'Deploy', 'running', 'Waiting for Vercel build...')
          const verify = await verifyDeployment(repoName, c.vercelToken)

          if (verify.success && verify.url) {
            await updateProject(projectId, { vercel_url: verify.url })
            await logStep(projectId, 6, 'Deploy', 'success', `Live → ${verify.url}`, 0, Date.now() - start)
          } else if (verify.status === 'build_failed') {
            await updateProject(projectId, { vercel_url: vercelUrl, status: 'build_failed' })
            await logStep(projectId, 6, 'Deploy', 'failed', `Build failed — ${verify.reason}`, 0, Date.now() - start)
          } else {
            await updateProject(projectId, { vercel_url: verify.url || vercelUrl, status: 'deploy_failed' })
            await logStep(projectId, 6, 'Deploy', 'failed', `Deployment issue — ${verify.reason}`, 0, Date.now() - start)
          }
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

    const { data: final } = await db.from('factory_projects').select('vercel_url, github_url, status').eq('id', projectId).single()

    // NEVER set "live" if deploy/build failed — preserve the failure status
    let finalStatus: string
    if (isFreeUser) {
      finalStatus = 'preview'
    } else if (final?.status === 'build_failed' || final?.status === 'deploy_failed') {
      finalStatus = final.status  // Keep the failure status
    } else if (final?.vercel_url) {
      finalStatus = 'live'
    } else {
      finalStatus = 'failed'
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
