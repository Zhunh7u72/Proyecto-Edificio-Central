import { fetchInscripciones } from '@/lib/inscripciones-query'
import InscripcionesClient from './InscripcionesClient'

export const dynamic = 'force-dynamic'

export default async function InscripcionesPage() {
  const { inscripciones, error } = await fetchInscripciones()

  return (
    <InscripcionesClient inscripciones={inscripciones} dbError={error} />
  )
}
