import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  // When configured:
  // 1. Verify webhook signature with Stripe
  // 2. Handle events:
  //    - checkout.session.completed → create/upgrade subscription, grant credits
  //    - invoice.paid → renew credits for subscription period
  //    - customer.subscription.updated → update plan
  //    - customer.subscription.deleted → downgrade to free

  const body = await req.text()
  // const sig = req.headers.get('stripe-signature')
  // const event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)

  // const supabase = createServiceClient()
  // switch (event.type) {
  //   case 'checkout.session.completed':
  //     // Grant credits or update subscription
  //     break
  //   case 'invoice.paid':
  //     // Monthly credit renewal
  //     break
  //   case 'customer.subscription.deleted':
  //     // Downgrade to free
  //     break
  // }

  return NextResponse.json({ received: true })
}
