'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { WizardSteps } from '@/components/new/WizardSteps'

function WizardContent() {
  const searchParams = useSearchParams()
  const idea = searchParams.get('idea') || ''

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Nieuw project</h1>
        <p className="text-sm text-text-secondary mt-1">Configureer en start je SaaS</p>
      </div>
      <WizardSteps initialIdea={idea} />
    </div>
  )
}

export default function NewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-muted">Loading...</div>}>
      <WizardContent />
    </Suspense>
  )
}
