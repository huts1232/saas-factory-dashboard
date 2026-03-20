'use client'

import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/auth-context'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Loader2 } from 'lucide-react'

const AUTH_PAGES = ['/login', '/signup']

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const pathname = usePathname()

  // Auth pages: no layout chrome
  if (AUTH_PAGES.includes(pathname)) return <>{children}</>

  // BUG 6 FIX: Show loading spinner while auth state resolves
  // This prevents the race condition where layout picks public before auth loads
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  // BUG 1+2+5 FIX: LOGGED IN = ALWAYS sidebar, NEVER navbar with login buttons
  if (user) {
    return (
      <>
        <Sidebar />
        <main className="ml-56 min-h-screen">{children}</main>
      </>
    )
  }

  // NOT LOGGED IN: public navbar with "Get started" / "Log in"
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
    </>
  )
}
