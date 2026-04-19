'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { jobSchema, type JobInput } from '@/lib/validations/company'
import { createJobAction, updateJobAction } from '@/lib/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Briefcase, Building2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export function JobForm({ initialData, isEditing = false }: { initialData?: any, isEditing?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const form = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      requirements: initialData?.requirements ? initialData.requirements.join(', ') : '',
      location: initialData?.location || '',
      type: initialData?.type || 'full-time',
      is_active: initialData?.is_active ?? true,
    },
  })

  async function onSubmit(data: JobInput) {
    setLoading(true)
    setMessage('')
    try {
      const result = isEditing 
        ? await updateJobAction(initialData.id, data)
        : await createJobAction(data)

      if (result.error) setMessage(result.error)
      else {
        setMessage(`Job ${isEditing ? 'updated' : 'posted'} successfully!`)
        if (!isEditing) form.reset()
      }
    } catch (e: any) {
      console.error(e)
      setMessage("System error executing action.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="rounded-none border-primary/20 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 flex gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
           <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
        </div>
        <CardHeader className="border-b border-primary/10 pb-6">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> {isEditing ? 'UPDATE_JOB_POSTING' : 'INITIALIZE_NEW_JOB_POST'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="system-label">PARAM: JOB_TITLE</Label>
                <Input placeholder="Software Engineer" className="system-input" {...form.register('title')} />
                {form.formState.errors.title && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 tracking-tighter">{form.formState.errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="system-label">PARAM: EMPLOYMENT_TYPE</Label>
                <select className="flex h-10 w-full bg-black/40 border border-primary/20 px-3 py-2 text-sm text-primary uppercase tracking-widest placeholder:text-primary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-black" {...form.register('type')}>
                  <option value="full-time">FULL-TIME</option>
                  <option value="part-time">PART-TIME</option>
                  <option value="internship">INTERNSHIP</option>
                  <option value="contract">CONTRACT</option>
                </select>
                {form.formState.errors.type && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 tracking-tighter">{form.formState.errors.type.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="system-label">PARAM: JOB_DESCRIPTION</Label>
              <Textarea 
                placeholder="Describe the role, responsibilities, and impact..." 
                className="system-input min-h-[120px]" 
                {...form.register('description')} 
              />
              {form.formState.errors.description && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 tracking-tighter">{form.formState.errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="system-label">PARAM: REQUIREMENTS (Comma separated)</Label>
              <Textarea 
                placeholder="React, Node.js, 3+ years experience..." 
                className="system-input min-h-[80px]" 
                {...form.register('requirements')} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="system-label">PARAM: LOCATION</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input placeholder="Remote, Hybrid, or City" className="system-input pl-10" {...form.register('location')} />
                </div>
              </div>

              <div className="space-y-2 flex items-center space-x-2 mt-8">
                <input type="checkbox" id="is_active" className="w-4 h-4 rounded border-primary/20 bg-black/40 text-primary focus:ring-primary" {...form.register('is_active')} />
                <Label htmlFor="is_active" className="system-label m-0 cursor-pointer text-xs">STATUS: ACTIVE_LISTING</Label>
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
              {loading ? 'PROCESSING...' : (isEditing ? 'COMMIT_UPDATES' : 'PUBLISH_POSTING')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
