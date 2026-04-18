import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getUserWithRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { user, role } = await getUserWithRole()

  if (user) {
    if (!role) redirect('/onboarding/role-select')
    if (role === 'student') redirect('/student/dashboard')
    if (role === 'company_official') redirect('/company/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <div className="relative z-10 space-y-8 max-w-2xl">
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/30 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            PROTOCOL: DISCOVERY_ESTABLISHED
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-primary uppercase tracking-tighter leading-none">
            NEXUS<span className="text-white/20">_OS</span>
          </h1>
          <p className="text-lg md:text-xl text-primary/60 font-black uppercase tracking-widest">
            BRUTE LOGIC. REFINED BY DESIGN.
          </p>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest leading-relaxed max-w-lg mx-auto opacity-60">
          The next-generation professional interface for FAST NUCES DevDay'26. Bridge the gap between engineering depth and recruiter clarity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-64 h-14 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              INITIALIZE_SESSION
            </Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-64 h-14 text-xs font-black uppercase tracking-[0.2em] border-primary/40 text-primary">
              CREATE_SYSTEM_ID
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
