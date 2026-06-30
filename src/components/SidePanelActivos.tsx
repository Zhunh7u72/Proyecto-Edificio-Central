import Link from 'next/link'
import { getRutaImagenActividad, ActividadConArchivos } from '@/lib/actividad-archivos'
import styles from './SidePanelActivos.module.css'

interface Activity extends ActividadConArchivos {
  id_actividad: number
  titulo: string
  tipo: string
  fecha_fin?: string | null
}

export default function SidePanelActivos({ items }: { items: Activity[] }) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>
          <span className={styles.pulseIcon}>🔥</span> Últimos Eventos
        </h3>
      </div>

      <div className={styles.list}>
        {items.length === 0 ? (
          <p className={styles.empty}>No hay eventos recientes en este momento.</p>
        ) : (
          items.slice(0, 4).map((item) => {
            const imagen = getRutaImagenActividad(item)
            return (
              <Link key={item.id_actividad} href={`/eventos/${item.id_actividad}`} className={styles.card}>
                <div className={styles.cardImageWrapper}>
                  {imagen ? (
                    <img src={imagen} alt={item.titulo} className={styles.cardImage} loading="lazy" />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>
                      <span>📰</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.tipoBadge}>{item.tipo}</span>
                  <h4 className={styles.title}>{item.titulo}</h4>
                </div>
              </Link>
            )
          })
        )}
      </div>

      <div className={styles.panelFooter}>
        <Link href="/#actividades" className={styles.viewAll}>Ver toda la agenda →</Link>
      </div>
    </div>
  )
}
