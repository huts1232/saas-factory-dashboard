'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  user: User | null
  plan: 'free' | 'starter' | 'pro'
  credits: number
  loading: boolean
}

const AuthContext = createContext<UserProfile>({
  user: null,
  plan: 'free',
  credits: 0,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserProfile>({
    user: null,
    plan: 'free',
    credits: 0,
    loading: true,
  })
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setState({ user: null, plan: 'free', credits: 0, loading: false })
        return
      }

      const [subRes, credRes] = await Promise.all([
        supabase.from('subscriptions').select('plan').eq('user_id', user.id).single(),
        supabase.rpc('get_credit_balance', { p_user_id: user.id }),
      ])

      setState({
        user,
        plan: (subRes.data?.plan as any) || 'free',
        credits: credRes.data ?? 0,
        loading: false,
      })
    }
    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        load()
      } else {
        setState({ user: null, plan: 'free', credits: 0, loading: false })
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Listen for credit changes
  useEffect(() => {
    if (!state.user) return
    const channel = supabase
      .channel('credits')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'credits',
        filter: `user_id=eq.${state.user.id}`,
      }, (payload: any) => {
        setState(s => ({ ...s, credits: payload.new.balance_after }))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [state.user?.id])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useUser() {
  return useContext(AuthContext)
}
