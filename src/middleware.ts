import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// These paths require authentication — redirect to /login if not authed
const PROTECTED_API = ['/api/connectors', '/api/credits', '/api/subscription']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect specific API routes that need auth
  // Pages use client-side login modal instead of redirect
  const isProtectedApi = PROTECTED_API.some(p => pathname.startsWith(p))
  if (!isProtectedApi) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return response
}

export const config = {
  matcher: ['/api/connectors/:path*', '/api/credits/:path*', '/api/subscription/:path*'],
}
