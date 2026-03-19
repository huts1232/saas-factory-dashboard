import { NextResponse } from 'next/server'

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
