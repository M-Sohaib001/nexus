'use client'

import { motion } from 'framer-motion'

export function SystemLoader({ message = 'INITIALIZING MODULE...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="relative w-16 h-16">
        <motion.div 
          className="absolute inset-0 border-2 border-primary/20 rounded-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 border-2 border-primary rounded-none shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-1 h-1 bg-primary animate-ping" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-primary font-mono"
        >
          {message}
        </motion.p>
        <div className="w-32 h-[1px] bg-primary/20 overflow-hidden relative">
           <motion.div 
             className="absolute inset-0 bg-primary shadow-[0_0_10px_rgba(239,68,68,0.8)]"
             animate={{ x: ['-100%', '100%'] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
           />
        </div>
      </div>
    </div>
  )
}
