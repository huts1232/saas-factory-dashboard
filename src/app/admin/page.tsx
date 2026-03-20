'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Users, BarChart3, CreditCard, Activity, Database, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAdmin) { router.push('/dashboard'); return }
    if (!authLoading && isAdmin) {
      Promise.all([
        fetch('/api/projects').then(r => r.json()),
        supabase.from('subscriptions').select('*'),
        supabase.from('credits').select('*').eq('type', 'pipeline_use'),
      ]).then(([proj, subRes, credRes]) => {
        setProjects(Array.isArray(proj) ? proj : [])
        setSubs(subRes.data || [])
        setLoading(false)
      })
    }
  }, [authLoading, isAdmin])

  if (authLoading || loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
  if (!isAdmin) return null

  const liveProjects = projects.filter(p => p.status === 'live')
  const previewProjects = projects.filter(p => p.status === 'preview')
  const failedProjects = projects.filter(p => p.status === 'failed')
  const paidSubs = subs.filter(s => s.plan !== 'free')
  const totalTokens = projects.reduce((s, p) => s + (p.total_tokens || 0), 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">System overview — admin only</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: projects.length, icon: <Database className="h-5 w-5 text-accent" />, sub: `${liveProjects.length} live, ${previewProjects.length} preview` },
          { label: 'Subscriptions', value: paidSubs.length, icon: <CreditCard className="h-5 w-5 text-green-500" />, sub: `${subs.length} total, ${paidSubs.length} paid` },
          { label: 'Failed Builds', value: failedProjects.length, icon: <Activity className="h-5 w-5 text-red-500" />, sub: 'Needs attention' },
          { label: 'Total Tokens', value: totalTokens.toLocaleString(), icon: <BarChart3 className="h-5 w-5 text-purple-500" />, sub: `${projects.reduce((s, p) => s + (p.total_api_calls || 0), 0)} API calls` },
        ].map((s, i) => (
          <div key={i} className="bg-bg-card border border-border-default rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-text-muted">{s.label}</p>
            <p className="text-xs text-text-muted mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* All Projects */}
      <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border-default">
          <h2 className="font-semibold">All Projects ({projects.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-text-muted text-xs">
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Step</th>
                <th className="px-6 py-3 text-left">Tokens</th>
                <th className="px-6 py-3 text-left">URLs</th>
                <th className="px-6 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-border-default hover:bg-bg-elevated/50">
                  <td className="px-6 py-3">
                    <Link href={`/project/${p.id}`} className="font-medium text-text-primary hover:text-accent">
                      {p.product_name || p.name}
                    </Link>
                    {p.tagline && <p className="text-xs text-text-muted truncate max-w-xs">{p.tagline}</p>}
                  </td>
                  <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-6 py-3 font-mono text-text-muted">{p.current_step}/11</td>
                  <td className="px-6 py-3 font-mono text-text-muted">{(p.total_tokens || 0).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      {p.vercel_url && <a href={p.vercel_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">Site</a>}
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:underline">GitHub</a>}
                      {!p.vercel_url && !p.github_url && <span className="text-xs text-text-muted">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-default">
          <h2 className="font-semibold">Subscriptions ({subs.length})</h2>
        </div>
        {subs.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No subscriptions yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-text-muted text-xs">
                  <th className="px-6 py-3 text-left">User ID</th>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id} className="border-b border-border-default">
                    <td className="px-6 py-3 font-mono text-xs text-text-muted">{s.user_id?.slice(0, 8)}...</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.plan === 'pro' ? 'bg-purple-500/10 text-purple-400' : s.plan === 'starter' ? 'bg-accent/10 text-accent' : 'bg-bg-elevated text-text-muted'}`}>
                        {s.plan}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-text-muted">{s.status}</td>
                    <td className="px-6 py-3 text-xs text-text-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
