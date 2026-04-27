import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Briefcase, FileText } from 'lucide-react'
import { ApplyButton } from './ApplyButton'

export default async function StudentJobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: job } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (
        name, logo_url, description, website_url
      )
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (!job) {
    redirect('/student/jobs')
  }

  // Check if they already applied
  const { data: application } = await supabase
    .from('job_applications')
    .select('id')
    .eq('job_id', resolvedParams.id)
    .eq('student_id', user.id)
    .maybeSingle()

  const hasApplied = !!application
  const company = job.companies

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <div className="flex items-center gap-4 pb-6 border-b border-primary/20">
        <Link href="/student/jobs" className="text-zinc-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase">ROLE_SPECIFICATION</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1 font-bold">ID: {job.id.split('-')[0]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="p-8 bg-primary/5 border border-primary/20 relative">
            <div className="absolute top-0 right-0 p-3 flex gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
               <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
            </div>
            
            <h2 className="text-3xl font-black uppercase text-white mb-4 leading-tight">{job.title}</h2>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-400 bg-black/40 px-3 py-2 border border-zinc-800">
                <Building2 className="w-4 h-4 text-primary" /> {company?.name}
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-400 bg-black/40 px-3 py-2 border border-zinc-800">
                <MapPin className="w-4 h-4 text-primary" /> {job.location || 'REMOTE'}
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase text-primary bg-primary/10 px-3 py-2 border border-primary/20">
                <Briefcase className="w-4 h-4" /> {job.type}
              </div>
            </div>

            <ApplyButton 
              jobId={job.id} 
              jobTitle={job.title} 
              companyName={company?.name ?? 'Unknown Company'} 
              hasApplied={hasApplied} 
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> MISSION_PARAMETERS
              </h3>
              <div className="p-6 bg-black/40 border border-zinc-800/50 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {job.description}
              </div>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-3">REQUIRED_CAPABILITIES</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.requirements.map((req: string, i: number) => (
                    <div key={i} className="p-3 bg-primary/5 border border-primary/10 text-xs font-bold text-zinc-300 uppercase flex items-start gap-2">
                       <span className="text-primary mt-0.5 animate-pulse">■</span> {req}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 text-center">
            <div className="w-20 h-20 bg-black border border-primary/30 mx-auto flex items-center justify-center overflow-hidden mb-4 p-2 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              {company?.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-primary/60" />
              )}
            </div>
            <h3 className="text-lg font-black uppercase text-white mb-2">{company?.name}</h3>
            {company?.website_url && (
              <a href={company.website_url} target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 hover:text-primary transition-colors uppercase tracking-widest block mb-4">
                VISIT_EXTERNAL_NEXUS
              </a>
            )}
            <p className="text-xs text-zinc-400 font-medium">
              {company?.description || 'No corporate description available.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
