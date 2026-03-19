import { NextResponse, after } from 'next/server'
import { runPipeline } from '@/lib/pipeline/adapter'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(req: Request) {
  const { projectId, startFromStep, isAdmin } = await req.json()

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  after(async () => {
    try {
      await runPipeline(projectId, { startFromStep, isAdmin })
    } catch (err) {
      console.error('Pipeline background error:', err)
    }
  })

  return NextResponse.json({ started: true })
}
