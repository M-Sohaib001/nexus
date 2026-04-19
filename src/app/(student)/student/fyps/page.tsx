import { createClient, getUserWithRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentFypDiscoveryGrid } from '@/components/student/StudentFypDiscoveryGrid'

export default async function StudentFypDiscoveryPage({
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
    const tL = tech.toLowerCase()
    const tU = tech.toUpperCase()
    const tC = tL.charAt(0).toUpperCase() + tL.slice(1)
    query = query.or(`tech_stack.cs.{${tech}},tech_stack.cs.{${tL}},tech_stack.cs.{${tU}},tech_stack.cs.{${tC}}`)
  }

  query = query.range(offset, offset + limit - 1)

  const { data: fypsRes, count } = await query

  const fyps = fypsRes || []
  const totalCount = count || 0
  const hasNextPage = offset + limit < totalCount

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6">
      <div className="mb-8">
        <h1 className="system-header text-primary mb-3">SYSTEM_R&D_PROJECTS</h1>
        <p className="text-muted-foreground text-[11px] font-black uppercase tracking-widest max-w-2xl opacity-60">
          Discover and evaluate architectural signatures and final year deployments built natively across the ecosystem by peers.
        </p>
      </div>

      <StudentFypDiscoveryGrid 
        initialFyps={fyps} 
        currentPage={page}
        hasNextPage={hasNextPage}
      />
    </div>
  )
}
