'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  plan: 'free' | 'starter' | 'pro'
  credits: number
  isAdmin: boolean
  loading: boolean
  showLoginModal: boolean
  pendingIdea: string | null
  openLoginModal: (idea?: string) => void
  closeLoginModal: () => void
}

const AuthContext = createContext<AuthState>({
  user: null,
  plan: 'free',
  credits: 0,
  isAdmin: false,
  loading: true,
  showLoginModal: false,
  pendingIdea: null,
  openLoginModal: () => {},
  closeLoginModal: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [plan, setPlan] = useState<'free' | 'starter' | 'pro'>('free')
  const [credits, setCredits] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [pendingIdea, setPendingIdea] = useState<string | null>(null)

  const [supabase] = useState(() => createClient())

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setUser(null)
      setPlan('free')
      setCredits(0)
      setIsAdmin(false)
      setLoading(false)
      return
    }

    setUser(user)

    const [subRes, credRes, adminRes] = await Promise.all([
      supabase.from('subscriptions').select('plan').eq('user_id', user.id).single(),
      supabase.rpc('get_credit_balance', { p_user_id: user.id }),
      supabase.from('admin_users').select('id').eq('email', user.email!).single(),
    ])

    setPlan((subRes.data?.plan as any) || 'free')
    setCredits(credRes.data ?? 0)
    setIsAdmin(!!adminRes.data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        load()
        setShowLoginModal(false)
      } else {
        setUser(null)
        setPlan('free')
        setCredits(0)
        setIsAdmin(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [load, supabase])

  // Credit realtime
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('credits-live')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'credits',
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        setCredits(payload.new.balance_after)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, supabase])

  const openLoginModal = useCallback((idea?: string) => {
    if (idea) setPendingIdea(idea)
    setShowLoginModal(true)
  }, [])

  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, plan, credits, isAdmin, loading,
      showLoginModal, pendingIdea,
      openLoginModal, closeLoginModal,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useUser() {
  return useContext(AuthContext)
}
