import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse, after } from 'next/server'
import { runPipeline } from '@/lib/pipeline/adapter'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const isAdmin = body.isAdmin || false
  const startFromStep = body.startFromStep

  const supabase = createServiceClient()
  const { data: project, error } = await supabase.from('factory_projects').select('*').eq('id', id).single()
  if (error || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const resumeFrom = startFromStep || (project.current_step + 1)

  // Reset status but keep data
  await supabase.from('factory_projects').update({ status: 'pending', errors: [] }).eq('id', id)

  // Only delete logs for steps we're re-running
  if (!startFromStep) {
    await supabase.from('build_logs').delete().eq('project_id', id)
  }

  after(async () => {
    try {
      await runPipeline(id, { startFromStep: resumeFrom, isAdmin })
    } catch (err) {
      console.error('Pipeline retry error:', err)
    }
  })

  return NextResponse.json({ retrying: true, startFromStep: resumeFrom })
}
