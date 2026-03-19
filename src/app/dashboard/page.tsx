import { createServiceClient } from '@/lib/supabase/server'
import { ProjectGrid } from '@/components/dashboard/ProjectGrid'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServiceClient()
  const { data: projects } = await supabase
    .from('factory_projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Al je SaaS projecten op één plek</p>
      </div>
      <ProjectGrid projects={projects || []} />
    </div>
  )
}
