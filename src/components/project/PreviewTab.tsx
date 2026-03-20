'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Database, Globe, Table, Columns3, ArrowRight, Home, Settings, Users, CreditCard, BarChart3, Star, Zap, Bell, Search, ChevronDown, Check, Mail } from 'lucide-react'

interface PreviewTabProps { project: any }

function getFeatures(p: any): any[] {
  return Array.isArray(p.features) ? p.features : p.features?.features || []
}

function generateTheme(name: string) {
  const hash = (name || 'app').split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
  const hue = Math.abs(hash) % 360
  return { hue, h2: (hue + 40) % 360, accent: (hue + 180) % 360 }
}

// ===== BROWSER FRAME =====
function Browser({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-default overflow-hidden shadow-2xl shadow-black/30">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-bg-elevated border-b border-border-default">
        <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-500/70" /><div className="h-3 w-3 rounded-full bg-yellow-500/70" /><div className="h-3 w-3 rounded-full bg-green-500/70" /></div>
        <div className="flex-1 flex justify-center"><div className="px-4 py-1 rounded-lg bg-bg-primary border border-border-default text-[11px] text-text-muted font-mono">{url}</div></div>
      </div>
      <div className="overflow-y-auto max-h-[60vh] bg-white">{children}</div>
    </div>
  )
}

// =====================================================================
// PREMIUM LANDING PAGE MOCKUP
// =====================================================================
function LandingMockup({ project }: { project: any }) {
  const features = getFeatures(project)
  const name = project.product_name || 'MyApp'
  const tagline = project.tagline || 'The best tool for your needs'
  const desc = project.description || ''
  const price = project.pricing?.suggestedPrice || '$9/mo'
  const slug = name.toLowerCase().replace(/\s+/g, '')
  const t = generateTheme(name)

  return (
    <div className="text-gray-900" style={{ fontSize: '11px' }}>
      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(${t.hue}, 70%, 15%), hsl(${t.h2}, 60%, 10%))` }}>
        {/* Decorative elements */}
        <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full opacity-20" style={{ background: `radial-gradient(circle, hsl(${t.hue}, 70%, 50%), transparent)` }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-15" style={{ background: `radial-gradient(circle, hsl(${t.h2}, 70%, 50%), transparent)` }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Nav */}
        <div className="relative flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: `hsl(${t.hue}, 70%, 50%)` }}>
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-white text-sm">{name}</span>
          </div>
          <div className="flex items-center gap-5 text-[10px]">
            <span className="text-white/60">Features</span>
            <span className="text-white/60">Pricing</span>
            <span className="text-white/60">Docs</span>
            <span className="px-3 py-1.5 rounded-lg text-white font-medium" style={{ background: `hsl(${t.hue}, 70%, 50%)` }}>Get Started</span>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative px-8 pt-12 pb-16 text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] text-white/70 mb-6">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: `hsl(${t.hue}, 70%, 50%)` }} /> Now in public beta
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight mb-3">{tagline}</h1>
          <p className="text-white/50 text-xs leading-relaxed mb-6 max-w-sm mx-auto">{desc || `${name} helps you work smarter. Start free, upgrade when you're ready.`}</p>
          <div className="flex gap-2 justify-center mb-8">
            <span className="px-5 py-2 rounded-lg text-white text-[10px] font-semibold shadow-lg" style={{ background: `hsl(${t.hue}, 70%, 50%)`, boxShadow: `0 4px 14px hsla(${t.hue}, 70%, 50%, 0.4)` }}>Get Started Free →</span>
            <span className="px-5 py-2 rounded-lg border border-white/20 text-white/70 text-[10px] font-medium">See Demo</span>
          </div>
          <div className="flex justify-center gap-6 text-[9px] text-white/40">
            <span>1,000+ teams</span><span>·</span><span>50,000+ users</span><span>·</span><span>4.9/5 rating</span>
          </div>
        </div>
      </div>

      {/* ===== SOCIAL PROOF ===== */}
      <div className="px-8 py-6 border-b border-gray-100">
        <p className="text-[9px] text-gray-400 text-center mb-3">TRUSTED BY TEAMS AT</p>
        <div className="flex justify-center gap-8 opacity-30">
          {['Acme Corp', 'TechFlow', 'DataSync', 'CloudBase', 'NexGen'].map(c => (
            <span key={c} className="text-[10px] font-bold text-gray-900 tracking-wider">{c.toUpperCase()}</span>
          ))}
        </div>
      </div>

      {/* ===== FEATURES — BENTO GRID ===== */}
      <div className="px-8 py-10">
        <p className="text-center text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: `hsl(${t.hue}, 70%, 50%)` }}>Features</p>
        <h2 className="text-lg font-bold text-center text-gray-900 mb-8">Everything you need</h2>

        {features.length > 0 ? (
          <div className="space-y-3">
            {/* Big feature card */}
            <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(${t.hue}, 60%, 95%), hsl(${t.h2}, 60%, 95%))` }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20" style={{ background: `hsl(${t.hue}, 70%, 50%)`, filter: 'blur(30px)' }} />
              <div className="relative">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `hsl(${t.hue}, 70%, 50%)` }}>
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{features[0]?.name || 'Core Feature'}</h3>
                <p className="text-[10px] text-gray-600 leading-relaxed max-w-md">{features[0]?.description || 'The main feature that powers everything.'}</p>
              </div>
            </div>
            {/* 2x2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.slice(1, 5).map((f: any, i: number) => {
                const icons = [BarChart3, Users, CreditCard, Star]
                const Icon = icons[i % icons.length]
                return (
                  <div key={i} className="rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110" style={{ background: `hsl(${(t.hue + i * 30) % 360}, 60%, 94%)` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: `hsl(${(t.hue + i * 30) % 360}, 60%, 45%)` }} />
                    </div>
                    <h3 className="text-[10px] font-bold text-gray-900 mb-0.5">{f.name}</h3>
                    <p className="text-[8px] text-gray-500 leading-relaxed">{f.description?.slice(0, 60) || 'Powerful feature for your workflow.'}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {['Analytics', 'Collaboration', 'Automation', 'Security'].map((f, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-4">
                <div className="h-7 w-7 rounded-lg bg-gray-100 mb-2" /><p className="text-[10px] font-bold text-gray-900">{f}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <div className="px-8 py-8 bg-gray-50">
        <h2 className="text-sm font-bold text-center text-gray-900 mb-6">Loved by teams</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Sarah K.', role: 'Product Manager', quote: `${name} transformed how our team works. Can't imagine going back.` },
            { name: 'Mike R.', role: 'CTO, StartupX', quote: 'The best investment we made this year. Setup took 5 minutes.' },
            { name: 'Lisa M.', role: 'Founder', quote: 'Finally a tool that just works. Our productivity doubled.' },
          ].map((t2, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex gap-0.5 mb-2">{[0,1,2,3,4].map(s => <Star key={s} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />)}</div>
              <p className="text-[8px] text-gray-600 italic leading-relaxed mb-2">&ldquo;{t2.quote}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ background: `hsl(${(t.hue + i * 60) % 360}, 50%, 50%)` }}>{t2.name[0]}</div>
                <div><p className="text-[8px] font-medium text-gray-900">{t2.name}</p><p className="text-[7px] text-gray-400">{t2.role}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== PRICING ===== */}
      <div className="px-8 py-10">
        <p className="text-center text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: `hsl(${t.hue}, 70%, 50%)` }}>Pricing</p>
        <h2 className="text-sm font-bold text-center text-gray-900 mb-6">Start free, scale as you grow</h2>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] font-bold text-gray-900">Free</p>
            <p className="text-xl font-bold text-gray-900 mt-1">$0</p>
            <p className="text-[8px] text-gray-500 mt-0.5 mb-3">For individuals</p>
            <div className="space-y-1.5 mb-4">
              {['Basic features', 'Up to 3 projects', 'Community support'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-[8px] text-gray-600"><Check className="h-2.5 w-2.5 text-gray-400" /> {f}</div>
              ))}
            </div>
            <div className="w-full py-1.5 rounded-lg border border-gray-200 text-[9px] font-medium text-gray-700 text-center">Get started</div>
          </div>
          <div className="rounded-xl p-4 relative" style={{ background: `linear-gradient(135deg, hsl(${t.hue}, 70%, 50%), hsl(${t.h2}, 70%, 50%))` }}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white rounded-full text-[7px] font-bold shadow" style={{ color: `hsl(${t.hue}, 70%, 50%)` }}>POPULAR</div>
            <p className="text-[10px] font-bold text-white/90">Pro</p>
            <p className="text-xl font-bold text-white mt-1">{price.replace('/mo', '')}<span className="text-[9px] font-normal text-white/60">/mo</span></p>
            <p className="text-[8px] text-white/60 mt-0.5 mb-3">For professionals</p>
            <div className="space-y-1.5 mb-4">
              {['Everything in Free', 'Unlimited projects', 'Priority support', 'Advanced analytics', 'Custom integrations'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-[8px] text-white/80"><Check className="h-2.5 w-2.5 text-white/60" /> {f}</div>
              ))}
            </div>
            <div className="w-full py-1.5 rounded-lg bg-white text-[9px] font-semibold text-center" style={{ color: `hsl(${t.hue}, 70%, 40%)` }}>Start free trial</div>
          </div>
        </div>
      </div>

      {/* ===== CTA ===== */}
      <div className="relative overflow-hidden py-10" style={{ background: `linear-gradient(135deg, hsl(${t.hue}, 70%, 15%), hsl(${t.h2}, 60%, 10%))` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), transparent 50%)' }} />
        <div className="relative text-center px-8">
          <h2 className="text-lg font-bold text-white mb-2">Ready to get started?</h2>
          <p className="text-[10px] text-white/50 mb-5">Join thousands of teams already using {name}</p>
          <div className="flex justify-center gap-2 max-w-xs mx-auto">
            <input className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-[10px] text-white placeholder-white/30" placeholder="Enter your email" />
            <span className="px-4 py-2 rounded-lg text-[10px] text-white font-semibold" style={{ background: `hsl(${t.hue}, 70%, 50%)` }}>Start free</span>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="px-8 py-6 border-t border-gray-100">
        <div className="flex justify-between text-[8px] text-gray-400">
          <span>© 2026 {name}. All rights reserved.</span>
          <div className="flex gap-4"><span>Privacy</span><span>Terms</span><span>Contact</span></div>
        </div>
      </div>
    </div>
  )
}

// =====================================================================
// PREMIUM DASHBOARD MOCKUP
// =====================================================================
function DashboardMockup({ project }: { project: any }) {
  const features = getFeatures(project)
  const name = project.product_name || 'MyApp'
  const t = generateTheme(name)

  return (
    <div className="flex min-h-[480px]" style={{ fontSize: '10px' }}>
      {/* Sidebar */}
      <div className="w-40 flex-shrink-0 flex flex-col" style={{ background: `hsl(${t.hue}, 30%, 8%)` }}>
        <div className="px-3 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-lg flex items-center justify-center" style={{ background: `hsl(${t.hue}, 70%, 50%)` }}><Zap className="h-2.5 w-2.5 text-white" /></div>
            <span className="font-bold text-white text-[11px]">{name}</span>
          </div>
        </div>
        <div className="p-2 space-y-0.5 flex-1">
          <NavItem icon={Home} label="Dashboard" active hue={t.hue} />
          {features.slice(0, 4).map((f: any, i: number) => {
            const icons = [BarChart3, Users, CreditCard, Star]
            return <NavItem key={i} icon={icons[i % icons.length]} label={f.name?.split(' ')[0] || 'Feature'} hue={t.hue} />
          })}
          <NavItem icon={Settings} label="Settings" hue={t.hue} />
        </div>
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: `hsl(${t.hue}, 50%, 50%)` }}>S</div>
            <div><p className="text-[9px] text-white/80 font-medium">Sarah</p><p className="text-[7px] text-white/30">Pro plan</p></div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 bg-gray-50 p-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-sm font-bold text-gray-900">Welcome back, Sarah 👋</p><p className="text-[9px] text-gray-500">Here&apos;s what&apos;s happening today</p></div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-gray-200"><Search className="h-3 w-3 text-gray-400" /><span className="text-[8px] text-gray-400">Search...</span></div>
            <div className="relative"><Bell className="h-4 w-4 text-gray-400" /><div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" style={{ background: `hsl(${t.hue}, 70%, 50%)` }} /></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total Users', value: '2,847', change: '+12.5%', up: true },
            { label: 'Revenue', value: '$14,290', change: '+23.1%', up: true },
            { label: 'Active Now', value: '184', change: '+5.4%', up: true },
            { label: 'Conversion', value: '3.2%', change: '-0.8%', up: false },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-[8px] text-gray-500 mb-1">{s.label}</p>
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
              <p className={`text-[8px] mt-0.5 ${s.up ? 'text-green-600' : 'text-red-500'}`}>{s.change} vs last month</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold text-gray-900">Revenue Overview</p>
            <div className="flex gap-1">{['1W', '1M', '3M', '1Y'].map(p => <span key={p} className={`px-2 py-0.5 rounded text-[7px] font-medium ${p === '1M' ? 'text-white' : 'text-gray-400 bg-gray-50'}`} style={p === '1M' ? { background: `hsl(${t.hue}, 70%, 50%)` } : {}}>{p}</span>)}</div>
          </div>
          {/* SVG Line Chart */}
          <svg viewBox="0 0 400 100" className="w-full h-20">
            <defs>
              <linearGradient id={`grad-${t.hue}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`hsl(${t.hue}, 70%, 50%)`} stopOpacity="0.3" />
                <stop offset="100%" stopColor={`hsl(${t.hue}, 70%, 50%)`} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,80 C30,70 60,75 100,60 C140,45 170,50 200,35 C230,20 260,30 300,15 C340,5 370,10 400,5" fill="none" stroke={`hsl(${t.hue}, 70%, 50%)`} strokeWidth="2" />
            <path d="M0,80 C30,70 60,75 100,60 C140,45 170,50 200,35 C230,20 260,30 300,15 C340,5 370,10 400,5 L400,100 L0,100 Z" fill={`url(#grad-${t.hue})`} />
          </svg>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50 flex justify-between"><p className="text-[9px] font-semibold text-gray-900">Recent Activity</p><p className="text-[8px] font-medium" style={{ color: `hsl(${t.hue}, 70%, 50%)` }}>View all →</p></div>
          {['Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'Alex Turner', 'Lisa Park'].map((n, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ background: `hsl(${(t.hue + i * 50) % 360}, 45%, 55%)` }}>{n[0]}</div>
              <div className="flex-1"><p className="text-[9px] font-medium text-gray-900">{n}</p><p className="text-[7px] text-gray-400">Signed up · {i + 1}h ago</p></div>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${i < 3 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{i < 3 ? 'Active' : 'Trial'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active, hue }: { icon: any; label: string; active?: boolean; hue: number }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] ${active ? 'text-white font-medium' : 'text-white/40'}`}
      style={active ? { background: `hsla(${hue}, 70%, 50%, 0.15)` } : {}}>
      <Icon className="h-3 w-3" style={active ? { color: `hsl(${hue}, 70%, 60%)` } : {}} /> {label}
    </div>
  )
}

// =====================================================================
// PREMIUM ADMIN MOCKUP
// =====================================================================
function AdminMockup({ project }: { project: any }) {
  const name = project.product_name || 'MyApp'
  const t = generateTheme(name)

  return (
    <div className="flex min-h-[480px]" style={{ fontSize: '10px', background: `hsl(${t.hue}, 20%, 5%)` }}>
      <div className="w-36 flex-shrink-0 border-r border-white/5 p-2" style={{ background: `hsl(${t.hue}, 25%, 4%)` }}>
        <p className="text-[10px] font-bold text-white px-3 py-3 mb-2">{name} Admin</p>
        {[{ l: 'Analytics', a: true }, { l: 'Users', a: false }, { l: 'Revenue', a: false }, { l: 'Settings', a: false }, { l: 'Billing', a: false }].map((n, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg text-[9px] mb-0.5 ${n.a ? 'text-white' : 'text-white/30'}`}
            style={n.a ? { background: `hsla(${t.hue}, 70%, 50%, 0.15)`, color: `hsl(${t.hue}, 70%, 70%)` } : {}}>
            {['📊', '👥', '💰', '⚙️', '💳'][i]} {n.l}
          </div>
        ))}
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm font-bold text-white mb-4">Platform Overview</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'Users', v: '2,847' }, { l: 'MRR', v: '$14.3K' }, { l: 'Active', v: '1,892' }, { l: 'Churn', v: '2.1%' }].map((s, i) => (
            <div key={i} className="rounded-xl border border-white/5 p-3" style={{ background: `hsla(${(t.hue + i * 20) % 360}, 50%, 50%, 0.08)` }}>
              <p className="text-[8px] text-white/40">{s.l}</p>
              <p className="text-sm font-bold text-white">{s.v}</p>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div className="rounded-xl border border-white/5 p-3 mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[9px] font-semibold text-white mb-3">MRR Growth</p>
          <div className="flex items-end gap-0.5 h-20">
            {[30, 35, 40, 38, 45, 50, 48, 55, 60, 58, 65, 72, 70, 78, 85].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `hsl(${t.hue}, 70%, ${50 + (i / 15) * 15}%)`, opacity: 0.8 }} />
            ))}
          </div>
        </div>
        {/* Users */}
        <div className="rounded-xl border border-white/5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="px-3 py-2 border-b border-white/5"><p className="text-[9px] font-semibold text-white">Recent Users</p></div>
          {['Sarah J. — Pro', 'Mike C. — Free', 'Emma W. — Pro', 'Alex T. — Enterprise'].map((u, i) => {
            const [n, plan] = u.split(' — ')
            return (
              <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0">
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-[7px] text-white font-bold" style={{ background: `hsl(${(t.hue + i * 40) % 360}, 45%, 45%)` }}>{n[0]}</div>
                <span className="text-[9px] text-white flex-1">{n}</span>
                <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{ background: `hsla(${t.hue}, 50%, 50%, 0.15)`, color: `hsl(${t.hue}, 60%, 70%)` }}>{plan}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// =====================================================================
// MAIN PREVIEW TAB
// =====================================================================
export function PreviewTab({ project }: PreviewTabProps) {
  const [view, setView] = useState<'landing' | 'dashboard' | 'admin'>('landing')
  const name = project.product_name || 'app'
  const slug = name.toLowerCase().replace(/\s+/g, '')
  const arch = project.architecture

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-bg-secondary rounded-lg p-1 w-fit">
        {([['landing', 'Landing Page'], ['dashboard', 'Dashboard'], ['admin', 'Admin Panel']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setView(key as any)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${view === key ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>{label}</button>
        ))}
      </div>

      {/* Mockup in browser frame */}
      <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <Browser url={`${slug}.com${view === 'dashboard' ? '/dashboard' : view === 'admin' ? '/admin' : ''}`}>
          {view === 'landing' && <LandingMockup project={project} />}
          {view === 'dashboard' && <DashboardMockup project={project} />}
          {view === 'admin' && <AdminMockup project={project} />}
        </Browser>
      </motion.div>

      {/* Technical details (collapsible) */}
      {arch && (
        <details className="group">
          <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">Technical Details ({(arch.database?.tables || []).length} tables, {(arch.fileStructure || []).length} files, {(arch.apiRoutes || []).length} routes)</summary>
          <div className="mt-3 space-y-3">
            {(arch.database?.tables || []).length > 0 && (
              <div className="bg-bg-card border border-border-default rounded-xl p-4">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Database className="h-3 w-3 text-accent-green" /> Database</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(arch.database.tables || []).map((tbl: any, i: number) => (
                    <div key={i} className="text-[10px]"><span className="font-mono text-accent-green">{tbl.name}</span> <span className="text-text-muted">({(tbl.columns || []).length} cols)</span></div>
                  ))}
                </div>
              </div>
            )}
            {(arch.apiRoutes || []).length > 0 && (
              <div className="bg-bg-card border border-border-default rounded-xl p-4">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Globe className="h-3 w-3 text-accent-purple" /> API Routes</h4>
                <div className="space-y-1">
                  {(arch.apiRoutes || []).slice(0, 8).map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <span className={cn('font-mono font-bold px-1 rounded', r.method === 'GET' ? 'text-green-400' : r.method === 'POST' ? 'text-blue-400' : 'text-yellow-400')}>{r.method}</span>
                      <span className="font-mono text-text-secondary">{r.path}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  )
}
