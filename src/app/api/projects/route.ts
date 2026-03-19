import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServiceClient()
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()

  let query = supabase.from('factory_projects').select('*').order('created_at', { ascending: false })

  // If authenticated, show only user's projects + legacy (no user_id)
  if (user) {
    query = query.or(`user_id.eq.${user.id},user_id.is.null`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { idea, targetUser, pricing, domain, skipReview } = body

  if (!idea?.trim()) {
    return NextResponse.json({ error: 'idea is required' }, { status: 400 })
  }

  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()

  const name = idea.slice(0, 60)
  const slug = slugify(idea) + '-' + Date.now().toString(36)

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('factory_projects')
    .insert({
      name,
      slug,
      idea,
      target_user: targetUser || null,
      pricing: pricing ? { model: pricing } : null,
      domain: domain || null,
      user_id: user?.id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
