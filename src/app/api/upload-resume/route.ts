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

    // PHASE 21: RESUME ASSIST EXTRACTION
    let suggestions = {
      skills: [] as string[],
      projects: [] as string[]
    }

    try {
      // Dynamic require to avoid build-time static optimization issues with CJS/ESM hybrid modules
      const pdf = require('pdf-parse')
      const pdfData = await pdf(buffer)
      const text = pdfData.text
      const textLower = text.toLowerCase()

      // Skill Detection (Common Tech Stack)
      const techKeywords = [
        'react', 'next.js', 'typescript', 'javascript', 'node.js', 'python', 'django', 
        'flask', 'fastapi', 'postgresql', 'mongodb', 'supabase', 'firebase', 'aws', 
        'docker', 'kubernetes', 'tensorflow', 'pytorch', 'machine learning', 'deep learning',
        'java', 'spring', 'c++', 'rust', 'go', 'flutter', 'react native', 'tailwind', 'css'
      ]

      suggestions.skills = techKeywords.filter(skill => textLower.includes(skill.toLowerCase()))

      // Project Detection (Heuristics - looking for capitalized lines that look like titles)
      const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 5)
      const projectMarkers = ['project', 'built', 'developed', 'application']
      
      suggestions.projects = lines.filter((line: string) => {
        const lineLower = line.toLowerCase()
        const hasMarker = projectMarkers.some(m => lineLower.includes(m))
        const isCapitalized = /^[A-Z]/.test(line)
        const isNotTooLong = line.length < 100
        return (hasMarker && isCapitalized && isNotTooLong)
      }).slice(0, 3) // Limit to 3 suggestions

    } catch (parseError) {
      console.error('PDF_PARSE_ERROR:', parseError)
      // Non-blocking for upload
    }

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
      suggestions,
      message: 'RESUME_UPLOAD_SUCCESS' 
    })

  } catch (error: any) {
    console.error('CLOUDINARY_UPLOAD_ERROR:', error)
    return NextResponse.json({ error: `UPLOAD_ERROR: ${error.message || 'UNKNOWN_FAILURE'}` }, { status: 500 })
  }
}
