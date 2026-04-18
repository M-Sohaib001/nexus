import { createClient, getUserWithRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentDiscoveryGrid } from '@/components/company/StudentDiscoveryGrid'

export default async function CompanyDiscover({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}) {
  const { user } = await getUserWithRole()
  if (!user) redirect('/login')

  const resolvedParams = await searchParams
  const gradYear = resolvedParams.graduation_year as string
  const availability = resolvedParams.availability as string
  const isAiNative = resolvedParams.is_ai_native_builder === 'true'
  
  const page = parseInt((resolvedParams.page as string) || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('students')
    .select('*, profiles!inner(full_name, avatar_url), fyps(title, tech_stack)', { count: 'exact' })
    .order('created_at', { foreignTable: 'fyps', ascending: false })
    .limit(1, { foreignTable: 'fyps' })

  if (gradYear) {
    query = query.eq('graduation_year', parseInt(gradYear))
  }
  if (availability) {
    query = query.eq('availability', availability)
  }
  if (isAiNative) {
    query = query.eq('is_ai_native_builder', true)
  }

  query = query.range(offset, offset + limit - 1)

  const [signalsRes, studentsRes] = await Promise.all([
    supabase
      .from('interest_signals')
      .select('student_id')
      .eq('company_id', user.id),
    query
  ])

  const signaledStudentIds = new Set(signalsRes.data?.map(s => s.student_id) || [])
  const students = studentsRes.data || []
  const count = studentsRes.count || 0
  const hasNextPage = offset + limit < count

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Discover Students</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">Find perfectly matched candidates fulfilling your company's latest hiring constraints seamlessly utilizing global tag indexing.</p>
      </div>

      <StudentDiscoveryGrid 
        initialStudents={students} 
        signaledStudentIds={Array.from(signaledStudentIds)} 
        currentPage={page}
        hasNextPage={hasNextPage}
      />
    </div>
  )
}
