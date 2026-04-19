'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, FileText, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { applyToJobAction } from '@/lib/actions/applications'

interface JobApplicationModalProps {
  jobId: string
  jobTitle: string
  companyName: string
  onClose: () => void
}

export function JobApplicationModal({ jobId, jobTitle, companyName, onClose }: JobApplicationModalProps) {
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError] = useState('')

  const handleApply = async () => {
    setLoading(true)
    setError('')
    const result = await applyToJobAction(jobId, coverLetter)
    if (result.error) {
      setError(result.error)
    } else {
      setApplied(true)
      setTimeout(onClose, 2000)
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#0B0F14] border-2 border-primary/30 w-full max-w-xl overflow-hidden relative"
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #EF4444 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-widest uppercase italic">DEPLOY_APPLICATION</h2>
                  <p className="text-[10px] font-black text-primary/60 tracking-[0.2em]">TARGET: {companyName}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              <div className="p-4 bg-primary/5 border border-primary/10">
                <p className="text-xs uppercase text-zinc-400 font-bold mb-1">APPLYING FOR:</p>
                <p className="text-primary text-lg font-black uppercase">{jobTitle}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">OPTIONAL_ATTACHMENT: COVER_LETTER</h3>
                </div>
                <Textarea 
                  placeholder="Express your interest in this role and why you're a good fit..."
                  className="system-input min-h-[120px]"
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                />
              </div>
              
              {error && (
                <div className="p-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border bg-red-500/10 border-red-500/20 text-red-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-4 p-6 bg-primary/5 border border-primary/10">
               {applied ? (
                 <div className="w-full py-6 flex flex-col items-center justify-center gap-3 bg-green-500/10 border border-green-500/20">
                    <Check className="w-8 h-8 text-green-500 animate-bounce" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-green-500">APPLICATION_TRANSMITTED_SUCCESSFULLY</span>
                 </div>
               ) : (
                 <>
                  <Button 
                    onClick={handleApply}
                    disabled={loading}
                    className="flex-1 rounded-none bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-widest h-12 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    {loading ? 'TRANSMITTING...' : 'SUBMIT_APPLICATION'}
                  </Button>
                  <Button 
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 rounded-none border-zinc-800 text-zinc-500 text-[11px] font-black uppercase tracking-widest h-12"
                  >
                    ABORT_PROCESS
                  </Button>
                 </>
               )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
