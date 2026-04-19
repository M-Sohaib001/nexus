"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { FileDown, Sparkles, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ResumeSection {
  id: string
  title: string
  subtitle: string
  date: string
  description: string
}

interface Props {
  student: any
  fyps: any[]
  experiences?: any[]
}

export function ResumeBuilder({ student, fyps, experiences = [] }: Props) {
  const profileData = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles

  const [education, setEducation] = useState<ResumeSection[]>([
    { id: '1', title: student.degree_program || 'Degree', subtitle: 'University Name', date: `Class of ${student.graduation_year}`, description: '' }
  ])
  
  const initialExperiences = experiences.map(exp => ({
     id: exp.id,
     title: exp.title,
     subtitle: exp.company,
     date: `${exp.start_date} - ${exp.end_date || 'Present'}`,
     description: exp.description || ''
  }))
  const [experience, setExperience] = useState<ResumeSection[]>(initialExperiences)
  
  const [skills, setSkills] = useState<string>(
    Array.isArray(student.skills) ? student.skills.join(', ') : 'React, Next.js, TypeScript, Tailwind CSS'
  )
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)

  const addEdu = () => setEducation([...education, { id: Date.now().toString(), title: '', subtitle: '', date: '', description: '' }])
  const removeEdu = (id: string) => setEducation(education.filter(e => e.id !== id))
  
  const addExp = () => setExperience([...experience, { id: Date.now().toString(), title: '', subtitle: '', date: '', description: '' }])
  const removeExp = (id: string) => setExperience(experience.filter(e => e.id !== id))

  const handleExport = async () => {
    if (!previewRef.current) return
    setIsExporting(true)
    
    try {
      // Capture the preview div
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      const pdfBlob = pdf.output('blob')

      // Upload to Nexus server
      const formData = new FormData()
      formData.append('file', pdfBlob, `${profileData.full_name.replace(/\s+/g, '_')}_Resume.pdf`)
      
      const res = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setExportSuccess(true)
        setTimeout(() => setExportSuccess(false), 5000)
      }
    } catch (err) {
      console.error('PDF Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* ── Editor ── */}
      <div className="space-y-8 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Education
            </h3>
            <Button variant="ghost" size="sm" onClick={addEdu} className="font-bold text-xs"><Plus className="w-3 h-3 mr-1" /> Add</Button>
          </div>
          {education.map((edu, idx) => (
            <Card key={edu.id} className="relative group">
              <CardContent className="p-4 space-y-3">
                <Button 
                  variant="ghost" size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
                  onClick={() => removeEdu(edu.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Input placeholder="Degree / Qualification" value={edu.title} onChange={e => {
                  const n = [...education]; n[idx].title = e.target.value; setEducation(n)
                }} className="font-bold" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Institution" value={edu.subtitle} onChange={e => {
                    const n = [...education]; n[idx].subtitle = e.target.value; setEducation(n)
                  }} />
                  <Input placeholder="Date (e.g. 2020 - 2024)" value={edu.date} onChange={e => {
                    const n = [...education]; n[idx].date = e.target.value; setEducation(n)
                  }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">Work Experience</h3>
            <Button variant="ghost" size="sm" onClick={addExp} className="font-bold text-xs"><Plus className="w-3 h-3 mr-1" /> Add</Button>
          </div>
          {experience.length === 0 && <p className="text-sm text-muted-foreground italic px-2">No experience added yet.</p>}
          {experience.map((exp, idx) => (
            <Card key={exp.id} className="relative group">
              <CardContent className="p-4 space-y-3">
                <Button 
                  variant="ghost" size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
                  onClick={() => removeExp(exp.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Input placeholder="Job Title" value={exp.title} onChange={e => {
                  const n = [...experience]; n[idx].title = e.target.value; setExperience(n)
                }} className="font-bold" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Company" value={exp.subtitle} onChange={e => {
                    const n = [...experience]; n[idx].subtitle = e.target.value; setExperience(n)
                  }} />
                  <Input placeholder="Duration" value={exp.date} onChange={e => {
                    const n = [...experience]; n[idx].date = e.target.value; setExperience(n)
                  }} />
                </div>
                <Textarea placeholder="Responsibilities" value={exp.description} onChange={e => {
                  const n = [...experience]; n[idx].description = e.target.value; setExperience(n)
                }} />
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold">Skills</h3>
          <Textarea 
            placeholder="React, Node.js, Python, PostgreSQL..." 
            value={skills} 
            onChange={e => setSkills(e.target.value)} 
          />
        </section>

        <div className="pt-4 flex gap-3">
          <Button 
            disabled={isExporting} 
            onClick={handleExport} 
            className="flex-1 rounded-none h-12 bg-primary hover:bg-primary/90 font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            {isExporting ? 'GENERATING_PDF...' : 'EXPORT_RESUME'}
            {!isExporting && <FileDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>
        
        {exportSuccess && (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 border border-green-500/20 px-4 py-3 font-black uppercase tracking-widest text-[10px] animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4" />
            RESUME_UPLOAD_SUCCESS — PROFILE_UPDATED
          </div>
        )}
      </div>

      {/* ── Preview ── */}
      <div className="sticky top-6">
        <div className="bg-muted/30 border-2 border-dashed rounded-2xl p-8 overflow-hidden">
          <div 
            ref={previewRef}
            className="bg-white text-black w-full min-h-[800px] shadow-2xl p-12 space-y-8 font-serif"
            style={{ borderRadius: '1px' }}
          >
            <header className="border-b-2 border-primary pb-6">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black">{profileData.full_name}</h1>
              <div className="flex flex-wrap gap-4 text-xs font-bold mt-2 text-zinc-600">
                <span>{student.degree_program}</span>
                <span>•</span>
                <span>Portfolio: nexus.app/student/{student.qr_token}</span>
              </div>
            </header>

            <section className="space-y-4">
              <p className="text-sm leading-relaxed text-zinc-700 italic">
                {student.bio || 'Professional building the future through innovative software engineering and practical AI workflows.'}
              </p>
            </section>

            <section className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-1 text-primary">Education</h4>
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-sm">{edu.title || 'Degree'}</p>
                    <p className="text-[10px] font-bold text-zinc-500">{edu.date}</p>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium">{edu.subtitle}</p>
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-1 text-primary">Featured Projects</h4>
              {fyps.slice(0, 2).map(fyp => (
                <div key={fyp.id}>
                   <div className="flex justify-between items-baseline">
                    <p className="font-bold text-sm">{fyp.title}</p>
                    <p className="text-[10px] font-bold text-zinc-500">FYP</p>
                  </div>
                  <p className="text-xs text-zinc-600 italic mt-0.5">{fyp.summary}</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed line-clamp-2">{fyp.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {fyp.tech_stack?.slice(0, 4).map((t: string) => (
                      <span key={t} className="text-[8px] bg-zinc-100 px-1.5 py-0.5 rounded uppercase font-bold text-zinc-500">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {experience.length > 0 && (
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-1 text-primary">Experience</h4>
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-sm">{exp.title}</p>
                      <p className="text-[10px] font-bold text-zinc-500">{exp.date}</p>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium">{exp.subtitle}</p>
                    <p className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </section>
            )}

            <section className="space-y-2 pb-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-1 text-primary">Skills</h4>
              <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                {skills}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
