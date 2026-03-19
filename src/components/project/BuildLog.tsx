'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface LogEntry {
  id: string
  step_number: number
  step_name: string
  status: string
  message: string | null
  created_at: string
}

export function BuildLog({ logs }: { logs: LogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  return (
    <div className="bg-bg-primary border border-border-default rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-border-default flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-accent-pink/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-accent-orange/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-accent-green/60" />
        </div>
        <span className="text-[10px] text-text-muted font-mono ml-2">build.log</span>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto font-mono text-[13px] leading-relaxed space-y-0.5">
        {logs.length === 0 ? (
          <p className="text-text-muted">Waiting for build output...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <span className="text-text-muted flex-shrink-0 text-[11px]">
                {new Date(log.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className={cn(
                'flex-shrink-0 w-16 text-[11px]',
                log.status === 'success' && 'text-accent-green',
                log.status === 'failed' && 'text-accent-pink',
                log.status === 'running' && 'text-accent',
              )}>
                [{log.status}]
              </span>
              <span className={cn(
                log.status === 'success' && 'text-accent-green/80',
                log.status === 'failed' && 'text-accent-pink/80',
                log.status === 'running' && 'text-text-secondary',
                !['success', 'failed', 'running'].includes(log.status) && 'text-text-muted',
              )}>
                <span className="text-text-muted">{log.step_name}:</span>{' '}
                {log.message || '...'}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
