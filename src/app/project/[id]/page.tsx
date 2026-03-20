'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/auth-context'
import { PipelineView } from '@/components/project/PipelineView'
import { BuildLog } from '@/components/project/BuildLog'
import { PreviewTab } from '@/components/project/PreviewTab'
import { ChatBar } from '@/components/project/ChatBar'
import { ConnectModal } from '@/components/project/ConnectModal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { GlowButton } from '@/components/ui/GlowButton'
import { Loader2, Rocket, ExternalLink, Github, Play, Trash2, Gem, Settings, Link2, CheckCircle2, Circle, DollarSign, Users, Target, Code, Database, Globe, Zap } from 'lucide-react'
import { formatTokens } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

const APP_SERVICES = [
  { icon: '💳', name: 'Stripe', desc: 'Accept payments from your customers', placeholder: 'sk_live_...', helpUrl: 'https://dashboard.stripe.com/apikeys', helpText: 'Go to Stripe Dashboard → Developers → API Keys. Copy your Secret Key.' },
  { icon: '🔐', name: 'Google Auth', desc: 'Let users sign in with Google', placeholder: 'Client ID...', helpUrl: 'https://console.cloud.google.com/apis/credentials', helpText: 'Create an OAuth 2.0 Client ID in Google Cloud Console. Set the redirect URI to your app URL + /api/auth/callback.' },
  { icon: '🌐', name: 'Custom Domain', desc: 'Use your own .com domain', placeholder: 'myapp.com', helpUrl: 'https://vercel.com/docs/projects/domains', helpText: 'Add your domain in Vercel project settings. Then update your DNS records to point to Vercel.' },
  { icon: '📧', name: 'Resend', desc: 'Send transactional emails', placeholder: 're_...', helpUrl: 'https://resend.com/api-keys', helpText: 'Sign up at Resend.com and create an API key. Verify your sending domain.' },
]

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
  const [connectService, setConnectService] = useState<typeof APP_SERVICES[number] | null>(null)
  const [connectedServices, setConnectedServices] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const isFree = plan === 'free' && !isAdmin
  const isPaid = !isFree

  const loadProject = useCallback(async () => {
    const [projRes, logsRes] = await Promise.all([fetch(`/api/projects/${id}`), fetch(`/api/projects/${id}/logs`)])
    if (projRes.ok) setProject(await projRes.json())
    if (logsRes.ok) setLogs(await logsRes.json())
    setLoading(false)
  }, [id])

  useEffect(() => { loadProject() }, [loadProject])

  // Auto-switch to preview tab for free users with completed builds
  useEffect(() => {
    if (project && isFree && (project.status === 'preview' || project.current_step >= 2) && project.features) {
      setTab('preview')
    }
  }, [project?.status, project?.current_step, isFree])

  useEffect(() => {
    const channel = supabase.channel(`project-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'factory_projects', filter: `id=eq.${id}` }, (payload) => setProject(payload.new))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'build_logs', filter: `project_id=eq.${id}` }, (payload) => setLogs(prev => [...prev, payload.new]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'build_logs', filter: `project_id=eq.${id}` }, (payload) => setLogs(prev => prev.map(l => l.id === (payload.new as any).id ? payload.new : l)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, supabase])

  async function handleContinueBuild() {
    setDeploying(true)
    await fetch(`/api/projects/${id}/retry`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAdmin: true, startFromStep: (project.current_step || 0) + 1 }) })
  }

  async function handleDelete() { setDeleting(true); await fetch(`/api/projects/${id}`, { method: 'DELETE' }); router.push('/dashboard') }

  async function handleConnectSave(service: string, key: string): Promise<boolean> {
    // Save to user_connectors (per-app config would need a separate table in production)
    try {
      await fetch('/api/connectors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service, apiKey: key }) })
      setConnectedServices(prev => new Set(prev).add(service))
      return true
    } catch { return false }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
  if (!project) return <div className="flex items-center justify-center min-h-screen text-text-muted">Project niet gevonden</div>

  const isBuilding = !['live', 'failed', 'pending', 'preview'].includes(project.status)
  const isLive = project.status === 'live'
  const isPreviewDone = project.status === 'preview'
  const isFailed = project.status === 'failed'
  const isPending = project.status === 'pending' && project.current_step >= 1
  const hasArchitecture = !!project.architecture
  const progress = Math.round((project.current_step / 11) * 100)
  const features = Array.isArray(project.features) ? project.features : project.features?.features || []
  const arch = project.architecture || {}
  const pricing = project.pricing || project.features?.monetization || {}
  const suggestedPrice = pricing.suggestedPrice || '$9/mo'
  const priceNum = parseInt(suggestedPrice.replace(/[^0-9]/g, '')) || 9

  return (
    <div className={isBuilding ? 'pb-8' : 'pb-28'}>
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.product_name || project.name}</h1>
              <StatusBadge status={project.status} size="lg" />
            </div>
            {project.tagline && <p className="text-text-secondary mt-1">{project.tagline}</p>}
          </div>
          {!isBuilding && (
            <div className="flex gap-2">
              {isPaid && isLive && project.vercel_url && <a href={project.vercel_url} target="_blank" rel="noopener noreferrer"><GlowButton variant="green" size="sm"><ExternalLink className="h-3.5 w-3.5" /> Open Site</GlowButton></a>}
              {isPaid && isLive && project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer"><GlowButton variant="ghost" size="sm"><Github className="h-3.5 w-3.5" /> GitHub</GlowButton></a>}
              {isAdmin && isPending && <GlowButton variant="accent" size="sm" onClick={handleContinueBuild} loading={deploying}><Play className="h-3.5 w-3.5" /> Continue Build</GlowButton>}
              {isFailed && isPaid && <GlowButton variant="accent" size="sm" onClick={handleContinueBuild} loading={deploying}><Play className="h-3.5 w-3.5" /> Retry</GlowButton>}
              <GlowButton variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}><Trash2 className="h-3.5 w-3.5" /></GlowButton>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      {project.current_step > 0 && (
        <div className="px-8 pb-4">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
            <span>Step {project.current_step}/11 — <span className="capitalize">{project.status}</span></span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-2.5 bg-bg-elevated rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-green" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>
      )}

      {/* Banners */}
      {isBuilding && (
        <div className="mx-8 mb-6 relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent-purple/10 to-accent-green/10 animate-pulse" />
          <div className="relative p-6 flex items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
            <div><p className="text-base font-semibold">{project.product_name || 'Your SaaS'} is being built...</p><p className="text-sm text-text-muted mt-0.5">Usually takes 5-10 minutes.</p></div>
          </div>
        </div>
      )}
      {isPaid && isLive && (
        <div className="mx-8 mb-6 bg-accent-green/5 border border-accent-green/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4"><span className="text-3xl">🎉</span><div><p className="text-accent-green font-bold text-lg">Your SaaS is live!</p>{project.vercel_url && <p className="text-sm text-accent-green/70 font-mono">{project.vercel_url}</p>}</div></div>
            {project.vercel_url && <a href={project.vercel_url} target="_blank" rel="noopener noreferrer"><GlowButton variant="green"><ExternalLink className="h-4 w-4" /> Open Site</GlowButton></a>}
          </div>
        </div>
      )}
      {isPreviewDone && (
        <div className="mx-8 mb-6 relative overflow-hidden rounded-2xl border border-amber-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-accent/5 to-green-500/5" />
          <div className="relative p-8 text-center">
            <span className="text-3xl">🎨</span>
            <h3 className="text-xl font-bold mt-3 mb-2">Your SaaS preview is ready!</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">Deploy it to your own accounts to go live and start earning.</p>
            <Link href="/pricing"><GlowButton variant="green" size="lg"><Rocket className="h-5 w-5" /> Deploy to my accounts — $19/mo</GlowButton></Link>
          </div>
        </div>
      )}
      {isFailed && (
        <div className="mx-8 mb-6 bg-accent-pink/5 border border-accent-pink/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-accent-pink font-semibold text-sm">Pipeline failed at step {project.current_step}</p>
          {isPaid && <GlowButton variant="accent" size="sm" onClick={handleContinueBuild} loading={deploying}><Play className="h-3 w-3" /> Retry</GlowButton>}
        </div>
      )}

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8">
        <div className="lg:col-span-1 bg-bg-card border border-border-default rounded-xl p-4">
          <PipelineView currentStep={project.current_step} status={project.status} logs={logs} onRetry={() => handleContinueBuild()} isFree={isFree} />
        </div>

        <div className="lg:col-span-2">
          <div className="flex gap-1 mb-4 bg-bg-secondary rounded-lg p-1 w-fit">
            {(['overview', 'preview', ...(isPaid && (isBuilding || isLive || isFailed) ? ['logs'] : [])] as const).map(t => (
              <button key={t} onClick={() => setTab(t as any)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${tab === t ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>{t}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-4">
              {/* A) At a glance */}
              <div className="bg-bg-card border border-border-default rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-accent" /> Your SaaS at a glance</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-[10px] text-text-muted uppercase tracking-wider">Product</p><p className="font-medium">{project.product_name || project.name}</p></div>
                  <div><p className="text-[10px] text-text-muted uppercase tracking-wider">Target User</p><p className="text-text-secondary">{project.target_user || 'General audience'}</p></div>
                  <div className="col-span-2"><p className="text-[10px] text-text-muted uppercase tracking-wider">Description</p><p className="text-text-secondary">{project.description || project.idea}</p></div>
                  <div><p className="text-[10px] text-text-muted uppercase tracking-wider">Pricing</p><p className="font-medium text-accent-green">{suggestedPrice}</p></div>
                  <div><p className="text-[10px] text-text-muted uppercase tracking-wider">Model</p><p className="text-text-secondary capitalize">{pricing.model || 'freemium'}</p></div>
                </div>
              </div>

              {/* Links (paid only) */}
              {isPaid && (project.vercel_url || project.github_url) && (
                <div className="grid grid-cols-2 gap-4">
                  {project.vercel_url && <InfoCard label="Live URL" value={project.vercel_url} link />}
                  {project.github_url && <InfoCard label="GitHub" value={project.github_url} link />}
                </div>
              )}

              {/* B) Features */}
              {features.length > 0 && (
                <div className="bg-bg-card border border-border-default rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-accent-purple" /> Features ({features.length})</h3>
                  <div className="space-y-3">
                    {features.map((f: any, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-bg-elevated flex items-center justify-center text-sm flex-shrink-0">
                          {['⚡', '📊', '🔒', '🚀', '💡'][i % 5]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{f.name || f}</span>
                            {f.priority && <span className={`text-[9px] px-2 py-0.5 rounded-full ${f.priority === 'mvp' ? 'bg-accent/10 text-accent' : 'bg-bg-elevated text-text-muted'}`}>{f.priority === 'mvp' ? 'MVP' : 'Nice to have'}</span>}
                            <CheckCircle2 className="h-3.5 w-3.5 text-accent-green ml-auto flex-shrink-0" />
                          </div>
                          {f.description && <p className="text-xs text-text-muted mt-0.5">{f.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* C) Architecture */}
              {hasArchitecture && (
                <div className="bg-bg-card border border-border-default rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Code className="h-4 w-4 text-accent" /> Architecture</h3>
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div className="bg-bg-elevated rounded-xl p-3"><div className="text-xl font-bold text-accent">{(arch.database?.tables || []).length}</div><div className="text-[10px] text-text-muted">Tables</div></div>
                    <div className="bg-bg-elevated rounded-xl p-3"><div className="text-xl font-bold text-accent">{(arch.fileStructure || []).length}</div><div className="text-[10px] text-text-muted">Files</div></div>
                    <div className="bg-bg-elevated rounded-xl p-3"><div className="text-xl font-bold text-accent">{(arch.apiRoutes || []).length}</div><div className="text-[10px] text-text-muted">API Routes</div></div>
                  </div>
                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel'].map(t => (
                      <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-bg-elevated text-text-secondary border border-border-default">{t}</span>
                    ))}
                  </div>
                  {/* DB tables preview */}
                  {(arch.database?.tables || []).length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-text-muted mb-1">Database tables:</p>
                      {(arch.database.tables || []).slice(0, 6).map((t: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <Database className="h-3 w-3 text-accent-green flex-shrink-0" />
                          <span className="font-mono text-text-primary">{t.name}</span>
                          <span className="text-text-muted">— {(t.columns || []).length} columns</span>
                        </div>
                      ))}
                      {(arch.database.tables || []).length > 6 && <p className="text-[10px] text-text-muted ml-5">+{arch.database.tables.length - 6} more</p>}
                    </div>
                  )}
                </div>
              )}

              {/* D) Revenue Potential */}
              <div className="bg-bg-card border border-border-default rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-accent-green" /> Revenue Potential</h3>
                <div className="bg-bg-elevated rounded-xl p-4 mb-3">
                  <p className="text-xs text-text-muted mb-1">Suggested pricing</p>
                  <p className="text-2xl font-bold text-accent-green">{suggestedPrice}</p>
                  <p className="text-xs text-text-muted mt-1 capitalize">{pricing.model || 'freemium'} model</p>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex justify-between"><span>10 users × {suggestedPrice}</span><span className="font-bold text-text-primary">${priceNum * 10}/mo</span></div>
                  <div className="flex justify-between"><span>50 users × {suggestedPrice}</span><span className="font-bold text-text-primary">${priceNum * 50}/mo</span></div>
                  <div className="flex justify-between border-t border-border-default pt-2"><span>100 users × {suggestedPrice}</span><span className="font-bold text-accent-green text-lg">${priceNum * 100}/mo</span></div>
                </div>
              </div>

              {/* E) Configure (paid + live only) */}
              {isPaid && isLive && (
                <div className="bg-bg-card border border-border-default rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Settings className="h-4 w-4 text-accent" /> Configure your app</h3>
                  <div className="space-y-3">
                    {APP_SERVICES.map((svc) => {
                      const isConnected = connectedServices.has(svc.name.toLowerCase().replace(/[^a-z]/g, ''))
                      return (
                        <div key={svc.name} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{svc.icon}</span>
                            <div><p className="text-sm font-medium">{svc.name}</p><p className="text-[10px] text-text-muted">{svc.desc}</p></div>
                          </div>
                          {isConnected ? (
                            <span className="text-xs text-accent-green flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Connected</span>
                          ) : (
                            <button onClick={() => setConnectService(svc)} className="text-xs text-accent hover:underline flex items-center gap-1"><Link2 className="h-3 w-3" /> Connect</button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* F) Next Steps (paid + live only) */}
              {isPaid && isLive && (
                <div className="bg-bg-card border border-border-default rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Globe className="h-4 w-4 text-accent" /> Next Steps</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Connect Stripe payments', done: connectedServices.has('stripe'), action: () => setConnectService(APP_SERVICES[0]) },
                      { label: 'Set up Google Auth', done: connectedServices.has('googleauth'), action: () => setConnectService(APP_SERVICES[1]) },
                      { label: 'Connect custom domain', done: connectedServices.has('customdomain'), action: () => setConnectService(APP_SERVICES[2]) },
                      { label: 'Configure email (Resend)', done: connectedServices.has('resend'), action: () => setConnectService(APP_SERVICES[3]) },
                      { label: 'Share with first users', done: false },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {step.done ? <CheckCircle2 className="h-4 w-4 text-accent-green flex-shrink-0" /> : <Circle className="h-4 w-4 text-text-muted flex-shrink-0" />}
                        <span className={`text-sm ${step.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>{step.label}</span>
                        {!step.done && step.action && <button onClick={step.action} className="text-[10px] text-accent hover:underline ml-auto">Set up →</button>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Build cost */}
              {isPaid && project.total_tokens > 0 && (
                <div className="bg-bg-card border border-border-default rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2">Build Cost</h3>
                  <div className="flex gap-6 text-sm text-text-secondary">
                    <span>Tokens: <span className="text-text-primary font-mono">{formatTokens(project.total_tokens)}</span></span>
                    <span>API calls: <span className="text-text-primary font-mono">{project.total_api_calls}</span></span>
                  </div>
                </div>
              )}

              {/* Free upgrade nudge */}
              {isFree && hasArchitecture && (
                <div className="bg-bg-card border border-border-default rounded-xl p-5 text-center">
                  <Gem className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="text-sm font-semibold mb-1">Ready to launch?</p>
                  <p className="text-xs text-text-muted mb-3">Deploy on your own infrastructure and start earning.</p>
                  <Link href="/pricing"><GlowButton variant="accent" size="sm"><Rocket className="h-3.5 w-3.5" /> View Plans</GlowButton></Link>
                </div>
              )}
            </div>
          )}

          {tab === 'preview' && <PreviewTab project={project} />}
          {tab === 'logs' && isPaid && <BuildLog logs={logs} />}
        </div>
      </div>

      {!isBuilding && <ChatBar projectId={id} messages={project.messages || []} onUpdate={loadProject} />}

      {/* Connect Modal */}
      <ConnectModal service={connectService} open={!!connectService} onClose={() => setConnectService(null)} onSave={handleConnectSave} />

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-bg-secondary border border-border-default rounded-xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete project?</h3>
            <p className="text-sm text-text-secondary mb-4">{project.product_name || project.name} will be permanently deleted.</p>
            <div className="flex gap-2 justify-end">
              <GlowButton variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</GlowButton>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50 flex items-center gap-2">
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
