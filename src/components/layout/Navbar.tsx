'use client'

import Link from 'next/link'
import { useUser } from '@/lib/auth-context'
import { Zap } from 'lucide-react'

export function Navbar() {
  const { openLoginModal } = useUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-bg-primary/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <span className="text-sm font-bold tracking-tight gradient-text">Vaxario</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <Link href="/templates" className="hover:text-text-primary transition-colors">Templates</Link>
          <Link href="/pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => openLoginModal()} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Log in</button>
          <button onClick={() => openLoginModal()} className="px-4 py-2 rounded-lg bg-accent text-bg-primary text-sm font-semibold hover:bg-accent/90 transition-all">Get started</button>
        </div>
      </div>
    </nav>
  )
}
