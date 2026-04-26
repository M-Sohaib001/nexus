"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Edit } from 'lucide-react'

import { fypSchema, type FypInput } from '@/lib/validations/student'
import { createFypAction, deleteFypAction, updateFypAction } from '@/app/(student)/student/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function FypManager({ fyps }: { fyps: any[] }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingFypId, setEditingFypId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const form = useForm<FypInput>({
    resolver: zodResolver(fypSchema),
    defaultValues: {
      title: '',
      summary: '',
      description: '',
      tech_stack: '',
    },
  })

  const handleEdit = (fyp: any) => {
    setEditingFypId(fyp.id)
    setIsCreating(true)
    form.reset({
      title: fyp.title,
      summary: fyp.summary,
      description: fyp.description,
      tech_stack: fyp.tech_stack.join(', '),
    })
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingFypId(null)
    form.reset({
      title: '',
      summary: '',
      description: '',
      tech_stack: '',
    })
    setMessage('')
  }

  async function onSubmit(data: FypInput) {
    setLoading(true)
    setMessage('')
    
    try {
      let result;
      if (editingFypId) {
        result = await updateFypAction(editingFypId, data)
      } else {
        result = await createFypAction(data)
      }

      if (result.error) setMessage(result.error)
      else {
        setMessage(editingFypId ? "FYP_RECORD_UPDATED" : "FYP_RECORD_CREATED")
        form.reset()
        setIsCreating(false)
        setEditingFypId(null)
      }
    } catch (e: any) {
      console.error(e)
      setMessage("SYSTEM_FAULT: ACTION_FAILED")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      const result = await deleteFypAction(id)
      if (result?.error) setMessage(result.error)
    } catch (e: any) {
      console.error(e)
      setMessage("SYSTEM_FAULT: DELETE_FAILED")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">Your Primary Final Year Project</h2>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1 opacity-60">Manage the core feature project highlighted on your public Nexus link.</p>
        </div>
        {!isCreating && fyps?.length === 0 ? (
          <Button onClick={() => setIsCreating(true)} variant="default" className="uppercase font-black text-[10px] tracking-widest">
            <Plus className="w-4 h-4 mr-2" /> CREATE_FYP
          </Button>
        ) : !isCreating && fyps?.length >= 1 ? (
          <Button onClick={() => handleEdit(fyps[0])} variant="secondary" className="uppercase font-black text-[10px] tracking-widest">
            <Edit className="w-4 h-4 mr-2" /> EDIT_FYP
          </Button>
        ) : (
          <Button onClick={handleCancel} variant="secondary" className="uppercase font-black text-[10px] tracking-widest">CANCEL_OP</Button>
        )}
      </div>

      {isCreating && (
        <Card className="border-primary/40 shadow-md ring-1 ring-primary/20 transition-all rounded-none bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl uppercase font-black tracking-widest">
              {editingFypId ? 'MODIFY_FYP_ENTRY' : 'INITIALIZE_FYP_ENTRY'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-widest">Project Title</Label>
                <Input {...form.register('title')} placeholder="AI-based Cancer Detection System" className="rounded-none border-primary/20" />
                {form.formState.errors.title && <p className="text-red-500 text-[10px] font-mono">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-widest">Short Summary</Label>
                <Input {...form.register('summary')} placeholder="A two sentence summary of the project..." className="rounded-none border-primary/20" />
                {form.formState.errors.summary && <p className="text-red-500 text-[10px] font-mono">{form.formState.errors.summary.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-widest">Full Description</Label>
                <Textarea {...form.register('description')} rows={4} placeholder="Built a deep learning model to detect cancer from images" className="rounded-none border-primary/20" />
                {form.formState.errors.description && <p className="text-red-500 text-[10px] font-mono">{form.formState.errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-widest">Tech Stack (Comma separated)</Label>
                <Input {...form.register('tech_stack')} placeholder="React, Node.js, Python, PostgreSQL" className="rounded-none border-primary/20" />
                {form.formState.errors.tech_stack && <p className="text-red-500 text-[10px] font-mono">{form.formState.errors.tech_stack.message as React.ReactNode}</p>}
              </div>
              
              {message && <p className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 p-2 border border-green-500/20">{message}</p>}
              
              <div className="flex flex-col md:flex-row gap-3 mt-4">
                <Button type="submit" disabled={loading} className="w-full md:w-auto mt-2 md:mt-0 uppercase font-black text-[10px] tracking-widest">
                  {loading ? 'SAVING...' : (editingFypId ? 'COMMIT_OVERWRITE' : 'PUBLISH_FYP')}
                </Button>
                {editingFypId && (
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="w-full md:w-auto uppercase font-black text-[10px] tracking-widest border-primary/20">
                    ABORT_EDIT
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {fyps?.length === 0 ? (
            <div className="md:col-span-2 text-muted-foreground p-12 text-center border-2 rounded-xl border-dashed bg-muted/10">
              <p className="text-lg">No primary project added yet. Showcase your thesis!</p>
            </div>
          ) : (
            fyps?.map((fyp) => (
             <Card key={fyp.id} className="flex flex-col hover:border-primary/30 transition-colors bg-card hover:shadow-sm">
               <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-3">
                 <CardTitle className="text-xl leading-tight font-extrabold text-foreground/90">{fyp.title}</CardTitle>
                 <div className="flex -mt-2 -mr-2 bg-muted/50 rounded-lg p-0.5 border">
                   <Button variant="ghost" size="icon" onClick={() => handleEdit(fyp)} className="text-primary hover:text-primary hover:bg-white rounded-md transition-all">
                     <Edit className="w-4 h-4" />
                   </Button>
                   {confirmDeleteId === fyp.id ? (
                     <div className="flex items-center bg-red-500/10 border border-red-500/20 rounded-md">
                       <Button variant="ghost" size="sm" onClick={() => {
                         handleDelete(fyp.id)
                         setConfirmDeleteId(null)
                       }} className="text-red-500 hover:text-red-600 font-black text-[9px] uppercase tracking-tighter px-2">
                         PURGE
                       </Button>
                       <div className="w-px h-4 bg-red-500/20" />
                       <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} className="text-zinc-500 hover:text-white font-black text-[9px] uppercase tracking-tighter px-2">
                         ESC
                       </Button>
                     </div>
                   ) : (
                     <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(fyp.id)} className="text-red-500 hover:text-red-600 hover:bg-white rounded-md transition-all">
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   )}
                 </div>
               </CardHeader>
               <CardContent className="flex-1 flex flex-col pt-0">
                 <p className="text-sm font-medium mb-3 text-secondary-foreground/80 leading-relaxed border-b pb-3">{fyp.summary}</p>
                 <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">{fyp.description}</p>
                 <div className="flex flex-wrap gap-2 mt-auto">
                   {fyp.tech_stack?.map((tech: string, i: number) => (
                     <span key={i} className="px-2.5 py-1 bg-secondary border border-secondary-foreground/10 text-secondary-foreground text-xs rounded-md font-semibold tracking-wide">
                       {tech}
                     </span>
                   ))}
                 </div>
               </CardContent>
             </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
