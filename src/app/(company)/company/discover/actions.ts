"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleInterestSignalAction(studentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthenticated" }

  // Check if signal exists preventing violations directly via explicit checks enabling toggles
  const { data: existingSignal } = await supabase
    .from('interest_signals')
    .select('id')
    .eq('company_id', user.id)
    .eq('student_id', studentId)
    .maybeSingle()

  if (existingSignal) {
    // Unlike/Remove Interest
    const { error } = await supabase
      .from('interest_signals')
      .delete()
      .eq('id', existingSignal.id)
      
    if (error) return { error: error.message }
  } else {
    // Add Interest
    const { error } = await supabase
      .from('interest_signals')
      .insert({
        company_id: user.id,
        student_id: studentId
      })
      
    if (error) return { error: error.message }
  }

  revalidatePath('/company/discover')
  return { success: true }
}

export async function updateConversationTag(id: string, tag: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('conversations')
    .update({ tag })
    .eq('id', id)
    .eq('company_id', user.id)

  return error ? { error: error.message } : { success: true }
}

export async function updateConversationNote(id: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthenticated" }

  const { error } = await supabase
    .from('conversations')
    .update({ private_note: note })
    .eq('id', id)
    .eq('company_id', user.id)

  return error ? { error: error.message } : { success: true }
}
