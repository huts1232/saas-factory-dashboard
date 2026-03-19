import { createServiceClient } from '@/lib/supabase/server'
import { HomeContent } from '@/components/home/HomeContent'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let projectCount = 0
  try {
    const supabase = createServiceClient()
    const { count } = await supabase.from('factory_projects').select('*', { count: 'exact', head: true })
    projectCount = count || 0
  } catch {}

  return <HomeContent projectCount={projectCount} />
}
