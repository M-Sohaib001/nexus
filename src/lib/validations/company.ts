import * as z from 'zod'

export const companyProfileSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  description: z.string().max(1000, 'Description too long (max 1000 chars)').optional().nullable(),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  logo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
})

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>

export const jobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().optional(), // We'll split this by comma in the action
  location: z.string().optional().nullable(),
  type: z.enum(['full-time', 'part-time', 'internship', 'contract']),
  is_active: z.boolean(),
})

export type JobInput = z.infer<typeof jobSchema>
