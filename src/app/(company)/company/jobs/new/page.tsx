import { JobForm } from '@/components/company/JobForm'
import { Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function NewJobPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 pb-6 border-b border-primary/20">
        <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase">INITIALIZE_POSTING</h1>
          <div className="flex items-center gap-2 mt-1">
            <Link href="/company/jobs" className="text-[10px] text-zinc-500 hover:text-primary transition-colors font-black uppercase tracking-widest">
              JOB_DIRECTORY
            </Link>
            <span className="text-[10px] text-primary/40 font-black">/</span>
            <span className="text-[10px] text-primary font-black tracking-widest">NEW_ENTRY</span>
          </div>
        </div>
      </div>
      
      <JobForm />
    </div>
  )
}
