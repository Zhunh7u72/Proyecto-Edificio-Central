import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [{ data: config }, session] = await Promise.all([
    supabase
      .from('informacion_institucional')
      .select('logo_url')
      .limit(1)
      .single(),
    getSession(),
  ])

  return (
    <>
      <Header logoUrl={config?.logo_url} isAuthenticated={Boolean(session)} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
