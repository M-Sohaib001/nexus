"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Edit, ExternalLink, Code } from 'lucide-react'

import { projectSchema, type ProjectInput } from '@/lib/validations/student'
import { createProjectAction, deleteProjectAction, updateProjectAction } from '@/lib/actions/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function ProjectManager({ projects }: { projects: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      tech_stack: '',
      github_url: '',
      live_url: '',
    },
  })

  const handleEdit = (project: any) => {
    setEditingProjectId(project.id)
    setIsCreating(true)
    form.reset({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack?.join(', ') || '',
      github_url: project.github_url || '',
      live_url: project.live_url || '',
    })
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingProjectId(null)
    form.reset({
      title: '',
      description: '',
      tech_stack: '',
      github_url: '',
      live_url: '',
    })
    setMessage('')
  }

  async function onSubmit(data: ProjectInput) {
    setLoading(true)
    setMessage('')
    
    try {
      let result;
      if (editingProjectId) {
        result = await updateProjectAction(editingProjectId, data)
      } else {
        result = await createProjectAction(data)
      }

      if (result.error) setMessage(result.error)
      else {
        setMessage(editingProjectId ? "Project updated successfully!" : "Project created successfully!")
        form.reset()
        setIsCreating(false)
        setEditingProjectId(null)
      }
    } catch (e: any) {
      console.error(e)
      setMessage("System error executing action.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await deleteProjectAction(id)
      if (result?.error) {
        setMessage(result.error)
      }
    } catch (e: any) {
      console.error(e)
      setMessage("SYSTEM_FAULT: DELETE_FAILED")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-2 border-l-4 border-primary pl-4">
        <div>
          <h2 className="text-xl font-black tracking-tighter uppercase">Secondary Projects Feed</h2>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1 opacity-70">Add side-projects, hackathons, and open source work.</p>
        </div>
        <Button onClick={() => isCreating ? handleCancel() : setIsCreating(true)} variant={isCreating ? "secondary" : "default"} className="uppercase font-black text-[10px] tracking-widest">
          {isCreating ? 'DISMISS_FORM' : <><Plus className="w-4 h-4 mr-2" /> INIT_PROJECT</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/40 shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-none bg-primary/5 transition-all outline outline-1 outline-primary/20 outline-offset-4 animate-in fade-in slide-in-from-top-2">
          <CardHeader className="border-b border-primary/20 bg-background/50">
            <CardTitle className="text-md uppercase font-black tracking-widest text-primary">
              {editingProjectId ? 'MODIFY_PROJECT_DATA' : 'COMPILE_NEW_PROJECT_DATA'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-widest text-primary/80">Project Identifier</Label>
                <Input {...form.register('title')} placeholder="Nexus Application System" className="border-primary/20 bg-background rounded-none font-mono" />
                {form.formState.errors.title && <p className="text-red-500 text-xs font-mono">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-widest text-primary/80">Technical Overview</Label>
                <Textarea {...form.register('description')} rows={4} placeholder="Architected a multi-role candidate discovery system using server components" className="border-primary/20 bg-background rounded-none font-mono" />
                {form.formState.errors.description && <p className="text-red-500 text-xs font-mono">{form.formState.errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] tracking-widest text-primary/80">Framework Matrix (Comma Separated)</Label>
                <Input {...form.register('tech_stack')} placeholder="Next.js, Tailwind, Supabase, Vercel" className="border-primary/20 bg-background rounded-none font-mono" />
                {form.formState.errors.tech_stack && <p className="text-red-500 text-xs font-mono">{form.formState.errors.tech_stack.message as React.ReactNode}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="uppercase font-black text-[10px] tracking-widest text-primary/80">GitHub Repository Link</Label>
                  <Input {...form.register('github_url')} placeholder="https://github.com/..." className="border-primary/20 bg-background rounded-none font-mono" />
                  {form.formState.errors.github_url && <p className="text-red-500 text-xs font-mono">{form.formState.errors.github_url.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="uppercase font-black text-[10px] tracking-widest text-primary/80">Live Deployment URL</Label>
                  <Input {...form.register('live_url')} placeholder="https://..." className="border-primary/20 bg-background rounded-none font-mono" />
                  {form.formState.errors.live_url && <p className="text-red-500 text-xs font-mono">{form.formState.errors.live_url.message}</p>}
                </div>
              </div>
              
              {message && <p className="text-xs font-black uppercase tracking-widest text-green-500 bg-green-500/10 p-3 border border-green-500/20">{message}</p>}
              
              <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-primary/20">
                <Button type="submit" disabled={loading} className="w-full md:w-auto uppercase font-black tracking-widest text-[10px] rounded-none">
                  {loading ? 'SAVING_PROJECT...' : (editingProjectId ? 'OVERWRITE_RECORD' : 'INITIALIZE_RECORD')}
                </Button>
                {editingProjectId && (
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="w-full md:w-auto uppercase font-black tracking-widest text-[10px] rounded-none border-primary/20 hover:border-primary text-primary/60 hover:text-primary transition-all">
                    ABORT
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {(!projects || projects.length === 0) ? (
          <div className="min-h-[200px] md:col-span-2 text-primary/40 p-12 text-center border-2 rounded-none border-dashed border-primary/20 bg-primary/5 flex items-center justify-center flex-col">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase italic">NO_DATABANKS_FOUND</p>
            <p className="text-[10px] mt-2 font-mono opacity-50">Upload secondary side projects for recruitment parity.</p>
          </div>
        ) : (
          projects.map((project) => (
             <Card key={project.id} className="flex flex-col rounded-none border-primary/20 bg-card hover:border-primary/50 transition-all shadow-none group">
               <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-4 bg-primary/5 border-b border-primary/10">
                 <CardTitle className="text-lg leading-tight font-black uppercase tracking-tighter text-foreground/90">{project.title}</CardTitle>
                  <div className="flex -mt-2 -mr-2 bg-background border border-primary/20 divide-x divide-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(project)} className="text-secondary-foreground hover:bg-primary hover:text-primary-foreground rounded-none h-8 w-8 transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    {confirmDeleteId === project.id ? (
                      <div className="flex items-center bg-red-500/10 border-l border-primary/20">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            handleDelete(project.id)
                            setConfirmDeleteId(null)
                          }} 
                          className="text-red-500 hover:text-red-600 font-black text-[8px] uppercase tracking-tighter px-2 h-8"
                        >
                          PURGE
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setConfirmDeleteId(null)} 
                          className="text-zinc-500 hover:text-white font-black text-[8px] uppercase tracking-tighter px-2 h-8 border-l border-primary/20"
                        >
                          ESC
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setConfirmDeleteId(project.id)} 
                        disabled={deletingId === project.id}
                        className="text-red-500 hover:bg-red-500 hover:text-white rounded-none h-8 w-8 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
               </CardHeader>
               <CardContent className="flex-1 flex flex-col pt-5">
                 {deletingId === project.id && (
                   <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 animate-pulse">
                     <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">DELETING_PROJECT...</p>
                   </div>
                 )}
                 <p className="text-sm text-secondary-foreground mb-6 flex-1 italic">{project.description}</p>
                 
                 <div className="grid grid-cols-2 gap-2 mb-6">
                    {project.github_url ? (
                       <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 p-2 bg-background border border-primary/20 text-primary hover:bg-primary/10 transition-colors text-[9px] uppercase tracking-widest font-black">
                         <Code className="w-3 h-3" /> REPOSITORY
                       </a>
                    ) : (
                       <div className="flex items-center justify-center gap-1.5 p-2 bg-background border border-primary/10 text-primary/20 text-[9px] uppercase tracking-widest font-black cursor-not-allowed">
                         <Code className="w-3 h-3" /> NO_REPO
                       </div>
                    )}
                    {project.live_url ? (
                       <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 p-2 bg-background border border-primary/20 text-primary hover:bg-primary/10 transition-colors text-[9px] uppercase tracking-widest font-black">
                         <ExternalLink className="w-3 h-3" /> DEPLOYMENT
                       </a>
                    ) : (
                       <div className="flex items-center justify-center gap-1.5 p-2 bg-background border border-primary/10 text-primary/20 text-[9px] uppercase tracking-widest font-black cursor-not-allowed">
                         <ExternalLink className="w-3 h-3" /> NO_LINK
                       </div>
                    )}
                 </div>

                 <div className="flex flex-wrap gap-1.5 mt-auto border-t pt-4 border-primary/10">
                   {project.tech_stack?.map((tech: string, i: number) => (
                     <span key={i} className="px-2 py-0.5 bg-background border border-primary/20 text-primary/80 text-[9px] font-black uppercase tracking-widest shadow-[inset_0_0_10px_rgba(239,68,68,0.05)]">
                       {tech}
                     </span>
                   ))}
                 </div>
               </CardContent>
             </Card>
          ))
        )}
      </div>
    </div>
  )
}
