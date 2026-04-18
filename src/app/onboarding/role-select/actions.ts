"use server"

import { createClient } from '@/lib/supabase/server'

export async function updateRoleAction(role: string) {
  if (role !== 'student' && role !== 'company_official') {
    return { error: 'Invalid role' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
