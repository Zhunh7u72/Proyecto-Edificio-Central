import ActividadCrud from '@/components/admin/ActividadCrud'
import { fetchActividadesByTipoWithComentarios } from '@/lib/actividades-query'

export const dynamic = 'force-dynamic'

export default async function CapacitacionesPage() {
  const { data, error, comentariosPorActividad } =
    await fetchActividadesByTipoWithComentarios('Capacitacion')
  return (
    <ActividadCrud
      tipo="Capacitacion"
      pageTitle="Gestión de Capacitaciones"
      pageDescription="Crear, editar y eliminar capacitaciones para estudiantes."
      actividades={data}
      comentariosPorActividad={comentariosPorActividad}
      dbError={error}
    />
  )
}
