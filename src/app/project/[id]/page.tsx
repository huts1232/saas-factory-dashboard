'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProjectHeader } from '@/components/project/ProjectHeader'
import { PipelineView } from '@/components/project/PipelineView'
import { BuildLog } from '@/components/project/BuildLog'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Loader2 } from 'lucide-react'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'logs'>('overview')

  const supabase = createClient()

  // Fetch initial data
  useEffect(() => {
    async function load() {
      const [projRes, logsRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/logs`),
      ])
      if (projRes.ok) {
        setProject(await projRes.json())
      }
      if (logsRes.ok) {
        setLogs(await logsRes.json())
      }
      setLoading(false)
    }
    load()
  }, [id])

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`project-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'factory_projects',
        filter: `id=eq.${id}`,
      }, (payload) => {
        setProject(payload.new)
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'build_logs',
        filter: `project_id=eq.${id}`,
      }, (payload) => {
        setLogs((prev) => [...prev, payload.new])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'build_logs',
        filter: `project_id=eq.${id}`,
      }, (payload) => {
        setLogs((prev) => prev.map((l) => l.id === (payload.new as any).id ? payload.new : l))
      })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen text-text-muted">
        Project niet gevonden
      </div>
    )
  }

  const isBuilding = !['live', 'failed', 'pending'].includes(project.status)

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
        <div className="mt-6 bg-accent-green/5 border border-accent-green/20 rounded-xl p-4 text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-accent-green font-semibold mt-1">Je SaaS is live!</p>
          {project.vercel_url && (
            <a href={project.vercel_url} target="_blank" className="text-sm text-accent-green/70 hover:text-accent-green underline">
              {project.vercel_url}
            </a>
          )}
        </div>
      )}

      {/* Failed banner */}
      {project.status === 'failed' && (
        <div className="mt-6 bg-accent-pink/5 border border-accent-pink/20 rounded-xl p-4">
          <p className="text-accent-pink font-semibold">Pipeline gefaald</p>
          <p className="text-sm text-accent-pink/70 mt-1">
            Gestopt bij stap {project.current_step}. Klik op Retry om door te gaan.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Pipeline view */}
        <div className="lg:col-span-1 bg-bg-card border border-border-default rounded-xl p-4">
          <PipelineView
            currentStep={project.current_step}
            status={project.status}
            logs={logs}
            onRetry={() => handleRetry()}
          />
        </div>

        {/* Details / Logs */}
        <div className="lg:col-span-2">
          <div className="flex gap-1 mb-4 bg-bg-secondary rounded-lg p-1 w-fit">
            <button
              onClick={() => setTab('overview')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'overview' ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab('logs')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'logs' ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Build Logs
            </button>
          </div>

          {tab === 'overview' && (
            <div className="space-y-4">
              {/* Info cards */}
              <div className="grid grid-cols-2 gap-4">
                {project.github_url && (
                  <InfoCard label="GitHub" value={project.github_url} link />
                )}
                {project.vercel_url && (
                  <InfoCard label="Vercel" value={project.vercel_url} link />
                )}
                {project.supabase_url && (
                  <InfoCard label="Database" value={project.supabase_url} link />
                )}
                {project.domain && (
                  <InfoCard label="Domain" value={project.domain} />
                )}
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
                          }`}>
                            {f.priority}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {project.description && (
                <div className="bg-bg-card border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2">Beschrijving</h3>
                  <p className="text-sm text-text-secondary">{project.description}</p>
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
  const content = (
    <div className="bg-bg-card border border-border-default rounded-xl p-3">
      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xs text-text-primary font-mono truncate">{value}</p>
    </div>
  )
  if (link) {
    return <a href={value} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80">{content}</a>
  }
  return content
}
