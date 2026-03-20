'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ProjectGrid } from '@/components/dashboard/ProjectGrid'
import { Loader2, PartyPopper } from 'lucide-react'

function DashboardContent() {
  const searchParams = useSearchParams()
  const upgraded = searchParams.get('upgraded')
  const plan = searchParams.get('plan')
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(data => {
      setProjects(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (upgraded === 'true') {
      setShowBanner(true)
      const t = setTimeout(() => setShowBanner(false), 10000)
      return () => clearTimeout(t)
    }
  }, [upgraded])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>

  return (
    <>
      {showBanner && (
        <div className="mx-8 mt-8 mb-0 bg-accent-green/5 border border-accent-green/20 rounded-2xl p-6 flex items-center gap-4">
          <PartyPopper className="h-8 w-8 text-accent-green flex-shrink-0" />
          <div>
            <p className="text-accent-green font-bold text-lg">
              Welcome to {plan === 'pro' ? 'Pro' : 'Starter'}!
            </p>
            <p className="text-sm text-accent-green/70">
              Your credits have been added. You can now deploy your Vaxes to production.
            </p>
          </div>
        </div>
      )}
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Vaxes</h1>
          <p className="text-sm text-text-secondary mt-1">All your Vaxes in one place</p>
        </div>
        <ProjectGrid projects={projects} />
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>}>
      <DashboardContent />
    </Suspense>
  )
}
