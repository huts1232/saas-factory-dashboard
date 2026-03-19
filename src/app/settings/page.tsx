'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/auth-context'
import { GlowButton } from '@/components/ui/GlowButton'
import { cn } from '@/lib/utils'
import { CircleCheck, CircleAlert, Circle, Loader2, TestTube, Lock, Gem, Rocket } from 'lucide-react'
import Link from 'next/link'

const SERVICES = [
  { id: 'anthropic', name: 'Anthropic', desc: 'Claude API key', placeholder: 'sk-ant-...', required: true },
  { id: 'github', name: 'GitHub', desc: 'Personal Access Token', placeholder: 'ghp_...', required: true },
  { id: 'vercel', name: 'Vercel', desc: 'API token', placeholder: 'vcp_...', required: true },
  { id: 'supabase', name: 'Supabase', desc: 'Access token', placeholder: 'sbp_...', required: true },
  { id: 'stripe', name: 'Stripe', desc: 'Secret key (optional)', placeholder: 'sk_...', required: false },
  { id: 'resend', name: 'Resend', desc: 'API key (optional)', placeholder: 're_...', required: false },
]

interface Connector {
  service: string
  status: string
  last_tested_at: string | null
  metadata: any
}

export default function SettingsPage() {
  const { user, plan, isAdmin } = useUser()
  const isFree = plan === 'free' && !isAdmin
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  useEffect(() => {
    if (!isFree) {
      fetch('/api/connectors').then(r => r.json()).then(setConnectors).catch(() => {})
    }
  }, [isFree])

  async function handleSave(service: string) {
    setSaving(true)
    await fetch('/api/connectors', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service, apiKey }),
    })
    setEditing(null); setApiKey(''); setSaving(false)
    const res = await fetch('/api/connectors')
    setConnectors(await res.json())
    handleTest(service)
  }

  async function handleTest(service: string) {
    setTesting(service)
    await fetch(`/api/connectors/${service}/test`, { method: 'POST' })
    setTesting(null)
    const updated = await fetch('/api/connectors')
    setConnectors(await updated.json())
  }

  function getConnector(service: string) { return connectors.find(c => c.service === service) }

  // ===== FREE USERS: UPGRADE WALL =====
  if (isFree) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-text-secondary mb-8">Connect your tools to deploy SaaS apps</p>

        <div className="bg-bg-card border border-border-default rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 mb-4">
            <Lock className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-xl font-bold mb-2">Upgrade to connect your tools</h2>
          <p className="text-sm text-text-secondary mb-3 max-w-md mx-auto">
            Connect your GitHub, Vercel, Supabase, and Stripe accounts to deploy SaaS apps on your own infrastructure.
          </p>
          <p className="text-xs text-text-muted mb-6">Free plan includes preview only. Upgrade to Starter to deploy.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {['🐙 GitHub', '▲ Vercel', '⚡ Supabase', '💳 Stripe'].map(s => (
              <div key={s} className="bg-bg-elevated rounded-xl p-3 text-center opacity-50">
                <div className="text-2xl mb-1">{s.split(' ')[0]}</div>
                <div className="text-[10px] text-text-muted">{s.split(' ')[1]}</div>
                <Lock className="h-3 w-3 text-text-muted mx-auto mt-1" />
              </div>
            ))}
          </div>

          <Link href="/pricing">
            <GlowButton variant="green" size="lg">
              <Gem className="h-5 w-5" /> Upgrade to Starter — $19/mo
            </GlowButton>
          </Link>
        </div>
      </div>
    )
  }

  // ===== PAID USERS: CONNECTOR MANAGEMENT =====
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-text-secondary mb-8">Manage your API keys and connectors</p>

      <div className="space-y-3">
        {SERVICES.map((svc) => {
          const conn = getConnector(svc.id)
          const isEditing = editing === svc.id
          const isTesting = testing === svc.id

          return (
            <div key={svc.id} className="bg-bg-card border border-border-default rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {conn?.status === 'connected' ? <CircleCheck className="h-5 w-5 text-green-400" /> :
                   conn?.status === 'failed' ? <CircleAlert className="h-5 w-5 text-red-400" /> :
                   <Circle className="h-5 w-5 text-text-muted" />}
                  <div>
                    <div className="font-medium text-sm">{svc.name}{svc.required && <span className="text-red-400 ml-1">*</span>}</div>
                    <div className="text-xs text-text-muted">{svc.desc}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {conn && <GlowButton variant="ghost" size="sm" onClick={() => handleTest(svc.id)} loading={isTesting}><TestTube className="h-3 w-3" /> Test</GlowButton>}
                  <GlowButton variant="ghost" size="sm" onClick={() => { setEditing(isEditing ? null : svc.id); setApiKey('') }}>
                    {conn ? 'Update' : 'Connect'}
                  </GlowButton>
                </div>
              </div>
              {isEditing && (
                <div className="mt-3 flex gap-2">
                  <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={svc.placeholder}
                    className="flex-1 bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm outline-none focus:border-accent/50 font-mono" />
                  <GlowButton variant="accent" size="sm" onClick={() => handleSave(svc.id)} loading={saving}>Save</GlowButton>
                </div>
              )}
              {conn?.metadata?.last_test_message && (
                <div className={cn('mt-2 text-xs', conn.status === 'connected' ? 'text-green-400/70' : 'text-red-400/70')}>
                  {conn.metadata.last_test_message}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
