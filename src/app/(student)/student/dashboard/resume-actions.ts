'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyResumeAssistAction(data: { skills: string[], projects: string[] }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  // 1. Update Student Skills (Merge with existing)
  const { data: student, error: fetchError } = await supabase.from('students').select('skills').eq('id', user.id).maybeSingle()
  if (fetchError) console.error('QUERY_ERROR (resume_skills):', fetchError);
  
  const existingSkills = student?.skills || []
  const newSkills = Array.from(new Set([...existingSkills, ...data.skills])).slice(0, 15)

  const { error: skillError } = await supabase
    .from('students')
    .update({ skills: newSkills })
    .eq('id', user.id)

  if (skillError) return { error: `SKILL_SYNC_ERROR: ${skillError.message}` }

  // 2. Add as Projects (Projects, not FYPs)
  if (data.projects.length > 0) {
    const projectInserts = data.projects.map(title => ({
      title,
      description: 'Automatically detected from resume. Please refine this description.',
      student_id: user.id,
      tech_stack: data.skills.slice(0, 3) // Suggest first 3 skills as tech stack
    }))

    const { error: projectError } = await supabase
      .from('projects')
      .insert(projectInserts)

    if (projectError) return { error: `PROJECT_SYNC_ERROR: ${projectError.message}` }
  }

  revalidatePath('/student/dashboard')
  return { success: true }
}
