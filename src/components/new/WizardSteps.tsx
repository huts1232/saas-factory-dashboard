'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GlowButton } from '@/components/ui/GlowButton'
import { ArrowLeft, ArrowRight, Rocket, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Idee', 'Features', 'Config', 'Bevestiging']

const AUDIENCES = ['Developers', 'Small Business', 'Freelancers', 'Enterprise', 'Consumers']
const PRICING_MODELS = [
  { value: 'freemium', label: 'Freemium', desc: 'Free basis + betaald extra' },
  { value: 'subscription', label: 'Subscription', desc: 'Maandelijks abonnement' },
  { value: 'usage-based', label: 'Usage-based', desc: 'Betaal per gebruik' },
  { value: 'free', label: 'Free', desc: 'Helemaal gratis' },
]

interface WizardProps {
  initialIdea: string
}

export function WizardSteps({ initialIdea }: WizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [idea, setIdea] = useState(initialIdea)
  const [ideaFeedback, setIdeaFeedback] = useState('')
  const [targetUser, setTargetUser] = useState('')
  const [pricingModel, setPricingModel] = useState('freemium')
  const [domain, setDomain] = useState('')
  const [skipReview, setSkipReview] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      // Create project
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: ideaFeedback ? `${idea} (${ideaFeedback})` : idea,
          targetUser,
          pricing: pricingModel,
          domain: domain || undefined,
          skipReview,
        }),
      })
      const data = await res.json()
      if (!data.id) throw new Error('Failed to create project')

      // Start pipeline
      await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: data.id }),
      })

      router.push(`/project/${data.id}`)
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all',
              i < step ? 'bg-accent-green/10 border-accent-green/30 text-accent-green' :
              i === step ? 'bg-accent/10 border-accent/30 text-accent animate-glow' :
              'bg-bg-elevated border-border-default text-text-muted'
            )}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn(
              'text-xs hidden sm:block',
              i === step ? 'text-text-primary' : 'text-text-muted'
            )}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-px',
                i < step ? 'bg-accent-green/30' : 'bg-border-default'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-bg-card border border-border-default rounded-xl p-6"
        >
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Verfijn je idee</h2>
              <p className="text-sm text-text-secondary">Wat wil je bouwen? Wees zo specifiek als je wilt.</p>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="w-full h-24 bg-bg-elevated border border-border-default rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 resize-none"
                placeholder="Beschrijf je SaaS idee..."
              />
              <div>
                <label className="text-xs text-text-muted block mb-1">Extra feedback (optioneel)</label>
                <input
                  value={ideaFeedback}
                  onChange={(e) => setIdeaFeedback(e.target.value)}
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50"
                  placeholder="Focus op X, doelgroep is Y..."
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Doelgroep</h2>
              <p className="text-sm text-text-secondary">Voor wie bouw je dit?</p>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCES.map((a) => (
                  <button
                    key={a}
                    onClick={() => setTargetUser(a)}
                    className={cn(
                      'px-4 py-3 rounded-lg border text-sm text-left transition-all',
                      targetUser === a
                        ? 'border-accent/50 bg-accent/5 text-accent'
                        : 'border-border-default bg-bg-elevated text-text-secondary hover:border-border-bright'
                    )}
                  >
                    {a}
                  </button>
                ))}
                <input
                  value={AUDIENCES.includes(targetUser) ? '' : targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  placeholder="Anders..."
                  className="px-4 py-3 rounded-lg border border-border-default bg-bg-elevated text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Configuratie</h2>
                <div className="space-y-2">
                  {PRICING_MODELS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPricingModel(p.value)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-all',
                        pricingModel === p.value
                          ? 'border-accent/50 bg-accent/5'
                          : 'border-border-default bg-bg-elevated hover:border-border-bright'
                      )}
                    >
                      <div>
                        <span className={pricingModel === p.value ? 'text-accent' : 'text-text-primary'}>{p.label}</span>
                        <span className="text-text-muted ml-2 text-xs">{p.desc}</span>
                      </div>
                      {pricingModel === p.value && <Check className="h-4 w-4 text-accent" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-text-secondary">Custom domein (optioneel)</label>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="mijnapp.nl"
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setSkipReview(!skipReview)}
                  className={cn(
                    'h-5 w-9 rounded-full transition-all cursor-pointer flex items-center',
                    skipReview ? 'bg-bg-elevated' : 'bg-accent'
                  )}
                >
                  <div className={cn(
                    'h-4 w-4 rounded-full bg-white shadow transition-transform',
                    skipReview ? 'translate-x-0.5' : 'translate-x-[18px]'
                  )} />
                </div>
                <span className="text-sm text-text-secondary">Review loop (Claude reviewt en fixt automatisch)</span>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Klaar om te bouwen!</h2>
              <div className="space-y-3 bg-bg-elevated rounded-lg p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Idee</span>
                  <span className="text-text-primary text-right max-w-xs truncate">{idea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Doelgroep</span>
                  <span className="text-text-primary">{targetUser || 'Claude kiest'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Pricing</span>
                  <span className="text-text-primary">{pricingModel}</span>
                </div>
                {domain && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Domein</span>
                    <span className="text-text-primary">{domain}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Review loop</span>
                  <span className="text-text-primary">{skipReview ? 'Uit' : 'Aan'}</span>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                Geschatte tijd: 10-20 minuten &middot; Geschatte kosten: ~300K tokens (~$1)
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <GlowButton
          variant="ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4" /> Vorige
        </GlowButton>

        {step < 3 ? (
          <GlowButton
            variant="accent"
            onClick={() => setStep(step + 1)}
            disabled={step === 0 && !idea.trim()}
          >
            Volgende <ArrowRight className="h-4 w-4" />
          </GlowButton>
        ) : (
          <GlowButton
            variant="green"
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting || !idea.trim()}
          >
            <Rocket className="h-4 w-4" /> Start bouwen
          </GlowButton>
        )}
      </div>
    </div>
  )
}
