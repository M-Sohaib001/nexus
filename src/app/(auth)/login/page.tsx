"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as z from 'zod'

import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginInput) {
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <h1 className="text-4xl font-black uppercase text-white tracking-widest flex items-center justify-center gap-3">
             <div className="w-2 h-8 bg-primary animate-pulse" />
             NEXUS
           </h1>
           <p className="text-[10px] text-primary/60 font-mono tracking-[0.3em] mt-2 uppercase">System_Authorization</p>
        </div>

        <div className="border border-primary/20 bg-black/60 backdrop-blur-xl p-8 relative shadow-[0_0_50px_rgba(239,68,68,0.05)]">
          {/* Cyberpunk corner accents */}
          <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-primary" />
          <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-primary" />
          <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-primary" />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-primary" />

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Email_Address</Label>
              <Input 
                id="email" 
                placeholder="identity@nexus.app" 
                className="system-input"
                {...form.register("email")} 
              />
              {form.formState.errors.email && <p className="text-[10px] text-destructive tracking-widest uppercase font-bold mt-1">{form.formState.errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Access_Code</Label>
              <Input 
                id="password" 
                type="password" 
                className="system-input"
                {...form.register("password")} 
              />
              {form.formState.errors.password && <p className="text-[10px] text-destructive tracking-widest uppercase font-bold mt-1">{form.formState.errors.password.message}</p>}
            </div>
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[10px] uppercase tracking-widest font-bold p-3 text-center animate-in fade-in slide-in-from-top-1">
                ERROR: {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full rounded-none h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_15px_rgba(239,68,68,0.2)] mt-4" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'ESTABLISHING_LINK...' : 'INITIALIZE_SESSION'}
            </Button>
          </form>
          
          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-primary/20" />
            <span className="mx-4 text-[10px] font-bold text-primary/40 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-primary/20" />
          </div>
          
          <Button 
            variant="outline" 
            className="w-full rounded-none h-10 border-primary/30 text-zinc-300 hover:text-white hover:bg-primary/10 hover:border-primary font-bold uppercase tracking-widest text-[10px] transition-all" 
            onClick={handleGoogleLogin}
          >
            Google_Auth
          </Button>

          <div className="mt-8 text-center border-t border-primary/10 pt-6">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Unregistered User? <Link href="/signup" className="text-primary hover:text-primary/80 ml-2 transition-colors border-b border-primary/30 hover:border-primary pb-0.5">Initialize_Record</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
