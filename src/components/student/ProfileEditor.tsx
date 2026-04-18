"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { QRCodeSVG } from 'qrcode.react'

import { studentProfileSchema, type StudentProfileInput } from '@/lib/validations/student'
import { saveStudentProfileAction } from '@/app/(student)/student/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function ProfileEditor({ initialData, originUrl }: { initialData: any, originUrl: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const form = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      degree_program: initialData?.degree_program || '',
      graduation_year: initialData?.graduation_year || new Date().getFullYear(),
      bio: initialData?.bio || '',
      linkedin_url: initialData?.linkedin_url || '',
      github_url: initialData?.github_url || '',
      availability: initialData?.availability || 'open',
      is_ai_native_builder: initialData?.is_ai_native_builder || false,
    },
  })

  async function onSubmit(data: StudentProfileInput) {
    setLoading(true)
    setMessage('')
    const result = await saveStudentProfileAction(data)
    if (result.error) setMessage(result.error)
    else setMessage("Profile updated successfully!")
    setLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Public Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Degree Program</Label>
              <Input {...form.register('degree_program')} />
              {form.formState.errors.degree_program && <p className="text-red-500 text-sm">{form.formState.errors.degree_program.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Input type="number" {...form.register('graduation_year', { valueAsNumber: true })} />
              {form.formState.errors.graduation_year && <p className="text-red-500 text-sm">{form.formState.errors.graduation_year.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea {...form.register('bio')} rows={3} />
            {form.formState.errors.bio && <p className="text-red-500 text-sm">{form.formState.errors.bio.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input type="url" placeholder="https://linkedin.com/in/..." {...form.register('linkedin_url')} />
            </div>
            <div className="space-y-2">
              <Label>GitHub URL</Label>
              <Input type="url" placeholder="https://github.com/..." {...form.register('github_url')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select onValueChange={(val: any) => form.setValue('availability', val, { shouldValidate: true })} defaultValue={form.getValues('availability')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actively_looking">Actively Looking</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="not_available">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Switch 
                checked={form.watch('is_ai_native_builder')} 
                onCheckedChange={(val: boolean) => form.setValue('is_ai_native_builder', val, { shouldValidate: true })} 
              />
              <Label>AI-Native Builder Badge</Label>
            </div>
          </div>

          {message && <p className="text-sm font-medium">{message}</p>}
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
        
        {initialData?.qr_token && (
          <div className="mt-8 p-6 bg-muted/50 rounded-lg flex flex-col md:flex-row items-center border border-border shadow-sm space-y-4 md:space-y-0 md:space-x-6">
             <div className="p-2 bg-white rounded-md">
               <QRCodeSVG value={`${originUrl}/student/${initialData.qr_token}`} size={120} />
             </div>
             <div className="text-center md:text-left">
               <h3 className="font-semibold text-lg flex items-center justify-center md:justify-start gap-2">
                  Networking QR Code
               </h3>
               <p className="text-sm text-muted-foreground mb-3 max-w-sm">
                 Scan or share your unique link during real-life networking connections instantly showcasing your achievements.
               </p>
               <a href={`${originUrl}/student/${initialData.qr_token}`} target="_blank" className="font-mono text-sm text-primary hover:underline truncate inline-block max-w-[250px]">
                 {originUrl}/student/{initialData.qr_token}
               </a>
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
