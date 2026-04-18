"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function BootScreen() {
  const [complete, setComplete] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  
  const sequence = [
    "INITIALIZING NEXUS_OS v2.0.26...",
    "LOADING CORE MODULES...",
    "ESTABLISHING SECURE SUPABASE TUNNEL...",
    "AUTH_SYSTEM: READY",
    "REALTIME_CHANNELS: ACTIVE",
    "SYSTEM_INTERFACE: BRUTE_LOGIC_ENGAGED",
    "BOOT_SEQUENCE_COMPLETE."
  ]

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      if (current < sequence.length) {
        setLogs(prev => [...prev, `> ${sequence[current]}`])
        current++
      } else {
        clearInterval(interval)
        setTimeout(() => setComplete(true), 500)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [])

  if (complete) return null

  return (
    <div className="fixed inset-0 z-[999] bg-[#0B0F14] flex flex-col items-start justify-center p-8 md:p-24 font-mono text-primary animate-out duration-1000 fade-out fill-mode-forwards">
      <div className="space-y-2 max-w-2xl">
        {logs.map((log, i) => (
          <div key={i} className={cn(
            "text-sm md:text-md tracking-widest",
            i === logs.length - 1 && "animate-pulse"
          )}>
            {log}
          </div>
        ))}
      </div>
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">FAST NUCES DEVELOPER'S DAY 2026</p>
          <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em]">REFINING DESIGN VIA BRUTE_LOGIC</p>
        </div>
        <div className="w-16 h-1 bg-primary/20 overflow-hidden">
          <div className="w-full h-full bg-primary animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  )
}
