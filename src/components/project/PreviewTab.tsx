'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Database, Globe, Table, Columns3, ArrowRight,
  Layout, LogIn, Settings, Home, Shield, Users, CreditCard,
  FileText, BarChart3, Upload, BookOpen, Zap, Star,
} from 'lucide-react'

interface PreviewTabProps {
  project: any
}

// ===== BROWSER MOCKUP COMPONENT =====
function BrowserMockup({ url, title, children }: { url: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-default overflow-hidden bg-bg-primary">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-bg-elevated border-b border-border-default">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="px-4 py-1 rounded-md bg-bg-primary border border-border-default text-[10px] text-text-muted font-mono max-w-xs truncate">
            {url}
          </div>
        </div>
      </div>
      {/* Page title */}
      <div className="px-3 py-1.5 border-b border-border-default">
        <span className="text-[10px] font-medium text-text-muted">{title}</span>
      </div>
      {/* Content */}
      <div className="p-4 min-h-[200px]">
        {children}
      </div>
    </motion.div>
  )
}

// ===== LANDING PAGE MOCKUP =====
function LandingMockup({ project }: { project: any }) {
  const features = getFeatures(project)
  const productName = project.product_name || 'MyApp'
  const tagline = project.tagline || 'The best tool for your needs'
  const pricing = project.pricing

  return (
    <BrowserMockup url={`${productName.toLowerCase().replace(/\s+/g, '')}.vercel.app`} title="Landing Page">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-accent/20" />
          <span className="text-xs font-bold text-text-primary">{productName}</span>
        </div>
        <div className="flex gap-2">
          <div className="px-2.5 py-1 rounded text-[9px] text-text-muted">Log in</div>
          <div className="px-2.5 py-1 rounded bg-accent/20 text-[9px] text-accent">Sign up</div>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center mb-5">
        <h3 className="text-sm font-bold text-text-primary mb-1">{tagline}</h3>
        <p className="text-[10px] text-text-muted max-w-[250px] mx-auto">{project.description?.slice(0, 100) || 'Start using the tool today'}</p>
        <div className="flex gap-2 justify-center mt-3">
          <div className="px-3 py-1.5 rounded-md bg-accent/20 text-[9px] text-accent font-medium">Get started free</div>
          <div className="px-3 py-1.5 rounded-md border border-border-default text-[9px] text-text-muted">Learn more</div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-2">
        {features.slice(0, 4).map((f: any, i: number) => (
          <div key={i} className="p-2 rounded-lg bg-bg-elevated border border-border-default">
            <div className="h-3 w-3 rounded bg-accent/10 mb-1.5" />
            <p className="text-[9px] font-medium text-text-primary leading-tight">{f.name}</p>
          </div>
        ))}
      </div>

      {/* Pricing hint */}
      {pricing?.suggestedPrice && (
        <div className="mt-4 text-center">
          <p className="text-[9px] text-text-muted">Starting at <span className="text-accent font-medium">{pricing.suggestedPrice}</span></p>
        </div>
      )}
    </BrowserMockup>
  )
}

// ===== DASHBOARD MOCKUP =====
function DashboardMockup({ project }: { project: any }) {
  const features = getFeatures(project)
  const productName = project.product_name || 'MyApp'
  const tables = project.architecture?.database?.tables || []

  return (
    <BrowserMockup url={`${productName.toLowerCase().replace(/\s+/g, '')}.vercel.app/dashboard`} title="Customer Dashboard">
      <div className="flex gap-3">
        {/* Sidebar */}
        <div className="w-24 flex-shrink-0 space-y-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-accent/10">
            <Home className="h-2.5 w-2.5 text-accent" />
            <span className="text-[8px] text-accent font-medium">Dashboard</span>
          </div>
          {features.slice(0, 3).map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-bg-elevated">
              <div className="h-2.5 w-2.5 rounded bg-text-muted/20" />
              <span className="text-[8px] text-text-muted truncate">{f.name.split(' ')[0]}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-2 py-1">
            <Settings className="h-2.5 w-2.5 text-text-muted" />
            <span className="text-[8px] text-text-muted">Settings</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {['Total Items', 'Active', 'This Week'].map((label, i) => (
              <div key={i} className="p-2 rounded-lg bg-bg-elevated border border-border-default">
                <p className="text-[8px] text-text-muted">{label}</p>
                <p className="text-sm font-bold text-text-primary">{[42, 18, 7][i]}</p>
              </div>
            ))}
          </div>

          {/* Table hint */}
          <div className="rounded-lg border border-border-default overflow-hidden">
            <div className="flex items-center gap-4 px-3 py-1.5 bg-bg-elevated border-b border-border-default">
              {(tables[0]?.columns || []).slice(0, 4).map((col: any, i: number) => (
                <span key={i} className="text-[8px] text-text-muted font-medium flex-1">{col.name}</span>
              ))}
            </div>
            {[0, 1, 2].map(row => (
              <div key={row} className="flex items-center gap-4 px-3 py-2 border-b border-border-default last:border-0">
                {[0, 1, 2, 3].map(col => (
                  <div key={col} className="flex-1 h-2 bg-bg-elevated rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserMockup>
  )
}

// ===== ADMIN MOCKUP =====
function AdminMockup({ project }: { project: any }) {
  const productName = project.product_name || 'MyApp'

  return (
    <BrowserMockup url={`${productName.toLowerCase().replace(/\s+/g, '')}.vercel.app/admin`} title="Admin Panel">
      <div className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Users', val: '124', icon: Users },
            { label: 'Revenue', val: '$890', icon: CreditCard },
            { label: 'Active', val: '67', icon: Zap },
            { label: 'Rating', val: '4.8', icon: Star },
          ].map((s, i) => (
            <div key={i} className="p-2 rounded-lg bg-bg-elevated border border-border-default text-center">
              <s.icon className="h-3 w-3 mx-auto mb-1 text-accent" />
              <p className="text-xs font-bold text-text-primary">{s.val}</p>
              <p className="text-[7px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent users table */}
        <div className="rounded-lg border border-border-default">
          <div className="px-3 py-1.5 bg-bg-elevated border-b border-border-default">
            <span className="text-[9px] font-medium text-text-muted">Recent Users</span>
          </div>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-border-default last:border-0">
              <div className="h-4 w-4 rounded-full bg-accent/10" />
              <div className="flex-1 h-2 bg-bg-elevated rounded w-20" />
              <div className="h-2 bg-bg-elevated rounded w-16" />
              <span className="text-[8px] text-accent-green">Active</span>
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="rounded-lg border border-border-default p-3">
          <p className="text-[9px] text-text-muted mb-2">Revenue (last 30 days)</p>
          <div className="flex items-end gap-1 h-12">
            {[30, 45, 35, 60, 50, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-accent/20" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </BrowserMockup>
  )
}

// ===== HELPER =====
function getFeatures(project: any): any[] {
  if (Array.isArray(project.features)) return project.features
  return project.features?.features || []
}

// ===== MAIN COMPONENT =====
export function PreviewTab({ project }: PreviewTabProps) {
  const arch = project.architecture
  const features = getFeatures(project)
  const tables = arch?.database?.tables || []
  const apiRoutes = arch?.apiRoutes || []

  // Extract pages
  const pages = (arch?.fileStructure || [])
    .filter((f: any) => f.path.includes('page.tsx') && !f.path.includes('api/'))
    .map((f: any) => {
      const route = '/' + f.path.replace(/^(src\/)?app\//, '').replace(/\/page\.tsx$/, '').replace(/\[.*?\]/g, ':id')
      return { path: route === '/.' ? '/' : route, desc: f.description }
    })

  return (
    <div className="space-y-8">
      {/* ===== VISUAL MOCKUPS ===== */}
      <div>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Layout className="h-4 w-4 text-accent" /> App Preview
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LandingMockup project={project} />
          <DashboardMockup project={project} />
        </div>
        <div className="mt-4">
          <AdminMockup project={project} />
        </div>
      </div>

      {/* ===== SITEMAP ===== */}
      {pages.length > 0 && (
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-accent" /> Pages ({pages.length})
          </h3>
          {/* Flow */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {pages.slice(0, 8).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-md bg-bg-elevated border border-border-default text-text-secondary font-mono whitespace-nowrap">
                  {p.path}
                </span>
                {i < Math.min(pages.length, 8) - 1 && <ArrowRight className="h-3 w-3 text-text-muted flex-shrink-0" />}
              </div>
            ))}
            {pages.length > 8 && <span className="text-[10px] text-text-muted">+{pages.length - 8} more</span>}
          </div>
          {/* Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {pages.map((p: any, i: number) => (
              <div key={i} className="p-2.5 rounded-lg bg-bg-elevated border border-border-default">
                <p className="text-[10px] font-mono text-accent mb-0.5">{p.path}</p>
                <p className="text-[10px] text-text-muted line-clamp-2">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== DATABASE SCHEMA ===== */}
      {tables.length > 0 && (
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-accent-green" /> Database ({tables.length} tables)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tables.map((table: any, i: number) => (
              <div key={i} className="rounded-lg border border-border-default overflow-hidden">
                <div className="px-3 py-2 bg-accent-green/5 border-b border-border-default flex items-center gap-2">
                  <Table className="h-3 w-3 text-accent-green" />
                  <span className="text-xs font-mono font-semibold text-accent-green">{table.name}</span>
                  {table.columns && <span className="text-[9px] text-text-muted ml-auto">{table.columns.length} cols</span>}
                </div>
                <div className="p-2.5 space-y-0.5">
                  {(table.columns || []).slice(0, 6).map((col: any, j: number) => (
                    <div key={j} className="flex items-center justify-between text-[10px] py-0.5">
                      <span className="font-mono text-text-secondary">{col.name}</span>
                      <span className="text-text-muted font-mono">{col.type}</span>
                    </div>
                  ))}
                  {(table.columns || []).length > 6 && (
                    <p className="text-[9px] text-text-muted pt-1">+{table.columns.length - 6} more</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== API ROUTES ===== */}
      {apiRoutes.length > 0 && (
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Columns3 className="h-4 w-4 text-accent-purple" /> API Routes ({apiRoutes.length})
          </h3>
          <div className="space-y-1">
            {apiRoutes.map((route: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-bg-elevated transition-all">
                <span className={cn(
                  'text-[9px] font-mono font-bold px-2 py-0.5 rounded w-12 text-center',
                  route.method === 'GET' && 'bg-green-400/10 text-green-400',
                  route.method === 'POST' && 'bg-blue-400/10 text-blue-400',
                  route.method === 'PUT' && 'bg-yellow-400/10 text-yellow-400',
                  route.method === 'DELETE' && 'bg-red-400/10 text-red-400',
                  route.method === 'PATCH' && 'bg-purple-400/10 text-purple-400',
                )}>
                  {route.method}
                </span>
                <span className="text-xs font-mono text-text-primary">{route.path}</span>
                <span className="text-[10px] text-text-muted flex-1 text-right truncate hidden md:block">{route.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== FEATURES ===== */}
      {features.length > 0 && (
        <div className="bg-bg-card border border-border-default rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Features ({features.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {features.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-bg-elevated">
                <div className={cn('h-2 w-2 rounded-full mt-1.5 flex-shrink-0', f.priority === 'mvp' ? 'bg-accent' : 'bg-text-muted')} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary">{f.name}</span>
                    <span className={cn('text-[8px] px-1.5 py-0.5 rounded-full font-medium',
                      f.priority === 'mvp' ? 'bg-accent/10 text-accent' : 'bg-bg-card text-text-muted'
                    )}>{f.priority}</span>
                    {f.complexity && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-bg-card text-text-muted">{f.complexity}</span>}
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
