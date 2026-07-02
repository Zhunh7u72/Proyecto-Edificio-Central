import { fetchAllActividades } from '@/lib/actividades-query'
import { fetchComentariosMap } from '@/lib/comentarios-query'
import { fetchInscripcionesMap } from '@/lib/inscripciones-query'
import ActividadesClient from './ActividadesClient'

export const dynamic = 'force-dynamic'

export default async function ActividadesPage() {
  const { data } = await fetchAllActividades()
  const idActividades = data.map((a) => a.id_actividad)
  const comentariosPorActividad = await fetchComentariosMap(idActividades)
  const inscripcionesPorActividad = await fetchInscripcionesMap(idActividades)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-secondary)' }}>
            Gestión de Actividades
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Crea, edita o elimina noticias y eventos. Haz clic en una fila para ver los detalles.</p>
        </div>
      </div>

      <ActividadesClient
        actividades={data}
        comentariosPorActividad={comentariosPorActividad}
        inscripcionesPorActividad={inscripcionesPorActividad}
      />
    </div>
  )
}
