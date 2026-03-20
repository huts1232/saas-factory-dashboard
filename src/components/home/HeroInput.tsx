'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useUser } from '@/lib/auth-context'

const EXAMPLES = [
  'AI Invoice Tool',
  'Recipe Planner',
  'Habit Tracker',
  'CRM for Freelancers',
]

export function HeroInput() {
  const [idea, setIdea] = useState('')
  const router = useRouter()
  const { user, openLoginModal } = useUser()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!idea.trim()) return
    if (!user) {
      openLoginModal(idea.trim())
      return
    }
    router.push(`/new?idea=${encodeURIComponent(idea.trim())}`)
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          What do you want to <span className="gradient-text">build</span>?
        </h1>
        <p className="text-text-secondary text-lg">Describe your idea. Vaxario designs, builds, and deploys it.</p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-accent/30 to-accent-green/30 opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
          <div className="relative flex items-center bg-bg-card border border-border-default rounded-xl group-focus-within:border-accent/50 transition-colors">
            <Sparkles className="ml-4 h-5 w-5 text-text-muted" />
            <input type="text" value={idea} onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your AI tool idea..."
              className="flex-1 bg-transparent px-4 py-4 text-lg text-text-primary placeholder:text-text-muted outline-none" autoFocus />
            <button type="submit" disabled={!idea.trim()}
              className="m-2 px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-medium">
              Start <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.form>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-wrap gap-2 justify-center">
        {EXAMPLES.map((example) => (
          <button key={example} onClick={() => setIdea(example)}
            className="px-3 py-1.5 rounded-full text-xs text-text-secondary bg-bg-card border border-border-default hover:border-accent/30 hover:text-accent transition-all">
            {example}
          </button>
        ))}
      </motion.div>
    </div>
  )
}
