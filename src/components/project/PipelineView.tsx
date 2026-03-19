'use client'

import { cn } from '@/lib/utils'
import { STEP_NAMES } from '@/lib/utils'
import {
  Lightbulb, Cpu, Code, Database, Github, Rocket,
  Globe, Search, Bug, FileText, LayoutDashboard,
  CheckCircle2, XCircle, Loader2, Circle, RotateCcw, Lock,
} from 'lucide-react'

const STEP_ICONS: Record<number, React.ElementType> = {
  1: Lightbulb,
  2: Cpu,
  3: Code,
  4: Database,
  5: Github,
  6: Rocket,
  7: Globe,
  8: Search,
  9: Bug,
  10: FileText,
  11: LayoutDashboard,
}

interface BuildLog {
  id: string
  step_number: number
  step_name: string
  status: string
  message: string | null
  duration_ms: number | null
  tokens_used: number
}

interface PipelineViewProps {
  currentStep: number
  status: string
  logs: BuildLog[]
  onRetry?: (step: number) => void
  isFree?: boolean
}

export function PipelineView({ currentStep, status, logs, onRetry, isFree }: PipelineViewProps) {
  const logMap = new Map<number, BuildLog>()
  logs.forEach((l) => logMap.set(l.step_number, l))

  function getStepStatus(step: number): 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'locked' {
    const log = logMap.get(step)
    if (log) return log.status as any
    if (step === currentStep && !['live', 'failed', 'pending', 'preview'].includes(status)) return 'running'
    if (step < currentStep) return 'success'
    return 'pending'
  }

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">Pipeline</h3>
      {Array.from({ length: 11 }, (_, i) => i + 1).map((step) => {
        const stepStatus = getStepStatus(step)
        const Icon = STEP_ICONS[step] || Circle
        const log = logMap.get(step)

        return (
          <div key={step} className="relative flex items-start gap-3 py-2 px-2 rounded-lg group">
            {/* Connector line */}
            {step < 11 && (
              <div className={cn(
                'absolute left-[21px] top-9 w-px h-[calc(100%-12px)]',
                stepStatus === 'success' ? 'bg-accent-green/30' :
                stepStatus === 'failed' ? 'bg-accent-pink/30' :
                'bg-border-default'
              )} />
            )}

            {/* Icon */}
            <div className={cn(
              'relative z-10 flex items-center justify-center h-7 w-7 rounded-lg flex-shrink-0',
              stepStatus === 'success' && 'bg-accent-green/10 text-accent-green',
              stepStatus === 'running' && 'bg-accent/10 text-accent',
              stepStatus === 'failed' && 'bg-accent-pink/10 text-accent-pink',
              stepStatus === 'pending' && 'bg-bg-elevated text-text-muted',
              stepStatus === 'locked' && 'bg-bg-elevated text-text-muted opacity-50',
            )}>
              {stepStatus === 'locked' ? (
                <Lock className="h-3.5 w-3.5" />
              ) : stepStatus === 'running' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : stepStatus === 'success' ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : stepStatus === 'failed' ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium',
                  stepStatus === 'success' && 'text-text-primary',
                  stepStatus === 'running' && 'text-accent',
                  stepStatus === 'failed' && 'text-accent-pink',
                  stepStatus === 'pending' && 'text-text-muted',
                  stepStatus === 'locked' && 'text-text-muted opacity-50',
                )}>
                  {STEP_NAMES[step]}
                </span>
                {log?.duration_ms && (
                  <span className="text-[10px] text-text-muted">
                    {(log.duration_ms / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
              {log?.message && (
                <p className={cn(
                  'text-xs mt-0.5 truncate',
                  stepStatus === 'failed' ? 'text-accent-pink/70' : 'text-text-muted'
                )}>
                  {log.message}
                </p>
              )}
              {stepStatus === 'failed' && onRetry && (
                <button
                  onClick={() => onRetry(step)}
                  className="mt-1 inline-flex items-center gap-1 text-[10px] text-accent hover:text-accent/80"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
