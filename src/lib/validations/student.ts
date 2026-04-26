import * as z from 'zod'

export const studentProfileSchema = z.object({
  degree_program: z.string().min(2, 'Degree program is required'),
  graduation_year: z.number().int().min(2000).max(2100),
  bio: z.string().max(500, 'Bio too long (max 500 chars)').optional().nullable(),
  linkedin_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  github_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  availability: z.enum(['actively_looking', 'open', 'not_available']),
  is_ai_native_builder: z.boolean(),
  skills: z.string().optional().nullable(),
})

export type StudentProfileInput = z.infer<typeof studentProfileSchema>

export const fypSchema = z.object({
  title: z.string().min(3, 'Title required'),
  summary: z.string().min(10, 'Summary required'),
  description: z.string().min(20, 'Description required'),
  tech_stack: z.string().min(2, 'Provide at least one skill')
})

export type FypInput = z.infer<typeof fypSchema>

export const projectSchema = z.object({
  title: z.string().min(3, 'Title required'),
  description: z.string().min(10, 'Description required'),
  tech_stack: z.string().min(2, 'Provide at least one tech skill'),
  github_url: z.union([z.string().url('Must be a valid URL'), z.literal(''), z.null()]).optional(),
  live_url: z.union([z.string().url('Must be a valid URL'), z.literal(''), z.null()]).optional()
})

export type ProjectInput = z.infer<typeof projectSchema>
