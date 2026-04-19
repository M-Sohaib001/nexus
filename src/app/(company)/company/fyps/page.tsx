import { createClient, getUserWithRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FypDiscoveryGrid } from '@/components/company/FypDiscoveryGrid'

export default async function FypDiscovery({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}) {
  const { user } = await getUserWithRole()
  if (!user) redirect('/login')

  const resolvedParams = await searchParams
  const search = resolvedParams.search as string
  const tech = resolvedParams.tech as string
  
  const page = parseInt((resolvedParams.page as string) || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('fyps')
    .select('*, students!inner(*, profiles!inner(full_name, avatar_url))', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  if (tech) {
    // Basic ilike mapping searching through the tech stack array casted natively as text
    query = query.filter('tech_stack', 'cs', `{${tech}}`)
  }

  query = query.range(offset, offset + limit - 1)

  const [signalsRes, fypsRes] = await Promise.all([
    supabase
      .from('interest_signals')
      .select('student_id')
      .eq('company_id', user.id),
    query
  ])

  const signaledStudentIds = new Set(signalsRes.data?.map(s => s.student_id) || [])
  const fyps = fypsRes.data || []
  const count = fypsRes.count || 0
  const hasNextPage = offset + limit < count

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6">
      <div className="mb-8">
        <h1 className="system-header text-primary mb-3">R&D PROJECTS</h1>
        <p className="text-muted-foreground text-[11px] font-black uppercase tracking-widest max-w-2xl opacity-60">Source elite candidates directly utilizing global architectural signatures and native framework indexing mechanics.</p>
      </div>

      <FypDiscoveryGrid 
        initialFyps={fyps} 
        signaledStudentIds={Array.from(signaledStudentIds)} 
        currentPage={page}
        hasNextPage={hasNextPage}
      />
    </div>
  )
}
