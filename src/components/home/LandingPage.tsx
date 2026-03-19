'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Rocket, Cpu, Globe, Key, Zap, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: Cpu, title: 'AI-Powered', desc: 'Claude designs your entire app — features, database, code' },
  { icon: Globe, title: 'Full Stack', desc: 'Next.js + Supabase + Vercel, deployed and live' },
  { icon: Key, title: 'Your Keys', desc: 'BYOK model — use your own API keys, full control' },
  { icon: Zap, title: 'Minutes', desc: 'From idea to live app in under 20 minutes' },
]

const STEPS = [
  { num: '01', title: 'Describe', desc: 'Tell us your SaaS idea in one sentence' },
  { num: '02', title: 'Review', desc: 'AI generates features, architecture, and a full spec' },
  { num: '03', title: 'Ship', desc: 'One click to deploy — code, database, hosting, done' },
]

export function LandingPage({ projectCount }: { projectCount: number }) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6">
            <Zap className="h-3 w-3" /> {projectCount}+ SaaS apps built
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight">
            Build a SaaS in <span className="gradient-text">minutes</span>,<br />not months
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
            Describe your idea. AI builds it. You ship today.
            Full stack Next.js + Supabase, deployed on Vercel.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Link href="/signup"
              className="px-6 py-3 rounded-lg bg-accent text-bg-primary font-semibold hover:bg-accent/90 transition-all flex items-center gap-2">
              Start building — it&apos;s free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing"
              className="px-6 py-3 rounded-lg border border-border-default text-text-secondary font-medium hover:bg-bg-card transition-all">
              View pricing
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
              className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">{step.num}</div>
              <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-text-secondary">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-bg-card border border-border-default rounded-xl p-6 hover:border-border-bright transition-all">
              <f.icon className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-text-secondary">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to build?</h2>
        <p className="text-text-secondary mb-6">Start for free. No credit card required.</p>
        <Link href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-accent text-bg-primary font-semibold hover:bg-accent/90 transition-all">
          <Rocket className="h-5 w-5" /> Create your first SaaS
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-text-muted">
          <span>&copy; 2026 SaaS Factory</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-text-secondary">Terms</Link>
            <Link href="/privacy" className="hover:text-text-secondary">Privacy</Link>
            <Link href="/pricing" className="hover:text-text-secondary">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
