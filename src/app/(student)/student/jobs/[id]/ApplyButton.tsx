'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { JobApplicationModal } from '@/components/student/JobApplicationModal'

export function ApplyButton({ jobId, jobTitle, companyName, hasApplied }: { jobId: string, jobTitle: string, companyName: string, hasApplied: boolean }) {
  const [showModal, setShowModal] = useState(false)

  if (hasApplied) {
    return (
      <Button disabled className="w-full md:w-auto rounded-none bg-green-500/20 text-green-500 border border-green-500/30 font-black uppercase tracking-widest px-8 py-6 h-auto cursor-not-allowed">
        APPLICATION_SUBMITTED
      </Button>
    )
  }

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        className="w-full md:w-auto rounded-none bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 py-6 h-auto shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-95"
      >
        INITIATE_APPLICATION
      </Button>

      {showModal && (
        <JobApplicationModal
          jobId={jobId}
          jobTitle={jobTitle}
          companyName={companyName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
