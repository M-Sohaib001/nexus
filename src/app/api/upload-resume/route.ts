import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate PDF and 5MB limit server-side
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 400 })
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
  }

  const upload = new FormData()
  upload.append('file', file)
  upload.append('upload_preset', uploadPreset)
  upload.append('folder', `nexus/resumes/${user.id}`)
  upload.append('resource_type', 'raw')  // raw = non-image files (PDFs)

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    { method: 'POST', body: upload }
  )

  if (!cloudRes.ok) {
    const err = await cloudRes.json()
    return NextResponse.json({ error: err.error?.message ?? 'Upload failed' }, { status: 500 })
  }

  const { secure_url } = await cloudRes.json()

  // Persist URL to students table — RLS ensures only the owner can write
  const { error: dbError } = await supabase
    .from('students')
    .update({ resume_url: secure_url })
    .eq('id', user.id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ url: secure_url })
}
