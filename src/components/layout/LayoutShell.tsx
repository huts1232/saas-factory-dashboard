'use client'

import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/auth-context'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

const AUTH_PAGES = ['/login', '/signup']
const PUBLIC_FULL_WIDTH = ['/', '/pricing', '/terms', '/privacy', '/templates']

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const pathname = usePathname()

  // Auth pages: no chrome at all
  if (AUTH_PAGES.includes(pathname)) {
    return <>{children}</>
  }

  // Not logged in: navbar, full width, no sidebar
  if (!user && !loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16">{children}</main>
      </>
    )
  }

  // Loading: show nothing to prevent flash
  if (loading) {
    return <main className="min-h-screen" />
  }

  // Logged in on public pages that should be full width (landing)
  if (PUBLIC_FULL_WIDTH.includes(pathname) && pathname === '/') {
    return (
      <>
        <Sidebar />
        <main className="ml-56 min-h-screen">{children}</main>
      </>
    )
  }

  // Logged in: sidebar + content
  return (
    <>
      <Sidebar />
      <main className="ml-56 min-h-screen">{children}</main>
    </>
  )
}
