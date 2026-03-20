'use client'

import { useUser } from '@/lib/auth-context'
import { HeroInput } from './HeroInput'
import { LandingPage } from './LandingPage'

export function HomeContent({ projectCount }: { projectCount: number }) {
  const { user, loading, credits } = useUser()

  if (loading) return null

  if (!user) return <LandingPage projectCount={projectCount} />

  // Logged in home
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 -mt-14">
      <p className="text-text-secondary mb-3 text-lg">
        Ready to build, <span className="text-text-primary font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>?
      </p>
      <HeroInput />
      <div className="mt-12 flex gap-6 text-xs text-text-muted">
        <span><span className="font-mono text-accent">{projectCount}</span> Vaxes built</span>
        <span><span className="font-mono text-accent">{credits}</span> credits</span>
      </div>
    </div>
  )
}
