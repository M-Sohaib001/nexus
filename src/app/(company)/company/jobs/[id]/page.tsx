import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobForm } from '@/components/company/JobForm'
import { Briefcase, Users, ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import Link from 'next/link'
import { ApplicationStatusToggle } from '@/components/company/ApplicationStatusToggle'

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!job || job.company_id !== user.id) {
    redirect('/company/jobs')
  }

  // Fetch applications with student details
  const { data: applications } = await supabase
    .from('job_applications')
    .select(`
      id, status, cover_letter, created_at,
      student_id,
      students!inner (
        degree_program, resume_url, linkedin_url,
        profiles!inner ( full_name, avatar_url )
      )
    `)
    .eq('job_id', resolvedParams.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 pb-6 border-b border-primary/20">
        <Link href="/company/jobs" className="text-zinc-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase">{job.title}</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1 font-bold">MANAGEMENT_CONSOLE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-black uppercase text-primary mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> POSTING_DATA
          </h2>
          <JobForm initialData={job} isEditing={true} />
        </div>

        <div>
          <h2 className="text-sm font-black uppercase text-primary mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> CANDIDATE_APPLICATIONS ({applications?.length || 0})
          </h2>

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 pb-8 custom-scrollbar">
            {applications && applications.length > 0 ? (
              applications.map((app: any) => {
                const studentData = app.students
                const profileData = studentData.profiles
                return (
                  <div key={app.id} className="p-5 bg-primary/5 border border-primary/20 relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-black border border-primary/30 flex items-center justify-center overflow-hidden">
                          {profileData.avatar_url ? (
                            <img src={profileData.avatar_url} alt="Candidate" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase text-white">{profileData.full_name}</h4>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{studentData.degree_program}</p>
                          <div className="flex gap-3 mt-2">
                            {studentData.resume_url && (
                              <a href={studentData.resume_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest flex items-center gap-1">
                                <FileText className="w-3 h-3" /> RESUME
                              </a>
                            )}
                            {studentData.linkedin_url && (
                              <a href={studentData.linkedin_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> LINKEDIN
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <ApplicationStatusToggle 
                        applicationId={app.id} 
                        currentStatus={app.status} 
                        jobId={job.id} 
                      />
                    </div>
                    
                    {app.cover_letter && (
                      <div className="mt-4 p-4 bg-black/40 border border-primary/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">COVER_LETTER.TXT</p>
                        <p className="text-xs text-zinc-300 whitespace-pre-wrap">{app.cover_letter}</p>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="border border-dashed border-primary/30 p-8 text-center bg-black/20">
                <Users className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">AWAITING_CANDIDATE_SUBMISSIONS</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
