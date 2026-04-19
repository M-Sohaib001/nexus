"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { updateConversationTag, updateConversationNote } from '@/app/(company)/company/discover/actions'

const TAG_CONFIG: Record<string, { label: string; classes: string }> = {
  strong_fit: {
    label: 'STRONG_FIT',
    classes: 'bg-primary/20 text-primary border-primary glow-border',
  },
  follow_up: {
    label: 'FOLLOW_UP',
    classes: 'bg-red-500/20 text-red-400 border-red-500/50',
  },
  not_now: {
    label: 'NOT_NOW',
    classes: 'bg-white/5 text-white/40 border-white/10',
  },
  untagged: {
    label: 'UNSET_TAG',
    classes: 'bg-white/5 text-white/20 border-white/10 opacity-50',
  },
}

const TAGS = Object.keys(TAG_CONFIG)

interface Props {
  conversationId: string
  initialTag: string
  privateNote: string
  studentName: string
  avatarUrl: string | null
  degreeProgram: string | null
  graduationYear: number | null
  availability: string | null
  qrToken: string | null
  resumeUrl: string | null
  fypTitle: string | null
  fypSummary: string | null
  startedAt: string
  onTagChange?: (conversationId: string, newTag: string) => void
}

export function CrmConversationRow({
  conversationId,
  initialTag,
  privateNote,
  studentName,
  avatarUrl,
  degreeProgram,
  graduationYear,
  availability,
  qrToken,
  resumeUrl,
  fypTitle,
  fypSummary,
  startedAt,
  onTagChange,
}: Props) {
  const [tag, setTag] = useState(initialTag)
  const [note, setNote] = useState(privateNote)
  const [isSaving, setIsSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [changingTag, setChangingTag] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setChangingTag(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTag = async (newTag: string) => {
    setTag(newTag)
    setChangingTag(false)
    onTagChange?.(conversationId, newTag)   // notify CrmBoard immediately for instant re-sort
    await updateConversationTag(conversationId, newTag)
  }

  const handleNoteBlur = async () => {
    if (note === privateNote) return
    setIsSaving(true)
    await updateConversationNote(conversationId, note)
    setIsSaving(false)
  }

  const tagCfg = TAG_CONFIG[tag] ?? TAG_CONFIG.untagged
  const availabilityLabel =
    availability === 'actively_looking'
      ? 'STATUS: ACTIVE_LOOKING'
      : availability === 'open'
      ? 'STATUS: OPEN_TO_OFFERS'
      : null

  return (
    <Card className="rounded-none border-primary/20 hover:border-primary transition-all duration-300 shadow-none bg-primary/5 group/row overflow-hidden">
      <CardContent className="p-6">
        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-none bg-primary/10 border border-primary/30 flex items-center justify-center text-xl font-black text-primary shrink-0 font-mono">
              {studentName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-black text-lg text-primary uppercase tracking-tighter truncate leading-none mb-1">{studentName}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">
                {degreeProgram ?? 'Unknown_Program'}
                {graduationYear ? ` // CLASS_${graduationYear}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Tag badge / picker */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setChangingTag((v) => !v)}
                className={`px-3 py-1 text-xs font-extrabold rounded-full border-2 uppercase tracking-wider transition-all hover:ring-2 ${tagCfg.classes}`}
              >
                {tagCfg.label}
              </button>
              {changingTag && (
                <div className="absolute right-0 top-10 z-20 bg-[#0B0F14] border border-primary/40 rounded-none shadow-[0_0_30px_rgba(59,130,246,0.1)] p-1 flex flex-col gap-0.5 min-w-[160px]">
                  {TAGS.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTag(t)}
                      className={`text-left px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-primary/10 ${tag === t ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {TAG_CONFIG[t].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {availabilityLabel && (
              <span className="px-2.5 py-0.5 bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/25">
                {availabilityLabel}
              </span>
            )}

            {resumeUrl && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/30">
                  RESUME_DETECTED
                </span>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-7 border-primary/40">
                    DOWNLOAD_DOC
                  </Button>
                </a>
              </div>
            )}

            {qrToken && (
              <Link href={`/student/${qrToken}`} target="_blank">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* ── FYP preview (always visible) ── */}
        {fypTitle && (
          <div className="mt-6 bg-[#0B0F14]/60 border border-primary/20 rounded-none px-5 py-4 relative">
            <div className="absolute -top-2 left-4 px-2 bg-[#0B0F14] text-[8px] font-black uppercase tracking-[0.3em] text-primary/60">MODULE: FEATURED_PROJECT</div>
            <p className="font-black text-sm text-primary uppercase tracking-tight">{fypTitle}</p>
            {fypSummary && (
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 line-clamp-2 opacity-60 leading-relaxed">{fypSummary}</p>
            )}
          </div>
        )}

          {expanded && (
          <div className="mt-5 space-y-3 border-t border-primary/10 pt-5">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                PRIVATE_NOTES
              </p>
              {isSaving && (
                <span className="text-[10px] text-green-500 font-extrabold uppercase animate-pulse">
                  SAVING...
                </span>
              )}
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Add evaluation notes, next steps, red flags…"
              className="min-h-[100px] resize-none text-sm bg-background/80 focus-visible:ring-primary/50 rounded-none border-primary/20"
            />
            <div className="flex justify-between items-center">
              <p className="text-[9px] text-muted-foreground font-mono opacity-40">
                LOG_TIMESTAMP: {new Date(startedAt).getTime()} // {new Date(startedAt).toLocaleDateString('en-GB')}
              </p>
              <Button
                size="sm"
                disabled={isSaving || note === privateNote}
                onClick={handleNoteBlur}
                className="rounded-none text-[10px] font-black uppercase tracking-widest h-8 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30"
                variant="ghost"
              >
                {isSaving ? 'SAVING...' : 'SAVE_NOTE'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
