import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse, after } from 'next/server'
import { runPipeline } from '@/lib/pipeline/adapter'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: project, error } = await supabase
    .from('factory_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Reset status
  await supabase
    .from('factory_projects')
    .update({ status: 'pending', errors: [] })
    .eq('id', id)

  // Delete old logs so pipeline creates fresh ones
  await supabase
    .from('build_logs')
    .delete()
    .eq('project_id', id)

  // Run pipeline in background using after()
  after(async () => {
    try {
      await runPipeline(id)
    } catch (err) {
      console.error('Pipeline retry error:', err)
    }
  })

  return NextResponse.json({ retrying: true })
}
