"use server"

import { createClient } from '@/lib/supabase/server'
import { studentProfileSchema, fypSchema } from '@/lib/validations/student'
import { revalidatePath } from 'next/cache'

export async function saveStudentProfileAction(data: any) {
  const result = studentProfileSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('students')
    .update(result.data)
    .eq('id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function createFypAction(data: any) {
  const result = fypSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('fyps')
    .insert({
      title: result.data.title,
      summary: result.data.summary,
      description: result.data.description,
      tech_stack: result.data.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean),
      created_by: user.id
    })

  if (error) return { error: error.message }

  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function deleteFypAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('fyps')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { error: error.message }

  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function updateFypAction(id: string, data: any) {
  const result = fypSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('fyps')
    .update({
      title: result.data.title,
      summary: result.data.summary,
      description: result.data.description,
      tech_stack: result.data.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean),
    })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { error: error.message }

  revalidatePath('/student/dashboard')
  return { success: true }
}
