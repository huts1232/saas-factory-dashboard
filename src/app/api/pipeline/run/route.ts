import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { runPipeline } from '@/lib/pipeline/adapter'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max for Vercel

export async function POST(req: Request) {
  const { projectId } = await req.json()

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  // Use next/server after() to keep the function alive after response
  // This works on Vercel — the function continues running after the response is sent
  after(async () => {
    try {
      await runPipeline(projectId)
    } catch (err) {
      console.error('Pipeline background error:', err)
    }
  })

  return NextResponse.json({ started: true })
}
