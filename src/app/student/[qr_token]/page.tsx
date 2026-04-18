import { createClient, getUserWithRole } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Globe, Link as LinkIcon, Calendar, CheckCircle2, Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConversationCard } from '@/components/company/ConversationCard'

// Next.js Server Component Params type resolution
export default async function PublicStudentProfile({ params }: { params: Promise<{ qr_token: string }> | { qr_token: string } }) {
  // Await params securely for Next.js 14/15 standards
  const resolvedParams = await params
  const supabase = await createClient()
  const { user, profile } = await getUserWithRole()

  // Fetch Student + Joined Profile Record
  const { data: student } = await supabase
    .from('students')
    .select('*, profiles(full_name, avatar_url, created_at)')
    .eq('qr_token', resolvedParams.qr_token)
    .single()

  if (!student) notFound()

  // Fetch FYPs explicitly bound to student
  const { data: fyps } = await supabase
    .from('fyps')
    .select('*')
    .eq('created_by', student.id)

  const profileData = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles
  const isCreator = process.env.CREATOR_QR_TOKEN && resolvedParams.qr_token === process.env.CREATOR_QR_TOKEN

  // Identity Bounds: Automatically establish or retrieve Conversational analytics safely evaluating PostgREST limits!
  let conversation = null
  if (user && profile?.role === 'company_official') {
     const { data: newConv, error } = await supabase
       .from('conversations')
       .insert({ student_id: student.id, company_id: user.id })
       .select('*')
       .single()

     if (error?.code === '23505') { // Postgres Unique Constraint Violation resolves Racing Collisions!
        const { data: existingConv } = await supabase
           .from('conversations')
           .select('*')
           .eq('student_id', student.id)
           .eq('company_id', user.id)
           .single()
        conversation = existingConv
     } else {
        conversation = newConv
     }
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className={`space-y-8 ${conversation ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
      <Card className="rounded-none border-primary/20 shadow-none bg-primary/5 overflow-hidden">
        <div className="h-32 bg-primary/10 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        </div>
        <CardContent className="relative pt-20 px-6 md:px-10">
          <div className="absolute -top-16 left-6 md:left-10">
            <div className="w-32 h-32 bg-background rounded-none border-2 border-primary flex items-center justify-center text-5xl font-black text-primary shadow-[0_0_20px_rgba(239,68,68,0.2)] font-mono">
              {profileData?.full_name?.charAt(0) || 'S'}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="system-header text-primary mb-2">
                {profileData?.full_name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {isCreator && (
                  <span className="bg-accent/20 text-accent text-[9px] px-2 py-0.5 border border-accent/30 font-black uppercase tracking-widest">
                    MODULE: CREATOR
                  </span>
                )}
                {student.is_ai_native_builder && (
                  <span className="bg-primary/20 text-primary text-[9px] px-2 py-0.5 border border-primary/30 font-black uppercase tracking-widest">
                    MODULE: AI_NATIVE_BUILDER
                  </span>
                )}
              </div>
              <p className="text-sm text-primary/60 font-black uppercase tracking-widest">{student.degree_program}</p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3 text-[10px] text-primary/60 bg-primary/5 p-5 border border-primary/20 rounded-none w-full md:w-auto font-mono">
               <div className="flex items-center gap-2 font-black uppercase tracking-widest">
                 <Calendar className="w-3 h-3" /> HANDSHAKE_CLASS: {student.graduation_year}
               </div>
               {student.availability === 'actively_looking' && (
                 <span className="bg-primary/20 text-primary px-3 py-1 font-black uppercase tracking-widest border border-primary/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                   STATUS: ACTIVE_LOOKING
                 </span>
               )}
            </div>
          </div>

          <div className="mt-10 text-lg leading-relaxed">
            {student.bio || <span className="italic text-muted-foreground">Portfolio currently under construction.</span>}
          </div>

          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-primary/20">
            {student.linkedin_url && (
              <a href={student.linkedin_url} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:text-primary transition-all">
                LINK: LINKEDIN
              </a>
            )}
            {student.github_url && (
              <a href={student.github_url} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:text-primary transition-all">
                LINK: GITHUB
              </a>
            )}
            {student.resume_url && (
              <a href={student.resume_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-primary/40 font-black text-[10px] uppercase tracking-widest">
                  EXTRACT_DOC: RESUME
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="relative mt-12 mb-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-primary/20"></div>
        </div>
        <div className="relative flex justify-start">
          <span className="pr-4 bg-[#0B0F14] system-label text-primary">MODULE: PROJECT_FEED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fyps?.length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-16 text-center text-muted-foreground border border-primary/20 bg-primary/5 rounded-none font-mono">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">NO_PUBLIC_PROJECTS_DETECTED</p>
          </div>
        ) : (
          fyps?.map((fyp) => (
             <Card key={fyp.id} className="flex flex-col rounded-none border-primary/10 hover:border-primary/40 transition-all bg-primary/5 group/card relative overflow-hidden">
               <div className="absolute top-0 right-0 p-1.5 bg-primary/10 border-l border-b border-primary/20 text-[7px] font-black uppercase tracking-widest text-primary/40">PROJECT_ID: {fyp.id.split('-')[0]}</div>
               <CardHeader className="pb-2 pt-6 px-6">
                 <CardTitle className="text-md font-black text-primary uppercase tracking-tight">{fyp.title}</CardTitle>
               </CardHeader>
               <CardContent className="flex-1 flex flex-col px-6 pb-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-3 leading-relaxed">{fyp.summary}</p>
                 <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-6 flex-1 italic opacity-60 leading-relaxed">{fyp.description}</p>
                 <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-primary/10">
                   {fyp.tech_stack?.map((tech: string, i: number) => (
                     <span key={i} className="px-2 py-0.5 border border-primary/20 bg-background text-primary/80 text-[8px] font-black uppercase tracking-widest">
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
      
      {conversation && (
        <div className="lg:col-span-4 sticky top-6">
          <ConversationCard 
            initialConversation={conversation} 
            studentName={profileData?.full_name || 'Candidate'}
          />
        </div>
      )}
    </div>
  )
}
