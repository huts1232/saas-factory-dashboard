import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !stripeKey.startsWith('sk_') || !webhookSecret || !webhookSecret.startsWith('whsec_')) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)
    const event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
    const supabase = createServiceClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const plan = session.metadata?.plan
        const credits = parseInt(session.metadata?.credits || '0')
        const customerEmail = session.customer_details?.email

        if (customerEmail) {
          // Find user by email
          const { data: users } = await (supabase as any).auth.admin.listUsers()
          const user = users?.users?.find((u: any) => u.email === customerEmail)

          if (user) {
            if (plan === 'starter' || plan === 'pro') {
              // Update subscription
              await supabase.from('subscriptions').upsert({
                user_id: user.id, plan, status: 'active',
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                current_period_start: new Date().toISOString(),
              }, { onConflict: 'user_id' })

              // Grant initial credits
              const grantAmount = plan === 'starter' ? 50 : 200
              const { data: bal } = await supabase.rpc('get_credit_balance', { p_user_id: user.id })
              await supabase.from('credits').insert({
                user_id: user.id, amount: grantAmount, balance_after: (bal || 0) + grantAmount,
                type: 'subscription_grant', description: `${plan} plan — ${grantAmount} credits`,
              })
            } else if (credits > 0) {
              // Credit pack purchase
              const { data: bal } = await supabase.rpc('get_credit_balance', { p_user_id: user.id })
              await supabase.from('credits').insert({
                user_id: user.id, amount: credits, balance_after: (bal || 0) + credits,
                type: 'purchase', description: `Purchased ${credits} credits`,
              })
            }
          }
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any
        await supabase.from('subscriptions').update({ plan: 'free', status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
