"use client"

import { useState, useCallback } from 'react'
import { CrmConversationRow } from './CrmConversationRow'

const TAG_ORDER: Record<string, number> = {
  strong_fit: 0,
  follow_up: 1,
  not_now: 2,
  untagged: 3,
}

function sortConversations(data: any[]) {
  return [...data].sort((a, b) => {
    const tagDiff = (TAG_ORDER[a.tag] ?? 3) - (TAG_ORDER[b.tag] ?? 3)
    if (tagDiff !== 0) return tagDiff
    return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  })
}

export function CrmBoard({ initialConversations }: { initialConversations: any[] }) {
  const [conversations, setConversations] = useState(() => sortConversations(initialConversations))

  const handleTagChange = useCallback((conversationId: string, newTag: string) => {
    setConversations((prev) =>
      sortConversations(prev.map((c) => (c.id === conversationId ? { ...c, tag: newTag } : c)))
    )
  }, [])

  return (
    <div className="space-y-4">
      {conversations.map((item) => (
        <CrmConversationRow
          key={item.id}
          conversationId={item.id}
          initialTag={item.tag ?? 'untagged'}
          privateNote={item.private_note ?? ''}
          studentName={item.studentName}
          avatarUrl={item.avatarUrl}
          degreeProgram={item.degreeProgram}
          graduationYear={item.graduationYear}
          availability={item.availability}
          qrToken={item.qrToken}
          resumeUrl={item.resumeUrl}
          fypTitle={item.fypTitle}
          fypSummary={item.fypSummary}
          startedAt={item.started_at}
          onTagChange={handleTagChange}
        />
      ))}
    </div>
  )
}
