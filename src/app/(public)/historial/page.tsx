import { query } from '@/lib/db'
import HistorialClient from './HistorialClient'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function HistorialPage() {
  const hoy = new Date().toISOString()

  const res = await query(`
    SELECT id_actividad, titulo, descripcion, tipo, fecha_publicacion, fecha_inicio, fecha_fin
    FROM actividades
    WHERE fecha_fin < $1 OR (fecha_fin IS NULL AND fecha_publicacion < $1)
    ORDER BY fecha_inicio DESC
  `, [hoy])
  const actividades = res.rows

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>🕰️ Baúl de los Recuerdos</h1>
          <p className={styles.subtitle}>
            Historial completo de eventos, anuncios y capacitaciones pasadas
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <HistorialClient actividades={actividades ?? []} />
      </div>
    </div>
  )
}
