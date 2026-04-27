import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uofsrqhvlbpxnoyogdel.supabase.co',
  'sb_publishable_MwYEFqdnRcChxEZoA-imcg_E0f8Los4'
)

async function test() {
  await supabase.auth.signInWithPassword({
    email: 'student2@test.com',
    password: 'Test@12345'
  })
  
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Logged in as student2:', user?.id)
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()
    
  console.log('Profile:', profile)
  console.log('Error:', error)
}
test()
