import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'AUTHENTICATION_REQUIRED' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'FILE_NOT_FOUND' }, { status: 400 })
  }

  // VALIDATION: PDF ONLY + 5MB BOUNDS
  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    return NextResponse.json({ error: 'INVALID_FORMAT: PDF_REQUIRED' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'FILE_SIZE_EXCEEDED: 5MB_LIMIT' }, { status: 400 })
  }

  // Verify Cloudinary Config
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'CLOUDINARY_NOT_CONFIGURED' }, { status: 500 })
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `nexus/resumes/${user.id}`,
          resource_type: 'raw',
          public_id: `resume_${Date.now()}`,
          format: 'pdf',
          access_mode: 'public'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    }) as any

    const secure_url = uploadResponse.secure_url

    // Persist URL to students table
    const { error: dbError } = await supabase
      .from('students')
      .update({ resume_url: secure_url })
      .eq('id', user.id)

    if (dbError) {
      return NextResponse.json({ error: `DATABASE_ERROR: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      url: secure_url,
      message: 'RESUME_UPLOAD_SUCCESS' 
    })

  } catch (error: any) {
    console.error('CLOUDINARY_UPLOAD_ERROR:', error)
    return NextResponse.json({ error: `UPLOAD_ERROR: ${error.message || 'UNKNOWN_FAILURE'}` }, { status: 500 })
  }
}
