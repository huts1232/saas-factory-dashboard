import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { LayoutShell } from "@/components/layout/LayoutShell"
import { LoginModal } from "@/components/auth/LoginModal"
import { CookieBanner } from "@/components/ui/CookieBanner"

export const metadata: Metadata = {
  title: "SaaS Factory — Build a SaaS in minutes",
  description: "Describe your idea. AI builds it. Full stack Next.js + Supabase, deployed on Vercel.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <AuthProvider>
          <LoginModal />
          <CookieBanner />
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  )
}
