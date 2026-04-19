"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, UploadCloud, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react'
import { ResumeAssistModal } from './ResumeAssistModal'

export function ResumeUploader({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [showAssist, setShowAssist] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

    setStatus('uploading')
    setErrorMsg('')
    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/upload-resume', { method: 'POST', body: form })
    const json = await res.json()

    if (!res.ok) {
      setErrorMsg(json.error ?? 'Upload failed.')
      setStatus('error')
      return
    }

    setUrl(json.url)
    if (json.suggestions && (json.suggestions.skills.length > 0 || json.suggestions.projects.length > 0)) {
      setSuggestions(json.suggestions)
      setShowAssist(true)
    }
    setStatus('success')
    setTimeout(() => setStatus('idle'), 3000)
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
            {status === 'uploading' ? 'Uploading…' : 'Drop your resume here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PDF only · Max 5MB</p>
        </div>
      </div>

      {/* Status messages */}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
          <button onClick={() => setStatus('idle')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Resume uploaded successfully!
        </div>
      )}

      {/* Current resume */}
      {url && (
        <div className="flex items-center gap-3 p-4 bg-card border rounded-xl shadow-sm">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground/90 truncate">Current Resume</p>
            <p className="text-xs text-muted-foreground truncate">{url.split('/').pop()}</p>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="font-bold shrink-0">View</Button>
          </a>
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
