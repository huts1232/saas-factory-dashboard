'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  role: string
  content: string
  timestamp: string
}

interface ChatBarProps {
  projectId: string
  messages: ChatMessage[]
  onUpdate: () => void
}

export function ChatBar({ projectId, messages, onUpdate }: ChatBarProps) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages || [])
  const [showHistory, setShowHistory] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalMessages(messages || [])
  }, [messages])

  useEffect(() => {
    if (showHistory) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages.length, showHistory])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    const msg = input.trim()
    setInput('')
    setSending(true)
    setShowHistory(true)

    setLocalMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date().toISOString() }])

    try {
      const res = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()

      if (data.reply) {
        setLocalMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date().toISOString() }])
      }

      if (data.updated) onUpdate()
    } catch {
      setLocalMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again.', timestamp: new Date().toISOString() }])
    }

    setSending(false)
  }

  return (
    <div className="fixed bottom-0 left-56 right-0 z-30">
      {/* Chat history */}
      <AnimatePresence>
        {showHistory && localMessages.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-bg-secondary/95 backdrop-blur-xl border-t border-border-default overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto px-6 py-3 space-y-2">
              {localMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-bg-elevated text-text-secondary'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-xl bg-bg-elevated">
                    <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <button onClick={() => setShowHistory(false)}
              className="w-full text-center py-1 text-[10px] text-text-muted hover:text-text-secondary border-t border-border-default">
              Hide chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="bg-bg-secondary/95 backdrop-blur-xl border-t border-border-default px-6 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-3 max-w-4xl mx-auto">
          <button type="button" onClick={() => setShowHistory(!showHistory)}
            className="text-text-muted hover:text-text-secondary transition-colors relative">
            <MessageSquare className="h-5 w-5" />
            {localMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent text-[8px] text-bg-primary flex items-center justify-center font-bold">
                {localMessages.length}
              </span>
            )}
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for changes... e.g. 'add a dark mode' or 'change pricing to $15/mo'"
              className="w-full bg-bg-card border border-border-default rounded-xl px-4 py-2.5 pr-12 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent/50 transition-all"
              disabled={sending}
            />
            <button type="submit" disabled={!input.trim() || sending}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg bg-accent/80 hover:bg-accent flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              {sending ? <Loader2 className="h-3 w-3 animate-spin text-bg-primary" /> : <Send className="h-3 w-3 text-bg-primary" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
