'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useUser } from '@/lib/auth-context'
import {
  Rocket, ChevronDown, Check, Send, FileText, BarChart3,
  CreditCard, Shield, Smartphone, Globe, ArrowRight,
} from 'lucide-react'

const PLACEHOLDERS = [
  'A study tool where students pay $9/mo...',
  'An invoice app for freelancers at $19/mo...',
  'A booking platform that charges per appointment...',
  'A CRM for agencies with $29/mo subscriptions...',
]

const CHIPS = [
  { emoji: '🧾', label: 'Invoice SaaS' },
  { emoji: '📅', label: 'Booking Platform' },
  { emoji: '📚', label: 'Study Tool' },
  { emoji: '👥', label: 'CRM' },
]

const STEPS = [
  { num: '01', icon: '🔗', title: 'Connect your tools', desc: 'Link your GitHub, Vercel, Supabase, and Stripe accounts. One-time setup, takes 5 minutes.' },
  { num: '02', icon: '💡', title: 'Describe your idea', desc: 'Tell us what SaaS you want to build. AI designs the features, pricing model, and user flows.' },
  { num: '03', icon: '☕', title: 'Go grab a coffee', desc: 'AI writes the code, sets up the database, builds a landing page, adds Stripe payments, and deploys everything. Takes about 10 minutes.' },
  { num: '04', icon: '💰', title: 'Start earning', desc: 'Your SaaS is live. Customers visit your landing page, sign up, pay for subscriptions. You earn money on every payment.' },
]

const FEATURES = [
  { icon: FileText, title: 'Landing Page', desc: 'A beautiful, conversion-optimized page that sells your product. Pricing table, features, FAQ — all generated.' },
  { icon: BarChart3, title: 'Customer Dashboard', desc: 'Your users get a full dashboard to use your product. Auth, settings, and all the features — built in.' },
  { icon: CreditCard, title: 'Stripe Payments', desc: 'Subscriptions, one-time payments, free trials. Your customers pay, you earn. Stripe handles everything.' },
  { icon: Shield, title: 'Auth & Database', desc: 'User accounts, login, data storage. Built on Supabase with enterprise-grade security.' },
  { icon: Smartphone, title: 'Admin Panel', desc: 'See your customers, revenue, and usage. Manage your SaaS from a dedicated admin dashboard.' },
  { icon: Globe, title: 'Custom Domain', desc: 'Connect your own domain. yoursaas.com — not some-random-subdomain.vercel.app' },
]

const EXAMPLES = [
  { name: 'StudyGen', tagline: 'AI-powered study tools for students', time: '12 min', price: '$9/mo', features: ['AI Quizzes', 'Flashcards', 'Progress Tracking'] },
  { name: 'InvoiceFlow', tagline: 'Dead-simple invoicing for freelancers', time: '14 min', price: '$19/mo', features: ['Auto-generate', 'Payment tracking', 'Client portal'] },
  { name: 'TestMark', tagline: 'Bookmark health monitoring', time: '18 min', price: '$5/mo', features: ['URL Monitoring', 'Alerts', 'Team sharing'] },
]

const PLANS = [
  { name: 'Free', price: '$0', period: 'forever', desc: 'See what AI builds for you (preview only)', features: ['1 project', 'AI ideation preview', 'Architecture preview', 'No deploy'], cta: 'Start free' },
  { name: 'Starter', price: '$19', period: '/mo', desc: 'Launch your first SaaS business', features: ['50 credits/mo (~4 builds)', 'Full deploy pipeline', 'Stripe integration', 'Custom domains', 'All templates'], cta: 'Get Starter', popular: true },
  { name: 'Pro', price: '$49', period: '/mo', desc: 'Scale to multiple SaaS products', features: ['200 credits/mo (~18 builds)', 'Opus model', 'Priority builds', 'Email support', 'Advanced templates'], cta: 'Get Pro' },
]

const FAQS = [
  { q: 'How does this actually work?', a: 'You describe your idea, AI builds a complete app with landing page, dashboard, payments, and database. It gets deployed on your own Vercel account — live and ready for customers.' },
  { q: 'Do I really earn money from this?', a: 'Yes. Stripe is integrated. When customers sign up and pay, the money goes directly to YOUR Stripe account. We don\'t take a cut of your revenue.' },
  { q: 'What tech stack do the apps use?', a: 'Next.js, TypeScript, Tailwind CSS, Supabase (database + auth), Vercel (hosting), Stripe (payments). Production-grade, not a toy.' },
  { q: 'Do I own the code?', a: '100%. It\'s pushed to YOUR GitHub. You can modify it, hire developers to extend it, or do whatever you want. It\'s yours.' },
  { q: 'What are credits?', a: 'Each build step costs 1 credit. A full SaaS build takes ~11 credits. Starter plan includes 50 credits/month — enough for ~4 complete SaaS products.' },
  { q: 'Do I need to code?', a: 'No. But you CAN. The code is clean TypeScript and you can edit it with Claude Code or any IDE if you want to customize.' },
]

export function LandingPage({ projectCount }: { projectCount: number }) {
  const { openLoginModal } = useUser()
  const [idea, setIdea] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  // Typewriter effect
  useEffect(() => {
    const target = PLACEHOLDERS[placeholderIdx]
    if (isTyping) {
      if (displayedPlaceholder.length < target.length) {
        const timer = setTimeout(() => setDisplayedPlaceholder(target.slice(0, displayedPlaceholder.length + 1)), 40)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => setIsTyping(false), 2000)
        return () => clearTimeout(timer)
      }
    } else {
      if (displayedPlaceholder.length > 0) {
        const timer = setTimeout(() => setDisplayedPlaceholder(displayedPlaceholder.slice(0, -1)), 20)
        return () => clearTimeout(timer)
      } else {
        setPlaceholderIdx((placeholderIdx + 1) % PLACEHOLDERS.length)
        setIsTyping(true)
      }
    }
  }, [displayedPlaceholder, isTyping, placeholderIdx])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    openLoginModal(idea || undefined)
  }

  function handleChip(label: string) {
    setIdea(label)
    openLoginModal(label)
  }

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-text-secondary mb-8">
            ⚡ Become a builder today
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08]">
            From idea to<br /><span className="gradient-text">revenue</span> in minutes
          </h1>
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Describe your SaaS idea. AI builds everything — landing page, dashboard, payments.
            Your customers sign up, you earn money. That simple.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="w-full max-w-2xl mt-10">
          <form onSubmit={handleSubmit}>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 via-accent/20 to-pink-500/20 opacity-60 group-focus-within:opacity-100 blur-lg transition-opacity" />
              <div className="relative bg-bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/30">
                <input type="text" value={idea} onChange={(e) => setIdea(e.target.value)}
                  placeholder={displayedPlaceholder + (isTyping ? '|' : '')}
                  className="w-full bg-transparent px-7 py-6 pr-16 text-lg text-text-primary placeholder:text-text-muted/60 outline-none rounded-2xl" />
                <button type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/90 hover:scale-105 transition-all shadow-lg shadow-accent/20">
                  <Send className="h-4 w-4 text-bg-primary" />
                </button>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {CHIPS.map((c) => (
              <button key={c.label} onClick={() => handleChip(c.label)}
                className="px-3.5 py-1.5 rounded-full text-xs text-text-secondary bg-white/5 border border-white/10 hover:border-accent/30 hover:text-accent transition-all">
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-text-muted mt-4">Free to start &middot; No credit card required &middot; Your first preview in 2 minutes</p>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="px-6 py-28 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-accent text-sm font-medium mb-2 text-center">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Idea to income in 4 steps</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="text-xs font-mono text-accent mb-2">{step.num}</div>
              <h3 className="text-base font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== WHAT YOU GET ===== */}
      <section className="px-6 py-28 max-w-5xl mx-auto">
        <p className="text-accent text-sm font-medium mb-2 text-center">What you get</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Everything you need to run a SaaS business</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-bg-card border border-border-default rounded-2xl p-7 hover:border-border-bright transition-all group">
              <f.icon className="h-9 w-9 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== EXAMPLES ===== */}
      <section className="px-6 py-28 max-w-5xl mx-auto">
        <p className="text-accent text-sm font-medium mb-2 text-center">Real examples</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">See what builders are creating</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXAMPLES.map((ex, i) => (
            <motion.div key={ex.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-bg-card border border-border-default rounded-2xl p-6 hover:border-border-bright transition-all">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{ex.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green font-medium">⚡ {ex.time}</span>
              </div>
              <p className="text-sm text-text-secondary mb-4">{ex.tagline}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {ex.features.map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted">{f}</span>
                ))}
              </div>
              <div className="pt-3 border-t border-border-default text-sm">
                Users pay <span className="text-accent-green font-semibold">{ex.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== THE MATH ===== */}
      <section className="px-6 py-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-accent text-sm font-medium mb-2">The math</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Do the math</h2>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-bg-card border border-border-default rounded-2xl p-10">
            <p className="text-text-secondary mb-8 text-lg leading-relaxed">
              You build a study tool SaaS.<br />
              You charge <span className="text-text-primary font-semibold">$9/month</span> per user.<br />
              You get <span className="text-text-primary font-semibold">100 users</span> in 3 months.
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl md:text-6xl font-bold gradient-text">$900</span>
              <span className="text-xl text-text-secondary">/month</span>
            </div>
            <p className="text-lg text-text-secondary">recurring revenue</p>
            <p className="mt-6 text-sm text-text-muted italic">From an idea you had over coffee.</p>
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="px-6 py-28 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">Simple pricing</h2>
        <p className="text-text-secondary text-center mb-12">Start free. Upgrade when you&apos;re ready to launch.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div key={p.name} className={`rounded-2xl border p-7 flex flex-col ${
              p.popular ? 'border-accent/40 bg-accent/5 ring-1 ring-accent/20' : 'border-border-default bg-bg-card'
            }`}>
              {p.popular && <span className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-2">Most popular</span>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-text-muted text-sm">{p.period}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1 mb-5">{p.desc}</p>
              <ul className="space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="h-3.5 w-3.5 text-accent-green flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => openLoginModal()}
                className={`mt-7 w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  p.popular ? 'bg-accent text-bg-primary hover:bg-accent/90' : 'bg-bg-elevated text-text-primary hover:bg-border-default'
                }`}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="px-6 py-28 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-border-default rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium hover:bg-bg-card/50 transition-all">
                {faq.q}
                <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-text-secondary leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="px-6 py-28 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to launch your SaaS?</h2>
        <p className="text-text-secondary mb-10 text-lg">Join builders who are turning ideas into income.</p>

        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input type="text" value={idea} onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your SaaS idea..."
                className="w-full bg-bg-card border border-border-default rounded-2xl px-6 py-5 pr-14 text-lg text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50" />
              <button type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/90 transition-all">
                <ArrowRight className="h-4 w-4 text-bg-primary" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border-default px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="gradient-text font-bold text-sm">SaaS Factory</span>
            <span>&middot; Powered by Claude &middot; Built with Next.js + Supabase</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-text-secondary transition-colors">Home</Link>
            <Link href="/templates" className="hover:text-text-secondary transition-colors">Templates</Link>
            <Link href="/pricing" className="hover:text-text-secondary transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-text-secondary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy</Link>
          </div>
        </div>
        <p className="text-center text-[10px] text-text-muted mt-4">&copy; 2026 SaaS Factory. All rights reserved.</p>
      </footer>
    </div>
  )
}
