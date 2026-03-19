'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Rocket, Clock, Database, FileText, Globe } from 'lucide-react'
import { useUser } from '@/lib/auth-context'

interface ExampleProject {
  name: string
  tagline: string
  time: string
  price: string
  features: string[]
  url?: string
  tables?: number
  files?: number
  routes?: number
  idea: string
}

const TABS = ['Landing Page', 'Dashboard', 'Admin'] as const

export function ProjectPreviewModal({
  project,
  open,
  onClose,
}: {
  project: ExampleProject | null
  open: boolean
  onClose: () => void
}) {
  const [tab, setTab] = useState<typeof TABS[number]>('Landing Page')
  const { openLoginModal } = useUser()

  if (!project) return null

  const hasLiveUrl = !!project.url
  const iframeUrl = hasLiveUrl ? (
    tab === 'Landing Page' ? project.url :
    tab === 'Dashboard' ? `${project.url}/dashboard` :
    `${project.url}/admin`
  ) : undefined

  function handleBuild() {
    onClose()
    openLoginModal(project!.idea)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-4xl max-h-[90vh] bg-bg-secondary border border-border-default rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">{project.name}</span>
                <span className="text-xs text-text-muted bg-bg-elevated px-2 py-0.5 rounded-full">{project.tagline}</span>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-2 flex-shrink-0">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    tab === t ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated'
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="rounded-xl border border-border-default overflow-hidden shadow-2xl shadow-black/30">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-bg-elevated border-b border-border-default">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400/60" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                    <div className="h-3 w-3 rounded-full bg-green-400/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-bg-primary border border-border-default text-xs text-text-muted font-mono">
                      {project.url || `${project.name.toLowerCase()}.vercel.app`}
                      {tab === 'Dashboard' ? '/dashboard' : tab === 'Admin' ? '/admin' : ''}
                    </div>
                  </div>
                </div>

                {/* Content */}
                {hasLiveUrl ? (
                  <iframe
                    src={iframeUrl}
                    className="w-full h-[400px] bg-white"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <MockupContent tab={tab} project={project} />
                )}
              </div>
            </div>

            {/* Footer stats + actions */}
            <div className="px-6 py-4 border-t border-border-default flex-shrink-0">
              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-4">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Built in {project.time}</span>
                {project.tables && <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {project.tables} tables</span>}
                {project.files && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {project.files} files</span>}
                {project.routes && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {project.routes} routes</span>}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.features.map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted">{f}</span>
                ))}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green font-medium">
                  Users pay {project.price}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleBuild}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90 transition-all">
                  <Rocket className="h-4 w-4" /> Build something like this
                </button>
                {hasLiveUrl && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border-default text-text-secondary font-medium text-sm hover:bg-bg-elevated transition-all">
                    Visit live site <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Fallback mockup when no live URL
function MockupContent({ tab, project }: { tab: string; project: ExampleProject }) {
  if (tab === 'Landing Page') {
    return (
      <div className="p-6 bg-white min-h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <span className="font-bold text-gray-900">{project.name}</span>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 text-xs text-gray-500">Log in</div>
            <div className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md">Sign up</div>
          </div>
        </div>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.tagline}</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Start today with a free account. Upgrade to Pro for {project.price}.</p>
          <div className="flex gap-3 justify-center">
            <div className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg">Get Started</div>
            <div className="px-5 py-2 border text-sm rounded-lg text-gray-600">Learn More</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6">
          {project.features.map((f, i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-50 border">
              <p className="text-xs font-medium text-gray-900">{f}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (tab === 'Dashboard') {
    return (
      <div className="p-6 bg-gray-50 min-h-[400px]">
        <div className="flex gap-3 mb-6">
          {['Total', 'Active', 'Revenue'].map((s, i) => (
            <div key={i} className="flex-1 bg-white rounded-lg border p-4">
              <p className="text-xs text-gray-500">{s}</p>
              <p className="text-xl font-bold text-gray-900">{[42, 18, `$${parseInt(project.price.replace('$',''))*18}`][i]}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm font-medium text-gray-900 mb-3">Recent Activity</p>
          {[0,1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
              <div className="h-8 w-8 rounded-full bg-blue-50" />
              <div className="flex-1"><div className="h-2 bg-gray-100 rounded w-32" /></div>
              <div className="h-2 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  // Admin
  return (
    <div className="p-6 bg-gray-50 min-h-[400px]">
      <div className="grid grid-cols-4 gap-3 mb-6">
        {['Users', 'Revenue', 'Active', 'MRR'].map((s, i) => (
          <div key={i} className="bg-white rounded-lg border p-3 text-center">
            <p className="text-xs text-gray-500">{s}</p>
            <p className="text-lg font-bold text-gray-900">{['124', '$890', '67', '$890'][i]}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border p-4">
        <p className="text-sm font-medium text-gray-900 mb-3">Users</p>
        {[0,1,2].map(i => (
          <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
            <div className="h-6 w-6 rounded-full bg-blue-50" />
            <div className="flex-1"><div className="h-2 bg-gray-100 rounded w-24" /></div>
            <span className="text-[10px] text-green-600">Active</span>
          </div>
        ))}
      </div>
    </div>
  )
}
