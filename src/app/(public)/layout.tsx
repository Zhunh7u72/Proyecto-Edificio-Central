import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { query } from '@/lib/db'
import { getSession } from '@/lib/session'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [infoRes, session] = await Promise.all([
    query('SELECT logo_url FROM informacion_institucional LIMIT 1'),
    getSession(),
  ])
  const config = infoRes.rows.length > 0 ? infoRes.rows[0] : null

  return (
    <>
      <Header logoUrl={config?.logo_url} isAuthenticated={Boolean(session)} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
