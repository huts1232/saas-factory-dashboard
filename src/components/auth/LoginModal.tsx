'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Factory, X, Mail, Lock, Loader2 } from 'lucide-react'

export function LoginModal() {
  const { showLoginModal, closeLoginModal, pendingIdea } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'options' | 'email'>('options')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    const redirectPath = pendingIdea ? `/new?idea=${encodeURIComponent(pendingIdea)}` : '/dashboard'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirectPath}` },
    })
  }

  async function handleGitHub() {
    const redirectPath = pendingIdea ? `/new?idea=${encodeURIComponent(pendingIdea)}` : '/dashboard'
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirectPath}` },
    })
  }

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
    setMode('options')
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
                  <Factory className="h-5 w-5 text-accent" />
                </div>
              </div>
              <h2 className="text-xl font-bold">Start Building</h2>
              <p className="text-sm text-text-secondary mt-1">Create your free account</p>
            </div>

            {mode === 'options' ? (
              <div className="space-y-3">
                <button onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border-default bg-bg-card text-sm font-medium hover:bg-bg-elevated transition-all">
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>

                <button onClick={handleGitHub}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border-default bg-bg-card text-sm font-medium hover:bg-bg-elevated transition-all">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  Continue with GitHub
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-default" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-bg-secondary px-3 text-text-muted">OR</span></div>
                </div>

                <button onClick={() => setMode('email')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border-default bg-bg-card text-sm font-medium hover:bg-bg-elevated transition-all">
                  <Mail className="h-5 w-5" />
                  Continue with email
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmail} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-card border border-border-default text-sm outline-none focus:border-accent/50" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required minLength={6}
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
                <button type="button" onClick={() => setMode('options')}
                  className="w-full text-xs text-accent hover:underline text-center">
                  ← Back to options
                </button>
              </form>
            )}

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
