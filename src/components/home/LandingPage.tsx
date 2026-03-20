'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useUser } from '@/lib/auth-context'
import { Rocket, ChevronDown, Check, Send, ArrowRight, Zap } from 'lucide-react'
import { ProjectPreviewModal } from './ProjectPreviewModal'

const PLACEHOLDERS = ['A study app that turns PDFs into flashcards...', 'An invoice tool for freelancers...', 'A legal document scanner for small businesses...', 'A booking platform for personal trainers...']
const CHIPS = [{ emoji: '📚', label: 'Study Tool' }, { emoji: '🧾', label: 'Invoice App' }, { emoji: '📅', label: 'Booking Platform' }, { emoji: '⚖️', label: 'Legal Scanner' }]

const EXAMPLES = [
  { name: 'StudyGen', icon: '📚', tagline: 'AI study tools for students', time: '12 min', price: '$9/mo', features: ['PDF Upload', 'AI Flashcards', 'Smart Quizzes', 'Progress Tracking'], tables: 9, files: 29, routes: 21, idea: 'A study tool where students upload PDFs and AI generates flashcards', color: 'from-blue-600 to-purple-600', description: 'Upload any document. AI creates flashcards and study plans.' },
  { name: 'InvoiceFlow', icon: '🧾', tagline: 'Invoicing for freelancers', time: '14 min', price: '$19/mo', features: ['Create Invoices', 'Payment Tracking', 'Client Portal', 'PDF Export'], tables: 6, files: 22, routes: 14, idea: 'An invoice tool for freelancers', color: 'from-emerald-600 to-teal-600', description: 'Create invoices, track payments, manage clients.' },
  { name: 'TestMark', icon: '🔖', tagline: 'Bookmark health monitoring', time: '18 min', price: '$5/mo', features: ['URL Monitoring', 'Health Alerts', 'Team Sharing', 'Dashboard'], tables: 5, files: 59, routes: 14, idea: 'A bookmark health monitor', color: 'from-orange-600 to-red-600', description: 'Monitor bookmarks. Get alerted when links break.' },
]

const COMPARISON = [
  { what: 'Landing page', diy: '2-3 days', vax: '2 minutes' }, { what: 'User authentication', diy: '1-2 days', vax: 'Included' },
  { what: 'Database setup', diy: '1 day', vax: 'Included' }, { what: 'Payment integration', diy: '1-2 days', vax: 'Included' },
  { what: 'Admin dashboard', diy: '2-3 days', vax: 'Included' }, { what: 'Deployment', diy: 'Half a day', vax: 'Automatic' },
  { what: 'Total time', diy: '2-3 weeks', vax: '10 minutes' }, { what: 'Cost', diy: '$5,000+', vax: '$19/month' },
]

const PLANS = [
  { name: 'Free', price: '$0', period: 'forever', desc: 'See what Vaxario builds for you', features: ['Preview your Vax', 'AI designs features & architecture', 'No deployment'], cta: 'Start free' },
  { name: 'Starter', price: '$19', period: '/mo', desc: 'Launch your first Vax', features: ['50 credits (~4 complete Vaxes)', 'Deploy to your own accounts', 'Landing page + dashboard + payments', 'Customers pay you directly'], cta: 'Get Starter', popular: true },
  { name: 'Pro', price: '$49', period: '/mo', desc: 'Build a portfolio of Vaxes', features: ['200 credits', 'Everything in Starter', 'Priority builds', 'Custom domains'], cta: 'Get Pro' },
]

const FAQS = [
  { q: 'Do I need to know how to code?', a: 'No. Vaxario handles everything. You just describe what you want to build.' },
  { q: 'Do I really own everything?', a: "Yes. Code on your GitHub, app on your Vercel, money to your Stripe. We don't touch your revenue. Ever." },
  { q: 'What can I build?', a: 'Anything SaaS: AI tools, invoice apps, booking platforms, CRMs, monitoring tools — you name it.' },
  { q: 'How do I make money from this?', a: 'Your Vax comes with Stripe payments built in. Set your price, share your link, customers pay you directly.' },
  { q: 'What if I want to change something?', a: "Use the chat to ask for changes. Or edit the code yourself — it's clean TypeScript on your GitHub." },
]

function AnimatedNumber({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null); const inView = useInView(ref, { once: true }); const [v, setV] = useState(0)
  useEffect(() => { if (!inView) return; const s = Date.now(); const t = () => { const p = Math.min((Date.now() - s) / 1500, 1); setV(Math.round((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) requestAnimationFrame(t) }; requestAnimationFrame(t) }, [inView, target])
  return <span ref={ref}>{v.toLocaleString()}</span>
}

export function LandingPage({ projectCount }: { projectCount: number }) {
  const { openLoginModal } = useUser()
  const [idea, setIdea] = useState(''); const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [previewProject, setPreviewProject] = useState<typeof EXAMPLES[number] | null>(null)
  const [pi, setPi] = useState(0); const [dp, setDp] = useState(''); const [typing, setTyping] = useState(true)

  useEffect(() => {
    const t = PLACEHOLDERS[pi]
    if (typing) { if (dp.length < t.length) { const tm = setTimeout(() => setDp(t.slice(0, dp.length + 1)), 40); return () => clearTimeout(tm) } else { const tm = setTimeout(() => setTyping(false), 2000); return () => clearTimeout(tm) } }
    else { if (dp.length > 0) { const tm = setTimeout(() => setDp(dp.slice(0, -1)), 20); return () => clearTimeout(tm) } else { setPi((pi + 1) % PLACEHOLDERS.length); setTyping(true) } }
  }, [dp, typing, pi])

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); openLoginModal(idea || undefined) }

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10"><div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" /><div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} /><div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} /></div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-text-secondary mb-8">⚡ Become a builder today</div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08]">Want to build and sell<br />your own <span className="gradient-text">AI tool</span>?</h1>
          <p className="mt-6 text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">You don&apos;t need to code. You don&apos;t need a team. Just describe what you want to build. Vaxario creates it, deploys it, and connects payments — so you can start earning.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="w-full max-w-2xl mt-10">
          <form onSubmit={handleSubmit}>
            <div className="relative group"><div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/20 via-accent/20 to-pink-500/20 opacity-60 group-focus-within:opacity-100 blur-lg transition-opacity" /><div className="relative bg-bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/30"><input type="text" value={idea} onChange={e => setIdea(e.target.value)} placeholder={dp + (typing ? '|' : '')} className="w-full bg-transparent px-7 py-6 pr-16 text-lg text-text-primary placeholder:text-text-muted/60 outline-none rounded-2xl" /><button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/90 hover:scale-105 transition-all shadow-lg shadow-accent/20"><Send className="h-4 w-4 text-bg-primary" /></button></div></div>
          </form>
          <div className="flex flex-wrap gap-2 justify-center mt-5">{CHIPS.map(c => <button key={c.label} onClick={() => { setIdea(c.label); openLoginModal(c.label) }} className="px-3.5 py-1.5 rounded-full text-xs text-text-secondary bg-white/5 border border-white/10 hover:border-accent/30 hover:text-accent transition-all">{c.emoji} {c.label}</button>)}</div>
          <p className="text-xs text-text-muted mt-4">No coding required &middot; Free preview &middot; Deploy in minutes</p>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-28"><div className="max-w-5xl mx-auto">
        <p className="text-accent text-sm font-medium mb-2 text-center">How it works</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">From idea to paying customers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { num: '01', icon: '💡', title: 'Describe it', desc: 'Tell Vaxario what you want to build. An AI study tool? An invoice app? Just describe it in plain language.', g: 'from-blue-500/10 to-cyan-500/5' },
            { num: '02', icon: '🤖', title: 'We build it', desc: "Vaxario's AI creates everything: landing page, dashboard, auth, database, and Stripe payments. In minutes.", g: 'from-purple-500/10 to-pink-500/5' },
            { num: '03', icon: '🔑', title: 'You own it', desc: "Code on YOUR GitHub. App on YOUR hosting. Payments to YOUR Stripe. You own 100%. We don't take a cut.", g: 'from-amber-500/10 to-orange-500/5' },
            { num: '04', icon: '💰', title: 'You earn', desc: "Share your link. Customers sign up and pay. That's it. You're running a business.", g: 'from-green-500/10 to-emerald-500/5' },
          ].map((s, i) => (
            <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl bg-gradient-to-br ${s.g} border border-white/5 p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 transition-all`}>
              <div className="text-xs font-mono text-accent font-bold mb-4">{s.num}</div><div className="text-5xl mb-4">{s.icon}</div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3><p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div></section>

      {/* COMPARISON */}
      <section className="px-6 py-28 max-w-4xl mx-auto">
        <p className="text-accent text-sm font-medium mb-2 text-center">Why Vaxario</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">You could do it yourself. But why?</h2>
        <p className="text-text-secondary text-center mb-12">Here&apos;s what it takes to launch a SaaS the traditional way vs. with Vaxario.</p>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-border-default overflow-hidden">
          <div className="grid grid-cols-3 bg-bg-elevated"><div className="px-5 py-3 text-sm font-medium text-text-muted" /><div className="px-5 py-3 text-sm font-medium text-text-muted text-center border-x border-border-default">Do it yourself</div><div className="px-5 py-3 text-sm font-medium text-center gradient-text">Vaxario</div></div>
          {COMPARISON.map((r, i) => <div key={i} className="grid grid-cols-3 border-t border-border-default hover:bg-bg-card/50"><div className="px-5 py-3 text-sm text-text-primary">{r.what}</div><div className="px-5 py-3 text-sm text-text-muted text-center border-x border-border-default">{r.diy}</div><div className="px-5 py-3 text-sm text-center font-medium text-accent-green">{r.vax}</div></div>)}
        </motion.div>
      </section>

      {/* SHOWCASE */}
      <section className="px-6 py-28 max-w-5xl mx-auto">
        <p className="text-accent text-sm font-medium mb-2 text-center">Real examples</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">See what people are building</h2>
        <p className="text-text-secondary text-center mb-14">Click any Vax to see a live preview</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXAMPLES.map((ex, i) => (
            <motion.button key={ex.name} onClick={() => setPreviewProject(ex)} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-bg-card border border-border-default rounded-2xl overflow-hidden hover:border-accent/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/30 transition-all text-left group">
              <div className={`bg-gradient-to-br ${ex.color} p-4 pb-6 relative overflow-hidden`}><div className="absolute inset-0 bg-black/20" /><div className="relative bg-white rounded-lg shadow-xl overflow-hidden group-hover:scale-[1.02] transition-transform"><div className="flex items-center gap-1 px-2 py-1 bg-gray-100 border-b"><div className="flex gap-0.5"><div className="h-1 w-1 rounded-full bg-red-400" /><div className="h-1 w-1 rounded-full bg-yellow-400" /><div className="h-1 w-1 rounded-full bg-green-400" /></div><div className="flex-1 text-center text-[6px] text-gray-400 font-mono">{ex.name.toLowerCase()}.com</div></div><div className="p-2 bg-white h-20"><div className="text-[7px] font-bold text-gray-900 mb-1">{ex.name}</div><div className="text-[5px] text-gray-500 mb-2">{ex.tagline}</div><div className="flex gap-1"><div className="h-1.5 w-8 bg-blue-500 rounded" /><div className="h-1.5 w-6 bg-gray-200 rounded" /></div></div></div><div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-[8px] text-white font-medium">🖥 Preview</div></div>
              <div className="p-5"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-lg">{ex.icon}</span><h3 className="font-bold group-hover:text-accent transition-colors">{ex.name}</h3></div><span className="text-[9px] px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green font-medium">⚡ {ex.time}</span></div><p className="text-xs text-text-secondary mb-3">{ex.tagline}</p><div className="flex items-center justify-between pt-3 border-t border-border-default"><span className="text-xs">Users pay <span className="text-accent-green font-bold">{ex.price}</span></span><span className="text-[10px] text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">Preview →</span></div></div>
            </motion.button>
          ))}
        </div>
      </section>
      <ProjectPreviewModal project={previewProject} open={!!previewProject} onClose={() => setPreviewProject(null)} />

      {/* THE MATH */}
      <section className="px-6 py-28"><div className="max-w-3xl mx-auto text-center">
        <p className="text-accent text-sm font-medium mb-2">The math</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Your first Vax pays for itself</h2>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-bg-card border border-border-default rounded-2xl p-10">
          <p className="text-text-secondary text-lg">Build a study tool. Charge <span className="text-text-primary font-semibold">$9/month</span>. Get <span className="text-text-primary font-semibold">3 customers</span> in your first week.</p>
          <p className="text-text-secondary mt-4">That&apos;s <span className="text-accent-green font-bold text-xl">$27</span> — your plan ($19) is already paid for.</p>
          <div className="mt-8 py-6 border-t border-border-default">
            <p className="text-text-muted text-sm mb-1">Month 3: 50 customers</p>
            <div className="flex items-center justify-center gap-2"><span className="text-5xl md:text-6xl font-bold gradient-text">$<AnimatedNumber target={450} /></span><span className="text-xl text-text-secondary">/month</span></div>
            <p className="text-text-muted text-sm mt-4">Month 6: 200 customers = <span className="text-accent-green font-bold">$1,800/month</span></p>
            <p className="text-sm text-text-muted italic mt-4">All from an idea you described in one sentence.</p>
          </div>
        </motion.div>
      </div></section>

      {/* PRICING */}
      <section className="px-6 py-28 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">Simple pricing</h2>
        <p className="text-text-secondary text-center mb-12">Start free. Upgrade when you&apos;re ready to launch.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div key={p.name} className={`rounded-2xl border p-7 flex flex-col ${p.popular ? 'border-accent/40 bg-accent/5 ring-1 ring-accent/20' : 'border-border-default bg-bg-card'}`}>
              {p.popular && <span className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-2">Most popular</span>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="flex items-baseline gap-1 mt-1"><span className="text-3xl font-bold">{p.price}</span><span className="text-text-muted text-sm">{p.period}</span></div>
              <p className="text-xs text-text-secondary mt-1 mb-5">{p.desc}</p>
              <ul className="space-y-2.5 flex-1">{p.features.map(f => <li key={f} className="flex items-start gap-2 text-sm text-text-secondary"><Check className="h-3.5 w-3.5 text-accent-green flex-shrink-0 mt-0.5" /> {f}</li>)}</ul>
              <button onClick={() => openLoginModal()} className={`mt-7 w-full py-3 rounded-xl text-sm font-semibold transition-all ${p.popular ? 'bg-accent text-bg-primary hover:bg-accent/90' : 'bg-bg-elevated text-text-primary hover:bg-border-default'}`}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-28 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
        <div className="space-y-3">{FAQS.map((faq, i) => (
          <div key={i} className="border border-border-default rounded-xl overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium hover:bg-bg-card/50 transition-all">{faq.q}<ChevronDown className={`h-4 w-4 text-text-muted transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} /></button>
            {openFaq === i && <div className="px-6 pb-4 text-sm text-text-secondary leading-relaxed">{faq.a}</div>}
          </div>
        ))}</div>
      </section>

      {/* CTA */}
      <section className="px-6 py-28 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to build your first Vax?</h2>
        <p className="text-text-secondary mb-10 text-lg">Join builders who are turning ideas into income.</p>
        <div className="max-w-xl mx-auto"><form onSubmit={handleSubmit}><div className="relative"><input type="text" value={idea} onChange={e => setIdea(e.target.value)} placeholder="Describe your AI tool idea..." className="w-full bg-bg-card border border-border-default rounded-2xl px-6 py-5 pr-14 text-lg text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50" /><button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/90 transition-all"><ArrowRight className="h-4 w-4 text-bg-primary" /></button></div></form></div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border-default px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2"><span className="gradient-text font-bold text-sm">Vaxario</span><span>&middot; Build and sell AI tools without code</span></div>
          <div className="flex gap-6"><Link href="/" className="hover:text-text-secondary">Home</Link><Link href="/templates" className="hover:text-text-secondary">Templates</Link><Link href="/pricing" className="hover:text-text-secondary">Pricing</Link><Link href="/terms" className="hover:text-text-secondary">Terms</Link><Link href="/privacy" className="hover:text-text-secondary">Privacy</Link></div>
        </div>
        <p className="text-center text-[10px] text-text-muted mt-4">&copy; 2026 Vaxario. All rights reserved.</p>
      </footer>
    </div>
  )
}
