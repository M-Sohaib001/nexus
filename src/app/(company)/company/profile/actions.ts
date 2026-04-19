'use server'

import { createClient } from '@/lib/supabase/server'
import { companyProfileSchema, type CompanyProfileInput } from '@/lib/validations/company'
import { revalidatePath } from 'next/cache'

export async function saveCompanyProfileAction(data: CompanyProfileInput) {
  const result = companyProfileSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('companies')
    .update(result.data)
    .eq('id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/company/profile')
  revalidatePath('/student/companies')
  return { success: true }
}
