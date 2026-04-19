import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CompanyProfileEditor } from '@/components/company/CompanyProfileEditor'

export default async function CompanyProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (companyError) console.error('QUERY_ERROR (company_profile):', companyError);
  if (!company) return notFound()

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <CompanyProfileEditor initialData={company} />
    </div>
  )
}
