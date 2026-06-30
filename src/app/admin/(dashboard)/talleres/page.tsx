import styles from '@/components/admin/admin.module.css'
import layoutStyles from '../layout.module.css'
import { fetchActividadesByTipoWithComentarios } from '@/lib/data'
import ActividadCrud from '@/components/admin/ActividadCrud'

export const dynamic = 'force-dynamic'

export default async function TalleresPage() {
  const { data, error, comentariosPorActividad, inscripcionesPorActividad } = await fetchActividadesByTipoWithComentarios('Taller')
  return (
        <p>
          Los talleres estarán disponibles cuando se habilite el tipo en la base de datos. Por ahora
          puedes gestionar <strong>Anuncios</strong>, <strong>Eventos</strong> y{' '}
          <strong>Capacitaciones</strong>.
        </p>
      </div>
    </div>
  )
}
