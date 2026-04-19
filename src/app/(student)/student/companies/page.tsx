import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Building2, Globe, Search, Briefcase } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default async function StudentCompaniesPage() {
  const supabase = await createClient()
  
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('name')

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="system-header text-primary mb-2">DIRECTORY: REGISTERED_COMPANIES</h1>
          <p className="text-primary/60 text-xs font-black uppercase tracking-[0.2em]">RECRUITMENT_PARTNERS // LIVE_DATABASE</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
          <Input 
             placeholder="FILTER_BY_NAME_OR_INDUSTRY..." 
             className="pl-10 h-10 bg-primary/5 border-primary/20 rounded-none text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary shadow-[0_0_10px_rgba(239,68,68,0.05)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!companies || companies.length === 0 ? (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-primary/10 bg-primary/5 rounded-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 italic">NO_PARTNERS_REGISTERED_IN_THIS_SECTOR</p>
          </div>
        ) : (
          companies.map((company) => (
            <Card key={company.id} className="rounded-none border-primary/20 bg-[#0B0F14] hover:border-primary/50 transition-all hover:translate-y-[-2px] group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-1.5 bg-primary/10 border-l border-b border-primary/20 text-[7px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary/60 transition-colors">PARTNER_ID: {company.id.split('-')[0]}</div>
              
              <CardHeader className="pb-4 pt-8 px-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-none shadow-[0_0_15px_rgba(239,68,68,0.1)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all">
                    {company.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                        <Building2 className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-md font-black text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                      {company.name || 'ANONYMOUS_CORP'}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-primary/60 mt-1">
                       <Briefcase className="w-3 h-3" />
                       <span className="text-[9px] font-black uppercase tracking-[0.1em]">{company.industry || 'TECH_GENERAL'}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-8 pt-0 flex-1 flex flex-col space-y-6">
                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed italic opacity-80 flex-1">
                  {company.description || "Leading the future of technology and innovation within the NEXUS ecosystem."}
                </p>
                
                <div className="pt-6 border-t border-primary/10 flex justify-between items-center">
                   <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary">STATUS: RECRUITING</span>
                   </div>
                   <button className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1.5 border border-primary/20 px-3 py-1 bg-primary/5 hover:bg-primary/10">
                      VIEW_DETAILS 
                      <Globe className="w-3 h-3" />
                   </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-12 p-6 border border-primary/10 bg-primary/5 rounded-none flex items-center gap-4">
         <div className="w-10 h-10 border border-primary/20 flex items-center justify-center text-primary">
            <Building2 className="w-5 h-5" />
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">INTERACTION_LOG: READY</p>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-tight">Express interest in participating companies to initiate the professional handshake sequence.</p>
         </div>
      </div>
    </div>
  )
}
