"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyToJobAction(jobId: string, coverLetter?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      student_id: user.id,
      cover_letter: coverLetter || null,
      status: 'pending'
    })

  if (error) {
    if (error.code === '23505') return { error: "You have already applied to this job." }
    return { error: error.message }
  }

  revalidatePath('/student/jobs')
  revalidatePath(`/student/jobs/${jobId}`)
  return { success: true }
}

export async function updateApplicationStatusAction(applicationId: string, status: string, jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  // RLS ensures only the company that owns the job can update it
  const { error } = await supabase
    .from('job_applications')
    .update({ status })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  revalidatePath(`/company/jobs/${jobId}`)
  return { success: true }
}
