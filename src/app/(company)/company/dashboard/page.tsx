import { getUserWithRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CompanyDashboard() {
  const { user, profile } = await getUserWithRole()
  if (!user || profile?.role !== 'company_official') redirect('/login')

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/30 p-8 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Company HQ</h1>
          <p className="text-muted-foreground text-lg">Welcome back. Ready to recruit Next-Gen builders?</p>
        </div>
        <div className="mt-6 md:mt-0">
          <Link href="/company/discover">
            <Button size="lg" className="font-semibold px-8 hover:scale-105 transition-transform">Discover Candidates</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-xl bg-card shadow-sm">
           <h3 className="text-xl font-bold mb-2">Talent CRM</h3>
           <p className="text-muted-foreground">Review candidates, update tags, and manage private notes across your full pipeline.</p>
           <Link href="/company/crm" className="block mt-4">
             <Button variant="outline" className="font-bold">Open CRM</Button>
           </Link>
        </div>
        <div className="p-6 border rounded-xl bg-card shadow-sm">
           <h3 className="text-xl font-bold mb-2">Company Branding</h3>
           <p className="text-muted-foreground">Manage how standard builders perceive and engage your corporate profile.</p>
           <Button variant="outline" className="mt-4" disabled>Edit Profile</Button>
        </div>
      </div>
    </div>
  )
}
