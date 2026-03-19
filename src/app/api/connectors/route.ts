import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_connectors')
    .select('service, status, last_tested_at, metadata, created_at')
    .eq('user_id', user.id)

  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { service, apiKey } = await req.json()
  if (!service || !apiKey) {
    return NextResponse.json({ error: 'service and apiKey required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('user_connectors')
    .upsert({
      user_id: user.id,
      service,
      api_key: apiKey,
      status: 'untested',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,service' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
