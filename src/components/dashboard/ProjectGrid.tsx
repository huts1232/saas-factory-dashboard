'use client'

import { useState } from 'react'
import { ProjectCard } from './ProjectCard'
import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'
import Link from 'next/link'

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Building', value: 'building' },
  { label: 'Live', value: 'live' },
  { label: 'Failed', value: 'failed' },
]

const BUILDING_STATUSES = ['ideating', 'architecting', 'generating', 'database', 'pushing', 'deploying', 'reviewing', 'landing', 'admin']

export function ProjectGrid({ projects }: { projects: any[] }) {
  const [filter, setFilter] = useState('all')

  const filtered = projects.filter((p) => {
    if (filter === 'all') return true
    if (filter === 'building') return BUILDING_STATUSES.includes(p.status)
    return p.status === filter
  })

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-bg-secondary rounded-lg p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              filter === f.value
                ? 'bg-bg-elevated text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox className="h-12 w-12 text-text-muted mb-4" />
          <h3 className="text-lg font-semibold text-text-secondary mb-1">Geen projecten</h3>
          <p className="text-sm text-text-muted mb-4">
            {filter === 'all' ? 'Start je eerste SaaS!' : `Geen ${filter} projecten.`}
          </p>
          <Link
            href="/new"
            className="px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/30 text-sm font-medium hover:bg-accent/20 transition-all"
          >
            Nieuw project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
