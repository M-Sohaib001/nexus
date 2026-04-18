import { createClient, getUserWithRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CrmBoard } from '@/components/company/CrmBoard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

const TAG_ORDER: Record<string, number> = {
  strong_fit: 0,
  follow_up: 1,
  not_now: 2,
  untagged: 3,
}

export default async function CompanyCrm() {
  const { user, profile } = await getUserWithRole()
  if (!user || profile?.role !== 'company_official') redirect('/login')

  const supabase = await createClient()

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      tag,
      private_note,
      started_at,
      students!inner (
        id,
        degree_program,
        graduation_year,
        availability,
        qr_token,
        resume_url,
        profiles!inner ( full_name, avatar_url ),
        fyps ( id, title, summary, created_at )
      )
    `)
    .eq('company_id', user.id)
    .order('started_at', { ascending: false })

  // Enrich + sort by tag priority then recency
  const boardData = (conversations || [])
    .map((conv) => {
      const student = Array.isArray(conv.students) ? conv.students[0] : conv.students
      const profileData = Array.isArray(student?.profiles) ? student.profiles[0] : student?.profiles
      const latestFyp = (student?.fyps ?? []).sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0] ?? null

      return {
        id: conv.id,
        tag: conv.tag ?? 'untagged',
        private_note: conv.private_note ?? '',
        started_at: conv.started_at,
        studentName: profileData?.full_name ?? 'Unknown',
        avatarUrl: profileData?.avatar_url ?? null,
        degreeProgram: student?.degree_program ?? null,
        graduationYear: student?.graduation_year ?? null,
        availability: student?.availability ?? null,
        qrToken: student?.qr_token ?? null,
        resumeUrl: student?.resume_url ?? null,
        fypTitle: latestFyp?.title ?? null,
        fypSummary: latestFyp?.summary ?? null,
      }
    })
    .sort((a, b) => {
      const tagDiff = (TAG_ORDER[a.tag] ?? 3) - (TAG_ORDER[b.tag] ?? 3)
      if (tagDiff !== 0) return tagDiff
      return new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    })

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-primary/20 pb-8">
        <div>
          <h1 className="system-header text-primary">INTERACTION_LOG</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">
            {boardData.length} ACTIVE_RECORDS_DETECTED_IN_PIPELINE
          </p>
        </div>
        <Link href="/company/discover">
          <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/20">
            SCANN_FOR_TALENT
          </Button>
        </Link>
      </div>

      {boardData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 text-center border-2 border-dashed border-primary/20 bg-primary/5 rounded-none font-mono">
          <p className="text-xl font-black text-primary/40 uppercase tracking-[0.2em] mb-4 italic">NO_INTERACTIONS_DETECTED</p>
          <p className="text-[10px] uppercase tracking-widest opacity-40 max-w-sm leading-relaxed">System awaiting interaction handshake. Utilize the Discovery Module to manually trigger interest signals or initiate physical QR scans.</p>
          <Link href="/company/discover" className="mt-8">
            <Button className="px-10">INITIALIZE_DISCOVERY</Button>
          </Link>
        </div>
      ) : (
        <CrmBoard initialConversations={boardData} />
      )}
    </div>
  )
}
