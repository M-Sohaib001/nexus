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
    
    let result;
    if (editingFypId) {
      result = await updateFypAction(editingFypId, data)
    } else {
      result = await createFypAction(data)
    }

    if (result.error) setMessage(result.error)
    else {
      setMessage(editingFypId ? "Project updated successfully!" : "Project created successfully!")
      form.reset()
      setIsCreating(false)
      setEditingFypId(null)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    await deleteFypAction(id)
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Projects</h2>
          <p className="text-muted-foreground">Manage the portfolio highlighted on your public Nexus link.</p>
        </div>
        <Button onClick={() => isCreating ? handleCancel() : setIsCreating(true)} variant={isCreating ? "secondary" : "default"}>
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Project</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/40 shadow-md ring-1 ring-primary/20 transition-all">
          <CardHeader>
            <CardTitle className="text-xl">
              {editingFypId ? 'Edit Final Year Project' : 'New Final Year Project'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Project Title</Label>
                <Input {...form.register('title')} placeholder="Nexus Connect App" />
                {form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Short Summary</Label>
                <Input {...form.register('summary')} placeholder="A two sentence summary of the project..." />
                {form.formState.errors.summary && <p className="text-red-500 text-sm">{form.formState.errors.summary.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea {...form.register('description')} rows={4} placeholder="Describe the problem, solution, and outcomes..." />
                {form.formState.errors.description && <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tech Stack (Comma separated)</Label>
                <Input {...form.register('tech_stack')} placeholder="React, Node.js, Python, PostgreSQL" />
                {form.formState.errors.tech_stack && <p className="text-red-500 text-sm">{form.formState.errors.tech_stack.message as React.ReactNode}</p>}
              </div>
              
              {message && <p className="text-sm font-medium text-green-600">{message}</p>}
              
              <div className="flex flex-col md:flex-row gap-3 mt-4">
                <Button type="submit" disabled={loading} className="w-full md:w-auto mt-2 md:mt-0">
                  {loading ? 'Saving...' : (editingFypId ? 'Update Project' : 'Publish Project')}
                </Button>
                {editingFypId && (
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="w-full md:w-auto text-muted-foreground hover:text-foreground">
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {fyps?.length === 0 ? (
          <div className="md:col-span-2 text-muted-foreground p-12 text-center border-2 rounded-xl border-dashed bg-muted/10">
            <p className="text-lg">No projects added yet. Showcase your work!</p>
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
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(fyp.id)} className="text-red-500 hover:text-red-600 hover:bg-white rounded-md transition-all">
                     <Trash2 className="w-4 h-4" />
                   </Button>
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
    </div>
  )
}
