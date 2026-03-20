'use client'

import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/auth-context'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

const AUTH_PAGES = ['/login', '/signup']

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()
  const pathname = usePathname()

  // Auth pages: no layout
  if (AUTH_PAGES.includes(pathname)) return <>{children}</>

  // Loading: blank to prevent flash
  if (loading) return <main className="min-h-screen" />

  // LOGGED IN: ALWAYS sidebar layout (dashboard, projects, everything)
  if (user) {
    return (
      <>
        <Sidebar />
        <main className="ml-56 min-h-screen">{children}</main>
      </>
    )
  }

  // NOT LOGGED IN: public navbar, no sidebar
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
    </>
  )
}
