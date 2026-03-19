import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [balanceRes, historyRes] = await Promise.all([
    supabase.rpc('get_credit_balance', { p_user_id: user.id }),
    supabase.from('credits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
  ])

  return NextResponse.json({
    balance: balanceRes.data ?? 0,
    history: historyRes.data || [],
  })
}
