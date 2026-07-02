import ActividadCrud from '@/components/admin/ActividadCrud'
import { fetchActividadesByTipoWithComentarios } from '@/lib/actividades-query'

export const dynamic = 'force-dynamic'

export default async function CapacitacionesPage() {
  const { data, error, comentariosPorActividad, inscripcionesPorActividad } = await fetchActividadesByTipoWithComentarios('Capacitacion')
  return (
    <ActividadCrud
      tipo="Capacitacion"
      pageTitle="Gestión de Capacitaciones"
      pageDescription="Administra los cursos y capacitaciones ofrecidas."
      actividades={data}
      comentariosPorActividad={comentariosPorActividad}
      inscripcionesPorActividad={inscripcionesPorActividad}
      dbError={error}
    />
  )
}
