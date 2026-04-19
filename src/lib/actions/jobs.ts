"use server"

import { createClient } from '@/lib/supabase/server'
import { jobSchema } from '@/lib/validations/company'
import { revalidatePath } from 'next/cache'

export async function createJobAction(data: any) {
  const result = jobSchema.safeParse({ ...data, is_active: data.is_active === 'on' || data.is_active === true })
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const requirementsArray = result.data.requirements
    ? result.data.requirements.split(',').map((s: string) => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from('jobs')
    .insert({
      title: result.data.title,
      description: result.data.description,
      requirements: requirementsArray,
      location: result.data.location || null,
      type: result.data.type,
      is_active: result.data.is_active,
      company_id: user.id
    })

  if (error) return { error: error.message }

  revalidatePath('/company/jobs')
  revalidatePath('/student/jobs')
  return { success: true }
}

export async function updateJobAction(id: string, data: any) {
  const result = jobSchema.safeParse({ ...data, is_active: data.is_active === 'on' || data.is_active === true })
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const requirementsArray = result.data.requirements
    ? result.data.requirements.split(',').map((s: string) => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from('jobs')
    .update({
      title: result.data.title,
      description: result.data.description,
      requirements: requirementsArray,
      location: result.data.location || null,
      type: result.data.type,
      is_active: result.data.is_active
    })
    .eq('id', id)
    .eq('company_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/company/jobs')
  revalidatePath(`/company/jobs/${id}`)
  revalidatePath('/student/jobs')
  return { success: true }
}

export async function deleteJobAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
    .eq('company_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/company/jobs')
  revalidatePath('/student/jobs')
  return { success: true }
}
