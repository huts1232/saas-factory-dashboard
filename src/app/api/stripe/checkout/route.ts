import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PRICE_MAP: Record<string, { name: string; amount: number; mode: 'subscription' | 'payment'; credits?: number }> = {
  starter: { name: 'Starter Plan', amount: 1900, mode: 'subscription' },
  pro: { name: 'Pro Plan', amount: 4900, mode: 'subscription' },
  credits_10: { name: '10 Credits', amount: 500, mode: 'payment', credits: 10 },
  credits_50: { name: '50 Credits', amount: 2000, mode: 'payment', credits: 50 },
  credits_100: { name: '100 Credits', amount: 3500, mode: 'payment', credits: 100 },
}

export async function POST(req: Request) {
  const { plan } = await req.json()

  const priceInfo = PRICE_MAP[plan]
  if (!priceInfo) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Check if Stripe is configured with real keys
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey === 'sk_test_placeholder') {
    return NextResponse.json({
      error: 'Stripe not configured yet',
      message: `To enable payments, add your Stripe secret key to environment variables. Plan: ${priceInfo.name} ($${(priceInfo.amount / 100).toFixed(2)})`,
      setupRequired: true,
    }, { status: 503 })
  }

  // When Stripe is configured, this would create a Checkout Session:
  // const stripe = new Stripe(stripeKey)
  // const session = await stripe.checkout.sessions.create({...})
  // return NextResponse.json({ url: session.url })

  return NextResponse.json({ error: 'Stripe integration pending real keys' }, { status: 503 })
}
