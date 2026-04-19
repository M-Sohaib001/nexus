import * as z from 'zod'

export const companyProfileSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  description: z.string().max(1000, 'Description too long (max 1000 chars)').optional().nullable(),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  logo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
})

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>
