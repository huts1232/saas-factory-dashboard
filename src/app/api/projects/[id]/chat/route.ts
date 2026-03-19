import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { message } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'message required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: project, error } = await supabase
    .from('factory_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // Add user message to history
  const messages = [...(project.messages || []), { role: 'user', content: message, timestamp: new Date().toISOString() }]

  // Build context from current project state
  const context = JSON.stringify({
    productName: project.product_name,
    tagline: project.tagline,
    description: project.description,
    features: project.features,
    architecture: project.architecture,
    pricing: project.pricing,
  })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: `You are a product designer updating a SaaS product specification. The user wants to modify their product. Apply their request to the current spec and return the COMPLETE updated spec as JSON.

IMPORTANT: Return ONLY valid JSON with this structure:
{
  "productName": "...",
  "tagline": "...",
  "description": "...",
  "targetUser": "...",
  "features": [{"name": "...", "description": "...", "priority": "mvp|nice-to-have", "complexity": "simple|medium|complex"}],
  "monetization": {"model": "...", "freeFeatures": [], "paidFeatures": [], "suggestedPrice": "..."},
  "architecture": {
    "database": {"tables": [{"name": "...", "description": "...", "columns": [{"name": "...", "type": "...", "nullable": false}]}]},
    "fileStructure": [{"path": "...", "description": "..."}],
    "apiRoutes": [{"path": "...", "method": "...", "description": "..."}],
    "components": [{"name": "...", "description": "...", "props": "..."}]
  },
  "reply": "A brief friendly message explaining what you changed"
}`,
    messages: [{
      role: 'user',
      content: `Current product spec:\n${context}\n\nUser request: "${message}"\n\nApply this change and return the updated complete spec as JSON.`
    }],
  })

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.type === 'text' ? b.text : '')
    .join('')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let updatedSpec: any
  try {
    updatedSpec = JSON.parse(text)
  } catch {
    // If JSON parse fails, just save the message and return
    await supabase.from('factory_projects').update({ messages }).eq('id', id)
    return NextResponse.json({ reply: 'I understood your request but had trouble formatting the response. Please try again.', updated: false })
  }

  const reply = updatedSpec.reply || 'Updated!'
  messages.push({ role: 'assistant', content: reply, timestamp: new Date().toISOString() })

  // Update project with new spec
  const updates: Record<string, any> = {
    messages,
    updated_at: new Date().toISOString(),
    total_tokens: (project.total_tokens || 0) + response.usage.input_tokens + response.usage.output_tokens,
    total_api_calls: (project.total_api_calls || 0) + 1,
  }

  if (updatedSpec.productName) updates.product_name = updatedSpec.productName
  if (updatedSpec.tagline) updates.tagline = updatedSpec.tagline
  if (updatedSpec.description) updates.description = updatedSpec.description
  if (updatedSpec.targetUser) updates.target_user = updatedSpec.targetUser
  if (updatedSpec.features) {
    updates.features = { ...project.features, features: updatedSpec.features, ...(updatedSpec.monetization ? {} : {}) }
    if (updatedSpec.productName) updates.features.productName = updatedSpec.productName
    if (updatedSpec.tagline) updates.features.tagline = updatedSpec.tagline
  }
  if (updatedSpec.monetization) updates.pricing = updatedSpec.monetization
  if (updatedSpec.architecture) updates.architecture = updatedSpec.architecture

  await supabase.from('factory_projects').update(updates).eq('id', id)

  return NextResponse.json({ reply, updated: true })
}
