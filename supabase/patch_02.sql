-- =====================================
-- PATCH 02: Bug fixes & Security
-- Apply this in Supabase SQL Editor
-- =====================================

-- 1. Add DELETE policy for interest_signals (Issue #1)
--    Allows companies to un-bookmark students.
CREATE POLICY "Companies can delete their own signals" ON public.interest_signals
  FOR DELETE USING (auth.uid() = company_id);


-- 2. Secure role casting in handle_new_user (Issue #13)
--    Prevents metadata injection by whitelisting valid roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_role text;
  final_role public.user_role;
BEGIN
  extracted_role := new.raw_user_meta_data->>'role';
  
  IF extracted_role = 'company_official' THEN
    final_role := 'company_official'::public.user_role;
  ELSE
    final_role := 'student'::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    final_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. Create conversations_public view for students (Issue #10)
--    Students can only see company_id and timing — not private notes.
CREATE OR REPLACE VIEW public.conversations_public AS
  SELECT id, student_id, company_id, started_at
  FROM public.conversations;

GRANT SELECT ON public.conversations_public TO authenticated;


-- 4. RLS policy for conversations — companies can only see their own (Issue #7)
--    Prevents a company from reading another's CRM data.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversations' AND policyname = 'Companies read own conversations'
  ) THEN
    CREATE POLICY "Companies read own conversations" ON public.conversations
      FOR SELECT USING (auth.uid() = company_id);
  END IF;
END $$;

DO $$ BEGIN  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversations' AND policyname = 'Companies update own conversations'
  ) THEN
    CREATE POLICY "Companies update own conversations" ON public.conversations
      FOR UPDATE USING (auth.uid() = company_id);
  END IF;
END $$;
