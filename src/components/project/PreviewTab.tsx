'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Database, Globe, Table, Columns3, ArrowRight, Home, Settings, Users, CreditCard, BarChart3, Star, Zap, Shield, Layout, FileText } from 'lucide-react'

interface PreviewTabProps { project: any }

function getFeatures(p: any): any[] {
  return Array.isArray(p.features) ? p.features : p.features?.features || []
}

// ===== BROWSER FRAME =====
function Browser({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-default overflow-hidden shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 px-4 py-2 bg-bg-elevated border-b border-border-default">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-0.5 rounded bg-bg-primary border border-border-default text-[10px] text-text-muted font-mono">{url}</div>
        </div>
      </div>
      <div className="bg-white overflow-hidden">{children}</div>
    </div>
  )
}

// ===== LANDING PAGE MOCKUP (high-fidelity) =====
function LandingMockup({ project }: { project: any }) {
  const features = getFeatures(project)
  const name = project.product_name || 'MyApp'
  const tagline = project.tagline || 'Your new SaaS'
  const price = project.pricing?.suggestedPrice || '$9/mo'
  const slug = name.toLowerCase().replace(/\s+/g, '')

  return (
    <Browser url={`${slug}.vercel.app`}>
      <div className="text-gray-900" style={{ fontSize: '11px' }}>
        {/* Nav */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <span className="font-bold text-blue-600 text-xs">{name}</span>
          <div className="flex gap-2">
            <span className="text-gray-500">Log in</span>
            <span className="px-2.5 py-1 bg-blue-600 text-white rounded text-[9px] font-medium">Sign up</span>
          </div>
        </div>
        {/* Hero */}
        <div className="bg-gradient-to-b from-blue-50 to-white px-5 py-8 text-center">
          <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px] font-medium mb-3">✨ AI-powered</div>
          <h2 className="text-sm font-bold text-gray-900 mb-1">{tagline}</h2>
          <p className="text-[9px] text-gray-500 max-w-[220px] mx-auto mb-3">{project.description?.slice(0, 80) || 'Start today and transform your workflow.'}</p>
          <div className="flex gap-2 justify-center">
            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-[9px] font-medium">Get Started Free</span>
            <span className="px-3 py-1.5 border border-gray-200 rounded-md text-[9px] text-gray-600">Learn More</span>
          </div>
        </div>
        {/* Features */}
        <div className="px-5 py-5">
          <p className="text-[9px] font-bold text-center mb-3">Features</p>
          <div className="grid grid-cols-3 gap-2">
            {features.slice(0, 6).map((f: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2">
                <div className="text-[7px] font-bold text-gray-900">{f.name}</div>
                <div className="text-[6px] text-gray-500 mt-0.5 line-clamp-2">{f.description?.slice(0, 40)}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Pricing */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-center gap-3">
            <div className="bg-white rounded-lg border p-2 w-20 text-center">
              <div className="text-[8px] font-bold">Free</div>
              <div className="text-[10px] font-bold">$0</div>
            </div>
            <div className="bg-white rounded-lg border-2 border-blue-600 p-2 w-20 text-center">
              <div className="text-[8px] font-bold text-blue-600">Pro</div>
              <div className="text-[10px] font-bold">{price}</div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-5 py-2 border-t text-center text-[7px] text-gray-400">© 2026 {name}</div>
      </div>
    </Browser>
  )
}

// ===== DASHBOARD MOCKUP =====
function DashboardMockup({ project }: { project: any }) {
  const features = getFeatures(project)
  const name = project.product_name || 'MyApp'
  const tables = project.architecture?.database?.tables || []
  const slug = name.toLowerCase().replace(/\s+/g, '')

  return (
    <Browser url={`${slug}.vercel.app/dashboard`}>
      <div className="flex min-h-[320px]" style={{ fontSize: '10px' }}>
        {/* Sidebar */}
        <div className="w-28 bg-gray-50 border-r border-gray-100 p-2 flex-shrink-0">
          <div className="font-bold text-blue-600 text-[10px] mb-3 px-1">{name}</div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-50 text-blue-700 rounded text-[8px] font-medium"><Home className="h-2.5 w-2.5" /> Dashboard</div>
            {features.slice(0, 3).map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 hover:bg-gray-100 rounded text-[8px]">
                <div className="h-2.5 w-2.5 rounded bg-gray-200" />
                {f.name?.split(' ')[0]}
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 text-[8px]"><Settings className="h-2.5 w-2.5" /> Settings</div>
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-[10px]">Dashboard</span>
            <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[7px] font-bold">U</div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[{ l: 'Total Users', v: '0' }, { l: 'Revenue', v: '$0' }, { l: 'Active', v: '0' }].map((s, i) => (
              <div key={i} className="bg-white rounded border p-2">
                <div className="text-[7px] text-gray-500">{s.l}</div>
                <div className="text-[11px] font-bold text-gray-900">{s.v}</div>
              </div>
            ))}
          </div>
          {/* Table */}
          <div className="bg-white rounded border overflow-hidden">
            <div className="flex gap-3 px-2 py-1.5 bg-gray-50 border-b text-[7px] font-medium text-gray-500">
              {(tables[0]?.columns || [{ name: 'id' }, { name: 'name' }, { name: 'email' }, { name: 'created_at' }]).slice(0, 4).map((c: any, i: number) => (
                <span key={i} className="flex-1">{c.name}</span>
              ))}
            </div>
            {[0, 1, 2].map(r => (
              <div key={r} className="flex gap-3 px-2 py-1.5 border-b border-gray-50 last:border-0">
                {[0, 1, 2, 3].map(c => <div key={c} className="flex-1 h-1.5 bg-gray-100 rounded" />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Browser>
  )
}

// ===== ADMIN MOCKUP =====
function AdminMockup({ project }: { project: any }) {
  const name = project.product_name || 'MyApp'
  const slug = name.toLowerCase().replace(/\s+/g, '')

  return (
    <Browser url={`${slug}.vercel.app/admin`}>
      <div className="flex min-h-[320px]" style={{ fontSize: '10px' }}>
        {/* Sidebar */}
        <div className="w-28 bg-gray-900 p-2 flex-shrink-0">
          <div className="font-bold text-white text-[10px] mb-3 px-1">{name} Admin</div>
          <div className="space-y-0.5">
            {[{ icon: BarChart3, label: 'Analytics' }, { icon: Users, label: 'Users' }, { icon: CreditCard, label: 'Billing' }, { icon: Settings, label: 'Settings' }].map((item, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[8px] ${i === 0 ? 'bg-gray-800 text-white' : 'text-gray-400'}`}>
                <item.icon className="h-2.5 w-2.5" /> {item.label}
              </div>
            ))}
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 p-3 bg-gray-50">
          <div className="font-bold text-gray-900 text-[10px] mb-3">Analytics</div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[{ l: 'Users', v: '124', c: 'text-blue-600' }, { l: 'Revenue', v: '$890', c: 'text-green-600' }, { l: 'MRR', v: '$890', c: 'text-purple-600' }, { l: 'Churn', v: '2.1%', c: 'text-orange-600' }].map((s, i) => (
              <div key={i} className="bg-white rounded border p-2 text-center">
                <div className="text-[7px] text-gray-500">{s.l}</div>
                <div className={`text-[10px] font-bold ${s.c}`}>{s.v}</div>
              </div>
            ))}
          </div>
          {/* Chart */}
          <div className="bg-white rounded border p-2 mb-3">
            <div className="text-[8px] text-gray-500 mb-2">Revenue (30 days)</div>
            <div className="flex items-end gap-0.5 h-10">
              {[30, 45, 35, 60, 50, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-500 rounded-t opacity-80" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          {/* Users */}
          <div className="bg-white rounded border overflow-hidden">
            <div className="px-2 py-1.5 bg-gray-50 border-b text-[8px] font-medium text-gray-500">Recent Users</div>
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 border-b last:border-0">
                <div className="h-4 w-4 rounded-full bg-blue-100" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded w-16" />
                <span className="text-[7px] text-green-600 font-medium">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Browser>
  )
}

// ===== MAIN =====
export function PreviewTab({ project }: PreviewTabProps) {
  const [view, setView] = useState<'landing' | 'dashboard' | 'admin'>('landing')
  const arch = project.architecture
  const features = getFeatures(project)
  const tables = arch?.database?.tables || []
  const apiRoutes = arch?.apiRoutes || []

  const pages = (arch?.fileStructure || [])
    .filter((f: any) => f.path.includes('page.tsx') && !f.path.includes('api/'))
    .map((f: any) => ({
      path: '/' + f.path.replace(/^(src\/)?app\//, '').replace(/\/page\.tsx$/, '').replace(/\[.*?\]/g, ':id'),
      desc: f.description,
    }))
    .map((p: any) => ({ ...p, path: p.path === '/.' ? '/' : p.path }))

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-bg-secondary rounded-lg p-1 w-fit">
        {([['landing', 'Landing Page'], ['dashboard', 'Dashboard'], ['admin', 'Admin Panel']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setView(key as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              view === key ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}>{label}</button>
        ))}
      </div>

      {/* Mockups */}
      <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {view === 'landing' && <LandingMockup project={project} />}
        {view === 'dashboard' && <DashboardMockup project={project} />}
        {view === 'admin' && <AdminMockup project={project} />}
      </motion.div>

      {/* Technical details */}
      {pages.length > 0 && (
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Globe className="h-4 w-4 text-accent" /> Pages ({pages.length})</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {pages.slice(0, 8).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-1 rounded bg-bg-elevated border border-border-default text-text-secondary font-mono">{p.path}</span>
                {i < Math.min(pages.length, 8) - 1 && <ArrowRight className="h-2.5 w-2.5 text-text-muted" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {tables.length > 0 && (
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-accent-green" /> Database ({tables.length} tables)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tables.map((t: any, i: number) => (
              <div key={i} className="rounded-lg border border-border-default overflow-hidden">
                <div className="px-3 py-1.5 bg-accent-green/5 border-b border-border-default flex items-center gap-2">
                  <Table className="h-3 w-3 text-accent-green" />
                  <span className="text-xs font-mono font-semibold text-accent-green">{t.name}</span>
                  <span className="text-[9px] text-text-muted ml-auto">{(t.columns || []).length} cols</span>
                </div>
                <div className="p-2 space-y-0.5">
                  {(t.columns || []).slice(0, 5).map((c: any, j: number) => (
                    <div key={j} className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-text-secondary">{c.name}</span>
                      <span className="text-text-muted font-mono">{c.type}</span>
                    </div>
                  ))}
                  {(t.columns || []).length > 5 && <p className="text-[9px] text-text-muted">+{t.columns.length - 5} more</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {apiRoutes.length > 0 && (
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Columns3 className="h-4 w-4 text-accent-purple" /> API Routes ({apiRoutes.length})</h3>
          <div className="space-y-1">
            {apiRoutes.map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-1 px-2 rounded hover:bg-bg-elevated text-[10px]">
                <span className={cn('font-mono font-bold px-1.5 py-0.5 rounded w-11 text-center',
                  r.method === 'GET' && 'bg-green-400/10 text-green-400',
                  r.method === 'POST' && 'bg-blue-400/10 text-blue-400',
                  r.method === 'PUT' && 'bg-yellow-400/10 text-yellow-400',
                  r.method === 'DELETE' && 'bg-red-400/10 text-red-400',
                )}>{r.method}</span>
                <span className="font-mono text-text-primary">{r.path}</span>
                <span className="text-text-muted flex-1 text-right truncate hidden md:block">{r.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {features.length > 0 && (
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Features ({features.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {features.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-bg-elevated">
                <div className={cn('h-2 w-2 rounded-full mt-1.5', f.priority === 'mvp' ? 'bg-accent' : 'bg-text-muted')} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{f.name}</span>
                    <span className={cn('text-[8px] px-1.5 py-0.5 rounded-full', f.priority === 'mvp' ? 'bg-accent/10 text-accent' : 'bg-bg-card text-text-muted')}>{f.priority}</span>
                  </div>
                  {f.description && <p className="text-[10px] text-text-muted mt-0.5">{f.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
