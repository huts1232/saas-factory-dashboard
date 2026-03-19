'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useUser } from '@/lib/auth-context'
import { Rocket, Cpu, Globe, Key, Zap, ArrowRight, Send, ChevronDown, Check } from 'lucide-react'

const FEATURES = [
  { icon: Cpu, title: 'AI-Powered', desc: 'Claude generates production-ready code — not just prototypes' },
  { icon: Globe, title: 'Full Stack', desc: 'Real auth, database, API routes. Not a toy, a product' },
  { icon: Key, title: 'Your Infrastructure', desc: 'Bring your own API keys. You own everything' },
  { icon: Zap, title: '10+ Templates', desc: 'Start from proven SaaS blueprints — CRM, Invoice, AI Tool' },
]

const STEPS = [
  { num: '01', title: 'Start with an idea', desc: 'Describe the SaaS you want to build in plain language' },
  { num: '02', title: 'Watch it come to life', desc: 'AI generates code, database schema, and UI in real-time' },
  { num: '03', title: 'Ship instantly', desc: 'Deployed to Vercel with auth, database, and domain — ready for users' },
]

const PLANS_PREVIEW = [
  { name: 'Free', price: '$0', desc: 'Preview your SaaS design', features: ['1 project', 'AI ideation', 'Architecture preview'] },
  { name: 'Starter', price: '$19', desc: '~4 full builds per month', features: ['50 credits/mo', 'Full deploy pipeline', 'All templates', 'Custom domains'], popular: true },
  { name: 'Pro', price: '$49', desc: '~18 full builds per month', features: ['200 credits/mo', 'Opus model', 'Priority builds', 'Email support'] },
]

const FAQS = [
  { q: 'What exactly gets built?', a: 'A full Next.js 14 app with TypeScript, Tailwind CSS, Supabase auth & database, API routes, and a polished UI. Deployed live on Vercel.' },
  { q: 'How long does a build take?', a: 'The AI pipeline takes 10-20 minutes to generate, test, and deploy a complete application.' },
  { q: 'Do I own the code?', a: 'Yes, 100%. All code is pushed to your GitHub repository. You can modify, extend, or sell it.' },
  { q: 'What is the BYOK model?', a: 'Bring Your Own Keys — you connect your own Anthropic, GitHub, Vercel, and Supabase accounts. Your data stays under your control.' },
  { q: 'Can I customize after building?', a: 'Absolutely. The generated code is clean, well-structured TypeScript. Edit it like any Next.js project.' },
]

export function LandingPage({ projectCount }: { projectCount: number }) {
  const { openLoginModal } = useUser()
  const [idea, setIdea] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    openLoginModal(idea || undefined)
  }

  return (
    <div className="min-h-screen">
      {/* Hero with gradient background */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-text-secondary mb-8">
            <Zap className="h-3 w-3 text-accent" /> {projectCount}+ SaaS apps built
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Build a SaaS in<br />
            <span className="gradient-text">minutes</span>, not months
          </h1>

          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
            Describe your idea. AI builds it. Full stack Next.js + Supabase, deployed on Vercel.
          </p>
        </motion.div>

        {/* Input card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full max-w-2xl mt-10">
          <form onSubmit={handleSubmit}>
            <div className="relative bg-bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20">
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe what you want to build..."
                className="w-full bg-transparent px-6 py-5 pr-14 text-lg text-text-primary placeholder:text-text-muted outline-none rounded-2xl"
              />
              <button type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/90 transition-all">
                <Send className="h-4 w-4 text-bg-primary" />
              </button>
            </div>
          </form>
          <p className="text-xs text-text-muted mt-3 text-center">Free to start &middot; No credit card required</p>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-accent text-sm font-medium mb-2 text-center">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Meet SaaS Factory</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {STEPS.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
              <div className="text-4xl font-bold gradient-text mb-3">{step.num}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to ship</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-bg-card border border-border-default rounded-2xl p-8 hover:border-border-bright transition-all group">
              <f.icon className="h-10 w-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">Simple pricing</h2>
        <p className="text-text-secondary text-center mb-12">Start free. Upgrade when you&apos;re ready to deploy.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS_PREVIEW.map((p) => (
            <div key={p.name} className={`rounded-2xl border p-6 flex flex-col ${
              p.popular ? 'border-accent/40 bg-accent/5 ring-1 ring-accent/20' : 'border-border-default bg-bg-card'
            }`}>
              {p.popular && <span className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-2">Most popular</span>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold">{p.price}</span>
                {p.price !== '$0' && <span className="text-text-muted text-sm">/mo</span>}
              </div>
              <p className="text-xs text-text-secondary mt-1 mb-4">{p.desc}</p>
              <ul className="space-y-2 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="h-3.5 w-3.5 text-accent-green flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => openLoginModal()}
                className={`mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  p.popular ? 'bg-accent text-bg-primary hover:bg-accent/90' : 'bg-bg-elevated text-text-primary hover:bg-border-default'
                }`}>
                {p.name === 'Free' ? 'Start free' : `Get ${p.name}`}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-border-default rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-bg-card transition-all">
                {faq.q}
                <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-text-secondary">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to build?</h2>
        <p className="text-text-secondary mb-8 text-lg">Your next SaaS is one sentence away.</p>
        <button onClick={() => openLoginModal()}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-bg-primary font-semibold text-lg hover:bg-accent/90 transition-all">
          <Rocket className="h-5 w-5" /> Start building — it&apos;s free
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="gradient-text font-bold text-sm">SaaS Factory</span>
            <span>&middot; &copy; 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-text-secondary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy</Link>
            <Link href="/pricing" className="hover:text-text-secondary transition-colors">Pricing</Link>
            <Link href="/templates" className="hover:text-text-secondary transition-colors">Templates</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
