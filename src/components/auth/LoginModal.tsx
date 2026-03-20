'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Zap, X, Mail, Lock, Loader2 } from 'lucide-react'

export function LoginModal() {
  const { showLoginModal, closeLoginModal, pendingIdea } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // TODO: Enable Google/GitHub OAuth in Supabase dashboard, then re-add:
  // async function handleGoogle() { ... signInWithOAuth({ provider: 'google' }) }
  // async function handleGitHub() { ... signInWithOAuth({ provider: 'github' }) }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('subscriptions').upsert(
          { user_id: data.user.id, plan: 'free', status: 'active' },
          { onConflict: 'user_id' }
        )
        closeLoginModal()
        if (pendingIdea) {
          router.push(`/new?idea=${encodeURIComponent(pendingIdea)}`)
        } else {
          router.push('/onboarding')
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      closeLoginModal()
      if (pendingIdea) {
        router.push(`/new?idea=${encodeURIComponent(pendingIdea)}`)
      } else {
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  function handleClose() {
    closeLoginModal()
    setEmail('')
    setPassword('')
    setError('')
  }

  return (
    <AnimatePresence>
      {showLoginModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm bg-bg-secondary border border-border-default rounded-2xl p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
              </div>
              <h2 className="text-xl font-bold">Start Building</h2>
              <p className="text-sm text-text-secondary mt-1">Create your free account</p>
            </div>

            {/* TODO: Enable Google/GitHub OAuth in Supabase dashboard, then re-add social login buttons */}
            <form onSubmit={handleEmail} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-card border border-border-default text-sm outline-none focus:border-accent/50" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)" required minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-card border border-border-default text-sm outline-none focus:border-accent/50" />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-accent text-bg-primary font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSignup ? 'Create account' : 'Log in'}
              </button>
              <button type="button" onClick={() => { setIsSignup(!isSignup); setError('') }}
                className="w-full text-xs text-text-muted hover:text-text-secondary text-center">
                {isSignup ? 'Already have an account? Log in' : 'Need an account? Sign up'}
              </button>
            </form>

            <p className="text-[10px] text-text-muted text-center mt-4">
              By continuing, you agree to our{' '}
              <a href="/terms" className="underline">Terms</a> and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
