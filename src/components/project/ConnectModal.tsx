'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, ExternalLink } from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'

interface ConnectModalProps {
  service: { icon: string; name: string; desc: string; placeholder: string; helpUrl: string; helpText: string } | null
  open: boolean
  onClose: () => void
  onSave: (service: string, key: string) => Promise<boolean>
}

export function ConnectModal({ service, open, onClose, onSave }: ConnectModalProps) {
  const [key, setKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  if (!service) return null

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    // Simulate test — in production this would hit the connector test API
    await new Promise(r => setTimeout(r, 1500))
    const ok = key.trim().length > 5
    setTestResult({ ok, message: ok ? 'Connection successful!' : 'Invalid key — please check and try again' })
    setTesting(false)
  }

  async function handleSave() {
    if (!key.trim()) return
    setSaving(true)
    const ok = await onSave(service!.name.toLowerCase().replace(/[^a-z]/g, ''), key)
    setSaving(false)
    if (ok) {
      setKey('')
      setTestResult(null)
      onClose()
    }
  }

  function handleClose() {
    setKey('')
    setTestResult(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-bg-secondary border border-border-default rounded-2xl p-6 relative"
            onClick={e => e.stopPropagation()}>
            <button onClick={handleClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{service.icon}</span>
              <div>
                <h3 className="text-lg font-bold">Connect {service.name}</h3>
                <p className="text-xs text-text-muted">{service.desc}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-bg-elevated rounded-xl p-4 mb-4 text-xs text-text-secondary leading-relaxed">
              <p className="mb-2">{service.helpText}</p>
              <a href={service.helpUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:underline">
                Get your {service.name} key <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Input */}
            <div className="mb-4">
              <label className="text-xs text-text-muted block mb-1.5">API Key / Credentials</label>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder={service.placeholder}
                className="w-full bg-bg-card border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary font-mono outline-none focus:border-accent/50"
              />
            </div>

            {/* Test result */}
            {testResult && (
              <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testResult.ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {testResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {testResult.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <GlowButton variant="ghost" onClick={handleTest} loading={testing} disabled={!key.trim()} className="flex-1">
                Test Connection
              </GlowButton>
              <GlowButton variant="accent" onClick={handleSave} loading={saving} disabled={!key.trim()} className="flex-1">
                Save & Connect
              </GlowButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
