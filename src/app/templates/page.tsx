'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'Business', 'AI', 'Finance', 'Service', 'Data', 'Social', 'Productivity']

const TEMPLATES = [
  { id: 'saas-starter', name: 'SaaS Starter', icon: '🚀', category: 'Business', desc: 'Complete SaaS boilerplate with auth, billing, and dashboard', idea: 'A SaaS starter kit with user authentication, subscription billing, and admin dashboard' },
  { id: 'ai-tool', name: 'AI Tool', icon: '🤖', category: 'AI', desc: 'AI-powered tool with Claude integration and credit system', idea: 'An AI-powered tool that uses Claude to process user inputs with a credit-based system' },
  { id: 'marketplace', name: 'Marketplace', icon: '🏪', category: 'Business', desc: 'Two-sided marketplace with listings, search, and messaging', idea: 'A two-sided marketplace where sellers can list products and buyers can search, filter, and purchase' },
  { id: 'crm', name: 'CRM', icon: '👥', category: 'Business', desc: 'Customer relationship manager for small teams', idea: 'A simple CRM for freelancers and small teams to manage contacts, deals, and follow-ups' },
  { id: 'booking', name: 'Booking Platform', icon: '📅', category: 'Service', desc: 'Online booking system with calendar and payments', idea: 'An online booking platform where service providers can manage appointments and accept payments' },
  { id: 'analytics', name: 'Analytics Dashboard', icon: '📊', category: 'Data', desc: 'Data visualization dashboard with charts and reports', idea: 'An analytics dashboard that connects to data sources and shows interactive charts and reports' },
  { id: 'community', name: 'Community Platform', icon: '💬', category: 'Social', desc: 'Community forum with posts, comments, and profiles', idea: 'A community platform with discussion forums, user profiles, and content moderation' },
  { id: 'invoice', name: 'Invoice Tool', icon: '🧾', category: 'Finance', desc: 'Invoice creation and tracking for freelancers', idea: 'An invoice management tool for freelancers to create, send, and track invoices and payments' },
  { id: 'ecommerce', name: 'E-commerce', icon: '🛒', category: 'Business', desc: 'Online store with product catalog and checkout', idea: 'A simple e-commerce store with product catalog, shopping cart, and Stripe checkout' },
  { id: 'project-manager', name: 'Project Manager', icon: '📋', category: 'Productivity', desc: 'Task and project management with Kanban boards', idea: 'A project management tool with Kanban boards, task assignments, and team collaboration' },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = TEMPLATES.filter(t => {
    if (category !== 'All' && t.category !== category) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Templates</h1>
      <p className="text-sm text-text-secondary mb-6">Start met een bewezen template</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              category === c ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-bg-card border border-border-default text-text-muted hover:text-text-secondary'
            )}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t, i) => (
          <motion.button key={t.id} onClick={() => router.push(`/new?idea=${encodeURIComponent(t.idea)}&template=${t.id}`)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-bg-card border border-border-default rounded-xl p-5 text-left hover:border-border-bright hover:-translate-y-0.5 transition-all group">
            <div className="text-3xl mb-3">{t.icon}</div>
            <h3 className="font-semibold group-hover:text-accent transition-colors">{t.name}</h3>
            <p className="text-xs text-text-muted mt-1 line-clamp-2">{t.desc}</p>
            <span className="inline-block mt-3 text-[10px] px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted">{t.category}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
