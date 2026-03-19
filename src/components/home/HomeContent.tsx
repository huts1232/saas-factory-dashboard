'use client'

import { useUser } from '@/lib/auth-context'
import { HeroInput } from './HeroInput'
import { LandingPage } from './LandingPage'

export function HomeContent({ projectCount }: { projectCount: number }) {
  const { user, loading } = useUser()

  if (loading) return null

  if (!user) return <LandingPage projectCount={projectCount} />

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 -mt-14">
      <p className="text-text-secondary mb-2">Ready to build, <span className="text-text-primary font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>?</p>
      <HeroInput />
      {projectCount > 0 && (
        <p className="mt-12 text-xs text-text-muted">
          <span className="font-mono text-accent">{projectCount}</span> SaaS-en gebouwd
        </p>
      )}
    </div>
  )
}
