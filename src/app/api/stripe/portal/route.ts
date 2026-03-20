import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || !stripeKey.startsWith('sk_')) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  try {
    const { customerId } = await req.json()
    if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 })

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)
    const origin = req.headers.get('origin') || 'https://www.vaxario.com'

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
