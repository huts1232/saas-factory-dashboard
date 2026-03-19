'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useUser } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import {
  Factory, LayoutDashboard, Plus, Zap, Settings, Search, BookTemplate,
  LogOut, ChevronDown, Gem, FileText, CircleCheck, CircleAlert, Circle,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Zap },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/new', label: 'New Project', icon: Plus },
  { href: '/templates', label: 'Templates', icon: BookTemplate },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const CONNECTOR_ICONS: Record<string, string> = {
  anthropic: '🤖', github: '🐙', vercel: '▲', supabase: '⚡', stripe: '💳', resend: '📧',
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, plan, credits, loading } = useUser()
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [connectors, setConnectors] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    supabase.from('factory_projects').select('id, product_name, status, slug').eq('user_id', user.id)
      .order('updated_at', { ascending: false }).limit(5)
      .then(({ data }) => setRecentProjects(data || []))
    supabase.from('user_connectors').select('service, status').eq('user_id', user.id)
      .then(({ data }) => setConnectors(data || []))
  }, [user?.id])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Hide sidebar on auth pages
  if (['/login', '/signup'].includes(pathname)) return null

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border-default bg-bg-secondary flex flex-col text-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border-default flex-shrink-0">
        <div className="h-7 w-7 rounded-lg bg-accent/20 flex items-center justify-center">
          <Factory className="h-4 w-4 text-accent" />
        </div>
        <span className="font-bold tracking-tight">
          <span className="gradient-text">SaaS</span> Factory
        </span>
      </div>

      {/* User workspace */}
      {user && (
        <div className="px-3 py-3 border-b border-border-default flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-elevated cursor-pointer">
            <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
              {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-xs text-text-primary truncate flex-1">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </span>
            <ChevronDown className="h-3 w-3 text-text-muted" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
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

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <>
            <div className="pt-4 pb-1 px-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Recents</div>
            {recentProjects.map((p) => (
              <Link key={p.id} href={`/project/${p.id}`}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all',
                  pathname === `/project/${p.id}` && 'bg-accent/10 text-accent'
                )}>
                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate flex-1">{p.product_name || p.slug}</span>
                <span className={cn(
                  'h-2 w-2 rounded-full flex-shrink-0',
                  p.status === 'live' && 'bg-green-400',
                  p.status === 'failed' && 'bg-red-400',
                  !['live', 'failed'].includes(p.status) && 'bg-yellow-400 animate-pulse',
                )} />
              </Link>
            ))}
          </>
        )}

        {/* Connectors */}
        {connectors.length > 0 && (
          <>
            <div className="pt-4 pb-1 px-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Connectors</div>
            {connectors.map((c) => (
              <div key={c.service} className="flex items-center gap-2 px-3 py-1 text-text-muted">
                <span className="text-xs">{CONNECTOR_ICONS[c.service] || '🔗'}</span>
                <span className="capitalize flex-1">{c.service}</span>
                {c.status === 'connected' ? (
                  <CircleCheck className="h-3 w-3 text-green-400" />
                ) : c.status === 'failed' ? (
                  <CircleAlert className="h-3 w-3 text-red-400" />
                ) : (
                  <Circle className="h-3 w-3 text-text-muted" />
                )}
              </div>
            ))}
            <Link href="/settings" className="px-3 py-1 text-[11px] text-accent hover:underline">+ Connect more</Link>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="flex-shrink-0 border-t border-border-default p-3 space-y-2">
        {user && (
          <>
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-text-muted">⚡ {credits} credits</span>
              {plan === 'free' && (
                <Link href="/pricing" className="text-[10px] text-accent hover:underline flex items-center gap-1">
                  <Gem className="h-3 w-3" /> Upgrade
                </Link>
              )}
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all">
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          </>
        )}
        {!user && !loading && (
          <Link href="/login"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-all">
            Log in
          </Link>
        )}
        <p className="text-[10px] text-text-muted text-center">Powered by Claude &middot; v0.2</p>
      </div>
    </aside>
  )
}
