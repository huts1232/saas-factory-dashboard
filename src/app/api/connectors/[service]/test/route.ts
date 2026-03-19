import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TEST_ENDPOINTS: Record<string, (key: string) => Promise<{ ok: boolean; message: string }>> = {
  anthropic: async (key) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'content-type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
    })
    return { ok: res.ok || res.status === 429, message: res.ok ? 'Connected' : res.status === 429 ? 'Connected (rate limited)' : `Error: ${res.status}` }
  },
  github: async (key) => {
    const res = await fetch('https://api.github.com/user', { headers: { Authorization: `token ${key}` } })
    const data = await res.json()
    return { ok: res.ok, message: res.ok ? `Connected as ${data.login}` : `Error: ${res.status}` }
  },
  vercel: async (key) => {
    const res = await fetch('https://api.vercel.com/v9/projects', { headers: { Authorization: `Bearer ${key}` } })
    return { ok: res.ok, message: res.ok ? 'Connected' : `Error: ${res.status}` }
  },
  supabase: async (key) => {
    const res = await fetch('https://api.supabase.com/v1/projects', { headers: { Authorization: `Bearer ${key}` } })
    return { ok: res.ok, message: res.ok ? 'Connected' : `Error: ${res.status}` }
  },
  stripe: async (key) => {
    const res = await fetch('https://api.stripe.com/v1/account', { headers: { Authorization: `Bearer ${key}` } })
    return { ok: res.ok, message: res.ok ? 'Connected' : `Error: ${res.status}` }
  },
  resend: async (key) => {
    const res = await fetch('https://api.resend.com/api-keys', { headers: { Authorization: `Bearer ${key}` } })
    return { ok: res.ok, message: res.ok ? 'Connected' : `Error: ${res.status}` }
  },
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get the stored key
  const { data: connector } = await supabase
    .from('user_connectors')
    .select('api_key')
    .eq('user_id', user.id)
    .eq('service', service)
    .single()

  if (!connector) return NextResponse.json({ error: 'Connector not found' }, { status: 404 })

  const testFn = TEST_ENDPOINTS[service]
  if (!testFn) return NextResponse.json({ error: 'Unknown service' }, { status: 400 })

  try {
    const result = await testFn(connector.api_key)
    await supabase
      .from('user_connectors')
      .update({
        status: result.ok ? 'connected' : 'failed',
        last_tested_at: new Date().toISOString(),
        metadata: { last_test_message: result.message },
      })
      .eq('user_id', user.id)
      .eq('service', service)

    return NextResponse.json(result)
  } catch (err: any) {
    await supabase
      .from('user_connectors')
      .update({ status: 'failed', last_tested_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('service', service)

    return NextResponse.json({ ok: false, message: err.message })
  }
}
