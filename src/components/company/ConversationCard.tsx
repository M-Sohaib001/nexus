"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { updateConversationTag, updateConversationNote } from '@/app/(company)/company/discover/actions'

const TAGS = [
  { id: 'strong_fit', label: 'STRONG_FIT', color: 'bg-primary/20 text-primary border-primary glow-border' },
  { id: 'follow_up', label: 'FOLLOW_UP', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' },
  { id: 'not_now', label: 'NOT_NOW', color: 'bg-white/5 text-white/40 border-white/10' },
  { id: 'untagged', label: 'UNTRIAGED', color: 'bg-white/5 text-white/20 border-white/10 opacity-50' }
]

export function ConversationCard({ initialConversation, studentName }: { initialConversation: any, studentName: string }) {
  const supabase = createClient()
  const [conversation, setConversation] = useState(initialConversation)
  const [note, setNote] = useState(initialConversation.private_note || '')
  const [isSaving, setIsSaving] = useState(false)
  const channelRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any pending debounced cleanup natively preventing React strict mode unmount traps!
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!channelRef.current) {
      channelRef.current = supabase.channel(`conversation-${conversation.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${conversation.id}` },
          (payload) => {
            setConversation(payload.new)
            if (document.activeElement?.id !== 'private_note_editor') {
               setNote(payload.new.private_note || '')
            }
          }
        )
        .subscribe()
    }

    return () => {
      timeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
          channelRef.current = null
        }
      }, 150)
    }
  }, [conversation.id, supabase])

  const handleTag = async (tagId: string) => {
    setConversation({ ...conversation, tag: tagId }) // Optimistic Update executed!
    await updateConversationTag(conversation.id, tagId)
  }

  const handleNoteBlur = async () => {
    if (note === conversation.private_note) return
    setIsSaving(true)
    await updateConversationNote(conversation.id, note)
    setIsSaving(false)
  }

  return (
    <Card className="rounded-none border-primary/20 shadow-none bg-primary/5 backdrop-blur-md overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/20 pb-6">
        <CardTitle className="system-header text-primary">INTERACTION_RECORD</CardTitle>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">CANDIDATE_TAG: <span className="text-primary font-black">{studentName}</span></p>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        <div className="space-y-4">
          <label className="system-label text-primary/70">MODULE: ALIGNMENT_PARAM</label>
          <div className="grid grid-cols-2 gap-2">
            {TAGS.map(t => (
              <Button 
                key={t.id}
                variant="outline"
                className={`w-full justify-center rounded-none font-black text-[9px] uppercase tracking-widest border transition-all ${conversation.tag === t.id ? t.color : 'bg-background hover:bg-primary/5 border-primary/10 text-muted-foreground'}`}
                onClick={() => handleTag(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="system-label text-primary/70">MODULE: PRIVATE_RECORD_NOTES</label>
            {isSaving && <span className="text-[9px] text-primary font-black uppercase animate-pulse">AUTO_SYNC_ACTIVE...</span>}
          </div>
          <Textarea 
            id="private_note_editor"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Initialize evaluation string. Securely synchronized across primary recruitment channels..."
            className="min-h-[250px] rounded-none border-primary/20 resize-none focus-visible:ring-primary/40 text-xs font-mono p-5 bg-background/50 placeholder:opacity-30"
          />
          <div className="p-3 bg-primary/5 border border-primary/10">
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed opacity-60">
              Handshake established via isolated secure tunnel. Node isolation active. Data localized to recruiter authority bounds.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
