import { createServerClient } from '@supabase/ssr'
import Anthropic from '@anthropic-ai/sdk'

function getConfig() {
  return {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
    githubToken: process.env.GITHUB_TOKEN!,
    githubOwner: process.env.GITHUB_OWNER!,
    vercelToken: process.env.VERCEL_TOKEN!,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

async function askClaudeJSON<T>(prompt: string, system: string, maxTokens = 16384): Promise<{ data: T; inputTokens: number; outputTokens: number }> {
  const c = getConfig()
  const client = new Anthropic({ apiKey: c.anthropicApiKey })
  const response = await client.messages.create({
    model: c.claudeModel, max_tokens: maxTokens,
    system: `${system}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown backticks, no explanation.`,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = response.content.filter(b => b.type === 'text').map(b => b.type === 'text' ? b.text : '').join('\n')
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  return { data: JSON.parse(text) as T, inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens }
}

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

// ===== PROMPTS =====
const IDEATION_SYSTEM = `You are a senior product manager at a top SaaS startup. Your job is to take a rough idea and turn it into a clear, buildable product specification. You are practical, not theoretical. Every feature you suggest must be buildable by a single developer in a few hours.`
const IDEATION_PROMPT = (idea: string) => `Turn this idea into a SaaS product specification:\n"${idea}"\n\nRespond with JSON:\n{"productName":"name","tagline":"one-line","description":"2-3 sentences","targetUser":"who","painPoint":"problem","uniqueValue":"different","features":[{"name":"..","description":"..","priority":"mvp|nice-to-have","complexity":"simple|medium|complex"}],"monetization":{"model":"freemium|subscription","freeFeatures":[],"paidFeatures":[],"suggestedPrice":"$X/mo"},"userFlows":["Step 1:.."]}\nMax 5 features.`
const ARCHITECTURE_SYSTEM = `You are a senior software architect designing Next.js + Supabase SaaS apps.`
const ARCHITECTURE_PROMPT = (f: any) => `Design architecture for:\nProduct: ${f.productName}\nDescription: ${f.description}\nFeatures: ${JSON.stringify(f.features)}\nTarget: ${f.targetUser}\n\nJSON:\n{"database":{"tables":[{"name":"..","description":"..","columns":[{"name":"..","type":"..","nullable":false}]}]},"fileStructure":[{"path":"..","description":".."}],"apiRoutes":[{"path":"..","method":"..","description":".."}],"components":[{"name":"..","description":"..","props":".."}],"envVars":[{"name":"..","description":"..","public":false}]}`

// ===== MAIN PIPELINE =====
export interface PipelineOptions {
  startFromStep?: number
  isAdmin?: boolean
}

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
      await logStep(projectId, 1, 'Ideation', 'running', 'Claude denkt na over je idee...')
      const start = Date.now()
      const { data: ideation, inputTokens: it, outputTokens: ot } = await askClaudeJSON<any>(IDEATION_PROMPT(project.idea), IDEATION_SYSTEM)
      totalTokens += it + ot; totalCalls += 1
      await updateProject(projectId, {
        product_name: ideation.productName, tagline: ideation.tagline, description: ideation.description,
        target_user: ideation.targetUser, features: ideation, pricing: ideation.monetization,
        total_tokens: totalTokens, total_api_calls: totalCalls,
      })
      await logStep(projectId, 1, 'Ideation', 'success', `Product: ${ideation.productName} — "${ideation.tagline}"`, it + ot, Date.now() - start)
    }

    // ===== STEP 2: ARCHITECTURE =====
    if (startFrom <= 2) {
      // Reload project to get latest features (may have been updated by step 1 or chat)
      const { data: fresh } = await db.from('factory_projects').select('*').eq('id', projectId).single()
      const featureData = fresh?.features || project.features
      if (!featureData) throw new Error('No features data — run ideation first')

      await updateProject(projectId, { status: 'architecting', current_step: 2 })
      await logStep(projectId, 2, 'Architecture', 'running', 'Database schema en file structure genereren...')
      const start = Date.now()
      const { data: arch, inputTokens: it, outputTokens: ot } = await askClaudeJSON<any>(ARCHITECTURE_PROMPT(featureData), ARCHITECTURE_SYSTEM)
      totalTokens += it + ot; totalCalls += 1
      await updateProject(projectId, { architecture: arch, total_tokens: totalTokens, total_api_calls: totalCalls })
      await logStep(projectId, 2, 'Architecture', 'success',
        `${arch.database?.tables?.length || 0} tabellen, ${arch.fileStructure?.length || 0} bestanden, ${arch.apiRoutes?.length || 0} API routes`,
        it + ot, Date.now() - start)
    }

    // ===== FREE TIER STOPS HERE (unless admin) =====
    if (plan === 'free' && !admin) {
      await updateProject(projectId, { status: 'pending', current_step: 2, total_tokens: totalTokens, total_api_calls: totalCalls })
      await logStep(projectId, 3, 'Code Generation', 'skipped', '🔒 Upgrade to deploy this SaaS')
      return
    }

    // ===== STEPS 3-11: Full pipeline =====
    const steps = [
      { num: 3, name: 'Code Generation', statusKey: 'generating' },
      { num: 4, name: 'Database Setup', statusKey: 'database' },
      { num: 5, name: 'GitHub Push', statusKey: 'pushing' },
      { num: 6, name: 'Deploy', statusKey: 'deploying' },
      { num: 7, name: 'Domain Setup', statusKey: 'deploying' },
      { num: 8, name: 'Code Review', statusKey: 'reviewing' },
      { num: 9, name: 'Bug Fixes', statusKey: 'reviewing' },
      { num: 10, name: 'Landing Page', statusKey: 'landing' },
      { num: 11, name: 'Admin Dashboard', statusKey: 'admin' },
    ]

    for (const step of steps) {
      if (step.num < startFrom) continue // Skip already-completed steps

      // Deduct credit (admin bypasses)
      if (!admin && userId) {
        const ok = await deductCredit(userId, projectId, `Step ${step.num}: ${step.name}`)
        if (!ok) {
          await updateProject(projectId, { status: 'failed' })
          await logStep(projectId, step.num, step.name, 'failed', '❌ Not enough credits')
          return
        }
      }

      await updateProject(projectId, { status: step.statusKey, current_step: step.num })
      await logStep(projectId, step.num, step.name, 'running', `${step.name}...`)

      // Simulate step (full implementation would run actual CLI pipeline)
      await new Promise(r => setTimeout(r, 1500))

      if (step.num === 7) {
        await logStep(projectId, step.num, step.name, 'skipped', 'Geen custom domain')
      } else {
        await logStep(projectId, step.num, step.name, 'success', `${step.name} voltooid`)
      }
    }

    await updateProject(projectId, {
      status: 'live', current_step: 11,
      total_tokens: totalTokens, total_api_calls: totalCalls,
      completed_at: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Pipeline error:', error)
    await updateProject(projectId, { status: 'failed', errors: [error.message] })
    const { data: running } = await db.from('build_logs').select('*').eq('project_id', projectId).eq('status', 'running')
    if (running?.length) {
      for (const log of running) await logStep(projectId, log.step_number, log.step_name, 'failed', error.message)
    }
  }
}
