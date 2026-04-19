"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, UploadCloud, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { ResumeAssistModal } from './ResumeAssistModal'

async function saveResumeUrl(url: string): Promise<{ error?: string }> {
  const res = await fetch('/api/save-resume-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const json = await res.json()
  if (!res.ok) return { error: json.error ?? 'Failed to save URL' }
  return {}
}

export function ResumeUploader({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [showAssist, setShowAssist] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are accepted.')
      setStatus('error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File must be under 5MB.')
      setStatus('error')
      return
    }

    if (!cloudName) {
      setErrorMsg('UPLOAD_FAILED — Cloud storage not configured.')
      setStatus('error')
      return
    }

    setStatus('uploading')
    setErrorMsg('')

    try {
      // Direct unsigned upload to Cloudinary
      const form = new FormData()
      form.append('file', file)
      form.append('upload_preset', 'nexus_unsigned')
      form.append('resource_type', 'raw')
      form.append('folder', 'nexus/resumes')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: 'POST', body: form }
      )
      const data = await res.json()

      if (!res.ok || !data.secure_url) {
        setErrorMsg(data.error?.message ?? 'UPLOAD_FAILED — RETRY')
        setStatus('error')
        return
      }

      const secureUrl: string = data.secure_url

      // Persist URL to DB
      const saveResult = await saveResumeUrl(secureUrl)
      if (saveResult.error) {
        setErrorMsg(`SAVE_FAILED: ${saveResult.error}`)
        setStatus('error')
        return
      }

      setUrl(secureUrl)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)

      // Optionally trigger server-side PDF parsing for Resume Assist
      try {
        const parseRes = await fetch('/api/upload-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cloudinary_url: secureUrl }),
        })
        const parseData = await parseRes.json()
        if (parseData.suggestions && (parseData.suggestions.skills?.length > 0 || parseData.suggestions.projects?.length > 0)) {
          setSuggestions(parseData.suggestions)
          setShowAssist(true)
        }
      } catch {
        // Non-blocking — parsing failure shouldn't prevent upload success
      }

    } catch (e: any) {
      console.error('RESUME_UPLOAD_ERROR:', e)
      setErrorMsg('UPLOAD_FAILED — RETRY')
      setStatus('error')
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 transition-all select-none
          ${dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border bg-muted/10 hover:border-primary/50 hover:bg-muted/20'}`}
      >
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onInputChange} />
        <UploadCloud className={`w-10 h-10 transition-colors ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
        <div className="text-center">
          <p className="font-bold text-foreground/80">
            {status === 'uploading' ? 'UPLOADING_RESUME...' : 'Drop your resume here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PDF only · Max 5MB</p>
        </div>
      </div>

      {/* Status messages */}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-black bg-red-500/10 border border-red-500/20 px-4 py-3 uppercase tracking-widest">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
          <button onClick={() => setStatus('idle')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-500 text-sm font-black bg-green-500/10 border border-green-500/20 px-4 py-3 uppercase tracking-widest">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> UPLOAD_SUCCESS — RESUME_INDEXED
        </div>
      )}

      {/* Current resume */}
      {url ? (
        <div className="flex items-center gap-3 p-4 bg-card border rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground/90 truncate">OFFICIAL_RESUME_V2</p>
            <p className="text-[10px] text-muted-foreground truncate font-mono uppercase tracking-tighter">
              SECURE_CLOUD_LINK // {url.split('/').pop()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}`, '_blank')}
            className="font-black text-[10px] uppercase tracking-widest px-6 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
          >
            VIEW_RESUME
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-6 border-2 border-dashed border-zinc-800 bg-zinc-900/10 rounded-xl opacity-50 grayscale transition-all duration-700">
          <div className="w-10 h-10 border border-zinc-700 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-zinc-600" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">STATE: NO_RESUME_UPLOADED_TO_NEXUS</p>
        </div>
      )}

      {showAssist && suggestions && (
        <ResumeAssistModal
          suggestions={suggestions}
          onClose={() => setShowAssist(false)}
        />
      )}
    </div>
  )
}
