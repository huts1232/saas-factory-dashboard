'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Rocket, Clock, Database, FileText, Globe, Users, CreditCard, BarChart3, Settings, Home, ArrowRight } from 'lucide-react'
import { useUser } from '@/lib/auth-context'

interface ExampleProject {
  name: string
  tagline: string
  time: string
  price: string
  features: string[]
  tables?: number
  files?: number
  routes?: number
  idea: string
  color: string       // hero gradient color
  icon: string        // emoji
  description?: string
  priceFree?: string[]
  pricePaid?: string[]
}

const TABS = ['Landing Page', 'Dashboard', 'Admin'] as const

export function ProjectPreviewModal({ project, open, onClose }: {
  project: ExampleProject | null; open: boolean; onClose: () => void
}) {
  const [tab, setTab] = useState<typeof TABS[number]>('Landing Page')
  const { openLoginModal } = useUser()

  if (!project) return null

  function handleBuild() { onClose(); openLoginModal(project!.idea) }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-6"
          onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-5xl max-h-[95vh] bg-bg-secondary border border-border-default rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-default flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{project.icon}</span>
                <div>
                  <span className="text-lg font-bold">{project.name}</span>
                  <span className="text-xs text-text-muted ml-3">{project.tagline}</span>
                </div>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-3 pb-1 flex-shrink-0 bg-bg-secondary">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    tab === t ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-secondary'
                  }`}>{t}</button>
              ))}
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="rounded-xl border border-border-default overflow-hidden shadow-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a2e] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/50 font-mono">
                      {project.name.toLowerCase().replace(/\s/g, '')}.com{tab === 'Dashboard' ? '/dashboard' : tab === 'Admin' ? '/admin' : ''}
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    {tab === 'Landing Page' && <LandingMockup p={project} />}
                    {tab === 'Dashboard' && <DashboardMockup p={project} />}
                    {tab === 'Admin' && <AdminMockup p={project} />}
                  </motion.div>
                </AnimatePresence>
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
                <button onClick={handleBuild}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90 transition-all flex-shrink-0 ml-4">
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

// ===== HIGH-FIDELITY LANDING PAGE MOCKUP =====
function LandingMockup({ p }: { p: ExampleProject }) {
  return (
    <div className="bg-white" style={{ fontSize: '11px' }}>
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-base">{p.icon}</span>
          <span className="font-bold text-gray-900 text-sm">{p.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-[10px]">Features</span>
          <span className="text-gray-500 text-[10px]">Pricing</span>
          <span className="text-gray-500 text-[10px]">Log in</span>
          <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-medium">Sign up free</span>
        </div>
      </div>

      {/* Hero */}
      <div className={`bg-gradient-to-br ${p.color} px-8 py-12 text-center`}>
        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white/80 text-[9px] font-medium mb-4">
          ✨ AI-powered {p.name.toLowerCase()}
        </div>
        <h1 className="text-xl font-bold text-white mb-2">{p.tagline}</h1>
        <p className="text-white/70 text-xs max-w-sm mx-auto mb-5">{p.description || 'Start today and transform your workflow with AI-powered tools.'}</p>
        <div className="flex gap-2 justify-center">
          <span className="px-5 py-2 bg-white text-gray-900 rounded-lg text-[10px] font-semibold shadow-lg">Get started free</span>
          <span className="px-5 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-[10px] font-medium">Learn more</span>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-8">
        <p className="text-center text-xs font-bold text-gray-900 mb-5">Everything you need</p>
        <div className="grid grid-cols-3 gap-3">
          {p.features.map((f, i) => {
            const icons = ['⚡', '📊', '🔒', '🚀', '💡', '🎯']
            return (
              <div key={i} className="bg-gray-50 rounded-xl p-3 hover:shadow-md transition-shadow">
                <div className="text-base mb-2">{icons[i % icons.length]}</div>
                <p className="text-[10px] font-semibold text-gray-900">{f}</p>
                <p className="text-[8px] text-gray-500 mt-1">Powered by AI</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pricing */}
      <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
        <p className="text-center text-xs font-bold text-gray-900 mb-4">Simple pricing</p>
        <div className="flex justify-center gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3 w-28 text-center">
            <p className="text-[10px] font-bold text-gray-900">Free</p>
            <p className="text-lg font-bold text-gray-900">$0</p>
            <p className="text-[8px] text-gray-500">Basic features</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-blue-600 p-3 w-28 text-center relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[7px] font-bold px-2 py-0.5 rounded-full">POPULAR</div>
            <p className="text-[10px] font-bold text-blue-600">Pro</p>
            <p className="text-lg font-bold text-gray-900">{p.price.replace('/mo', '')}</p>
            <p className="text-[8px] text-gray-500">per month</p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-6 py-6">
        <div className="flex gap-3">
          {['"Game changer for my workflow"', '"Saved me hours every week"', '"Best tool in its category"'].map((t, i) => (
            <div key={i} className="flex-1 bg-gray-50 rounded-xl p-3">
              <p className="text-[9px] text-gray-600 italic">{t}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-4 w-4 rounded-full bg-gray-200" />
                <p className="text-[8px] text-gray-500">Happy user</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-[8px] text-gray-400">
        <span>© 2026 {p.name}</span>
        <span>Built with Next.js + Supabase</span>
      </div>
    </div>
  )
}

// ===== HIGH-FIDELITY DASHBOARD MOCKUP =====
function DashboardMockup({ p }: { p: ExampleProject }) {
  return (
    <div className="flex min-h-[420px] bg-gray-50" style={{ fontSize: '10px' }}>
      {/* Sidebar */}
      <div className="w-36 bg-gray-900 flex-shrink-0 flex flex-col">
        <div className="px-3 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-sm">{p.icon}</span>
            <span className="font-bold text-white text-[11px]">{p.name}</span>
          </div>
        </div>
        <div className="p-2 space-y-0.5 flex-1">
          {[
            { icon: Home, label: 'Dashboard', active: true },
            ...p.features.slice(0, 3).map(f => ({ icon: BarChart3, label: f.split(' ')[0], active: false })),
            { icon: Settings, label: 'Settings', active: false },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] ${
              item.active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}>
              <item.icon className="h-3 w-3" />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[7px] font-bold">U</div>
            <span className="text-[9px] text-gray-400 truncate">user@example.com</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-gray-900">Welcome back! 👋</p>
            <p className="text-[9px] text-gray-500">Here&apos;s what&apos;s happening today</p>
          </div>
          <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-medium">+ New</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total Users', value: '1,247', change: '+12%', color: 'text-blue-600' },
            { label: 'Revenue', value: '$4,829', change: '+23%', color: 'text-green-600' },
            { label: 'Active Now', value: '89', change: '+5%', color: 'text-purple-600' },
            { label: 'Growth', value: '18%', change: '+3%', color: 'text-orange-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-[8px] text-gray-500">{s.label}</p>
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[8px] text-green-600 mt-0.5">↑ {s.change}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 shadow-sm">
          <p className="text-[9px] font-semibold text-gray-900 mb-3">Revenue Overview</p>
          <div className="flex items-end gap-1 h-16">
            {[35, 45, 30, 55, 48, 65, 58, 72, 68, 80, 75, 90, 85, 95, 88].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-500/80 rounded-t hover:bg-blue-600 transition-colors" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[7px] text-gray-400">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
            <p className="text-[9px] font-semibold text-gray-900">Recent Activity</p>
            <p className="text-[8px] text-blue-600">View all →</p>
          </div>
          {['Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'Alex Turner', 'Lisa Park'].map((name, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-medium text-gray-900">{name}</p>
                <p className="text-[7px] text-gray-500">Signed up · {i + 1}h ago</p>
              </div>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${
                i < 3 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>{i < 3 ? 'Active' : 'Trial'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ===== HIGH-FIDELITY ADMIN MOCKUP =====
function AdminMockup({ p }: { p: ExampleProject }) {
  return (
    <div className="flex min-h-[420px] bg-[#0f0f1a]" style={{ fontSize: '10px' }}>
      {/* Sidebar */}
      <div className="w-36 bg-[#0a0a15] border-r border-white/5 flex-shrink-0 flex flex-col">
        <div className="px-3 py-4 border-b border-white/5">
          <p className="text-[10px] font-bold text-white">{p.name} Admin</p>
        </div>
        <div className="p-2 space-y-0.5 flex-1">
          {[
            { icon: BarChart3, label: 'Analytics', active: true },
            { icon: Users, label: 'Users', active: false },
            { icon: CreditCard, label: 'Billing', active: false },
            { icon: Settings, label: 'Settings', active: false },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] ${
              item.active ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500'
            }`}>
              <item.icon className="h-3 w-3" /> {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-4 overflow-hidden">
        <p className="text-sm font-bold text-white mb-4">Analytics Overview</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total Users', value: '1,247', icon: Users, color: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400' },
            { label: 'MRR', value: '$4,829', icon: CreditCard, color: 'from-green-500/20 to-green-600/10', text: 'text-green-400' },
            { label: 'Active', value: '892', icon: BarChart3, color: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400' },
            { label: 'Churn', value: '2.1%', icon: ArrowRight, color: 'from-orange-500/20 to-orange-600/10', text: 'text-orange-400' },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/5 p-3`}>
              <s.icon className={`h-4 w-4 ${s.text} mb-2`} />
              <p className="text-[8px] text-gray-400">{s.label}</p>
              <p className={`text-sm font-bold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-white/5 rounded-xl border border-white/5 p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-semibold text-white">Revenue</p>
            <div className="flex gap-1">
              {['1W', '1M', '3M', '1Y'].map(t => (
                <span key={t} className={`px-2 py-0.5 rounded text-[7px] ${t === '1M' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500'}`}>{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-0.5 h-20">
            {[30, 45, 35, 55, 48, 65, 58, 72, 68, 80, 75, 90, 85, 95, 88, 92].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-[9px] font-semibold text-white">Recent Users</p>
          </div>
          {['Sarah J.', 'Mike C.', 'Emma W.', 'Alex T.'].map((name, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[9px] text-white font-medium">{name}</p>
                <p className="text-[7px] text-gray-500">{name.toLowerCase().replace(' ', '.')}@email.com</p>
              </div>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${
                i < 2 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
              }`}>{i < 2 ? 'Pro' : 'Free'}</span>
              <span className="text-[7px] text-gray-500">{i + 1}h ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
