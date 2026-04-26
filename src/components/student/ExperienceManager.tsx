"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Briefcase, Calendar } from 'lucide-react'
import { createExperience, updateExperience, deleteExperience } from '@/lib/actions/experiences'

export function ExperienceManager({ experiences }: { experiences: any[] }) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: ''
  })

  const resetForm = () => {
    setFormData({ title: '', company: '', start_date: '', end_date: '', description: '' })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createExperience({
        ...formData,
        end_date: formData.end_date || undefined
      })
      resetForm()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setLoading(true)
    try {
      await updateExperience(editingId, {
        ...formData,
        end_date: formData.end_date || undefined
      })
      resetForm()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteExperience(id)
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (exp: any) => {
    setFormData({
      title: exp.title,
      company: exp.company,
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      description: exp.description || ''
    })
    setEditingId(exp.id)
    setIsAdding(false)
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  return (
    <Card className="rounded-none border-primary/20 bg-primary/5 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
             <Briefcase className="w-5 h-5 text-primary" /> PROFESSIONAL_HISTORY
          </CardTitle>
          <p className="text-[10px] font-bold tracking-widest text-primary/40 uppercase">Module: Experience_Ledger</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="border-primary/40 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10"
        >
          <Plus className="w-3 h-3 mr-2" /> ADD_ENTRY
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {(isAdding || editingId) && (
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-6 p-6 border border-primary/30 bg-primary/5 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="system-label">PARAM: TITLE</Label>
                <Input 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Software Engineering Intern"
                  className="system-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="system-label">PARAM: COMPANY</Label>
                <Input 
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  placeholder="Systems Ltd."
                  className="system-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="system-label">PARAM: START_DATE</Label>
                <Input 
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  className="system-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="system-label">PARAM: END_DATE (OPTIONAL)</Label>
                <Input 
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                  className="system-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="system-label">PARAM: DESCRIPTION</Label>
              <Textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Worked on dashboards and APIs"
                className="system-input min-h-[100px]"
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1 font-black uppercase tracking-[0.2em] text-[10px]">
                {loading ? 'SAVING_EXPERIENCE...' : (editingId ? 'COMMIT_UPDATE' : 'INITIALIZE_ENTRY')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="border-primary/40 font-black uppercase tracking-[0.2em] text-[10px]">
                CANCEL_OPERATION
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {experiences.length === 0 && !isAdding && (
            <div className="p-8 text-center text-muted-foreground border border-primary/20 bg-primary/5 rounded-none font-mono">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">NO_PROFESSIONAL_RECORDS_DETECTED</p>
            </div>
          )}
          {experiences.map((exp) => (
            <div key={exp.id} className="relative p-5 border border-primary/10 bg-background/50 hover:border-primary/40 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
              <div className={deletingId === exp.id ? 'opacity-20 transition-opacity' : ''}>
                <h3 className="text-sm font-black text-primary uppercase tracking-tight">{exp.title}</h3>
                <p className="text-xs text-primary/60 font-black tracking-widest uppercase">{exp.company}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[9px] text-muted-foreground font-mono uppercase">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exp.start_date}</span>
                  <span>-</span>
                  <span>{exp.end_date || 'PRESENT'}</span>
                </div>
              </div>

              {deletingId === exp.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 animate-pulse">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">PURGING...</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={loading || deletingId === exp.id}
                  onClick={() => startEdit(exp)} 
                  className="h-7 px-3 border-primary/20 text-[8px] font-black uppercase hover:bg-primary/10 transition-all disabled:opacity-50"
                >
                  EDIT_LOG
                </Button>
                {confirmDeleteId === exp.id ? (
                  <div className="flex items-center bg-destructive/10 border border-destructive/20 ml-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        handleDelete(exp.id)
                        setConfirmDeleteId(null)
                      }} 
                      className="h-7 text-destructive hover:text-white hover:bg-destructive font-black text-[8px] uppercase tracking-tighter px-3"
                    >
                      SURE?
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setConfirmDeleteId(null)} 
                      className="h-7 text-zinc-500 hover:text-white font-black text-[8px] uppercase tracking-tighter px-3 border-l border-destructive/20"
                    >
                      CANCEL
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={loading || deletingId === exp.id}
                    onClick={() => setConfirmDeleteId(exp.id)}
                    className="h-7 px-3 border-destructive/20 text-destructive text-[8px] font-black uppercase hover:bg-destructive/10 transition-all disabled:opacity-50"
                  >
                    PURGE
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

