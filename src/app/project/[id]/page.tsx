'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth-context'
import { ProjectHeader } from '@/components/project/ProjectHeader'
import { PipelineView } from '@/components/project/PipelineView'
import { BuildLog } from '@/components/project/BuildLog'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { GlowButton } from '@/components/ui/GlowButton'
import { Loader2, Lock, Rocket } from 'lucide-react'
import Link from 'next/link'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, plan, isAdmin, openLoginModal } = useUser()
  const [project, setProject] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'logs'>('overview')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [projRes, logsRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/logs`),
      ])
      if (projRes.ok) setProject(await projRes.json())
      if (logsRes.ok) setLogs(await logsRes.json())
      setLoading(false)
    }
    load()
  }, [id])

  // Realtime
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

  async function handleRetry() {
    await fetch(`/api/projects/${id}/retry`, { method: 'POST' })
  }

  async function handleDelete() {
    if (!confirm('Project verwijderen?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
  if (!project) return <div className="flex items-center justify-center min-h-screen text-text-muted">Project niet gevonden</div>

  const isFree = plan === 'free' && !isAdmin
  const isPreview = isFree && project.current_step <= 2 && project.status === 'pending'

  return (
    <div className="p-8">
      <ProjectHeader project={project} onRetry={handleRetry} onDelete={handleDelete} />

      {project.current_step > 0 && (
        <div className="mt-6 max-w-md">
          <ProgressBar current={project.current_step} total={11} />
        </div>
      )}

      {/* Live banner */}
      {project.status === 'live' && (
        <div className="mt-6 bg-accent-green/5 border border-accent-green/20 rounded-xl p-5 text-center">
          <span className="text-3xl">🎉</span>
          <p className="text-accent-green font-semibold text-lg mt-2">Je SaaS is live!</p>
          {project.vercel_url && (
            <a href={project.vercel_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-lg bg-accent-green/10 text-accent-green font-medium text-sm hover:bg-accent-green/20 transition-all">
              Open Site →
            </a>
          )}
        </div>
      )}

      {/* Free tier upgrade prompt after step 2 */}
      {isPreview && (
        <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-accent/10 border border-accent/20 rounded-xl p-6 text-center">
          <Lock className="h-8 w-8 text-accent mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Your SaaS is ready to deploy!</h3>
          <p className="text-sm text-text-secondary mb-4">
            Upgrade to Starter to generate code, set up the database, and deploy to Vercel.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/pricing">
              <GlowButton variant="accent">
                <Rocket className="h-4 w-4" /> Deploy this SaaS — $19/mo
              </GlowButton>
            </Link>
          </div>
        </div>
      )}

      {/* Failed banner */}
      {project.status === 'failed' && (
        <div className="mt-6 bg-accent-pink/5 border border-accent-pink/20 rounded-xl p-4">
          <p className="text-accent-pink font-semibold">Pipeline gefaald</p>
          <p className="text-sm text-accent-pink/70 mt-1">Gestopt bij stap {project.current_step}.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Pipeline */}
        <div className="lg:col-span-1 bg-bg-card border border-border-default rounded-xl p-4">
          <PipelineView currentStep={project.current_step} status={project.status} logs={logs}
            onRetry={() => handleRetry()} isFree={isFree} />
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <div className="flex gap-1 mb-4 bg-bg-secondary rounded-lg p-1 w-fit">
            {(['overview', 'logs'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  tab === t ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}>{t}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-4">
              {/* Links */}
              <div className="grid grid-cols-2 gap-4">
                {project.vercel_url && <InfoCard label="Live URL" value={project.vercel_url} link />}
                {project.github_url && <InfoCard label="GitHub" value={project.github_url} link />}
                {project.supabase_url && <InfoCard label="Database" value={project.supabase_url} link />}
                {project.domain && <InfoCard label="Domain" value={project.domain} />}
              </div>

              {/* Features */}
              {project.features && (
                <div className="bg-bg-card border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Features</h3>
                  <div className="space-y-2">
                    {(Array.isArray(project.features) ? project.features : project.features?.features || []).map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-text-primary">{f.name || f}</span>
                        {f.priority && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            f.priority === 'mvp' ? 'bg-accent/10 text-accent' : 'bg-bg-elevated text-text-muted'
                          }`}>{f.priority}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Architecture preview */}
              {project.architecture && (
                <div className="bg-bg-card border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Architecture</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-accent">{project.architecture.database?.tables?.length || 0}</div>
                      <div className="text-[10px] text-text-muted">Tables</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">{project.architecture.fileStructure?.length || 0}</div>
                      <div className="text-[10px] text-text-muted">Files</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">{project.architecture.apiRoutes?.length || 0}</div>
                      <div className="text-[10px] text-text-muted">API Routes</div>
                    </div>
                  </div>
                </div>
              )}

              {project.description && (
                <div className="bg-bg-card border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-text-secondary">{project.description}</p>
                </div>
              )}

              {/* Cost display */}
              {project.total_tokens > 0 && (
                <div className="bg-bg-card border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2">Build Cost</h3>
                  <div className="flex gap-6 text-sm text-text-secondary">
                    <span>{project.total_tokens.toLocaleString()} tokens</span>
                    <span>{project.total_api_calls} API calls</span>
                    <span>~{project.current_step} credits used</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'logs' && <BuildLog logs={logs} />}
        </div>
      </div>
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
