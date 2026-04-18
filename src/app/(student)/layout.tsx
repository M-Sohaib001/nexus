import { getUserWithRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getUserWithRole()

  if (!user) redirect('/login')
  if (!role) redirect('/onboarding/role-select')
  if (role !== 'student') redirect('/company/dashboard')

  return <>{children}</>
}
