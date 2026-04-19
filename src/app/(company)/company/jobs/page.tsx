import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Briefcase, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CompanyJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between pb-6 border-b border-primary/20">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-primary" />
            JOB_DIRECTORY
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mt-2 font-bold">Manage Active Postings & Applications</p>
        </div>
        
        <Link href="/company/jobs/new">
          <Button className="rounded-none bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Plus className="w-4 h-4 mr-2" /> NEW_POSTING
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs && jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job.id} className="p-6 bg-primary/5 border border-primary/20 flex flex-col justify-between group hover:bg-primary/10 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest ${job.is_active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {job.is_active ? 'STATUS: ACTIVE' : 'STATUS: CLOSED'}
                  </div>
                  <div className="text-xs px-2 py-1 bg-black/40 text-primary uppercase font-bold border border-primary/20">
                    {job.type}
                  </div>
                </div>
                <h3 className="text-lg font-black uppercase text-white mb-2">{job.title}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2">{job.description}</p>
                <div className="mt-4 text-xs font-bold text-zinc-500">
                  {job.location || 'Remote'} 
                </div>
              </div>
              <Link href={`/company/jobs/${job.id}`}>
                <Button variant="outline" className="w-full mt-6 rounded-none border-primary/30 text-primary hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest justify-between group-hover:border-primary transition-colors">
                  VIEW_DETAILS <ChevronRight className="w-4 h-4 text-primary" />
                </Button>
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-1 border border-dashed border-primary/30 p-12 flex flex-col items-center justify-center text-center">
            <Briefcase className="w-12 h-12 text-primary/40 mb-4" />
            <h3 className="text-sm font-black uppercase text-zinc-400 mb-2">NO_ACTIVE_POSTINGS_DETECTED</h3>
            <p className="text-xs text-zinc-600 mb-6 font-bold uppercase">Initialize a new job post to begin recruiting protocol.</p>
          </div>
        )}
      </div>
    </div>
  )
}
