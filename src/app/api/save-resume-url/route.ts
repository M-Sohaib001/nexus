import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'AUTHENTICATION_REQUIRED' }, { status: 401 })
  }

  const body = await request.json()
  const { url } = body

  if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
    return NextResponse.json({ error: 'INVALID_URL' }, { status: 400 })
  }

  const { error } = await supabase
    .from('students')
    .update({ resume_url: url })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
