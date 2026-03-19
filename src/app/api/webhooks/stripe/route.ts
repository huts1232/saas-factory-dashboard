import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Placeholder — Stripe webhook handler
  // Will handle: checkout.session.completed, invoice.paid, customer.subscription.updated/deleted
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }
  return NextResponse.json({ received: true })
}
