import { supabaseAdmin as supabase } from '@/lib/supabase'
import HistorialClient from './HistorialClient'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function HistorialPage() {
  const hoy = new Date().toISOString()

  const { data: actividades } = await supabase
    .from('actividades')
    .select('id_actividad, titulo, descripcion, tipo, fecha_publicacion, fecha_inicio, fecha_fin')
    .or(`fecha_fin.lt.${hoy},and(fecha_fin.is.null,fecha_publicacion.lt.${hoy})`)
    .order('fecha_inicio', { ascending: false })

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
