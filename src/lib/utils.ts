import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`
  return tokens.toString()
}

export function formatRelativeTime(date: string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export const STEP_NAMES: Record<number, string> = {
  1: 'Ideation',
  2: 'Architecture',
  3: 'Code Generation',
  4: 'Database Setup',
  5: 'GitHub Push',
  6: 'Deploy to Vercel',
  7: 'Domain Setup',
  8: 'Code Review',
  9: 'Bug Fixes',
  10: 'Landing Page',
  11: 'Admin Dashboard',
}

export const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-zinc-400', bg: 'bg-zinc-400/10', label: 'Pending' },
  ideating: { color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Ideating' },
  architecting: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Architecting' },
  generating: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Generating' },
  database: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Database' },
  pushing: { color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Pushing' },
  deploying: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Deploying' },
  reviewing: { color: 'text-indigo-400', bg: 'bg-indigo-400/10', label: 'Reviewing' },
  landing: { color: 'text-pink-400', bg: 'bg-pink-400/10', label: 'Landing Page' },
  admin: { color: 'text-violet-400', bg: 'bg-violet-400/10', label: 'Admin' },
  live: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Live' },
  failed: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Failed' },
}
