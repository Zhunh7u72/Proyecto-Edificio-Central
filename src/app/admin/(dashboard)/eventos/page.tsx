import ActividadCrud from '@/components/admin/ActividadCrud'
import { fetchActividadesByTipoWithComentarios } from '@/lib/actividades-query'

export const dynamic = 'force-dynamic'

export default async function EventosPage() {
  const { data, error, comentariosPorActividad } = await fetchActividadesByTipoWithComentarios('Evento')
  return (
    <ActividadCrud
      tipo="Evento"
      pageTitle="Gestión de Eventos"
      pageDescription="Crear, editar y eliminar eventos académicos y culturales."
      actividades={data}
      comentariosPorActividad={comentariosPorActividad}
      dbError={error}
    />
  )
}
