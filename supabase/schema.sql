-- Type: user_role
CREATE TYPE public.user_role AS ENUM ('student', 'company_official');

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    (new.raw_user_meta_data->>'role')::public.user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =====================================
-- PHASE 2: Student Profile & FYP System
-- =====================================

-- Phase 2 Enums
CREATE TYPE public.student_availability AS ENUM ('actively_looking', 'open', 'not_available');

-- Table: students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  degree_program TEXT,
  graduation_year INT,
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  availability public.student_availability DEFAULT 'open',
  is_ai_native_builder BOOLEAN DEFAULT false,
  qr_token TEXT UNIQUE NOT NULL,
  resume_url TEXT,
  skills TEXT[]
);

-- Table: fyps
CREATE TABLE IF NOT EXISTS public.fyps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  tech_stack TEXT[],
  created_by UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_qr_token ON public.students(qr_token);
CREATE INDEX IF NOT EXISTS idx_fyps_created_by ON public.fyps(created_by);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyps ENABLE ROW LEVEL SECURITY;


-- =====================================
-- PHASE 3: Company System & Interests
-- =====================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT,
  industry TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT
);

CREATE TABLE IF NOT EXISTS public.interest_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, student_id)
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_signals ENABLE ROW LEVEL SECURITY;

-- Profile Mutation Trigger (Automates symmetrical target instantiations globally)
CREATE OR REPLACE FUNCTION public.handle_profile_mutation()
RETURNS trigger AS $$
BEGIN
  IF new.role = 'student' THEN
    INSERT INTO public.students (id, qr_token)
    VALUES (new.id, substr(md5(random()::text || new.id::text), 0, 9))
    ON CONFLICT (id) DO NOTHING;
  ELSIF new.role = 'company_official' THEN
    INSERT INTO public.companies (id)
    VALUES (new.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_mutation ON public.profiles;
CREATE TRIGGER on_profile_mutation
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_mutation();

-- RLS Policies For Students/FYPs
CREATE POLICY "Students are viewable by everyone" ON public.students FOR SELECT USING (true);
CREATE POLICY "Students can update their own row" ON public.students FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "FYPs are viewable by everyone" ON public.fyps FOR SELECT USING (true);
CREATE POLICY "Students can insert their own FYPs" ON public.fyps FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Students can update their own FYPs" ON public.fyps FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Students can delete their own FYPs" ON public.fyps FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies For Companies
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Companies can update their own row" ON public.companies FOR UPDATE USING (auth.uid() = id);

-- RLS Policies For Signals
CREATE POLICY "Students can view signals aimed at them" ON public.interest_signals FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Companies can view signals they created" ON public.interest_signals FOR SELECT USING (auth.uid() = company_id);
CREATE POLICY "Companies can insert their own signals" ON public.interest_signals FOR INSERT WITH CHECK (auth.uid() = company_id);

-- =====================================
-- PHASE 4: Conversation Cards System
-- =====================================

CREATE TYPE public.conversation_tag AS ENUM ('strong_fit', 'follow_up', 'not_now', 'untagged');

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  tag public.conversation_tag DEFAULT 'untagged',
  private_note TEXT DEFAULT '',
  UNIQUE(student_id, company_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies manage their conversations" ON public.conversations USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);

-- Explicitly absent Student RLS blocks raw 'conversations' table reads entirely enforcing the API constraints natively.

-- security_invoker = true forces PostgREST to evaluate the underlying RLS policies
-- as the authenticated caller, preventing cross-user row leakage via /rest/v1/conversations_public
DROP VIEW IF EXISTS public.conversations_public;
CREATE VIEW public.conversations_public
  WITH (security_invoker = true) AS
SELECT 
  id,
  student_id,
  company_id,
  started_at,
  tag
FROM public.conversations
WHERE student_id = auth.uid() OR company_id = auth.uid();
-- =====================================
-- PHASE 15: Professional Experience
-- =====================================

CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for "Present"
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_experiences_student_id ON public.experiences(student_id);

CREATE POLICY "Experiences are viewable by everyone" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Students can manage their own experiences" ON public.experiences
  FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
