'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth-context'
import { PipelineView } from '@/components/project/PipelineView'
import { BuildLog } from '@/components/project/BuildLog'
import { PreviewTab } from '@/components/project/PreviewTab'
import { ChatBar } from '@/components/project/ChatBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { GlowButton } from '@/components/ui/GlowButton'
import { Loader2, Rocket, ExternalLink, Github, Play, Trash2, Lock, Settings, Link2, Gem } from 'lucide-react'
import { formatTokens } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { plan, isAdmin } = useUser()
  const [project, setProject] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'preview' | 'logs'>('overview')
  const [deploying, setDeploying] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  // Free = no paid plan, not admin
  const isFree = plan === 'free' && !isAdmin
  const isPaid = !isFree

  const loadProject = useCallback(async () => {
    const [projRes, logsRes] = await Promise.all([
      fetch(`/api/projects/${id}`), fetch(`/api/projects/${id}/logs`),
    ])
    if (projRes.ok) setProject(await projRes.json())
    if (logsRes.ok) setLogs(await logsRes.json())
    setLoading(false)
  }, [id])

  useEffect(() => { loadProject() }, [loadProject])

  useEffect(() => {
    const channel = supabase.channel(`project-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'factory_projects', filter: `id=eq.${id}` },
        (payload) => setProject(payload.new))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'build_logs', filter: `project_id=eq.${id}` },
        (payload) => setLogs(prev => [...prev, payload.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'build_logs', filter: `project_id=eq.${id}` },
        (payload) => setLogs(prev => prev.map(l => l.id === (payload.new as any).id ? payload.new : l)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, supabase])

  async function handleContinueBuild() {
    setDeploying(true)
    await fetch(`/api/projects/${id}/retry`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: true, startFromStep: (project.current_step || 0) + 1 }),
    })
  }

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
  if (!project) return <div className="flex items-center justify-center min-h-screen text-text-muted">Project niet gevonden</div>

  const isBuilding = !['live', 'failed', 'pending'].includes(project.status)
  const isLive = project.status === 'live'
  const isFailed = project.status === 'failed'
  const isPending = project.status === 'pending' && project.current_step >= 1
  const isPreviewState = isFree && project.current_step <= 2 && isPending
  const hasArchitecture = !!project.architecture
  const progress = Math.round((project.current_step / 11) * 100)

  return (
    <div className={isBuilding ? 'pb-8' : 'pb-28'}>
      {/* ===== HEADER ===== */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.product_name || project.name}</h1>
              <StatusBadge status={project.status} size="lg" />
            </div>
            {project.tagline && <p className="text-text-secondary mt-1">{project.tagline}</p>}
          </div>

          {/* Actions — only for non-building state */}
          {!isBuilding && (
            <div className="flex gap-2">
              {/* PAID ONLY: Open Site + GitHub buttons */}
              {isPaid && isLive && project.vercel_url && (
                <a href={project.vercel_url} target="_blank" rel="noopener noreferrer">
                  <GlowButton variant="green" size="sm"><ExternalLink className="h-3.5 w-3.5" /> Open Live Site</GlowButton>
                </a>
              )}
              {isPaid && isLive && project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  <GlowButton variant="ghost" size="sm"><Github className="h-3.5 w-3.5" /> GitHub</GlowButton>
                </a>
              )}

              {/* Admin: continue build */}
              {isAdmin && isPending && (
                <GlowButton variant="accent" size="sm" onClick={handleContinueBuild} loading={deploying}>
                  <Play className="h-3.5 w-3.5" /> Continue Build
                </GlowButton>
              )}
              {isFailed && isPaid && (
                <GlowButton variant="accent" size="sm" onClick={handleContinueBuild} loading={deploying}>
                  <Play className="h-3.5 w-3.5" /> Retry
                </GlowButton>
              )}

              {/* Delete — always available */}
              <GlowButton variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-3.5 w-3.5" />
              </GlowButton>
            </div>
          )}
        </div>

        {/* Metrics — PAID ONLY */}
        {isPaid && !isBuilding && project.total_tokens > 0 && (
          <div className="flex gap-6 mt-3 text-xs text-text-muted">
            <span>Tokens: <span className="text-text-primary font-mono">{formatTokens(project.total_tokens)}</span></span>
            <span>API calls: <span className="text-text-primary font-mono">{project.total_api_calls}</span></span>
          </div>
        )}
      </div>

      {/* ===== PROGRESS BAR ===== */}
      {project.current_step > 0 && (
        <div className="px-8 pb-4">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
            <span>Step {project.current_step}/11 — <span className="capitalize">{project.status}</span></span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-2.5 bg-bg-elevated rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-green"
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>
      )}

      {/* ===== BUILDING STATE ===== */}
      {isBuilding && (
        <div className="mx-8 mb-6 relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent-purple/10 to-accent-green/10 animate-pulse" />
          <div className="relative p-6 flex items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
            <div>
              <p className="text-base font-semibold">{project.product_name || 'Your SaaS'} is being built...</p>
              <p className="text-sm text-text-muted mt-0.5">Usually takes 5-10 minutes.</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== LIVE BANNER — PAID ONLY ===== */}
      {isPaid && isLive && (
        <div className="mx-8 mb-6 bg-accent-green/5 border border-accent-green/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="text-accent-green font-bold text-lg">Your SaaS is live!</p>
                {project.vercel_url && <p className="text-sm text-accent-green/70 font-mono">{project.vercel_url}</p>}
              </div>
            </div>
            {project.vercel_url && (
              <a href={project.vercel_url} target="_blank" rel="noopener noreferrer">
                <GlowButton variant="green"><ExternalLink className="h-4 w-4" /> Open Site</GlowButton>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ===== FREE TIER: UPGRADE BANNER ===== */}
      {isFree && isPending && hasArchitecture && (
        <div className="mx-8 mb-6 relative overflow-hidden rounded-2xl border border-accent/30">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-accent/10 to-green-500/10" />
          <div className="relative p-8 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 mb-4">
              <Rocket className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your SaaS preview is ready!</h3>
            <p className="text-sm text-text-secondary mb-2 max-w-md mx-auto">
              AI designed your product. Upgrade to deploy it on your own GitHub, Vercel, and Supabase.
            </p>
            <p className="text-xs text-text-muted mb-6">
              {(project.architecture?.database?.tables || []).length} tables &middot;{' '}
              {(project.architecture?.fileStructure || []).length} files &middot;{' '}
              {(project.architecture?.apiRoutes || []).length} API routes
            </p>
            <Link href="/pricing">
              <GlowButton variant="green" size="lg">
                <Rocket className="h-5 w-5" /> Deploy your SaaS — Upgrade to Starter
              </GlowButton>
            </Link>
            <p className="text-[10px] text-text-muted mt-3">You&apos;ll connect your own GitHub, Vercel &amp; Supabase after upgrading</p>
          </div>
        </div>
      )}

      {/* ===== FAILED ===== */}
      {isFailed && (
        <div className="mx-8 mb-6 bg-accent-pink/5 border border-accent-pink/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-accent-pink font-semibold text-sm">Pipeline failed at step {project.current_step}</p>
          {isPaid && <GlowButton variant="accent" size="sm" onClick={handleContinueBuild} loading={deploying}><Play className="h-3 w-3" /> Retry</GlowButton>}
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8">
        {/* Pipeline */}
        <div className="lg:col-span-1 bg-bg-card border border-border-default rounded-xl p-4">
          <PipelineView currentStep={project.current_step} status={project.status} logs={logs}
            onRetry={() => handleContinueBuild()} isFree={isFree} />
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          {/* Tabs — free users only see overview + preview (NO logs) */}
          <div className="flex gap-1 mb-4 bg-bg-secondary rounded-lg p-1 w-fit">
            {([
              'overview',
              ...(hasArchitecture ? ['preview'] : []),
              ...(isPaid && (isBuilding || isLive || isFailed) ? ['logs'] : []),
            ] as const).map(t => (
              <button key={t} onClick={() => setTab(t as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  tab === t ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}>{t}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-4">
              {/* Links — PAID ONLY */}
              {isPaid && (project.vercel_url || project.github_url) && (
                <div className="grid grid-cols-2 gap-4">
                  {project.vercel_url && <InfoCard label="Live URL" value={project.vercel_url} link />}
                  {project.github_url && <InfoCard label="GitHub" value={project.github_url} link />}
                </div>
              )}

              {/* Post-build config — PAID ONLY */}
              {isPaid && isLive && (
                <div className="bg-bg-card border border-border-default rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-accent" /> Configure your app
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: '💳', name: 'Stripe Payments', desc: 'Connect Stripe so customers can pay' },
                      { icon: '🔐', name: 'Google Auth', desc: 'OAuth for this app' },
                      { icon: '🌐', name: 'Custom Domain', desc: 'Your own .com' },
                      { icon: '📧', name: 'Email (Resend)', desc: 'Transactional emails' },
                    ].map((cfg) => (
                      <div key={cfg.name} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{cfg.icon}</span>
                          <div>
                            <p className="text-sm font-medium">{cfg.name}</p>
                            <p className="text-[10px] text-text-muted">{cfg.desc}</p>
                          </div>
                        </div>
                        <button className="text-xs text-accent hover:underline flex items-center gap-1">
                          <Link2 className="h-3 w-3" /> Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {project.features && (
                <div className="bg-bg-card border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Features</h3>
                  <div className="space-y-2">
                    {(Array.isArray(project.features) ? project.features : project.features?.features || []).map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{f.name || f}</span>
                        {f.priority && <span className={`text-[10px] px-2 py-0.5 rounded-full ${f.priority === 'mvp' ? 'bg-accent/10 text-accent' : 'bg-bg-elevated text-text-muted'}`}>{f.priority}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Architecture stats */}
              {project.architecture && (
                <div className="bg-bg-card border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Architecture</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div><div className="text-2xl font-bold text-accent">{project.architecture.database?.tables?.length || 0}</div><div className="text-[10px] text-text-muted">Tables</div></div>
                    <div><div className="text-2xl font-bold text-accent">{project.architecture.fileStructure?.length || 0}</div><div className="text-[10px] text-text-muted">Files</div></div>
                    <div><div className="text-2xl font-bold text-accent">{project.architecture.apiRoutes?.length || 0}</div><div className="text-[10px] text-text-muted">Routes</div></div>
                  </div>
                </div>
              )}

              {project.description && (
                <div className="bg-bg-card border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-text-secondary">{project.description}</p>
                </div>
              )}

              {/* FREE USER: Upgrade nudge at bottom of overview */}
              {isFree && hasArchitecture && (
                <div className="bg-bg-card border border-border-default rounded-xl p-5 text-center">
                  <Gem className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="text-sm font-semibold mb-1">Want to see this app live?</p>
                  <p className="text-xs text-text-muted mb-3">Upgrade to deploy on your own infrastructure.</p>
                  <Link href="/pricing">
                    <GlowButton variant="accent" size="sm"><Rocket className="h-3.5 w-3.5" /> View Plans</GlowButton>
                  </Link>
                </div>
              )}
            </div>
          )}

          {tab === 'preview' && <PreviewTab project={project} />}
          {tab === 'logs' && isPaid && <BuildLog logs={logs} />}
        </div>
      </div>

      {/* Chat bar — show for free (preview refinement) and paid (post-build changes) but NOT during build */}
      {!isBuilding && (
        <ChatBar projectId={id} messages={project.messages || []} onUpdate={loadProject} />
      )}

      {/* Delete modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete project?</h3>
            <p className="text-sm text-text-secondary mb-4">{project.product_name || project.name} will be permanently deleted.</p>
            <div className="flex gap-2 justify-end">
              <GlowButton variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</GlowButton>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50 flex items-center gap-2">
                {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value, link }: { label: string; value: string; link?: boolean }) {
  const inner = (
    <div className="bg-bg-card border border-border-default rounded-xl p-3 hover:border-border-bright transition-all">
      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xs text-text-primary font-mono truncate">{value}</p>
    </div>
  )
  return link ? <a href={value} target="_blank" rel="noopener noreferrer">{inner}</a> : inner
}
