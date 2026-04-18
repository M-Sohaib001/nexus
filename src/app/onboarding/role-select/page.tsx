"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { updateRoleAction } from './actions'

export default function RoleSelectPage() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!role) {
      setError("Please select a role to continue")
      return
    }
    
    setLoading(true)
    setError(null)
    
    const result = await updateRoleAction(role)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(role === 'student' ? '/student/dashboard' : '/company/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm rounded-none border-primary/20 bg-primary/5 shadow-none">
        <CardHeader className="border-b border-primary/20 pb-6 pt-8">
          <CardTitle className="system-header text-primary text-center">INITIALIZE_IDENTITY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-center opacity-60">
            Authenticated session detected. Manual role assignment required to initialize system modules.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="system-label text-primary/70">SELECT_AUTHORITY_LEVEL</Label>
              <Select onValueChange={setRole}>
                <SelectTrigger className="rounded-none border-primary/30 font-mono text-xs uppercase tracking-widest">
                  <SelectValue placeholder="NULL_ROLE" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-primary/40 bg-background font-mono text-xs">
                  <SelectItem value="student">STUDENT_USER</SelectItem>
                  <SelectItem value="company_official">COMPANY_AUTHORITY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-[10px] text-accent font-black uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]">{error}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full rounded-none font-black text-xs uppercase tracking-[0.2em] h-12" disabled={loading}>
            {loading ? 'SYNCING...' : 'ASSIGN_IDENTITY_AND_LAUNCH'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
