-- ============================================
-- NEXUS PRODUCTION PATCH
-- Run this in your Supabase SQL Editor
-- This is SAFE — all statements use IF NOT EXISTS
-- ============================================

-- 1. Add skills column to students (if missing)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS skills TEXT[];

-- 2. Add UNIQUE constraint on fyps.created_by (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fyps_created_by_key'
  ) THEN
    ALTER TABLE public.fyps ADD CONSTRAINT fyps_created_by_key UNIQUE (created_by);
  END IF;
END $$;

-- 3. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[],
  github_url TEXT,
  live_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_projects_student_id ON public.projects(student_id);

-- Projects RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Projects are viewable by everyone' AND tablename = 'projects') THEN
    CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert their own projects' AND tablename = 'projects') THEN
    CREATE POLICY "Students can insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can update their own projects' AND tablename = 'projects') THEN
    CREATE POLICY "Students can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can delete their own projects' AND tablename = 'projects') THEN
    CREATE POLICY "Students can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = student_id);
  END IF;
END $$;

-- 4. Create experiences table
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_experiences_student_id ON public.experiences(student_id);

-- Experiences RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Experiences are viewable by everyone' AND tablename = 'experiences') THEN
    CREATE POLICY "Experiences are viewable by everyone" ON public.experiences FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can manage their own experiences' AND tablename = 'experiences') THEN
    CREATE POLICY "Students can manage their own experiences" ON public.experiences FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- 5. Verify
SELECT 'PATCH COMPLETE' AS status,
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'projects') AS projects_exists,
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'experiences') AS experiences_exists;
