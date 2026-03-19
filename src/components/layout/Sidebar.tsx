'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Factory, LayoutDashboard, Plus, Zap } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Zap },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/new', label: 'New Project', icon: Plus },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border-default bg-bg-secondary flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border-default">
        <div className="h-7 w-7 rounded-lg bg-accent/20 flex items-center justify-center">
          <Factory className="h-4 w-4 text-accent" />
        </div>
        <span className="text-sm font-bold tracking-tight">
          <span className="gradient-text">SaaS</span> Factory
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-default">
        <p className="text-[10px] text-text-muted text-center">
          Powered by Claude &middot; v0.1
        </p>
      </div>
    </aside>
  )
}
