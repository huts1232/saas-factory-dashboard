'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useUser } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Plus, Zap, Settings, BookTemplate,
  LogOut, ChevronDown, Gem, FileText, CircleCheck, CircleAlert, Circle,
  Home, Search, Star, FolderOpen, Link2,
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, plan, credits, isAdmin } = useUser()
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [connectors, setConnectors] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      const projectQuery = supabase.from('factory_projects').select('id, product_name, status, slug')
        .order('updated_at', { ascending: false }).limit(5)
      if (!isAdmin) projectQuery.eq('user_id', user.id)
      const { data: projects } = await projectQuery
      setRecentProjects(projects || [])

      // Only load connectors for paid users
      if (plan !== 'free' || isAdmin) {
        const { data: conns } = await supabase.from('user_connectors')
          .select('service, status').eq('user_id', user.id)
        setConnectors(conns || [])
      }
    }
    loadData()
  }, [user?.id, isAdmin])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return null

  const NAV = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'All Projects', icon: FolderOpen },
    { href: '/templates', label: 'Templates', icon: BookTemplate },
    { href: '/settings', label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: Settings }] : []),
  ]

  const CONNECTORS_ICONS: Record<string, string> = {
    anthropic: '🤖', github: '🐙', vercel: '▲', supabase: '⚡', stripe: '💳', resend: '📧',
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border-default bg-bg-secondary flex flex-col text-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border-default flex-shrink-0">
        <div className="h-7 w-7 rounded-lg bg-accent/20 flex items-center justify-center">
          <Zap className="h-4 w-4 text-accent" />
        </div>
        <span className="font-bold tracking-tight gradient-text">Vaxario
        </span>
      </div>

      {/* Workspace */}
      <div className="px-3 py-3 border-b border-border-default flex-shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-elevated">
          <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
            {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-primary truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              {isAdmin && (
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-accent-purple/20 text-accent-purple font-bold uppercase">Admin</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all',
                isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        <Link href="/new" className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-accent hover:bg-accent/5 transition-all mt-2">
          <Plus className="h-4 w-4" /> New Project
        </Link>

        {/* Recents */}
        {recentProjects.length > 0 && (
          <>
            <div className="pt-5 pb-1 px-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Recents</div>
            {recentProjects.map((p) => (
              <Link key={p.id} href={`/project/${p.id}`}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all',
                  pathname === `/project/${p.id}` && 'bg-accent/10 text-accent'
                )}>
                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate flex-1 text-xs">{p.product_name || p.slug}</span>
                <span className={cn('h-2 w-2 rounded-full flex-shrink-0',
                  p.status === 'live' ? 'bg-green-400' : p.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
                )} />
              </Link>
            ))}
          </>
        )}

        {/* Connectors — paid only */}
        {(plan !== 'free' || isAdmin) && connectors.length > 0 && (
          <>
            <div className="pt-5 pb-1 px-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Connectors</div>
            {connectors.map((c) => (
              <div key={c.service} className="flex items-center gap-2 px-3 py-1 text-text-muted text-xs">
                <span>{CONNECTORS_ICONS[c.service] || '🔗'}</span>
                <span className="capitalize flex-1">{c.service}</span>
                {c.status === 'connected' ? <CircleCheck className="h-3 w-3 text-green-400" /> :
                 c.status === 'failed' ? <CircleAlert className="h-3 w-3 text-red-400" /> :
                 <Circle className="h-3 w-3" />}
              </div>
            ))}
            <Link href="/settings" className="px-3 py-1 text-[11px] text-accent hover:underline">+ Connect more</Link>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="flex-shrink-0 border-t border-border-default p-3 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-text-muted">⚡ {credits} credits</span>
          {plan === 'free' && !isAdmin && (
            <Link href="/pricing" className="text-[10px] text-accent hover:underline flex items-center gap-1">
              <Gem className="h-3 w-3" /> Upgrade
            </Link>
          )}
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all text-xs">
          <LogOut className="h-3.5 w-3.5" /> Log out
        </button>
      </div>
    </aside>
  )
}
