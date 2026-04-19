"use client"

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Terminal, User, Search, BarChart3, LogOut, ChevronRight, Building2, TerminalSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface NavbarProps {
  user: any
  profile: any
  student?: any
}

export function Navbar({ user, profile, student }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  const isStudent = profile?.role === 'student'
  const isCompany = profile?.role === 'company_official'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    ...(user ? [
      {
        label: 'CONTROL_PANEL',
        href: isStudent ? '/student/dashboard' : '/company/dashboard',
        icon: Terminal
      },
      {
        label: 'DISCOVERY',
        href: '/company/discover',
        icon: Search
      },
      ...(isStudent ? [
        {
          label: 'R&D PROJECTS',
          href: '/student/fyps',
          icon: TerminalSquare
        },
        {
          label: 'RECRUITERS',
          href: '/student/companies',
          icon: Building2
        }
      ] : []),
      ...(isCompany ? [
        {
          label: 'R&D PROJECTS',
          href: '/company/fyps',
          icon: TerminalSquare
        },
        {
          label: 'INTERACTION_LOG',
          href: '/company/crm',
          icon: BarChart3
        },
        {
          label: 'PROFILE',
          href: '/company/profile',
          icon: User
        }
      ] : []),
      ...(isStudent && student?.qr_token ? [{
        label: 'PROFILE_MODULE',
        href: `/student/${student.qr_token}`,
        icon: User
      }] : [])
    ] : [])
  ]

  return (
    <nav className="border-b border-primary/20 bg-[#0B0F14]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-none shadow-[0_0_15px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-mono font-black text-sm tracking-tighter text-white">NEXUS_OS</span>
              <span className="text-[10px] font-black text-primary tracking-[0.2em] opacity-80 uppercase">REBUILD_V2</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden group",
                    isActive ? "text-primary" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon className={cn("w-3 h-3", isActive ? "text-primary" : "text-zinc-500")} />
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary/10 border-b-2 border-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                </Link>
              )
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
               <div className="flex items-center gap-4">
                 <div className="h-8 w-[1px] bg-primary/20 mx-2" />
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={handleLogout} 
                   className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all gap-2"
                 >
                   <LogOut className="w-3 h-3" />
                   LOGOUT
                 </Button>
               </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest px-4">LOGIN</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 rounded-none px-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">INITIALIZE_ID</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-400 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-primary/10 bg-[#0B0F14] overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-4 border border-primary/10 rounded-none transition-all",
                    pathname === item.href ? "bg-primary/10 border-primary text-primary" : "text-zinc-400 hover:bg-primary/5"
                  )}
                >
                  <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              ))}
              {user ? (
                <Button 
                  onClick={handleLogout}
                  className="w-full justify-start rounded-none bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest gap-3 h-12"
                >
                  <LogOut className="w-4 h-4" />
                  TERMINATE_SESSION
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest">LOGIN</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button className="w-full text-[10px] font-black uppercase tracking-widest">INITIALIZE</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
