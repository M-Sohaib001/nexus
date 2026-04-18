"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function Navbar({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <Link href="/" className="font-mono font-black text-lg tracking-tighter flex items-center gap-2">
        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-none">NEXUS_OS</span>
        <span className="text-primary tracking-widest opacity-60 flex items-center gap-1.5 ml-1">
          <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
          V2.0
        </span>
      </Link>
      <div>
        {user ? (
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500">TERMINATE_SESSION</Button>
        ) : (
          <div className="flex gap-2">
             <Link href="/login">
               <Button variant="ghost" size="sm">SYS_LOGIN</Button>
             </Link>
             <Link href="/signup">
               <Button variant="outline" size="sm" className="border-primary/50 text-primary">INITIALIZE_ID</Button>
             </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
