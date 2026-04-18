import { getUserWithRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getUserWithRole()

  if (!user) redirect('/login')
  if (!role) redirect('/onboarding/role-select')
  if (role !== 'company_official') redirect('/student/dashboard')

  return <>{children}</>
}
