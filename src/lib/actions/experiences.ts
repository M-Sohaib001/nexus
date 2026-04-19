'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createExperience(formData: {
  title: string
  company: string
  start_date: string
  end_date?: string
  description?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('experiences')
    .insert({
      student_id: user.id,
      ...formData
    })

  if (error) throw new Error(error.message)
  revalidatePath('/student/dashboard')
}

export async function updateExperience(id: string, formData: {
  title: string
  company: string
  start_date: string
  end_date?: string
  description?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('experiences')
    .update(formData)
    .eq('id', id)
    .eq('student_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/student/dashboard')
}

export async function deleteExperience(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated')

  const { error } = await supabase
    .from('experiences')
    .delete()
    .eq('id', id)
    .eq('student_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/student/dashboard')
}
