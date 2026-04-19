'use client'

import { useState } from 'react'
import { updateApplicationStatusAction } from '@/lib/actions/applications'
import { cn } from '@/lib/utils'

export function ApplicationStatusToggle({ applicationId, currentStatus, jobId }: { applicationId: string, currentStatus: string, jobId: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setLoading(true)
    const result = await updateApplicationStatusAction(applicationId, newStatus, jobId)
    if (result.success) {
      setStatus(newStatus)
    }
    setLoading(false)
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'accepted': return 'text-green-500 border-green-500/30 bg-green-500/10'
      case 'rejected': return 'text-red-500 border-red-500/30 bg-red-500/10'
      case 'reviewed': return 'text-blue-500 border-blue-500/30 bg-blue-500/10'
      default: return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'
    }
  }

  return (
    <select 
      value={status}
      onChange={handleStatusChange}
      disabled={loading}
      className={cn(
        "px-2 py-1 text-[9px] font-black uppercase tracking-widest border border-dashed rounded-none outline-none cursor-pointer appearance-none",
        getStatusColor(status)
      )}
    >
      <option value="pending">PENDING</option>
      <option value="reviewed">REVIEWED</option>
      <option value="accepted">ACCEPTED</option>
      <option value="rejected">REJECTED</option>
    </select>
  )
}
