import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { plan, creditPack } = await req.json()

  // Placeholder — Stripe integration pending
  // When Stripe is configured, this will create a Checkout Session
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      error: 'Stripe not configured',
      message: 'Set STRIPE_SECRET_KEY in environment variables to enable payments',
    }, { status: 503 })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
