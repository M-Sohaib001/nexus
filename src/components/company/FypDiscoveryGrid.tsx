"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Code, TerminalSquare } from 'lucide-react'
import { useState } from 'react'
import { toggleInterestSignalAction } from '@/app/(company)/company/discover/actions'
import Link from 'next/link'

export function FypDiscoveryGrid({
  initialFyps,
  signaledStudentIds,
  currentPage = 1,
  hasNextPage = false
}: {
  initialFyps: any[],
  signaledStudentIds: string[],
  currentPage?: number,
  hasNextPage?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (!value || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/company/fyps?${params.toString()}`, { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`/company/fyps?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSignal = async (studentId: string) => {
    setLoadingMap(prev => ({ ...prev, [studentId]: true }))
    const result = await toggleInterestSignalAction(studentId)
    if (result?.error) {
       console.error("Interest signal failed:", result.error)
    }
    setLoadingMap(prev => ({ ...prev, [studentId]: false }))
  }

  return (
    <div className="space-y-6 pb-20">
      <Card className="p-4 md:p-6 rounded-none border-primary/20 sticky top-4 z-40 bg-background/95 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <Label className="system-label text-primary/70">PARAM: KEYWORD_SEARCH</Label>
            <Input 
              placeholder="Search Subject Title..."
              defaultValue={searchParams.get('search') || ''}
              onBlur={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFilterChange('search', e.currentTarget.value)
              }}
              className="w-full rounded-none border-primary/30 font-mono text-xs uppercase tracking-widest bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="system-label text-primary/70">PARAM: TECH_STACK</Label>
            <Input 
              placeholder="React, Python, Node..."
              defaultValue={searchParams.get('tech') || ''}
              onBlur={(e) => handleFilterChange('tech', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFilterChange('tech', e.currentTarget.value)
              }}
              className="w-full rounded-none border-primary/30 font-mono text-xs uppercase tracking-widest bg-background"
            />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="system-label text-primary/70">PARAM: SORT_MATRIX</Label>
            <div className="flex rounded-none border border-primary/30 h-10 w-full overflow-hidden">
              <button 
                onClick={() => handleFilterChange('sort', 'recent')}
                className={`flex-1 text-[10px] font-black uppercase tracking-widest transition-colors ${(!searchParams.get('sort') || searchParams.get('sort') === 'recent') ? 'bg-primary/20 text-primary' : 'bg-background text-primary/40 hover:bg-primary/10'}`}
              >
                RECENT
              </button>
              <button 
                onClick={() => handleFilterChange('sort', 'relevance')}
                className={`flex-1 text-[10px] font-black uppercase tracking-widest border-l border-primary/30 transition-colors ${searchParams.get('sort') === 'relevance' ? 'bg-primary/20 text-primary' : 'bg-background text-primary/40 hover:bg-primary/10'}`}
              >
                RELEVANCE
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {initialFyps.length === 0 ? (
          <div className="lg:col-span-2 text-center p-24 text-muted-foreground border border-primary/20 bg-primary/5 rounded-none font-mono">
             <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/40 italic">NO_MATCHING_RECORDS_DETECTED</p>
             <p className="mt-4 text-[10px] uppercase tracking-widest opacity-40 max-w-sm mx-auto leading-relaxed">System scan failed to yield valid architectural signatures. Reset filters and re-initialize discovery scan.</p>
          </div>
        ) : (
          initialFyps.map((fyp) => {
              const student = fyp.students
              if (!student) return null; // Fallback bound
              
              const isSignaled = signaledStudentIds.includes(student.id)
              const isLoading = loadingMap[student.id]
              const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles

              return (
                <Card 
                  onClick={() => window.open(`/student/${student.qr_token}`, '_blank')}
                  key={fyp.id} 
                  className="flex flex-col rounded-none border-primary/10 hover:border-primary/50 transition-all duration-300 bg-background shadow-none h-full overflow-hidden relative group/card cursor-pointer"
                >
                  <div className="absolute top-0 right-0 p-2 bg-primary/5 border-l border-b border-primary/20 text-[8px] font-black uppercase tracking-widest text-primary/40 group-hover/card:text-primary/70 transition-colors">PROJECT_ID: {fyp.id.split('-')[0]}</div>
                  
                  <CardContent className="pt-8 flex-1 flex flex-col px-6">
                    <h3 className="text-xl font-black flex items-center gap-2 leading-none mb-4 text-primary uppercase tracking-tighter">
                      <TerminalSquare className="w-5 h-5 opacity-70" /> {fyp.title}
                    </h3>
                    
                    <p className="text-[11px] text-muted-foreground mb-6 flex-1 italic leading-relaxed opacity-80">{fyp.summary || fyp.description}</p>
                    
                    <div className="flex flex-col bg-primary/5 p-4 border border-primary/20 mb-6 relative">
                       <span className="absolute -top-2 right-4 px-2 bg-background border border-primary/20 text-[8px] font-black uppercase tracking-widest text-primary/60">SYSTEM_ARCHITECT</span>
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-black text-primary shrink-0 font-mono">
                           {profile?.full_name?.charAt(0) || 'S'}
                         </div>
                         <div>
                           <p className="text-sm font-black text-primary leading-tight uppercase tracking-tight">{profile?.full_name}</p>
                           <p className="text-[8px] text-muted-foreground uppercase opacity-70 mt-0.5 tracking-widest">{student.degree_program}</p>
                         </div>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {fyp.tech_stack?.slice(0, 5).map((tech: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 border border-primary/20 bg-background text-primary/80 text-[8px] font-black uppercase tracking-widest">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="bg-primary/5 border-t border-primary/10 p-4 flex gap-2">
                    <Link href={`/student/${student.qr_token}`} target="_blank" className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" className="w-full border-primary/20 text-primary/60 font-black text-[10px] tracking-widest uppercase rounded-none">ACCESS_PORTFOLIO</Button>
                    </Link>
                    <Button 
                      onClick={(e) => { e.stopPropagation(); handleSignal(student.id); }} 
                      disabled={isLoading}
                      variant={isSignaled ? "default" : "outline"}
                      className={`flex-1 border-primary/20 text-[10px] tracking-widest uppercase rounded-none ${isSignaled ? 'bg-primary text-primary-foreground font-black' : 'hover:border-primary/50 text-primary font-black'}`}
                    >
                      {isLoading ? 'SYNC...' : (
                        isSignaled ? 'SYSTEM_BOOKMARKED' : 'SIGNAL_INTEREST'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
          })
        )}
      </div>

      {(currentPage > 1 || hasNextPage) && (
        <div className="flex justify-between items-center pt-8 mt-6 border-t border-primary/20">
          <Button 
            variant="outline" 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage <= 1}
            className="w-40 border-primary/30 font-black tracking-widest uppercase text-[10px] rounded-none"
          >
            BACK_STEP
          </Button>
          <span className="system-label text-primary/60">
            RECORD_PAGE_{currentPage}
          </span>
          <Button 
            variant="outline" 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={!hasNextPage}
            className="w-40 border-primary/30 font-black tracking-widest uppercase text-[10px] rounded-none"
          >
            NEXT_STEP
          </Button>
        </div>
      )}
    </div>
  )
}
