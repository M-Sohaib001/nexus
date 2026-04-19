'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { companyProfileSchema, type CompanyProfileInput } from '@/lib/validations/company'
import { saveCompanyProfileAction } from '@/app/(company)/company/profile/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Building2, Globe, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CompanyProfileEditor({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const form = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      description: initialData?.description || '',
      website_url: initialData?.website_url || '',
      logo_url: initialData?.logo_url || '',
    },
  })

  async function onSubmit(data: CompanyProfileInput) {
    setLoading(true)
    setMessage('')
    try {
      const result = await saveCompanyProfileAction(data)
      if (result.error) setMessage(result.error)
      else setMessage("Profile updated successfully!")
    } catch (e: any) {
      console.error(e)
      setMessage("System error executing action.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 px-2">
        <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-none shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="system-header text-primary">MODULE: COMPANY_PROFILE</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">IDENTITY_MANAGEMENT_INTERFACE</p>
        </div>
      </div>

      <Card className="rounded-none border-primary/20 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 flex gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
           <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
        </div>
        <CardHeader className="border-b border-primary/10 pb-6">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> RECRUITER_DATA_CONFIG
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="system-label">PARAM: COMPANY_NAME</Label>
                <Input placeholder="Systems Ltd." className="system-input" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 tracking-tighter">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="system-label">PARAM: INDUSTRY_SECTOR</Label>
                <Input placeholder="Software Development" className="system-input" {...form.register('industry')} />
                {form.formState.errors.industry && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 tracking-tighter">{form.formState.errors.industry.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="system-label">PARAM: MISSION_DESCRIPTION</Label>
              <Textarea 
                placeholder="Leading the future of technology and innovation within the NEXUS ecosystem." 
                className="system-input min-h-[120px]" 
                {...form.register('description')} 
              />
              {form.formState.errors.description && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 tracking-tighter">{form.formState.errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="system-label">LINK: OFFICIAL_WEBSITE</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input type="url" placeholder="https://company.com" className="system-input pl-10" {...form.register('website_url')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="system-label">LINK: BRAND_LOGO_URL</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input type="url" placeholder="https://company.com/logo.png" className="system-input pl-10" {...form.register('logo_url')} />
                </div>
              </div>
            </div>

            {message && (
              <div className={cn(
                "p-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border",
                message.includes('success') ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", message.includes('success') ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                {message}
              </div>
            )}
            
            <Button type="submit" disabled={loading} className="w-full md:w-auto mt-4 px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transform active:scale-95 transition-all">
              {loading ? 'SYNCHRONIZING_DATA...' : 'UPDATE_CORPORATE_IDENTITY'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="p-6 border border-primary/10 bg-primary/5 rounded-none flex items-center gap-4">
         <div className="w-10 h-10 border border-primary/20 flex items-center justify-center text-primary/60">
            <Globe className="w-5 h-5" />
         </div>
         <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-tight max-w-2xl">
            Identity configuration is live and synchronized with the student directory. All changes are reflected instantly across the NEXUS ecosystem nodes.
         </div>
      </div>
    </div>
  )
}
