'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'green' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function GlowButton({
  variant = 'accent',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-8 py-3.5 text-base',
        variant === 'accent' && 'bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]',
        variant === 'green' && 'bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 hover:border-accent-green/50 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]',
        variant === 'ghost' && 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
