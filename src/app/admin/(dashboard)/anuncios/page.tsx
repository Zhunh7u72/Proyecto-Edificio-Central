import ActividadCrud from '@/components/admin/ActividadCrud'
import { fetchActividadesByTipoWithComentarios } from '@/lib/actividades-query'

export const dynamic = 'force-dynamic'

export default async function AnunciosPage() {
  const { data, error, comentariosPorActividad, inscripcionesPorActividad } = await fetchActividadesByTipoWithComentarios('Anuncio')
  return (
    <ActividadCrud
      tipo="Anuncio"
      pageTitle="Gestión de Anuncios"
      pageDescription="Crear, editar y eliminar anuncios institucionales."
      actividades={data}
      comentariosPorActividad={comentariosPorActividad}
      inscripcionesPorActividad={inscripcionesPorActividad}
      dbError={error}
    />
  )
}
