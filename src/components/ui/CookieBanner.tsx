'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) {
      setShow(true)
    }
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'true')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-bg-card border border-border-default rounded-xl p-4 shadow-xl shadow-black/20"
        >
          <p className="text-xs text-text-secondary mb-3">
            We use essential cookies for authentication. No tracking or advertising cookies.
          </p>
          <div className="flex gap-2">
            <button onClick={accept}
              className="flex-1 px-3 py-1.5 rounded-lg bg-accent text-bg-primary text-xs font-semibold hover:bg-accent/90 transition-all">
              Got it
            </button>
            <a href="/privacy" className="px-3 py-1.5 rounded-lg border border-border-default text-xs text-text-muted hover:text-text-secondary transition-all">
              Learn more
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
