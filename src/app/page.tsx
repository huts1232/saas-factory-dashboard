import { HeroInput } from '@/components/home/HeroInput'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let projectCount = 0
  try {
    const supabase = createServiceClient()
    const { count } = await supabase
      .from('factory_projects')
      .select('*', { count: 'exact', head: true })
    projectCount = count || 0
  } catch {}

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 -mt-14">
      <HeroInput />
      {projectCount > 0 && (
        <p className="mt-12 text-xs text-text-muted">
          <span className="font-mono text-accent">{projectCount}</span> SaaS-en gebouwd
        </p>
      )}
    </div>
  )
}
