-- =====================================
-- PHASE 16: Job Portal Patch
-- =====================================

CREATE TYPE public.job_type AS ENUM ('full-time', 'part-time', 'internship', 'contract');
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  location TEXT,
  type public.job_type DEFAULT 'full-time',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  status public.application_status DEFAULT 'pending',
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, student_id)
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.job_applications(student_id);

-- RLS Policies For Jobs
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Companies can manage their own jobs" ON public.jobs
  FOR ALL USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);

-- RLS Policies For Job Applications
-- Students can view their own applications. Companies can view applications for their jobs.
CREATE POLICY "Students can view their own applications" ON public.job_applications
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Companies can view applications for their jobs" ON public.job_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND company_id = auth.uid())
  );

CREATE POLICY "Students can apply to jobs" ON public.job_applications
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Companies can update application status" ON public.job_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND company_id = auth.uid())
  );
