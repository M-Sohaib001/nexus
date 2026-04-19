'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, X, Terminal, Briefcase, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { applyResumeAssistAction } from '@/app/(student)/student/dashboard/resume-actions'

interface ResumeAssistModalProps {
  suggestions: {
    skills: string[]
    projects: string[]
  }
  onClose: () => void
}

export function ResumeAssistModal({ suggestions, onClose }: ResumeAssistModalProps) {
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)

  const handleApply = async () => {
    setLoading(true)
    const result = await applyResumeAssistAction(suggestions)
    if (result.success) {
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
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-widest uppercase italic">RESUME_PARSER_ACTIVE</h2>
                  <p className="text-[10px] font-black text-primary/60 tracking-[0.2em]">INTELLIGENT_PROFILE_ASSISTANT_V1.0</p>
                </div>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8 mb-10">
              {/* Skills section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">DETECTED_SKILLS</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.skills.length > 0 ? (
                    suggestions.skills.map(skill => (
                      <div key={skill} className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Check className="w-3 h-3" /> {skill}
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] italic text-zinc-600 font-mono">NO_SKILLS_FOUND_IN_BUFFER</p>
                  )}
                </div>
              </div>

              {/* Projects section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">DETECTED_PROJECT_MARKERS</h3>
                </div>
                <div className="space-y-2">
                  {suggestions.projects.length > 0 ? (
                    suggestions.projects.map(project => (
                      <div key={project} className="p-3 bg-zinc-900/50 border border-zinc-800 text-[10px] font-bold text-zinc-300 uppercase tracking-tight flex items-center gap-3">
                        <Zap className="w-3 h-3 text-primary shrink-0" />
                        {project}
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] italic text-zinc-600 font-mono">NO_PROJECTS_FOUND_IN_BUFFER</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-primary/5 border border-primary/10">
               {applied ? (
                 <div className="w-full py-6 flex flex-col items-center justify-center gap-3 bg-green-500/10 border border-green-500/20">
                    <Check className="w-8 h-8 text-green-500 animate-bounce" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-green-500">SYSTEM_SYNCHRONIZED_SUCCESSFULLY</span>
                 </div>
               ) : (
                 <>
                  <Button 
                    onClick={handleApply}
                    disabled={loading}
                    className="flex-1 rounded-none bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-widest h-12 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    {loading ? 'SYNCHRONIZING...' : 'APPLY_TO_DIGITAL_NEXUS'}
                  </Button>
                  <Button 
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 rounded-none border-zinc-800 text-zinc-500 text-[11px] font-black uppercase tracking-widest h-12"
                  >
                    DISREGARD_SUGGESTIONS
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
