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

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || !stripeKey.startsWith('sk_')) {
    return NextResponse.json({
      error: 'Stripe not configured',
      message: 'Set a valid STRIPE_SECRET_KEY (starting with sk_) in environment variables.',
      setupRequired: true,
    }, { status: 503 })
  }

  // Dynamic import to avoid build errors when stripe isn't installed
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)

    const origin = req.headers.get('origin') || 'https://saas-factory-dashboard.vercel.app'

    const sessionParams: any = {
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: priceInfo.name },
          unit_amount: priceInfo.amount,
          ...(priceInfo.mode === 'subscription' ? { recurring: { interval: 'month' } } : {}),
        },
        quantity: 1,
      }],
      mode: priceInfo.mode,
      success_url: `${origin}/dashboard?checkout=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      metadata: { plan, credits: priceInfo.credits?.toString() || '' },
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message)
    return NextResponse.json({ error: err.message || 'Stripe error' }, { status: 500 })
  }
}
