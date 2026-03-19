'use client'

import { useUser } from '@/lib/auth-context'
import { GlowButton } from '@/components/ui/GlowButton'
import { Check, Gem } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    credits: '0 credits',
    features: ['1 project', 'Ideation preview', 'Architecture preview', 'No deploy'],
    cta: 'Current plan',
    accent: false,
  },
  {
    name: 'Starter',
    price: '$19',
    period: '/mo',
    credits: '50 credits/mo',
    features: ['50 credits/mo (~4 deploys)', 'Full pipeline', 'All templates', 'Custom domains', 'Email support'],
    cta: 'Upgrade to Starter',
    accent: true,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    credits: '200 credits/mo',
    features: ['200 credits/mo (~18 deploys)', 'Opus model', 'Priority builds', 'All templates', 'Priority support'],
    cta: 'Upgrade to Pro',
    accent: false,
  },
]

const CREDIT_PACKS = [
  { credits: 10, price: '$5' },
  { credits: 50, price: '$20' },
  { credits: 100, price: '$35' },
]

export default function PricingPage() {
  const { plan: currentPlan } = useUser()

  async function handleCheckout(plan: string) {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert(data.message || 'Stripe not configured yet')
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="text-text-secondary mt-2">Start gratis. Upgrade wanneer je klaar bent om te deployen.</p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {PLANS.map((p) => (
          <div key={p.name} className={cn(
            'rounded-xl border p-6 flex flex-col',
            p.accent ? 'border-accent/50 bg-accent/5' : 'border-border-default bg-bg-card'
          )}>
            {p.accent && (
              <div className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-2">Most popular</div>
            )}
            <h3 className="text-lg font-bold">{p.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{p.price}</span>
              <span className="text-text-muted text-sm">{p.period}</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">{p.credits}</p>
            <ul className="mt-6 space-y-2 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="h-3.5 w-3.5 text-accent-green flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {currentPlan === p.name.toLowerCase() ? (
                <div className="w-full text-center py-2.5 rounded-lg bg-bg-elevated text-text-muted text-sm font-medium">
                  Current plan
                </div>
              ) : (
                <GlowButton
                  variant={p.accent ? 'accent' : 'ghost'}
                  className="w-full"
                  onClick={() => handleCheckout(p.name.toLowerCase())}
                >
                  {p.cta}
                </GlowButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Credit packs */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Credits bijkopen</h2>
        <p className="text-sm text-text-secondary mt-1">Extra credits zonder abonnement te wijzigen</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {CREDIT_PACKS.map((pack) => (
          <button key={pack.credits}
            onClick={() => handleCheckout(`credits_${pack.credits}`)}
            className="bg-bg-card border border-border-default rounded-xl p-4 text-center hover:border-border-bright transition-all">
            <div className="text-2xl font-bold">{pack.credits}</div>
            <div className="text-xs text-text-muted">credits</div>
            <div className="mt-2 text-lg font-semibold text-accent">{pack.price}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
