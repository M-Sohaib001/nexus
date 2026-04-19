import { getUserWithRole } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { ProfileEditor } from '@/components/student/ProfileEditor'
import { FypManager } from '@/components/student/FypManager'
import { ExperienceManager } from '@/components/student/ExperienceManager'
import { ResumeUploader } from '@/components/student/ResumeUploader'
import { ResumeBuilder } from '@/components/student/ResumeBuilder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function StudentDashboard() {
  const { user } = await getUserWithRole()
  if (!user) redirect('/login')

  const supabase = await createClient()
  
  const { data: student } = await supabase
    .from('students')
    .select('*, profiles(full_name, avatar_url)')
    .eq('id', user.id)
    .single()

  const { data: fyps } = await supabase
    .from('fyps')
    .select('*')
    .eq('created_by', student.id)
    .order('created_at', { ascending: false })

  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .eq('student_id', user.id)
    .order('start_date', { ascending: false })

  const { data: rawConversations } = await supabase
    .from('conversations_public')
    .select('id, started_at, company_id')
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })

  const companyIds = rawConversations?.map(c => c.company_id) || []
  const { data: companies } = companyIds.length > 0 ? await supabase
    .from('companies')
    .select('id, name, industry')
    .in('id', companyIds) : { data: [] }

  const conversations = rawConversations?.map(conv => ({
    ...conv,
    companies: companies?.find(c => c.id === conv.company_id) || null
  }))

  const headersList = await headers()
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host') || 'localhost:3000'
  const originUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-12 mt-6">
      <div>
        <h1 className="system-header text-primary">STUDENT_CONTROL_PANEL</h1>
        <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase mt-1 opacity-60">Status: System_Active // Module: Profile_Manager</p>
      </div>
      
      <ProfileEditor initialData={student} originUrl={originUrl} />
      
      <div className="lg:col-span-8 space-y-6">
        <FypManager fyps={fyps || []} />
        
        <div className="border-t my-8 border-border" />
        
        <ExperienceManager experiences={experiences || []} />

        <div className="border-t my-8 border-border" />

        <div className="space-y-6 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <h2 className="text-xl font-black uppercase tracking-tighter">RESUME_MANAGEMENT</h2>
          </div>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 bg-primary/5 border border-primary/20 p-1 rounded-none">
              <TabsTrigger value="upload" className="rounded-none font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">LOCAL_UPLOAD</TabsTrigger>
              <TabsTrigger value="build" className="rounded-none font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">SYSTEM_BUILDER</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-6 space-y-4">
              <ResumeUploader initialUrl={student?.resume_url ?? null} />
            </TabsContent>
            <TabsContent value="build" className="mt-6">
              <ResumeBuilder student={student} fyps={fyps || []} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t my-8 border-border" />
        
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
             <span className="w-2 h-2 bg-primary rounded-full" />
             INTERACTION_LOG
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(!conversations || conversations.length === 0) ? (
              <div className="col-span-2 p-12 text-center text-muted-foreground border-2 border-dashed border-primary/20 bg-primary/5 rounded-none font-mono">
                 <p className="font-black text-sm uppercase tracking-widest mb-2 opacity-60 italic">NO_INTERACTIONS_DETECTED</p>
                 <p className="text-[10px] uppercase tracking-widest opacity-40 leading-relaxed">System awaiting external handshake signals via mobile QR networking tokens.</p>
              </div>
            ) : (
              conversations.map((conv: any) => {
                const compName = (!conv.companies?.name || conv.companies?.name === '') ? 'Undisclosed Next-Gen Firm' : conv.companies?.name
                return (
                  <div key={conv.id} className="p-6 border bg-secondary/15 rounded-xl flex flex-col hover:border-primary/40 transition-colors shadow-sm">
                    <h3 className="font-extrabold text-xl mb-1.5 text-foreground/90">{compName}</h3>
                    <p className="text-[11px] font-black tracking-widest uppercase text-muted-foreground bg-background border border-border/80 px-2 py-0.5 rounded w-fit">{conv.companies?.industry || 'Stealth Network'}</p>
                    <div className="mt-8 pt-4 border-t border-border/50 flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                      <span>Connection Logged</span>
                      <span>{new Date(conv.started_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
