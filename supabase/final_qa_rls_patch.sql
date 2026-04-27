-- =====================================
-- FINAL QA PATCH: Fix RLS for Profiles
-- =====================================

-- This patch fixes the critical bug where 'profiles!inner' joins failed for companies
-- because they were not authorized to read student profiles, causing missing job
-- applications and empty FYP discovery feeds.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Profiles are viewable by everyone' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;
END $$;

-- Verify
SELECT 'PATCH COMPLETE' AS status,
  (SELECT count(*) FROM pg_policies WHERE policyname = 'Profiles are viewable by everyone') AS policy_exists;
