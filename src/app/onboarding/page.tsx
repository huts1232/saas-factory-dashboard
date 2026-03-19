'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GlowButton } from '@/components/ui/GlowButton'
import { Factory, Check, ArrowRight, Sparkles } from 'lucide-react'

const CONNECTOR_STEPS = [
  { service: 'anthropic', name: 'Anthropic', desc: 'Claude API key voor AI-generatie', placeholder: 'sk-ant-...' },
  { service: 'github', name: 'GitHub', desc: 'Personal Access Token voor code repos', placeholder: 'ghp_...' },
  { service: 'vercel', name: 'Vercel', desc: 'API token voor deployments', placeholder: 'vcp_...' },
  { service: 'supabase', name: 'Supabase', desc: 'Access token voor database', placeholder: 'sbp_...' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0=welcome, 1-4=connectors, 5=done
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [results, setResults] = useState<Record<string, boolean>>({})

  const connectorStep = CONNECTOR_STEPS[step - 1]

  async function handleConnect() {
    if (!apiKey.trim()) return
    setSaving(true)

    await fetch('/api/connectors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: connectorStep.service, apiKey }),
    })

    const testRes = await fetch(`/api/connectors/${connectorStep.service}/test`, { method: 'POST' })
    const result = await testRes.json()

    setResults(prev => ({ ...prev, [connectorStep.service]: result.ok }))
    setSaving(false)
    setApiKey('')
    setStep(step + 1)
  }

  function handleSkip() {
    setApiKey('')
    setStep(step + 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-accent' : 'bg-border-default'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-bg-card border border-border-default rounded-xl p-8 text-center">

            {step === 0 && (
              <>
                <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Factory className="h-8 w-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome to SaaS Factory!</h1>
                <p className="text-text-secondary text-sm mb-6">
                  Laten we je API keys instellen zodat je meteen kunt beginnen met bouwen.
                </p>
                <GlowButton variant="accent" onClick={() => setStep(1)} className="w-full">
                  Let&apos;s go <ArrowRight className="h-4 w-4" />
                </GlowButton>
              </>
            )}

            {step >= 1 && step <= 4 && connectorStep && (
              <>
                <h2 className="text-xl font-bold mb-1">Connect {connectorStep.name}</h2>
                <p className="text-sm text-text-secondary mb-6">{connectorStep.desc}</p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={connectorStep.placeholder}
                  className="w-full bg-bg-elevated border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary font-mono outline-none focus:border-accent/50 mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <GlowButton variant="ghost" onClick={handleSkip} className="flex-1">Skip</GlowButton>
                  <GlowButton variant="accent" onClick={handleConnect} loading={saving} disabled={!apiKey.trim()} className="flex-1">
                    Connect & Test
                  </GlowButton>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <div className="h-16 w-16 rounded-2xl bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-accent-green" />
                </div>
                <h1 className="text-2xl font-bold mb-2">All set! 🎉</h1>
                <p className="text-text-secondary text-sm mb-2">
                  {Object.values(results).filter(Boolean).length}/{CONNECTOR_STEPS.length} connectors verbonden
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {CONNECTOR_STEPS.map(s => (
                    <span key={s.service} className={`text-xs px-2 py-1 rounded-full ${
                      results[s.service] ? 'bg-green-400/10 text-green-400' : 'bg-bg-elevated text-text-muted'
                    }`}>
                      {results[s.service] ? <Check className="h-3 w-3 inline mr-1" /> : null}
                      {s.name}
                    </span>
                  ))}
                </div>
                <GlowButton variant="green" onClick={() => router.push('/dashboard')} className="w-full">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </GlowButton>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
