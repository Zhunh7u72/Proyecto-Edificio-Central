import ActividadCrud from '@/components/admin/ActividadCrud'
import { fetchActividadesByTipoWithComentarios } from '@/lib/actividades-query'

export const dynamic = 'force-dynamic'

export default async function AnunciosPage() {
  const { data, error, comentariosPorActividad } = await fetchActividadesByTipoWithComentarios('Anuncio')
  return (
    <ActividadCrud
      tipo="Anuncio"
      pageTitle="Gestión de Anuncios"
      pageDescription="Crear, editar y eliminar anuncios del Edificio Central."
      actividades={data}
      comentariosPorActividad={comentariosPorActividad}
      dbError={error}
    />
  )
}
