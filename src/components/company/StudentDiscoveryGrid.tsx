"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Bookmark, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { toggleInterestSignalAction } from '@/app/(company)/company/discover/actions'
import Link from 'next/link'

export function StudentDiscoveryGrid({
  initialStudents,
  signaledStudentIds,
  currentPage = 1,
  hasNextPage = false
}: {
  initialStudents: any[],
  signaledStudentIds: string[],
  currentPage?: number,
  hasNextPage?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  const handleFilterChange = (key: string, value: string | boolean | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (value === 'all' || value === false || value === '' || value === null) {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
    router.push(`/company/discover?${params.toString()}`, { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`/company/discover?${params.toString()}`)
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
      <Card className="p-4 md:p-6 rounded-none border-primary/20 sticky top-4 z-40 bg-background/95 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <Label className="system-label text-primary/70">PARAM: GRAD_YEAR</Label>
            <Select 
              value={searchParams.get('graduation_year') || 'all'}
              onValueChange={(val) => handleFilterChange('graduation_year', val)}
            >
              <SelectTrigger className="w-full rounded-none border-primary/30 font-mono text-xs uppercase tracking-widest">
                <SelectValue placeholder="ALL_YEARS" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-primary/40 bg-background font-mono text-xs">
                <SelectItem value="all">ALL_RECORDS</SelectItem>
                <SelectItem value="2024">CLASS_2024</SelectItem>
                <SelectItem value="2025">CLASS_2025</SelectItem>
                <SelectItem value="2026">CLASS_2026</SelectItem>
                <SelectItem value="2027">CLASS_2027</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="system-label text-primary/70">PARAM: AVAILABILITY_STATUS</Label>
            <Select 
              value={searchParams.get('availability') || 'all'}
              onValueChange={(val) => handleFilterChange('availability', val)}
            >
              <SelectTrigger className="w-full rounded-none border-primary/30 font-mono text-xs uppercase tracking-widest">
                <SelectValue placeholder="ANY_STATUS" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-primary/40 bg-background font-mono text-xs">
                <SelectItem value="all">ALL_STATUS</SelectItem>
                <SelectItem value="actively_looking">ACTIVE_LOOKING</SelectItem>
                <SelectItem value="open">OPEN_TO_OFFERS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-3 h-10 px-2 border border-primary/20 bg-primary/5">
             <Switch 
               checked={searchParams.get('is_ai_native_builder') === 'true'}
               onCheckedChange={(val) => handleFilterChange('is_ai_native_builder', val)}
               className="data-[state=checked]:bg-primary"
             />
             <Label className="system-label text-primary cursor-pointer flex items-center gap-2" onClick={() => handleFilterChange('is_ai_native_builder', searchParams.get('is_ai_native_builder') !== 'true')}>
                AI_NATIVE_ONLY <CheckCircle2 className="w-3 h-3" />
             </Label>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {initialStudents.length === 0 ? (
          <div className="lg:col-span-2 text-center p-24 text-muted-foreground border border-primary/20 bg-primary/5 rounded-none font-mono">
             <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/40 italic">NO_MATCHING_RECORDS_DETECTED</p>
             <p className="mt-4 text-[10px] uppercase tracking-widest opacity-40 max-w-sm mx-auto leading-relaxed">System scan failed to yield valid talent signatures. Reset filters and re-initialize discovery scan.</p>
          </div>
        ) : (
          initialStudents.map((student) => {
              const isSignaled = signaledStudentIds.includes(student.id)
              const isLoading = loadingMap[student.id]

              const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles
              const latestFyp = student.fyps?.length > 0 ? student.fyps[0] : null

              return (
                <Card key={student.id} className="flex flex-col rounded-none border-primary/10 hover:border-primary/50 transition-all duration-300 bg-background shadow-none h-full overflow-hidden relative group/card">
                  <div className="absolute top-0 right-0 p-2 bg-primary/5 border-l border-b border-primary/20 text-[8px] font-black uppercase tracking-widest text-primary/40 group-hover/card:text-primary/70 transition-colors">CANDIDATE_ID: {student.id.split('-')[0]}</div>
                  <CardContent className="pt-8 flex-1 flex flex-col px-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-none bg-primary/10 border border-primary/30 flex items-center justify-center text-xl font-black text-primary shrink-0 font-mono ring-offset-background group-hover/card:ring-2 ring-primary/20 transition-all">
                        {profile?.full_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="text-lg font-black flex items-center gap-2 leading-none mb-1.5 text-primary uppercase tracking-tighter">
                          {profile?.full_name}
                          {student.is_ai_native_builder && (
                            <span title="AI-Native Builder" className="text-accent hover:animate-pulse transition-all"><CheckCircle2 className="w-4 h-4 ml-0.5" /></span>
                          )}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{student.degree_program} // CLASS_{student.graduation_year}</p>
                      </div>
                    </div>

                    {student.availability === 'actively_looking' && (
                      <div className="mb-6">
                        <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                          STATUS: ACTIVE_LOOKING
                        </span>
                      </div>
                    )}

                    {latestFyp ? (
                      <div className="bg-primary/5 p-4 rounded-none border border-primary/20 relative shadow-inner flex-1">
                        <div className="absolute -top-2 left-3 px-1.5 bg-background text-[8px] font-black uppercase tracking-widest text-primary/60">MODULE: FEATURED_PROJECT</div>
                        <p className="font-black text-sm text-primary uppercase leading-tight tracking-tight mb-2.5">{latestFyp.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {latestFyp.tech_stack?.slice(0, 4).map((tech: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 border border-primary/20 bg-background text-primary/80 text-[8px] font-black uppercase tracking-widest">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1" />
                    )}
                  </CardContent>
                  
                  <CardFooter className="bg-primary/5 border-t border-primary/10 p-4 flex gap-2">
                    <Link href={`/student/${student.qr_token}`} target="_blank" className="flex-1">
                      <Button variant="outline" className="w-full border-primary/20 text-primary/60">ACCESS_PORTFOLIO</Button>
                    </Link>
                    <Button 
                      onClick={() => handleSignal(student.id)} 
                      disabled={isLoading}
                      variant={isSignaled ? "default" : "outline"}
                      className={`flex-1 border-primary/20 ${isSignaled ? 'bg-primary text-primary-foreground font-black' : 'hover:border-primary/50 text-primary font-black'}`}
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
            className="w-40 border-primary/30"
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
            className="w-40 border-primary/30"
          >
            NEXT_STEP
          </Button>
        </div>
      )}
    </div>
  )
}
