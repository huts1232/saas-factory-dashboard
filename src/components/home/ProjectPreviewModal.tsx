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
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-default flex-shrink-0">
              <div className="flex items-center gap-3"><span className="text-2xl">{project.icon}</span><span className="text-lg font-bold">{project.name}</span><span className="text-xs text-text-muted">{project.tagline}</span></div>
              <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex gap-1 px-6 pt-3 pb-1 flex-shrink-0">
              {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-secondary'}`}>{t}</button>)}
            </div>
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="rounded-xl border border-border-default overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a2e] border-b border-white/5">
                  <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-500/70" /><div className="h-3 w-3 rounded-full bg-yellow-500/70" /><div className="h-3 w-3 rounded-full bg-green-500/70" /></div>
                  <div className="flex-1 flex justify-center"><div className="px-4 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/50 font-mono">{project.name.toLowerCase().replace(/\s/g, '')}.com{tab === 'Dashboard' ? '/dashboard' : tab === 'Admin' ? '/admin' : ''}</div></div>
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
            <div className="px-6 py-4 border-t border-border-default flex-shrink-0">
              <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-3">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {project.time}</span>
                {project.tables && <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {project.tables} tables</span>}
                {project.files && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {project.files} files</span>}
                {project.routes && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {project.routes} routes</span>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {project.features.map(f => <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted">{f}</span>)}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green font-medium">Users pay {project.price}</span>
                </div>
                <button onClick={() => { onClose(); openLoginModal(project.idea) }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90 transition-all flex-shrink-0 ml-4">
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
// STUDYGEN — Purple/violet, EDUCATION layout
// Centered, friendly, rounded, soft shadows, PDF upload focus
// =====================================================================
const StudyGenMockups = {
  Landing: () => (
    <div className="bg-violet-50 text-gray-900" style={{ fontSize: '11px', fontFamily: "'Georgia', serif" }}>
      {/* Nav - minimal */}
      <div className="flex items-center justify-between px-8 py-4">
        <span className="font-bold text-violet-700 text-sm" style={{ fontFamily: 'sans-serif' }}>📚 StudyGen</span>
        <div className="flex items-center gap-4 text-[10px]" style={{ fontFamily: 'sans-serif' }}><span className="text-gray-500">Features</span><span className="text-gray-500">Pricing</span><span className="px-3 py-1.5 bg-violet-600 text-white rounded-full font-medium">Start free →</span></div>
      </div>
      {/* Hero - centered, illustration-heavy */}
      <div className="px-8 pt-8 pb-12 text-center max-w-md mx-auto">
        {/* Book → flashcards illustration (CSS art) */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-20 bg-violet-200 rounded-lg shadow-md flex items-center justify-center text-2xl transform -rotate-3">📖</div>
          <div className="text-violet-400 text-xl">→</div>
          <div className="flex gap-1.5">
            {['🧠', '📝', '🎯'].map((e, i) => (
              <div key={i} className="w-12 h-14 bg-white rounded-xl shadow-lg border border-violet-100 flex items-center justify-center text-lg transform" style={{ rotate: `${(i - 1) * 5}deg` }}>{e}</div>
            ))}
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 leading-snug mb-3">Transform any document<br />into study materials</h1>
        <p className="text-gray-500 text-xs leading-relaxed mb-6">Upload a PDF. AI creates flashcards, quizzes, and study plans — personalized to how you learn best.</p>
        {/* Upload dropzone */}
        <div className="bg-white border-2 border-dashed border-violet-300 rounded-2xl p-6 mb-6 hover:border-violet-500 transition-colors cursor-pointer">
          <div className="text-3xl mb-2">📄</div>
          <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'sans-serif' }}>Drop your PDF here</p>
          <p className="text-[9px] text-gray-400">or click to browse · PDF, DOCX up to 10MB</p>
        </div>
        <p className="text-[9px] text-gray-400">Free · No signup required · Instant results</p>
      </div>
      {/* Subject cards - grid */}
      <div className="px-8 pb-8">
        <p className="text-center text-xs font-bold text-gray-900 mb-4" style={{ fontFamily: 'sans-serif' }}>Popular subjects</p>
        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {[{ e: '🧬', n: 'Biology', c: 'bg-green-50 border-green-200' }, { e: '📐', n: 'Math', c: 'bg-blue-50 border-blue-200' }, { e: '🏛️', n: 'History', c: 'bg-amber-50 border-amber-200' }, { e: '⚗️', n: 'Chemistry', c: 'bg-pink-50 border-pink-200' }].map((s, i) => (
            <div key={i} className={`${s.c} border rounded-xl p-3 text-center cursor-pointer hover:shadow-md transition-all`}>
              <div className="text-xl mb-1">{s.e}</div>
              <p className="text-[8px] font-medium text-gray-700" style={{ fontFamily: 'sans-serif' }}>{s.n}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Features - horizontal scroll cards */}
      <div className="bg-white px-8 py-8">
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {[{ i: '🗂️', t: 'AI Flashcards', d: 'Auto-generated with difficulty levels' }, { i: '📝', t: 'Smart Quizzes', d: 'Multiple choice, fill-in, matching' }, { i: '📊', t: 'Progress Tracking', d: 'See mastery per topic' }, { i: '🧠', t: 'Spaced Repetition', d: 'AI schedules perfect review times' }].map((f, i) => (
            <div key={i} className="bg-violet-50 rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">{f.i}</div>
              <p className="text-[9px] font-bold text-gray-900" style={{ fontFamily: 'sans-serif' }}>{f.t}</p>
              <p className="text-[7px] text-gray-500 mt-0.5">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Pricing */}
      <div className="px-8 py-6 text-center">
        <div className="flex justify-center gap-3 max-w-sm mx-auto">
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-3 text-center"><p className="text-[10px] font-bold">Free</p><p className="text-lg font-bold">$0</p><p className="text-[7px] text-gray-500 mt-1">5 documents</p></div>
          <div className="flex-1 bg-violet-600 rounded-2xl p-3 text-center text-white shadow-lg shadow-violet-200"><p className="text-[10px] font-bold text-violet-200">Student</p><p className="text-lg font-bold">$9<span className="text-[8px] font-normal opacity-60">/mo</span></p><p className="text-[7px] text-violet-200 mt-1">Unlimited everything</p></div>
        </div>
      </div>
      <div className="px-6 py-3 border-t border-violet-100 text-center text-[7px] text-gray-400" style={{ fontFamily: 'sans-serif' }}>© 2026 StudyGen · Made for students, by students</div>
    </div>
  ),

  Dashboard: () => (
    <div className="flex min-h-[460px] bg-violet-50" style={{ fontSize: '10px', fontFamily: 'sans-serif' }}>
      {/* Sidebar - soft, rounded */}
      <div className="w-40 bg-white border-r border-violet-100 flex-shrink-0 p-3 flex flex-col">
        <div className="flex items-center gap-2 mb-4 px-1"><span className="text-lg">📚</span><span className="font-bold text-violet-700 text-[11px]">StudyGen</span></div>
        {[{ l: '📊 Dashboard', a: true }, { l: '📄 My Documents', a: false }, { l: '🗂️ Flashcards', a: false }, { l: '📝 Quizzes', a: false }, { l: '🎯 Progress', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded-xl text-[9px] mb-1 ${n.a ? 'bg-violet-100 text-violet-700 font-semibold' : 'text-gray-500 hover:bg-violet-50'}`}>{n.l}</div>
        ))}
        <div className="mt-auto pt-4 border-t border-violet-100"><div className="flex items-center gap-2 px-1"><div className="h-6 w-6 rounded-full bg-violet-200 flex items-center justify-center text-[8px] font-bold text-violet-700">S</div><div><p className="text-[9px] font-medium text-gray-900">Sarah</p><p className="text-[7px] text-gray-400">Student plan</p></div></div></div>
      </div>
      {/* Main - centered, spacious */}
      <div className="flex-1 p-5">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-sm font-bold text-gray-900">Welcome back, Sarah 👋</p><p className="text-[9px] text-gray-500">You have 3 flashcards due for review</p></div>
          <span className="px-3 py-2 bg-violet-600 text-white rounded-xl text-[9px] font-medium shadow-sm">📄 Upload PDF</span>
        </div>
        {/* Stats with progress rings */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[{ l: 'Flashcards', v: '42', bg: 'bg-violet-100', tc: 'text-violet-700' }, { l: 'Documents', v: '18', bg: 'bg-blue-100', tc: 'text-blue-700' }, { l: 'Study Streak', v: '7🔥', bg: 'bg-orange-100', tc: 'text-orange-700' }, { l: 'Mastery', v: '85%', bg: 'bg-green-100', tc: 'text-green-700' }].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-3 text-center`}>
              <p className={`text-sm font-bold ${s.tc}`}>{s.v}</p>
              <p className="text-[8px] text-gray-500 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
        {/* Documents */}
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-2.5 border-b border-violet-50 flex justify-between"><p className="text-[9px] font-bold text-gray-900">Recent Documents</p><p className="text-[8px] text-violet-600">View all →</p></div>
          {[{ n: '🧬 Biology Ch.3.pdf', c: 24, p: 80 }, { n: '🏛️ History Notes.pdf', c: 18, p: 40 }, { n: '📐 Math Formulas.pdf', c: 31, p: 95 }].map((d, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-violet-50 last:border-0">
              <span className="text-[9px]">{d.n}</span>
              <span className="text-[8px] text-gray-400 ml-auto">{d.c} cards</span>
              <div className="w-20"><div className="h-2 bg-violet-100 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${d.p}%` }} /></div></div>
              <span className="text-[8px] font-medium text-gray-600">{d.p}%</span>
            </div>
          ))}
        </div>
        {/* Activity chart */}
        <div className="bg-white rounded-2xl border border-violet-100 p-4 shadow-sm">
          <p className="text-[9px] font-bold text-gray-900 mb-3">This week&apos;s study activity</p>
          <div className="flex items-end gap-2 h-14">
            {[45, 30, 65, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-violet-400 rounded-t-lg" style={{ height: `${h}%` }} />
                <span className="text-[6px] text-gray-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  Admin: () => (
    <div className="flex min-h-[460px] bg-violet-950" style={{ fontSize: '10px', fontFamily: 'sans-serif' }}>
      <div className="w-36 bg-violet-950/80 border-r border-white/5 p-3">
        <p className="text-[10px] font-bold text-white mb-4">📚 Admin</p>
        {[{ l: '📊 Overview', a: true }, { l: '👥 Students', a: false }, { l: '💳 Revenue', a: false }, { l: '⚙️ Settings', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg text-[9px] mb-0.5 ${n.a ? 'bg-violet-500/20 text-violet-300' : 'text-violet-400/60'}`}>{n.l}</div>
        ))}
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm font-bold text-white mb-4">Platform Overview</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'Students', v: '1,247' }, { l: 'MRR', v: '$4,829' }, { l: 'Docs Uploaded', v: '8.4K' }, { l: 'Cards Created', v: '52K' }].map((s, i) => (
            <div key={i} className="rounded-xl bg-violet-500/10 border border-white/5 p-3"><p className="text-[8px] text-violet-300/60">{s.l}</p><p className="text-sm font-bold text-white">{s.v}</p></div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden mb-4">
          <div className="px-3 py-2 border-b border-white/5"><p className="text-[9px] font-semibold text-white">Top Students</p></div>
          {[{ n: 'Sarah J.', p: 'Student', d: '18 docs' }, { n: 'Mike C.', p: 'Free', d: '3 docs' }, { n: 'Lisa W.', p: 'Student', d: '42 docs' }].map((u, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0">
              <div className="h-5 w-5 rounded-full bg-violet-400/30 flex-shrink-0" />
              <span className="text-[9px] text-white flex-1">{u.n}</span>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${u.p === 'Free' ? 'bg-gray-500/20 text-gray-400' : 'bg-violet-500/20 text-violet-300'}`}>{u.p}</span>
              <span className="text-[8px] text-violet-300/60">{u.d}</span>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl border border-white/5 p-3"><p className="text-[9px] font-semibold text-white mb-2">Revenue</p><div className="flex items-end gap-0.5 h-16">{[20, 35, 30, 45, 50, 55, 65, 70, 75, 80, 85, 90].map((h, i) => <div key={i} className="flex-1 bg-gradient-to-t from-violet-500 to-purple-400 rounded-t opacity-80" style={{ height: `${h}%` }} />)}</div></div>
      </div>
    </div>
  ),
}

// =====================================================================
// INVOICEFLOW — Green, FINANCE layout
// Split-screen, invoice mockup, table-heavy, sharp/minimal
// =====================================================================
const InvoiceFlowMockups = {
  Landing: () => (
    <div className="bg-white text-gray-900" style={{ fontSize: '11px', fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <span className="font-bold text-emerald-700 text-sm">🧾 InvoiceFlow</span>
        <div className="flex items-center gap-4 text-[10px]"><span className="text-gray-500">Features</span><span className="text-gray-500">Pricing</span><span className="px-3 py-1.5 bg-emerald-600 text-white rounded text-[10px] font-medium">Start free</span></div>
      </div>
      {/* Hero - split screen layout */}
      <div className="flex min-h-[180px]">
        {/* Left: copy */}
        <div className="flex-1 px-8 py-10 flex flex-col justify-center">
          <div className="text-[9px] text-emerald-600 font-semibold mb-2 uppercase tracking-wider">For freelancers</div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight mb-3">Create invoices.<br />Get paid faster.</h1>
          <p className="text-[10px] text-gray-500 leading-relaxed mb-5">No more spreadsheets. Create professional invoices in 30 seconds, track payments, send reminders automatically.</p>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-emerald-600 text-white rounded text-[9px] font-semibold">Create invoice →</span>
            <span className="px-4 py-2 border border-gray-200 rounded text-[9px] text-gray-600">See demo</span>
          </div>
        </div>
        {/* Right: invoice mockup */}
        <div className="flex-1 bg-gray-50 p-6 flex items-center justify-center">
          <div className="bg-white rounded shadow-xl border border-gray-200 p-4 w-48 transform rotate-1">
            <div className="flex justify-between items-start mb-3">
              <div><p className="text-[8px] font-bold text-gray-900">INVOICE #001</p><p className="text-[6px] text-gray-400">Mar 15, 2026</p></div>
              <span className="text-[6px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-semibold">PAID</span>
            </div>
            <div className="border-t border-gray-100 pt-2 space-y-1.5">
              <div className="flex justify-between text-[7px]"><span className="text-gray-600">Web Design</span><span className="font-medium">€800</span></div>
              <div className="flex justify-between text-[7px]"><span className="text-gray-600">Logo Package</span><span className="font-medium">€350</span></div>
              <div className="flex justify-between text-[7px]"><span className="text-gray-600">Revisions (2hr)</span><span className="font-medium">€150</span></div>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="flex justify-between text-[7px] text-gray-400"><span>Subtotal</span><span>€1,300</span></div>
              <div className="flex justify-between text-[7px] text-gray-400"><span>BTW 21%</span><span>€273</span></div>
              <div className="flex justify-between text-[9px] font-bold text-gray-900 mt-1"><span>Total</span><span>€1,573</span></div>
            </div>
          </div>
        </div>
      </div>
      {/* Stats bar */}
      <div className="flex border-y border-gray-100">
        {[{ v: '€2M+', l: 'invoiced' }, { v: '48hr', l: 'avg payment' }, { v: '2,000+', l: 'freelancers' }].map((s, i) => (
          <div key={i} className="flex-1 text-center py-4 border-r border-gray-100 last:border-0">
            <p className="text-sm font-bold text-emerald-700">{s.v}</p>
            <p className="text-[8px] text-gray-500">{s.l}</p>
          </div>
        ))}
      </div>
      {/* Features - minimal grid */}
      <div className="px-8 py-8 grid grid-cols-2 gap-4">
        {[{ i: '⚡', t: 'One-Click Invoices', d: 'Client, items, send. 30 seconds.' }, { i: '🧮', t: 'Auto Tax (VAT/BTW)', d: 'Calculated based on your country.' }, { i: '📊', t: 'Payment Tracking', d: 'Paid, pending, overdue at a glance.' }, { i: '📄', t: 'PDF Export', d: 'Branded invoices your clients love.' }].map((f, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="text-lg flex-shrink-0">{f.i}</span>
            <div><p className="text-[10px] font-semibold text-gray-900">{f.t}</p><p className="text-[8px] text-gray-500">{f.d}</p></div>
          </div>
        ))}
      </div>
      {/* Pricing */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-center gap-3">
          <div className="bg-white rounded border border-gray-200 p-3 w-28 text-center"><p className="text-[9px] font-bold">Free</p><p className="text-lg font-bold">€0</p><p className="text-[7px] text-gray-500">3 invoices/mo</p></div>
          <div className="bg-emerald-600 rounded p-3 w-28 text-center text-white"><p className="text-[9px] font-bold text-emerald-200">Pro</p><p className="text-lg font-bold">€19<span className="text-[7px] font-normal opacity-60">/mo</span></p><p className="text-[7px] text-emerald-200">Unlimited</p></div>
          <div className="bg-white rounded border border-gray-200 p-3 w-28 text-center"><p className="text-[9px] font-bold">Business</p><p className="text-lg font-bold">€49<span className="text-[7px] font-normal opacity-60">/mo</span></p><p className="text-[7px] text-gray-500">Team + API</p></div>
        </div>
      </div>
      <div className="px-6 py-3 border-t text-center text-[7px] text-gray-400">© 2026 InvoiceFlow</div>
    </div>
  ),

  Dashboard: () => (
    <div className="flex min-h-[460px] bg-gray-50" style={{ fontSize: '10px', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar - clean, minimal */}
      <div className="w-40 bg-white border-r border-gray-200 flex-shrink-0 p-3 flex flex-col">
        <div className="flex items-center gap-2 mb-5 px-1"><span className="text-sm">🧾</span><span className="font-bold text-emerald-700 text-[11px]">InvoiceFlow</span></div>
        {[{ l: 'Dashboard', a: true }, { l: 'Invoices', a: false }, { l: 'Clients', a: false }, { l: 'Reports', a: false }, { l: 'Settings', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded text-[9px] mb-0.5 ${n.a ? 'bg-emerald-50 text-emerald-700 font-medium border-l-2 border-emerald-500' : 'text-gray-500'}`}>{n.l}</div>
        ))}
        <div className="mt-auto pt-4 border-t"><div className="flex items-center gap-2 px-1"><div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center text-white text-[7px] font-bold">J</div><span className="text-[9px] text-gray-600">Jules K.</span></div></div>
      </div>
      {/* Main */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4"><div><p className="text-sm font-bold text-gray-900">Dashboard</p><p className="text-[9px] text-gray-500">March 2026</p></div><span className="px-3 py-2 bg-emerald-600 text-white rounded text-[9px] font-medium">+ New Invoice</span></div>
        {/* Big revenue number */}
        <div className="bg-emerald-600 rounded-lg p-4 text-white mb-4">
          <p className="text-[9px] text-emerald-200">Revenue this month</p>
          <p className="text-2xl font-bold">€4,250</p>
          <p className="text-[9px] text-emerald-200 mt-1">↑ 12% vs February · 12 invoices sent</p>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[{ l: 'Paid', v: '€3,400', c: 'border-green-200 bg-green-50', tc: 'text-green-700' }, { l: 'Pending', v: '€850', c: 'border-yellow-200 bg-yellow-50', tc: 'text-yellow-700' }, { l: 'Overdue', v: '€1,300', c: 'border-red-200 bg-red-50', tc: 'text-red-700' }].map((s, i) => (
            <div key={i} className={`rounded border ${s.c} p-2`}><p className="text-[8px] text-gray-500">{s.l}</p><p className={`text-sm font-bold ${s.tc}`}>{s.v}</p></div>
          ))}
        </div>
        {/* Invoice table */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-gray-50 border-b text-[8px] font-medium text-gray-500">
            <span>Invoice</span><span>Client</span><span className="text-right">Amount</span><span className="text-center">Status</span><span className="text-right">Date</span>
          </div>
          {[
            { id: '#001', cl: 'Acme Corp', am: '€1,200', st: '✅ Paid', stc: 'bg-green-50 text-green-700', dt: 'Mar 15' },
            { id: '#002', cl: 'TechStart BV', am: '€850', st: '🟡 Pending', stc: 'bg-yellow-50 text-yellow-700', dt: 'Mar 12' },
            { id: '#003', cl: 'DesignStudio', am: '€2,200', st: '✅ Paid', stc: 'bg-green-50 text-green-700', dt: 'Mar 8' },
            { id: '#004', cl: 'FreshCo', am: '€450', st: '🔴 Overdue', stc: 'bg-red-50 text-red-700', dt: 'Feb 28' },
          ].map((inv, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 px-3 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 text-[9px]">
              <span className="font-mono text-gray-400">{inv.id}</span>
              <span className="font-medium text-gray-900">{inv.cl}</span>
              <span className="text-right font-bold">{inv.am}</span>
              <span className="text-center"><span className={`text-[7px] px-1.5 py-0.5 rounded ${inv.stc} font-medium`}>{inv.st}</span></span>
              <span className="text-right text-gray-400">{inv.dt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  Admin: () => (
    <div className="flex min-h-[460px] bg-gray-900" style={{ fontSize: '10px', fontFamily: "'Inter', sans-serif" }}>
      <div className="w-36 bg-gray-950 border-r border-white/5 p-3">
        <p className="text-[10px] font-bold text-white mb-4">🧾 Admin</p>
        {[{ l: 'Analytics', a: true }, { l: 'Users', a: false }, { l: 'Billing', a: false }, { l: 'Settings', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded text-[9px] mb-0.5 ${n.a ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500'}`}>{n.l}</div>
        ))}
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm font-bold text-white mb-4">Platform Analytics</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'Users', v: '2,147' }, { l: 'MRR', v: '€12.4K' }, { l: 'Invoices/mo', v: '8,200' }, { l: 'Churn', v: '1.8%' }].map((s, i) => (
            <div key={i} className="rounded bg-emerald-500/10 border border-white/5 p-3"><p className="text-[8px] text-gray-400">{s.l}</p><p className="text-sm font-bold text-white">{s.v}</p></div>
          ))}
        </div>
        <div className="bg-white/5 rounded border border-white/5 p-3 mb-4"><p className="text-[9px] font-semibold text-white mb-2">MRR Growth</p><div className="flex items-end gap-0.5 h-16">{[30, 40, 45, 50, 55, 58, 65, 70, 72, 80, 85, 92].map((h, i) => <div key={i} className="flex-1 bg-emerald-500 rounded-t opacity-80" style={{ height: `${h}%` }} />)}</div></div>
        <div className="bg-white/5 rounded border border-white/5 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/5"><p className="text-[9px] font-semibold text-white">Top Users</p></div>
          {[{ n: 'Jules K.', am: '€8.4K' }, { n: 'Anna M.', am: '€24.1K' }, { n: 'Tom B.', am: '€5.2K' }].map((u, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0"><div className="h-4 w-4 rounded bg-emerald-400/30 flex-shrink-0" /><span className="text-[9px] text-white flex-1">{u.n}</span><span className="text-[8px] text-emerald-400">{u.am} invoiced</span></div>
          ))}
        </div>
      </div>
    </div>
  ),
}

// =====================================================================
// TESTMARK — Blue/cyan, MONITORING/TECH layout
// Terminal-dark, monospace, data-dense, status grids
// =====================================================================
const TestMarkMockups = {
  Landing: () => (
    <div className="bg-slate-950 text-slate-200" style={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
        <span className="font-bold text-sky-400 text-sm" style={{ fontFamily: 'sans-serif' }}>🔖 TestMark</span>
        <div className="flex items-center gap-4 text-[10px]" style={{ fontFamily: 'sans-serif' }}><span className="text-slate-500">Docs</span><span className="text-slate-500">Pricing</span><span className="px-3 py-1.5 bg-sky-500 text-white rounded text-[10px] font-medium">Start monitoring</span></div>
      </div>
      {/* Hero - tech, centered */}
      <div className="px-8 py-12 text-center">
        <div className="mb-6">
          {/* Status grid illustration */}
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: 20 }).map((_, i) => <div key={i} className={`h-2.5 w-2.5 rounded-sm ${i === 7 || i === 14 ? 'bg-red-500' : 'bg-green-500'}`} />)}
          </div>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 20 }).map((_, i) => <div key={i} className={`h-2.5 w-2.5 rounded-sm ${i === 3 ? 'bg-yellow-500' : 'bg-green-500'}`} />)}
          </div>
        </div>
        <div className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'sans-serif' }}>99.7%</div>
        <p className="text-sky-400 text-xs mb-2" style={{ fontFamily: 'sans-serif' }}>Average uptime across all monitored URLs</p>
        <h1 className="text-lg font-bold text-white mt-4 mb-2" style={{ fontFamily: 'sans-serif' }}>Monitor your bookmarks.<br />Never miss a dead link.</h1>
        <p className="text-slate-400 text-[10px] max-w-xs mx-auto mb-6">Add URLs. We check every 15 minutes. Get instant alerts via email, Slack, or webhook when something breaks.</p>
        <span className="px-5 py-2.5 bg-sky-500 text-white rounded text-[10px] font-bold" style={{ fontFamily: 'sans-serif' }}>Start monitoring free →</span>
      </div>
      {/* Features - compact */}
      <div className="px-8 py-6 border-t border-white/5">
        <div className="grid grid-cols-2 gap-3">
          {[{ i: '📡', t: '15-min checks', d: 'HTTP, SSL, DNS monitoring' }, { i: '🔔', t: 'Instant alerts', d: 'Email + Slack + webhooks' }, { i: '👥', t: 'Team sharing', d: 'Share collections with your team' }, { i: '📊', t: 'Analytics', d: 'Response times, uptime history' }].map((f, i) => (
            <div key={i} className="bg-white/5 rounded p-3 border border-white/5">
              <span className="text-lg">{f.i}</span>
              <p className="text-[9px] font-bold text-white mt-1" style={{ fontFamily: 'sans-serif' }}>{f.t}</p>
              <p className="text-[7px] text-slate-500">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Pricing */}
      <div className="px-8 py-6 border-t border-white/5">
        <div className="flex justify-center gap-3">
          <div className="bg-white/5 rounded border border-white/5 p-3 w-24 text-center"><p className="text-[9px] font-bold text-white" style={{ fontFamily: 'sans-serif' }}>Free</p><p className="text-lg font-bold text-white">$0</p><p className="text-[7px] text-slate-500">10 URLs</p></div>
          <div className="bg-sky-500 rounded p-3 w-24 text-center text-white"><p className="text-[9px] font-bold text-sky-100" style={{ fontFamily: 'sans-serif' }}>Pro</p><p className="text-lg font-bold">$5<span className="text-[7px] font-normal opacity-60">/mo</span></p><p className="text-[7px] text-sky-100">500 URLs</p></div>
          <div className="bg-white/5 rounded border border-white/5 p-3 w-24 text-center"><p className="text-[9px] font-bold text-white" style={{ fontFamily: 'sans-serif' }}>Team</p><p className="text-lg font-bold text-white">$15<span className="text-[7px] font-normal opacity-60">/mo</span></p><p className="text-[7px] text-slate-500">Unlimited</p></div>
        </div>
      </div>
      <div className="px-6 py-3 border-t border-white/5 text-center text-[7px] text-slate-600">© 2026 TestMark</div>
    </div>
  ),

  Dashboard: () => (
    <div className="flex min-h-[460px] bg-slate-950" style={{ fontSize: '10px', fontFamily: "'Courier New', monospace" }}>
      <div className="w-36 bg-slate-900/50 border-r border-white/5 p-2 flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2 px-2 py-3 mb-2"><span className="text-sm">🔖</span><span className="font-bold text-sky-400 text-[11px]" style={{ fontFamily: 'sans-serif' }}>TestMark</span></div>
        {[{ l: 'Dashboard', a: true }, { l: 'URLs', a: false }, { l: 'Alerts', a: false }, { l: 'Teams', a: false }, { l: 'Settings', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded text-[9px] mb-0.5 ${n.a ? 'bg-sky-500/10 text-sky-400' : 'text-slate-600'}`} style={{ fontFamily: 'sans-serif' }}>{n.l}</div>
        ))}
        <div className="mt-auto pt-3 border-t border-white/5 px-2"><div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-green-500" /><span className="text-[8px] text-slate-500">All systems operational</span></div></div>
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4" style={{ fontFamily: 'sans-serif' }}><div><p className="text-sm font-bold text-white">Monitoring 47 URLs</p><p className="text-[9px] text-slate-500">Last check: 2 min ago</p></div><span className="px-3 py-1.5 bg-sky-500 text-white rounded text-[9px] font-medium">+ Add URL</span></div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'URLs', v: '47', c: 'text-sky-400' }, { l: 'Uptime', v: '99.2%', c: 'text-green-400' }, { l: 'Alerts', v: '2', c: 'text-red-400' }, { l: 'Avg Resp', v: '142ms', c: 'text-amber-400' }].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded p-2"><p className="text-[7px] text-slate-500" style={{ fontFamily: 'sans-serif' }}>{s.l}</p><p className={`text-sm font-bold ${s.c}`}>{s.v}</p></div>
          ))}
        </div>
        {/* URL monitoring table - monospace, compact */}
        <div className="bg-slate-900/50 border border-white/5 rounded overflow-hidden mb-4">
          <div className="grid grid-cols-4 gap-2 px-3 py-1.5 border-b border-white/5 text-[7px] text-slate-500" style={{ fontFamily: 'sans-serif' }}>
            <span>URL</span><span className="text-center">Status</span><span className="text-right">Response</span><span className="text-right">Last check</span>
          </div>
          {[
            { url: 'api.myapp.com', st: '200', ok: true, ms: '89ms' },
            { url: 'docs.myapp.com', st: '200', ok: true, ms: '142ms' },
            { url: 'staging.myapp.com', st: '503', ok: false, ms: 'timeout' },
            { url: 'blog.myapp.com', st: '200', ok: true, ms: '201ms' },
            { url: 'cdn.myapp.com', st: '200', ok: true, ms: '34ms' },
          ].map((u, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 px-3 py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 text-[9px]">
              <span className="text-sky-300 truncate">{u.url}</span>
              <span className="text-center"><span className={u.ok ? 'text-green-400' : 'text-red-400'}>{u.ok ? '● ' : '● '}{u.st}</span></span>
              <span className={`text-right ${u.ms === 'timeout' ? 'text-red-400' : 'text-slate-400'}`}>{u.ms}</span>
              <span className="text-right text-slate-600">2m ago</span>
            </div>
          ))}
        </div>
        {/* Uptime chart - area style */}
        <div className="bg-slate-900/50 border border-white/5 rounded p-3">
          <p className="text-[8px] text-slate-500 mb-2" style={{ fontFamily: 'sans-serif' }}>Uptime (24h)</p>
          <div className="flex items-end gap-0.5 h-10">
            {Array.from({ length: 48 }).map((_, i) => {
              const isDown = i === 28 || i === 29
              return <div key={i} className={`flex-1 rounded-t-sm ${isDown ? 'bg-red-500' : i > 40 ? 'bg-sky-400' : 'bg-sky-500/60'}`} style={{ height: isDown ? '20%' : `${75 + Math.random() * 25}%` }} />
            })}
          </div>
          <div className="flex justify-between mt-1 text-[6px] text-slate-600"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span></div>
        </div>
      </div>
    </div>
  ),

  Admin: () => (
    <div className="flex min-h-[460px] bg-slate-950" style={{ fontSize: '10px', fontFamily: "'Courier New', monospace" }}>
      <div className="w-36 bg-slate-900/50 border-r border-white/5 p-2 flex-shrink-0">
        <p className="text-[10px] font-bold text-white px-2 py-3 mb-2" style={{ fontFamily: 'sans-serif' }}>🔖 Admin</p>
        {[{ l: 'System', a: true }, { l: 'Users', a: false }, { l: 'Billing', a: false }, { l: 'Infra', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded text-[9px] mb-0.5 ${n.a ? 'bg-sky-500/10 text-sky-400' : 'text-slate-600'}`} style={{ fontFamily: 'sans-serif' }}>{n.l}</div>
        ))}
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm font-bold text-white mb-4" style={{ fontFamily: 'sans-serif' }}>System Status</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'Users', v: '892' }, { l: 'URLs', v: '24.5K' }, { l: 'Checks/day', v: '2.3M' }, { l: 'MRR', v: '$3.2K' }].map((s, i) => (
            <div key={i} className="bg-sky-500/10 border border-white/5 rounded p-2"><p className="text-[7px] text-slate-500" style={{ fontFamily: 'sans-serif' }}>{s.l}</p><p className="text-sm font-bold text-white">{s.v}</p></div>
          ))}
        </div>
        {/* System health - unique to TestMark */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-900/50 border border-white/5 rounded p-3">
            <p className="text-[8px] text-slate-500 mb-2" style={{ fontFamily: 'sans-serif' }}>System Health</p>
            {[{ l: 'API Latency', v: '12ms', s: '🟢' }, { l: 'Queue', v: '34 jobs', s: '🟢' }, { l: 'Error Rate', v: '0.02%', s: '🟢' }, { l: 'CPU', v: '34%', s: '🟢' }, { l: 'Memory', v: '62%', s: '🟡' }].map((h, i) => (
              <div key={i} className="flex justify-between py-0.5"><span className="text-[8px] text-slate-500">{h.l}</span><span className="text-[8px] text-white">{h.s} {h.v}</span></div>
            ))}
          </div>
          <div className="bg-slate-900/50 border border-white/5 rounded p-3">
            <p className="text-[8px] text-slate-500 mb-2" style={{ fontFamily: 'sans-serif' }}>Check Volume</p>
            <div className="flex items-end gap-0.5 h-20">{[60, 65, 70, 68, 75, 80, 78, 85, 82, 90, 88, 95].map((h, i) => <div key={i} className="flex-1 bg-sky-500 rounded-t opacity-80" style={{ height: `${h}%` }} />)}</div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/5 rounded overflow-hidden">
          <div className="px-3 py-2 border-b border-white/5"><p className="text-[8px] font-semibold text-white" style={{ fontFamily: 'sans-serif' }}>Top Users</p></div>
          {[{ n: 'DevTeam Inc.', p: 'Team', u: '2,400' }, { n: 'Sarah Dev', p: 'Pro', u: '340' }, { n: 'TechCorp', p: 'Team', u: '1,800' }].map((u, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-1.5 border-b border-white/5 last:border-0">
              <div className="h-4 w-4 rounded bg-sky-400/20 flex-shrink-0" />
              <span className="text-[9px] text-white flex-1" style={{ fontFamily: 'sans-serif' }}>{u.n}</span>
              <span className={`text-[7px] px-1.5 py-0.5 rounded ${u.p === 'Team' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'}`}>{u.p}</span>
              <span className="text-[8px] text-slate-500">{u.u} URLs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

const MOCKUPS: Record<string, { Landing: () => React.ReactNode; Dashboard: () => React.ReactNode; Admin: () => React.ReactNode }> = {
  StudyGen: StudyGenMockups,
  InvoiceFlow: InvoiceFlowMockups,
  TestMark: TestMarkMockups,
}
