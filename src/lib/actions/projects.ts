"use server"

import { createClient } from '@/lib/supabase/server'
import { projectSchema } from '@/lib/validations/student'
import { revalidatePath } from 'next/cache'

export async function createProjectAction(data: any) {
  const result = projectSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('projects')
    .insert({
      title: result.data.title,
      description: result.data.description,
      tech_stack: result.data.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean),
      github_url: result.data.github_url || null,
      live_url: result.data.live_url || null,
      student_id: user.id
    })

  if (error) return { error: error.message }

  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('student_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function updateProjectAction(id: string, data: any) {
  const result = projectSchema.safeParse(data)
  if (!result.success) return { error: result.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('projects')
    .update({
      title: result.data.title,
      description: result.data.description,
      tech_stack: result.data.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean),
      github_url: result.data.github_url || null,
      live_url: result.data.live_url || null
    })
    .eq('id', id)
    .eq('student_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/student/dashboard')
  return { success: true }
}
