'use client'

import { StatusBadge } from '@/components/ui/StatusBadge'
import { GlowButton } from '@/components/ui/GlowButton'
import { ExternalLink, Github, RotateCcw, Trash2 } from 'lucide-react'
import { formatTokens } from '@/lib/utils'

interface ProjectHeaderProps {
  project: any
  onRetry?: () => void
  onDelete?: () => void
}

export function ProjectHeader({ project, onRetry, onDelete }: ProjectHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{project.product_name || project.name}</h1>
            <StatusBadge status={project.status} size="lg" />
          </div>
          {project.tagline && (
            <p className="text-text-secondary">{project.tagline}</p>
          )}
        </div>
        <div className="flex gap-2">
          {project.vercel_url && (
            <a href={project.vercel_url} target="_blank" rel="noopener noreferrer">
              <GlowButton variant="green" size="sm">
                <ExternalLink className="h-3.5 w-3.5" /> Open Site
              </GlowButton>
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              <GlowButton variant="ghost" size="sm">
                <Github className="h-3.5 w-3.5" /> GitHub
              </GlowButton>
            </a>
          )}
          {project.status === 'failed' && onRetry && (
            <GlowButton variant="accent" size="sm" onClick={onRetry}>
              <RotateCcw className="h-3.5 w-3.5" /> Retry
            </GlowButton>
          )}
          {onDelete && (
            <GlowButton variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </GlowButton>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-text-muted">Tokens:</span>{' '}
          <span className="text-text-primary font-mono">{formatTokens(project.total_tokens)}</span>
        </div>
        <div>
          <span className="text-text-muted">API Calls:</span>{' '}
          <span className="text-text-primary font-mono">{project.total_api_calls}</span>
        </div>
        <div>
          <span className="text-text-muted">Step:</span>{' '}
          <span className="text-text-primary font-mono">{project.current_step}/11</span>
        </div>
      </div>
    </div>
  )
}
