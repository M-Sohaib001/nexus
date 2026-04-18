"use client"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-primary/20 bg-background/50 backdrop-blur-md">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">
            Nexus System Interface v2.0
          </p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
            Brute Logic. Refined by Design.
          </p>
        </div>
        
        <div className="px-6 py-2 border-2 border-primary/40 bg-primary/5 rounded-0 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-primary whitespace-nowrap">
            BUILT FOR FAST NUCES DEVELOPER'S DAY 2026
          </p>
        </div>
        
        <div className="font-mono text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest text-right">
          © 2026 DEVDAY. ALL LOGS SECURED.
        </div>
      </div>
    </footer>
  )
}
