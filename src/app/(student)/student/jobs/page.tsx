import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Building2, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function StudentJobsBoardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let query = supabase
    .from('jobs')
    .select(`
      *,
      companies (
        name, logo_url
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (resolvedParams.q) {
    query = query.ilike('title', `%${resolvedParams.q}%`)
  }

  const { data: jobs } = await query

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-primary/20">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-primary" />
            GLOBAL_OPPORTUNITY_NETWORK
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mt-2 font-bold">Discover & Apply to elite engineering roles</p>
        </div>
        
        <form className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <Input 
            name="q"
            defaultValue={resolvedParams.q}
            placeholder="SEARCH ROLES..." 
            className="system-input pl-10 h-10" 
          />
        </form>
      </div>

      <div className="space-y-4">
        {jobs && jobs.length > 0 ? (
          jobs.map(job => {
            const company = job.companies
            return (
              <Link key={job.id} href={`/student/jobs/${job.id}`} className="block">
                <div className="p-6 bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-black border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-[0_0_15px_rgba(239,68,68,0.1)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-shadow">
                      {company?.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-6 h-6 text-primary/60" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase text-white group-hover:text-primary transition-colors">{job.title}</h3>
                      <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">{company?.name || 'UNKNOWN ENTITY'}</p>
                      
                      <div className="flex flex-wrap gap-3 mt-3">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 bg-black/40 px-2 py-1 border border-zinc-800">
                          <MapPin className="w-3 h-3 text-primary" /> {job.location || 'REMOTE'}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 border border-primary/20">
                          {job.type}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto rounded-none border-primary text-primary hover:bg-primary text-[10px] font-black uppercase tracking-[0.2em]">
                      VIEW_POSITION
                    </Button>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="border border-dashed border-primary/30 p-16 flex flex-col items-center justify-center text-center bg-black/20">
            <Search className="w-12 h-12 text-primary/40 mb-4" />
            <h3 className="text-sm font-black uppercase text-zinc-400 mb-2">NO_RECORDS_FOUND</h3>
            <p className="text-xs text-zinc-600 mb-6 font-bold uppercase">Adjust search parameters to locate active opportunities.</p>
          </div>
        )}
      </div>
    </div>
  )
}
