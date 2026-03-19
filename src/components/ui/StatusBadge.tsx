'use client'

import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/lib/utils'

export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'lg' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const isBuilding = !['live', 'failed', 'pending'].includes(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.color,
        config.bg,
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm',
        isBuilding && 'animate-pulse'
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          status === 'live' && 'bg-green-400 shadow-[0_0_6px_rgba(0,255,136,0.6)]',
          status === 'failed' && 'bg-red-400',
          status === 'pending' && 'bg-zinc-400',
          isBuilding && 'bg-current'
        )}
      />
      {config.label}
    </span>
  )
}
