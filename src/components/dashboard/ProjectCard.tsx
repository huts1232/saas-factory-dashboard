'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatRelativeTime } from '@/lib/utils'

interface Project {
  id: string
  name: string
  slug: string
  idea: string
  status: string
  current_step: number
  product_name: string | null
  tagline: string | null
  github_url: string | null
  vercel_url: string | null
  total_tokens: number
  created_at: string
  updated_at: string
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const isBuilding = !['live', 'failed', 'pending'].includes(project.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/project/${project.id}`}>
        <div className={`bg-bg-card border border-border-default rounded-xl p-5 transition-all hover:border-border-bright hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 ${isBuilding ? 'animate-glow' : ''}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-text-primary truncate">
                {project.product_name || project.name}
              </h3>
              {project.tagline && (
                <p className="text-xs text-text-secondary mt-0.5 truncate">{project.tagline}</p>
              )}
            </div>
            <StatusBadge status={project.status} />
          </div>

          <p className="text-xs text-text-muted line-clamp-2 mb-4">{project.idea}</p>

          {project.current_step > 0 && (
            <div className="mb-4">
              <ProgressBar current={project.current_step} total={11} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {formatRelativeTime(project.updated_at || project.created_at)}
            </span>
            <div className="flex gap-2">
              {project.github_url && (
                <Github className="h-3.5 w-3.5 text-text-muted" />
              )}
              {project.vercel_url && (
                <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
