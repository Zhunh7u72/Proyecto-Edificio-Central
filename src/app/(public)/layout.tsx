import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: config } = await supabase
    .from('informacion_institucional')
    .select('logo_url')
    .limit(1)
    .single()

  return (
    <>
      <Header logoUrl={config?.logo_url} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
