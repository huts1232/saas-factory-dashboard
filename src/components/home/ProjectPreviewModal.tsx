'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Rocket, Clock, Database, FileText, Globe } from 'lucide-react'
import { useUser } from '@/lib/auth-context'

interface ExampleProject {
  name: string; tagline: string; time: string; price: string; features: string[]
  tables?: number; files?: number; routes?: number; idea: string; color: string; icon: string; description?: string
}

const TABS = ['Landing Page', 'Dashboard', 'Admin'] as const

export function ProjectPreviewModal({ project, open, onClose }: { project: ExampleProject | null; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<typeof TABS[number]>('Landing Page')
  const { openLoginModal } = useUser()
  if (!project) return null
  function handleBuild() { onClose(); openLoginModal(project!.idea) }

  const Mockup = MOCKUPS[project.name] || MOCKUPS.StudyGen

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-6" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-5xl max-h-[95vh] bg-bg-secondary border border-border-default rounded-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-default flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{project.icon}</span>
                <span className="text-lg font-bold">{project.name}</span>
                <span className="text-xs text-text-muted">{project.tagline}</span>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>
            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-3 pb-1 flex-shrink-0">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-secondary'}`}>{t}</button>
              ))}
            </div>
            {/* Preview */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="rounded-xl border border-border-default overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a2e] border-b border-white/5">
                  <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-500/70" /><div className="h-3 w-3 rounded-full bg-yellow-500/70" /><div className="h-3 w-3 rounded-full bg-green-500/70" /></div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/50 font-mono">
                      {project.name.toLowerCase().replace(/\s/g, '')}.com{tab === 'Dashboard' ? '/dashboard' : tab === 'Admin' ? '/admin' : ''}
                    </div>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[50vh]">
                  <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      {tab === 'Landing Page' && <Mockup.Landing />}
                      {tab === 'Dashboard' && <Mockup.Dashboard />}
                      {tab === 'Admin' && <Mockup.Admin />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-default flex-shrink-0">
              <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-3">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Built in {project.time}</span>
                {project.tables && <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {project.tables} tables</span>}
                {project.files && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {project.files} files</span>}
                {project.routes && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {project.routes} routes</span>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {project.features.map(f => <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted">{f}</span>)}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green font-medium">Users pay {project.price}</span>
                </div>
                <button onClick={handleBuild} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90 transition-all flex-shrink-0 ml-4">
                  <Rocket className="h-4 w-4" /> Build something like this
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =====================================================================
// STUDYGEN MOCKUPS — Purple/Violet theme
// =====================================================================
const StudyGenMockups = {
  Landing: () => (
    <div className="bg-white text-gray-900" style={{ fontSize: '11px' }}>
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2"><span className="text-base">📚</span><span className="font-bold text-violet-700 text-sm">StudyGen</span></div>
        <div className="flex items-center gap-4"><span className="text-gray-500 text-[10px]">Features</span><span className="text-gray-500 text-[10px]">Pricing</span><span className="text-gray-500 text-[10px]">Log in</span><span className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-[10px] font-medium">Start free</span></div>
      </div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white/90 text-[9px] font-medium mb-5">✨ AI-powered study tools</div>
          <h1 className="text-2xl font-bold text-white mb-3 leading-tight">Transform any document into<br />personalized study materials</h1>
          <p className="text-white/70 text-xs max-w-sm mx-auto mb-6">Upload a PDF. Get flashcards, quizzes, and study plans in seconds. Study smarter with spaced repetition.</p>
          <div className="flex gap-3 justify-center mb-4">
            <span className="px-6 py-2.5 bg-white text-violet-700 rounded-lg text-[10px] font-bold shadow-xl">Upload Your First PDF →</span>
            <span className="px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg text-[10px] font-medium">Watch demo</span>
          </div>
          <p className="text-white/50 text-[8px]">Free to start · No credit card required</p>
        </div>
      </div>
      {/* How it works */}
      <div className="px-8 py-8">
        <p className="text-center text-xs font-bold text-gray-900 mb-5">How it works</p>
        <div className="flex justify-center gap-4">
          {[{ icon: '📄', title: 'Upload', desc: 'Drop any PDF or document' }, { icon: '🤖', title: 'AI Generates', desc: 'Flashcards, quizzes, summaries' }, { icon: '🎯', title: 'Study & Track', desc: 'Spaced repetition + analytics' }].map((s, i) => (
            <div key={i} className="text-center w-28">
              <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-xl mx-auto mb-2">{s.icon}</div>
              <p className="text-[10px] font-bold text-gray-900">{s.title}</p>
              <p className="text-[8px] text-gray-500">{s.desc}</p>
              {i < 2 && <div className="hidden md:block absolute" />}
            </div>
          ))}
        </div>
      </div>
      {/* Features */}
      <div className="px-8 py-6 bg-gray-50">
        <p className="text-center text-xs font-bold text-gray-900 mb-5">Everything you need to ace your exams</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🗂️', title: 'AI Flashcards', desc: 'Automatically generated from your documents with smart difficulty levels' },
            { icon: '📝', title: 'Smart Quizzes', desc: 'Multiple choice, fill-in, matching — all from your content' },
            { icon: '📊', title: 'Progress Tracking', desc: 'See what you\'ve mastered and what needs more work' },
            { icon: '🧠', title: 'Spaced Repetition', desc: 'AI schedules reviews at the perfect intervals for long-term memory' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-lg">{f.icon}</span>
              <p className="text-[10px] font-bold text-gray-900 mt-1">{f.title}</p>
              <p className="text-[8px] text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Pricing */}
      <div className="px-8 py-8">
        <p className="text-center text-xs font-bold text-gray-900 mb-5">Simple pricing</p>
        <div className="flex justify-center gap-3">
          {[
            { name: 'Free', price: '$0', features: ['5 documents', 'Basic flashcards', '10 quizzes/mo'] },
            { name: 'Student', price: '$9', features: ['Unlimited docs', 'AI flashcards', 'Spaced repetition', 'Progress analytics'], popular: true },
            { name: 'School', price: '$49', features: ['Everything in Student', 'Team features', 'Admin dashboard', 'Priority support'] },
          ].map((p, i) => (
            <div key={i} className={`rounded-xl p-3 w-28 text-center ${p.popular ? 'bg-violet-600 text-white ring-2 ring-violet-300' : 'bg-white border border-gray-200'}`}>
              {p.popular && <div className="text-[7px] font-bold mb-1 text-violet-200">MOST POPULAR</div>}
              <p className={`text-[10px] font-bold ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
              <p className={`text-lg font-bold ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.price}<span className="text-[8px] font-normal opacity-60">/mo</span></p>
              <div className="mt-2 space-y-1">
                {p.features.map((f, j) => <p key={j} className={`text-[7px] ${p.popular ? 'text-violet-100' : 'text-gray-500'}`}>✓ {f}</p>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Social proof */}
      <div className="px-8 py-6 bg-violet-50">
        <div className="flex justify-center gap-6 text-center">
          <div><p className="text-lg font-bold text-violet-700">10,000+</p><p className="text-[8px] text-gray-500">flashcards generated</p></div>
          <div><p className="text-lg font-bold text-violet-700">95%</p><p className="text-[8px] text-gray-500">pass rate improvement</p></div>
          <div><p className="text-lg font-bold text-violet-700">4.9★</p><p className="text-[8px] text-gray-500">student rating</p></div>
        </div>
      </div>
      <div className="px-6 py-3 border-t text-center text-[7px] text-gray-400">© 2026 StudyGen · Built with Next.js + Supabase</div>
    </div>
  ),

  Dashboard: () => (
    <div className="flex min-h-[450px] bg-gray-50" style={{ fontSize: '10px' }}>
      <div className="w-36 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col">
        <div className="px-3 py-4 border-b border-gray-100"><div className="flex items-center gap-2"><span className="text-sm">📚</span><span className="font-bold text-violet-700 text-[11px]">StudyGen</span></div></div>
        <div className="p-2 space-y-0.5 flex-1">
          {[{ l: '📊 Dashboard', a: true }, { l: '📄 Documents', a: false }, { l: '🗂️ Flashcards', a: false }, { l: '📝 Quizzes', a: false }, { l: '🎯 Progress', a: false }, { l: '⚙️ Settings', a: false }].map((n, i) => (
            <div key={i} className={`px-3 py-2 rounded-lg text-[9px] ${n.a ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-500'}`}>{n.l}</div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100"><div className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center text-white text-[7px] font-bold">S</div><span className="text-[9px] text-gray-500">Sarah</span></div></div>
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4"><div><p className="text-sm font-bold text-gray-900">Welcome back, Sarah 👋</p><p className="text-[9px] text-gray-500">You have 3 flashcards due for review</p></div><span className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-[9px] font-medium">📄 Upload PDF</span></div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'Flashcards', v: '42', icon: '🗂️', c: 'from-violet-500/10 to-purple-500/5' }, { l: 'Documents', v: '18', icon: '📄', c: 'from-blue-500/10 to-indigo-500/5' }, { l: 'Study Streak', v: '7 🔥', icon: '', c: 'from-orange-500/10 to-red-500/5' }, { l: 'Accuracy', v: '85%', icon: '🎯', c: 'from-green-500/10 to-emerald-500/5' }].map((s, i) => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${s.c} border border-gray-100 p-3`}>
              <p className="text-[8px] text-gray-500">{s.l}</p>
              <p className="text-sm font-bold text-gray-900">{s.v}</p>
            </div>
          ))}
        </div>
        {/* Documents table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="px-3 py-2 border-b border-gray-50 flex justify-between"><p className="text-[9px] font-semibold text-gray-900">Recent Documents</p><p className="text-[8px] text-violet-600">View all →</p></div>
          {[
            { name: 'Biology Ch.3.pdf', cards: 24, time: '2 hours ago', pct: 80 },
            { name: 'History Notes.pdf', cards: 18, time: 'Yesterday', pct: 40 },
            { name: 'Math Formulas.pdf', cards: 31, time: '3 days ago', pct: 95 },
            { name: 'Chemistry Lab.pdf', cards: 12, time: 'Last week', pct: 60 },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <div className="h-6 w-6 rounded bg-violet-50 flex items-center justify-center text-[10px]">📄</div>
              <div className="flex-1"><p className="text-[9px] font-medium text-gray-900">{d.name}</p><p className="text-[7px] text-gray-400">{d.cards} cards · {d.time}</p></div>
              <div className="w-16"><div className="flex justify-between text-[7px] mb-0.5"><span className="text-gray-400">Progress</span><span className="font-medium">{d.pct}%</span></div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${d.pct}%` }} /></div></div>
              <span className="text-[8px] text-violet-600 font-medium">Study →</span>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-[9px] font-semibold text-gray-900 mb-3">Study Activity (last 7 days)</p>
          <div className="flex items-end gap-1.5 h-14">
            {[45, 30, 65, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-violet-500/80 rounded-t" style={{ height: `${h}%` }} />
                <span className="text-[6px] text-gray-400">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  Admin: () => (
    <div className="flex min-h-[450px] bg-violet-950" style={{ fontSize: '10px' }}>
      <div className="w-36 bg-violet-950/80 border-r border-white/5 flex-shrink-0 p-2">
        <p className="text-[10px] font-bold text-white px-3 py-3 mb-2">📚 StudyGen Admin</p>
        {[{ l: '📊 Analytics', a: true }, { l: '👥 Users', a: false }, { l: '💳 Billing', a: false }, { l: '⚙️ Settings', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg text-[9px] mb-0.5 ${n.a ? 'bg-violet-500/20 text-violet-300' : 'text-violet-400/60'}`}>{n.l}</div>
        ))}
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm font-bold text-white mb-4">Platform Analytics</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'Students', v: '1,247', c: 'from-violet-500/20' }, { l: 'Revenue', v: '$4,829/mo', c: 'from-green-500/20' }, { l: 'Documents', v: '8,421', c: 'from-blue-500/20' }, { l: 'Cards Created', v: '52,000', c: 'from-purple-500/20' }].map((s, i) => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${s.c} to-transparent border border-white/5 p-3`}>
              <p className="text-[8px] text-violet-300/60">{s.l}</p>
              <p className="text-sm font-bold text-white">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden mb-4">
          <div className="px-3 py-2 border-b border-white/5"><p className="text-[9px] font-semibold text-white">Recent Users</p></div>
          {[{ n: 'Sarah J.', p: 'Student', d: '18 docs', r: '$9' }, { n: 'Mike C.', p: 'Free', d: '3 docs', r: '$0' }, { n: 'Lisa W.', p: 'Student', d: '42 docs', r: '$9' }, { n: 'Alex T.', p: 'School', d: '156 docs', r: '$49' }].map((u, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex-shrink-0" />
              <div className="flex-1"><p className="text-[9px] text-white font-medium">{u.n}</p></div>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${u.p === 'Free' ? 'bg-gray-500/20 text-gray-400' : u.p === 'School' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-violet-500/20 text-violet-300'}`}>{u.p}</span>
              <span className="text-[8px] text-violet-300/60 w-12 text-right">{u.d}</span>
              <span className="text-[8px] text-green-400 w-8 text-right">{u.r}</span>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 p-3">
          <p className="text-[9px] font-semibold text-white mb-2">Revenue Growth</p>
          <div className="flex items-end gap-0.5 h-16">{[20, 35, 30, 45, 50, 55, 48, 65, 70, 75, 80, 90].map((h, i) => <div key={i} className="flex-1 bg-gradient-to-t from-violet-500 to-purple-400 rounded-t opacity-80" style={{ height: `${h}%` }} />)}</div>
        </div>
      </div>
    </div>
  ),
}

// =====================================================================
// INVOICEFLOW MOCKUPS — Green/Emerald business theme
// =====================================================================
const InvoiceFlowMockups = {
  Landing: () => (
    <div className="bg-white text-gray-900" style={{ fontSize: '11px' }}>
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2"><span className="text-base">🧾</span><span className="font-bold text-emerald-700 text-sm">InvoiceFlow</span></div>
        <div className="flex items-center gap-4"><span className="text-gray-500 text-[10px]">Features</span><span className="text-gray-500 text-[10px]">Pricing</span><span className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-medium">Start free</span></div>
      </div>
      <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 px-8 py-14 text-center relative overflow-hidden">
        <div className="relative">
          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white/90 text-[9px] font-medium mb-5">💰 For freelancers who hate admin</div>
          <h1 className="text-2xl font-bold text-white mb-3">Dead-simple invoicing<br />for freelancers</h1>
          <p className="text-white/70 text-xs max-w-sm mx-auto mb-6">Create beautiful invoices in 30 seconds. Track payments. Get paid faster. No accounting degree needed.</p>
          <div className="flex gap-3 justify-center"><span className="px-6 py-2.5 bg-white text-emerald-700 rounded-lg text-[10px] font-bold shadow-xl">Create Your First Invoice →</span><span className="px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg text-[10px]">See pricing</span></div>
        </div>
      </div>
      <div className="px-8 py-8 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '⚡', title: 'One-Click Invoices', desc: 'Fill in client, add items, send. Done in 30 seconds.' },
            { icon: '🧮', title: 'Auto Tax Calculation', desc: 'VAT/BTW calculated automatically based on your country.' },
            { icon: '📊', title: 'Payment Tracking', desc: 'See who paid, who\'s pending, and who\'s overdue at a glance.' },
            { icon: '📄', title: 'PDF Export', desc: 'Beautiful branded PDF invoices your clients will love.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-gray-100"><span className="text-lg">{f.icon}</span><p className="text-[10px] font-bold text-gray-900 mt-1">{f.title}</p><p className="text-[8px] text-gray-500 mt-0.5">{f.desc}</p></div>
          ))}
        </div>
      </div>
      <div className="px-8 py-8">
        <div className="flex justify-center gap-3">
          {[{ name: 'Free', price: '$0', features: ['3 invoices/mo', 'Basic templates'] }, { name: 'Pro', price: '$19', features: ['Unlimited invoices', 'Custom branding', 'Payment tracking', 'Auto reminders'], popular: true }, { name: 'Business', price: '$49', features: ['Everything in Pro', 'Team accounts', 'API access', 'Priority support'] }].map((p, i) => (
            <div key={i} className={`rounded-xl p-3 w-28 text-center ${p.popular ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-white border border-gray-200'}`}>
              {p.popular && <div className="text-[7px] font-bold mb-1 text-emerald-200">MOST POPULAR</div>}
              <p className={`text-[10px] font-bold ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
              <p className={`text-lg font-bold ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.price}<span className="text-[8px] font-normal opacity-60">/mo</span></p>
              {p.features.map((f, j) => <p key={j} className={`text-[7px] ${p.popular ? 'text-emerald-100' : 'text-gray-500'}`}>✓ {f}</p>)}
            </div>
          ))}
        </div>
      </div>
      <div className="px-8 py-5 bg-emerald-50"><div className="flex justify-center gap-6 text-center"><div><p className="text-lg font-bold text-emerald-700">€2M+</p><p className="text-[8px] text-gray-500">invoiced</p></div><div><p className="text-lg font-bold text-emerald-700">48hr</p><p className="text-[8px] text-gray-500">avg payment time</p></div><div><p className="text-lg font-bold text-emerald-700">2,000+</p><p className="text-[8px] text-gray-500">freelancers</p></div></div></div>
      <div className="px-6 py-3 border-t text-center text-[7px] text-gray-400">© 2026 InvoiceFlow</div>
    </div>
  ),

  Dashboard: () => (
    <div className="flex min-h-[450px] bg-gray-50" style={{ fontSize: '10px' }}>
      <div className="w-36 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col">
        <div className="px-3 py-4 border-b border-gray-100"><div className="flex items-center gap-2"><span className="text-sm">🧾</span><span className="font-bold text-emerald-700 text-[11px]">InvoiceFlow</span></div></div>
        <div className="p-2 space-y-0.5 flex-1">
          {[{ l: '📊 Dashboard', a: true }, { l: '🧾 Invoices', a: false }, { l: '👥 Clients', a: false }, { l: '📈 Reports', a: false }, { l: '⚙️ Settings', a: false }].map((n, i) => (
            <div key={i} className={`px-3 py-2 rounded-lg text-[9px] ${n.a ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-500'}`}>{n.l}</div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100"><div className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[7px] font-bold">J</div><span className="text-[9px] text-gray-500">Jules</span></div></div>
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4"><div><p className="text-sm font-bold text-gray-900">Good morning, Jules 👋</p><p className="text-[9px] text-gray-500">You have 3 overdue invoices</p></div><span className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-medium">+ Create Invoice</span></div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'This Month', v: '€4,250', c: 'from-emerald-500/10', sub: '↑ 12% vs last month' }, { l: 'Invoices', v: '12', c: 'from-blue-500/10', sub: '8 paid · 4 pending' }, { l: 'Overdue', v: '3 ⚠️', c: 'from-red-500/10', sub: '€1,300 outstanding' }, { l: 'Pending', v: '€850', c: 'from-yellow-500/10', sub: 'Awaiting payment' }].map((s, i) => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${s.c} to-transparent border border-gray-100 p-3`}>
              <p className="text-[8px] text-gray-500">{s.l}</p>
              <p className="text-sm font-bold text-gray-900">{s.v}</p>
              <p className="text-[7px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="px-3 py-2 border-b border-gray-50 flex justify-between"><p className="text-[9px] font-semibold text-gray-900">Recent Invoices</p><p className="text-[8px] text-emerald-600">View all →</p></div>
          {[
            { id: '#001', client: 'Acme Corp', amount: '€1,200', status: '✅ Paid', date: 'Mar 15', color: 'bg-green-50 text-green-700' },
            { id: '#002', client: 'TechStart BV', amount: '€850', status: '🟡 Pending', date: 'Mar 12', color: 'bg-yellow-50 text-yellow-700' },
            { id: '#003', client: 'DesignStudio', amount: '€2,200', status: '✅ Paid', date: 'Mar 8', color: 'bg-green-50 text-green-700' },
            { id: '#004', client: 'FreshCo', amount: '€450', status: '🔴 Overdue', date: 'Feb 28', color: 'bg-red-50 text-red-700' },
          ].map((inv, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <span className="text-[9px] font-mono text-gray-400 w-8">{inv.id}</span>
              <span className="text-[9px] font-medium text-gray-900 flex-1">{inv.client}</span>
              <span className="text-[9px] font-bold text-gray-900 w-14 text-right">{inv.amount}</span>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${inv.color}`}>{inv.status}</span>
              <span className="text-[8px] text-gray-400 w-12 text-right">{inv.date}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-[9px] font-semibold text-gray-900 mb-2">Revenue (6 months)</p>
          <div className="flex items-end gap-1.5 h-14">
            {[2100, 2800, 3200, 3800, 3500, 4250].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-500/80 rounded-t" style={{ height: `${(v / 4250) * 100}%` }} />
                <span className="text-[6px] text-gray-400">{['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  Admin: () => (
    <div className="flex min-h-[450px] bg-gray-900" style={{ fontSize: '10px' }}>
      <div className="w-36 bg-gray-950 border-r border-white/5 flex-shrink-0 p-2">
        <p className="text-[10px] font-bold text-white px-3 py-3 mb-2">🧾 InvoiceFlow Admin</p>
        {[{ l: '📊 Analytics', a: true }, { l: '👥 Users', a: false }, { l: '💳 Billing', a: false }, { l: '⚙️ Settings', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg text-[9px] mb-0.5 ${n.a ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500'}`}>{n.l}</div>
        ))}
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm font-bold text-white mb-4">Platform Analytics</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'Freelancers', v: '2,147', c: 'from-emerald-500/20' }, { l: 'MRR', v: '€12,400', c: 'from-green-500/20' }, { l: 'Invoices/mo', v: '8,200', c: 'from-blue-500/20' }, { l: 'Churn', v: '1.8%', c: 'from-orange-500/20' }].map((s, i) => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${s.c} to-transparent border border-white/5 p-3`}><p className="text-[8px] text-gray-400">{s.l}</p><p className="text-sm font-bold text-white">{s.v}</p></div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden mb-4">
          <div className="px-3 py-2 border-b border-white/5"><p className="text-[9px] font-semibold text-white">Top Users by Revenue</p></div>
          {[{ n: 'Jules K.', p: 'Pro', inv: '€8,400', r: '$19' }, { n: 'Anna M.', p: 'Business', inv: '€24,100', r: '$49' }, { n: 'Tom B.', p: 'Pro', inv: '€5,200', r: '$19' }].map((u, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-400 to-green-400 flex-shrink-0" />
              <span className="text-[9px] text-white font-medium flex-1">{u.n}</span>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${u.p === 'Business' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{u.p}</span>
              <span className="text-[8px] text-gray-400 w-16 text-right">{u.inv} invoiced</span>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 p-3"><p className="text-[9px] font-semibold text-white mb-2">MRR Growth</p><div className="flex items-end gap-0.5 h-16">{[30, 40, 45, 50, 55, 58, 65, 70, 72, 80, 85, 92].map((h, i) => <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500 to-green-400 rounded-t opacity-80" style={{ height: `${h}%` }} />)}</div></div>
      </div>
    </div>
  ),
}

// =====================================================================
// TESTMARK MOCKUPS — Tech blue/cyan theme
// =====================================================================
const TestMarkMockups = {
  Landing: () => (
    <div className="bg-white text-gray-900" style={{ fontSize: '11px' }}>
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2"><span className="text-base">🔖</span><span className="font-bold text-sky-700 text-sm">TestMark</span></div>
        <div className="flex items-center gap-4"><span className="text-gray-500 text-[10px]">Features</span><span className="text-gray-500 text-[10px]">Pricing</span><span className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-[10px] font-medium">Start monitoring</span></div>
      </div>
      <div className="bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 px-8 py-14 text-center relative overflow-hidden">
        <div className="relative">
          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white/90 text-[9px] font-medium mb-5">🔍 URL health monitoring</div>
          <h1 className="text-2xl font-bold text-white mb-3">Monitor your bookmarks.<br />Never miss a dead link.</h1>
          <p className="text-white/70 text-xs max-w-sm mx-auto mb-6">Add your important URLs. We check them every 15 minutes. Get alerted instantly when something breaks.</p>
          <div className="flex gap-3 justify-center"><span className="px-6 py-2.5 bg-white text-sky-700 rounded-lg text-[10px] font-bold shadow-xl">Start Monitoring Free →</span><span className="px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-lg text-[10px]">See demo</span></div>
        </div>
      </div>
      <div className="px-8 py-8 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📡', title: 'URL Monitoring', desc: 'Check every 15 minutes. HTTP status, response time, SSL.' },
            { icon: '🔔', title: 'Instant Alerts', desc: 'Email + Slack notifications when something breaks.' },
            { icon: '👥', title: 'Team Sharing', desc: 'Share bookmark collections with your entire team.' },
            { icon: '📊', title: 'Health Dashboard', desc: 'Response times, uptime %, status history at a glance.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-gray-100"><span className="text-lg">{f.icon}</span><p className="text-[10px] font-bold text-gray-900 mt-1">{f.title}</p><p className="text-[8px] text-gray-500 mt-0.5">{f.desc}</p></div>
          ))}
        </div>
      </div>
      <div className="px-8 py-8">
        <div className="flex justify-center gap-3">
          {[{ name: 'Free', price: '$0', features: ['10 URLs', 'Hourly checks', 'Email alerts'] }, { name: 'Pro', price: '$5', features: ['500 URLs', '15-min checks', 'Slack + Email', 'Response analytics'], popular: true }, { name: 'Team', price: '$15', features: ['Unlimited URLs', '5-min checks', 'Team sharing', 'API access'] }].map((p, i) => (
            <div key={i} className={`rounded-xl p-3 w-28 text-center ${p.popular ? 'bg-sky-600 text-white ring-2 ring-sky-300' : 'bg-white border border-gray-200'}`}>
              {p.popular && <div className="text-[7px] font-bold mb-1 text-sky-200">MOST POPULAR</div>}
              <p className={`text-[10px] font-bold ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
              <p className={`text-lg font-bold ${p.popular ? 'text-white' : 'text-gray-900'}`}>{p.price}<span className="text-[8px] font-normal opacity-60">/mo</span></p>
              {p.features.map((f, j) => <p key={j} className={`text-[7px] ${p.popular ? 'text-sky-100' : 'text-gray-500'}`}>✓ {f}</p>)}
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 py-3 border-t text-center text-[7px] text-gray-400">© 2026 TestMark</div>
    </div>
  ),

  Dashboard: () => (
    <div className="flex min-h-[450px] bg-slate-950" style={{ fontSize: '10px' }}>
      <div className="w-36 bg-slate-900 border-r border-white/5 flex-shrink-0 flex flex-col">
        <div className="px-3 py-4 border-b border-white/5"><div className="flex items-center gap-2"><span className="text-sm">🔖</span><span className="font-bold text-sky-400 text-[11px]">TestMark</span></div></div>
        <div className="p-2 space-y-0.5 flex-1">
          {[{ l: '📊 Dashboard', a: true }, { l: '🔗 Bookmarks', a: false }, { l: '🔔 Alerts', a: false }, { l: '👥 Teams', a: false }, { l: '⚙️ Settings', a: false }].map((n, i) => (
            <div key={i} className={`px-3 py-2 rounded-lg text-[9px] ${n.a ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-slate-500'}`}>{n.l}</div>
          ))}
        </div>
        <div className="p-3 border-t border-white/5"><div className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center text-white text-[7px] font-bold">D</div><span className="text-[9px] text-slate-400">Dev Team</span></div></div>
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4"><div><p className="text-sm font-bold text-white">Monitoring 47 URLs</p><p className="text-[9px] text-slate-400">Last check: 2 minutes ago</p></div><span className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-[9px] font-medium">+ Add URL</span></div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'URLs', v: '47', c: 'from-sky-500/20' }, { l: 'Uptime', v: '99.2%', c: 'from-green-500/20' }, { l: 'Alerts', v: '2', c: 'from-red-500/20' }, { l: 'Avg Response', v: '142ms', c: 'from-blue-500/20' }].map((s, i) => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${s.c} to-transparent border border-white/5 p-3`}><p className="text-[8px] text-slate-400">{s.l}</p><p className="text-sm font-bold text-white">{s.v}</p></div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden mb-4">
          <div className="px-3 py-2 border-b border-white/5 flex justify-between"><p className="text-[9px] font-semibold text-white">URL Status</p><p className="text-[8px] text-sky-400">View all →</p></div>
          {[
            { url: 'api.myapp.com', status: '🟢 200', ms: '89ms', time: '2 min ago' },
            { url: 'docs.myapp.com', status: '🟢 200', ms: '142ms', time: '2 min ago' },
            { url: 'staging.myapp.com', status: '🔴 503', ms: 'timeout', time: '2 min ago' },
            { url: 'blog.myapp.com', status: '🟢 200', ms: '201ms', time: '2 min ago' },
            { url: 'cdn.myapp.com', status: '🟢 200', ms: '34ms', time: '2 min ago' },
          ].map((u, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0 hover:bg-white/5">
              <span className="text-[9px] font-mono text-sky-300 flex-1">{u.url}</span>
              <span className="text-[8px] w-12">{u.status}</span>
              <span className={`text-[8px] font-mono w-12 text-right ${u.ms === 'timeout' ? 'text-red-400' : 'text-slate-400'}`}>{u.ms}</span>
              <span className="text-[8px] text-slate-500 w-16 text-right">{u.time}</span>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 p-3">
          <p className="text-[9px] font-semibold text-white mb-2">Uptime (24h)</p>
          <div className="flex items-end gap-0.5 h-12">{Array.from({ length: 24 }, (_, i) => i === 14 ? 40 : 85 + Math.random() * 15).map((h, i) => <div key={i} className={`flex-1 rounded-t ${h < 50 ? 'bg-red-500' : 'bg-sky-500/80'}`} style={{ height: `${h}%` }} />)}</div>
          <div className="flex justify-between mt-1 text-[6px] text-slate-500"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div>
        </div>
      </div>
    </div>
  ),

  Admin: () => (
    <div className="flex min-h-[450px] bg-slate-950" style={{ fontSize: '10px' }}>
      <div className="w-36 bg-slate-900 border-r border-white/5 flex-shrink-0 p-2">
        <p className="text-[10px] font-bold text-white px-3 py-3 mb-2">🔖 TestMark Admin</p>
        {[{ l: '📊 Analytics', a: true }, { l: '👥 Users', a: false }, { l: '💳 Billing', a: false }, { l: '🖥 System', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg text-[9px] mb-0.5 ${n.a ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500'}`}>{n.l}</div>
        ))}
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm font-bold text-white mb-4">System Analytics</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'Users', v: '892', c: 'from-sky-500/20' }, { l: 'URLs Monitored', v: '24,500', c: 'from-blue-500/20' }, { l: 'Checks/day', v: '2.3M', c: 'from-cyan-500/20' }, { l: 'MRR', v: '$3,200', c: 'from-green-500/20' }].map((s, i) => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${s.c} to-transparent border border-white/5 p-3`}><p className="text-[8px] text-slate-400">{s.l}</p><p className="text-sm font-bold text-white">{s.v}</p></div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-xl border border-white/5 p-3">
            <p className="text-[9px] font-semibold text-white mb-2">System Health</p>
            {[{ l: 'API Latency', v: '12ms', s: '🟢' }, { l: 'Queue Depth', v: '34', s: '🟢' }, { l: 'Error Rate', v: '0.02%', s: '🟢' }, { l: 'CPU Usage', v: '34%', s: '🟢' }].map((h, i) => (
              <div key={i} className="flex items-center justify-between py-1"><span className="text-[8px] text-slate-400">{h.l}</span><span className="text-[8px] text-white font-mono">{h.s} {h.v}</span></div>
            ))}
          </div>
          <div className="bg-white/5 rounded-xl border border-white/5 p-3">
            <p className="text-[9px] font-semibold text-white mb-2">Checks Volume</p>
            <div className="flex items-end gap-0.5 h-16">{[60, 65, 70, 68, 75, 80, 78, 85, 82, 90, 88, 95].map((h, i) => <div key={i} className="flex-1 bg-gradient-to-t from-sky-500 to-cyan-400 rounded-t opacity-80" style={{ height: `${h}%` }} />)}</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/5"><p className="text-[9px] font-semibold text-white">Top Users</p></div>
          {[{ n: 'DevTeam Inc.', p: 'Team', urls: '2,400' }, { n: 'Sarah Dev', p: 'Pro', urls: '340' }, { n: 'TechCorp', p: 'Team', urls: '1,800' }].map((u, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-sky-400 to-blue-400 flex-shrink-0" />
              <span className="text-[9px] text-white font-medium flex-1">{u.n}</span>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${u.p === 'Team' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-sky-500/20 text-sky-400'}`}>{u.p}</span>
              <span className="text-[8px] text-slate-400">{u.urls} URLs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

// ===== MOCKUP REGISTRY =====
const MOCKUPS: Record<string, { Landing: () => React.ReactNode; Dashboard: () => React.ReactNode; Admin: () => React.ReactNode }> = {
  StudyGen: StudyGenMockups,
  InvoiceFlow: InvoiceFlowMockups,
  TestMark: TestMarkMockups,
}
