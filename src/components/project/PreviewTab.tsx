'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  FileText, Database, Globe, ArrowRight, Layout, LogIn,
  Settings, Home, Shield, Table, Columns3,
} from 'lucide-react'

interface PreviewTabProps {
  project: any
}

const PAGE_ICONS: Record<string, React.ElementType> = {
  'page': Home,
  'layout': Layout,
  'login': LogIn,
  'dashboard': Layout,
  'settings': Settings,
  'admin': Shield,
}

function getPageIcon(path: string): React.ElementType {
  const lower = path.toLowerCase()
  for (const [key, icon] of Object.entries(PAGE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return FileText
}

export function PreviewTab({ project }: PreviewTabProps) {
  const arch = project.architecture
  const features = Array.isArray(project.features)
    ? project.features
    : project.features?.features || []

  // Extract pages from file structure
  const pages = (arch?.fileStructure || [])
    .filter((f: any) => f.path.startsWith('src/app/') && f.path.endsWith('page.tsx'))
    .map((f: any) => {
      const route = f.path
        .replace('src/app/', '/')
        .replace('/page.tsx', '')
        .replace(/\/\[.*?\]/g, '/:id') || '/'
      return { path: route || '/', desc: f.description, fullPath: f.path }
    })

  const tables = arch?.database?.tables || []
  const apiRoutes = arch?.apiRoutes || []
  const components = arch?.components || []

  return (
    <div className="space-y-6">
      {/* Sitemap */}
      <div className="bg-bg-card border border-border-default rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent" /> Pages & Routes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pages.length > 0 ? pages.map((page: any, i: number) => {
            const Icon = getPageIcon(page.path)
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-bg-elevated border border-border-default">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-mono text-text-primary">{page.path}</p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{page.desc}</p>
                </div>
              </motion.div>
            )
          }) : (
            <p className="text-sm text-text-muted col-span-2">No pages in architecture yet</p>
          )}
        </div>

        {/* Flow diagram */}
        {pages.length > 1 && (
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {pages.slice(0, 6).map((page: any, i: number) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] px-2 py-1 rounded bg-bg-elevated text-text-secondary whitespace-nowrap">
                  {page.path}
                </span>
                {i < Math.min(pages.length, 6) - 1 && <ArrowRight className="h-3 w-3 text-text-muted" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Schema */}
      <div className="bg-bg-card border border-border-default rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-accent-green" /> Database Schema
        </h3>
        {tables.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tables.map((table: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border-default overflow-hidden">
                <div className="px-3 py-2 bg-accent-green/5 border-b border-border-default flex items-center gap-2">
                  <Table className="h-3.5 w-3.5 text-accent-green" />
                  <span className="text-sm font-mono font-semibold text-accent-green">{table.name}</span>
                </div>
                <div className="p-3 space-y-1">
                  {table.description && (
                    <p className="text-[10px] text-text-muted mb-2">{table.description}</p>
                  )}
                  {(table.columns || []).slice(0, 8).map((col: any, j: number) => (
                    <div key={j} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-text-secondary">{col.name}</span>
                      <span className="text-text-muted font-mono text-[10px]">{col.type}</span>
                    </div>
                  ))}
                  {(table.columns || []).length > 8 && (
                    <p className="text-[10px] text-text-muted">+{table.columns.length - 8} more columns</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No tables in architecture yet</p>
        )}
      </div>

      {/* API Routes */}
      <div className="bg-bg-card border border-border-default rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Columns3 className="h-4 w-4 text-accent-purple" /> API Routes
        </h3>
        {apiRoutes.length > 0 ? (
          <div className="space-y-1.5">
            {apiRoutes.map((route: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-bg-elevated transition-all">
                <span className={cn(
                  'text-[10px] font-mono font-bold px-2 py-0.5 rounded w-14 text-center',
                  route.method === 'GET' && 'bg-green-400/10 text-green-400',
                  route.method === 'POST' && 'bg-blue-400/10 text-blue-400',
                  route.method === 'PUT' && 'bg-yellow-400/10 text-yellow-400',
                  route.method === 'DELETE' && 'bg-red-400/10 text-red-400',
                  route.method === 'PATCH' && 'bg-purple-400/10 text-purple-400',
                )}>
                  {route.method}
                </span>
                <span className="text-sm font-mono text-text-primary">{route.path}</span>
                <span className="text-xs text-text-muted flex-1 text-right truncate">{route.description}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No API routes in architecture yet</p>
        )}
      </div>

      {/* Features */}
      <div className="bg-bg-card border border-border-default rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((f: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-bg-elevated">
              <div className={cn(
                'h-2 w-2 rounded-full mt-1.5 flex-shrink-0',
                f.priority === 'mvp' ? 'bg-accent' : 'bg-text-muted'
              )} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{f.name}</span>
                  <span className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                    f.priority === 'mvp' ? 'bg-accent/10 text-accent' : 'bg-bg-card text-text-muted'
                  )}>{f.priority}</span>
                  {f.complexity && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bg-card text-text-muted">{f.complexity}</span>
                  )}
                </div>
                {f.description && <p className="text-xs text-text-muted mt-0.5">{f.description}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
