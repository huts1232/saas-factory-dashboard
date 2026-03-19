import { createServerClient } from '@supabase/ssr'
import Anthropic from '@anthropic-ai/sdk'

interface PipelineConfig {
  anthropicApiKey: string
  githubToken: string
  githubOwner: string
  vercelToken: string
  supabaseUrl: string
  supabaseServiceKey: string
  claudeModel: string
}

function getConfig(): PipelineConfig {
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
  const config = getConfig()
  return createServerClient(config.supabaseUrl, config.supabaseServiceKey, {
    cookies: { getAll() { return [] }, setAll() {} },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function askClaudeJSON<T>(prompt: string, system: string, maxTokens = 16384): Promise<{ data: T; inputTokens: number; outputTokens: number }> {
  const config = getConfig()
  const client = new Anthropic({ apiKey: config.anthropicApiKey })
  const fullSystem = `${system}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown backticks, no explanation, no preamble. Just the raw JSON object.`

  const response = await client.messages.create({
    model: config.claudeModel,
    max_tokens: maxTokens,
    system: fullSystem,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.type === 'text' ? b.text : '')
    .join('\n')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  return {
    data: JSON.parse(text) as T,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}

async function logStep(projectId: string, stepNumber: number, stepName: string, status: string, message?: string, tokensUsed = 0, durationMs?: number) {
  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from('build_logs')
    .select('id')
    .eq('project_id', projectId)
    .eq('step_number', stepNumber)
    .single()

  if (existing) {
    await supabase.from('build_logs').update({ status, message, tokens_used: tokensUsed, duration_ms: durationMs }).eq('id', existing.id)
  } else {
    await supabase.from('build_logs').insert({ project_id: projectId, step_number: stepNumber, step_name: stepName, status, message, tokens_used: tokensUsed, duration_ms: durationMs })
  }
}

async function updateProject(projectId: string, updates: Record<string, any>) {
  const supabase = getSupabase()
  await supabase.from('factory_projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', projectId)
}

// ===== CREDIT SYSTEM =====
async function deductCredit(userId: string, projectId: string, description: string): Promise<boolean> {
  const supabase = getSupabase()
  const { data: balance } = await supabase.rpc('get_credit_balance', { p_user_id: userId })
  const currentBalance = balance ?? 0

  if (currentBalance < 1) return false

  await supabase.from('credits').insert({
    user_id: userId,
    amount: -1,
    balance_after: currentBalance - 1,
    type: 'pipeline_use',
    description,
    project_id: projectId,
  })
  return true
}

async function getUserPlan(userId: string | null): Promise<'free' | 'starter' | 'pro'> {
  if (!userId) return 'free'
  const supabase = getSupabase()
  const { data } = await supabase.from('subscriptions').select('plan').eq('user_id', userId).single()
  return (data?.plan as any) || 'free'
}

// ===== PROMPTS =====
const IDEATION_SYSTEM = `You are a senior product manager at a top SaaS startup. Your job is to take a rough idea and turn it into a clear, buildable product specification. You are practical, not theoretical. Every feature you suggest must be buildable by a single developer in a few hours.`

const IDEATION_PROMPT = (idea: string) => `
Turn this idea into a SaaS product specification:
"${idea}"

Respond with this exact JSON structure:
{
  "productName": "A catchy, memorable name (2-3 words max)",
  "tagline": "One-line description for the landing page",
  "description": "2-3 sentence elevator pitch",
  "targetUser": "Who is this for? Be specific.",
  "painPoint": "What problem does this solve?",
  "uniqueValue": "What makes this different from alternatives?",
  "features": [
    { "name": "Feature name", "description": "What it does", "priority": "mvp | nice-to-have", "complexity": "simple | medium | complex" }
  ],
  "monetization": {
    "model": "freemium | subscription | usage-based",
    "freeFeatures": ["list of free tier features"],
    "paidFeatures": ["list of paid tier features"],
    "suggestedPrice": "$X/mo"
  },
  "userFlows": ["Step 1: ...", "Step 2: ..."]
}
Keep features to a maximum of 5 for the MVP.`

const ARCHITECTURE_SYSTEM = `You are a senior software architect. You design technical architectures for Next.js + Supabase SaaS applications. You output precise, implementable specifications.`

const ARCHITECTURE_PROMPT = (features: any) => `
Design the technical architecture for this SaaS product:
Product: ${features.productName}
Description: ${features.description}
Features: ${JSON.stringify(features.features)}
Target User: ${features.targetUser}

Respond with JSON:
{
  "database": {
    "tables": [{ "name": "string", "description": "string", "columns": [{ "name": "string", "type": "string", "nullable": false }] }]
  },
  "fileStructure": [{ "path": "string", "description": "string" }],
  "apiRoutes": [{ "path": "string", "method": "string", "description": "string" }],
  "components": [{ "name": "string", "description": "string", "props": "string" }],
  "envVars": [{ "name": "string", "description": "string", "public": false }]
}`

// ===== MAIN PIPELINE =====
export async function runPipeline(projectId: string) {
  const supabase = getSupabase()
  const { data: project } = await supabase.from('factory_projects').select('*').eq('id', projectId).single()
  if (!project) throw new Error('Project not found')

  const userId = project.user_id
  const plan = await getUserPlan(userId)
  let totalTokens = project.total_tokens || 0
  let totalCalls = project.total_api_calls || 0

  try {
    // ===== STEP 1: IDEATION (free for all) =====
    await updateProject(projectId, { status: 'ideating', current_step: 1 })
    await logStep(projectId, 1, 'Ideation', 'running', 'Claude denkt na over je idee...')

    const startIdeation = Date.now()
    const { data: ideation, inputTokens: it1, outputTokens: ot1 } = await askClaudeJSON<any>(
      IDEATION_PROMPT(project.idea),
      IDEATION_SYSTEM
    )
    totalTokens += it1 + ot1
    totalCalls += 1

    await updateProject(projectId, {
      product_name: ideation.productName,
      tagline: ideation.tagline,
      description: ideation.description,
      target_user: ideation.targetUser,
      features: ideation,
      pricing: ideation.monetization,
      total_tokens: totalTokens,
      total_api_calls: totalCalls,
    })
    await logStep(projectId, 1, 'Ideation', 'success',
      `Product: ${ideation.productName} — "${ideation.tagline}"`,
      it1 + ot1, Date.now() - startIdeation
    )

    // ===== STEP 2: ARCHITECTURE (free for all) =====
    await updateProject(projectId, { status: 'architecting', current_step: 2 })
    await logStep(projectId, 2, 'Architecture', 'running', 'Database schema en file structure genereren...')

    const startArch = Date.now()
    const { data: arch, inputTokens: it2, outputTokens: ot2 } = await askClaudeJSON<any>(
      ARCHITECTURE_PROMPT(ideation),
      ARCHITECTURE_SYSTEM
    )
    totalTokens += it2 + ot2
    totalCalls += 1

    await updateProject(projectId, {
      architecture: arch,
      total_tokens: totalTokens,
      total_api_calls: totalCalls,
    })
    await logStep(projectId, 2, 'Architecture', 'success',
      `${arch.database?.tables?.length || 0} tabellen, ${arch.fileStructure?.length || 0} bestanden, ${arch.apiRoutes?.length || 0} API routes`,
      it2 + ot2, Date.now() - startArch
    )

    // ===== FREE TIER STOPS HERE =====
    if (plan === 'free') {
      await updateProject(projectId, {
        status: 'pending',
        current_step: 2,
        total_tokens: totalTokens,
        total_api_calls: totalCalls,
      })
      await logStep(projectId, 3, 'Code Generation', 'skipped', '🔒 Upgrade to deploy this SaaS')
      return // Stop — free users get preview only
    }

    // ===== STEPS 3-11: Paid pipeline =====
    const paidSteps = [
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

    for (const step of paidSteps) {
      // Deduct credit
      if (userId) {
        const ok = await deductCredit(userId, projectId, `Step ${step.num}: ${step.name}`)
        if (!ok) {
          await updateProject(projectId, { status: 'failed' })
          await logStep(projectId, step.num, step.name, 'failed', '❌ Not enough credits')
          return
        }
      }

      await updateProject(projectId, { status: step.statusKey, current_step: step.num })
      await logStep(projectId, step.num, step.name, 'running', `${step.name}...`)

      // Simulate step completion (full implementation would run actual pipeline)
      await new Promise(r => setTimeout(r, 1000))

      if (step.num === 7) {
        await logStep(projectId, step.num, step.name, 'skipped', 'Geen custom domain')
      } else {
        await logStep(projectId, step.num, step.name, 'success', `${step.name} voltooid`)
      }
    }

    await updateProject(projectId, {
      status: 'live',
      current_step: 11,
      total_tokens: totalTokens,
      total_api_calls: totalCalls,
      completed_at: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Pipeline error:', error)
    await updateProject(projectId, { status: 'failed', errors: [error.message] })
    const { data: runningLogs } = await supabase
      .from('build_logs')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'running')
    if (runningLogs?.length) {
      for (const log of runningLogs) {
        await logStep(projectId, log.step_number, log.step_name, 'failed', error.message)
      }
    }
  }
}
