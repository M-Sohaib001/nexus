import { getUserWithRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getUserWithRole()

  if (!user) redirect('/login')
  if (role) {
    redirect(role === 'student' ? '/student/dashboard' : '/company/dashboard')
  }

  return <>{children}</>
}
