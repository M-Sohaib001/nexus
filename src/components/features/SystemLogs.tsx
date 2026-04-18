"use client"

import { usePathname } from "next/navigation"

export function SystemLogs({ role }: { role?: string }) {
  const pathname = usePathname()
  const module = pathname.split('/').pop()?.toUpperCase() || "ROOT"

  return (
    <div className="bg-primary/5 border-b border-primary/20 px-4 py-1.5 flex flex-wrap gap-x-6 gap-y-1 items-center font-mono text-[9px] font-black uppercase tracking-[0.2em] text-primary/70">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        SYSTEM_STATUS: ACTIVE
      </div>
      <div>MODULE: {module}</div>
      <div>USER_ROLE: {role || "GUEST"}</div>
      <div className="hidden sm:block ml-auto opacity-40">
        CONNECTION_ESTABLISHED_VIA_NEXUS_V2
      </div>
    </div>
  )
}
