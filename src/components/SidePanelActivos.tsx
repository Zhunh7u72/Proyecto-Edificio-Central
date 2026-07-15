import Link from 'next/link'
import { getRutaImagenActividad, getRutaVideoActividad, ActividadConArchivos } from '@/lib/actividad-archivos'
import styles from './SidePanelActivos.module.css'

interface Activity extends ActividadConArchivos {
  id_actividad: number
  titulo: string
  tipo: string
  fecha_fin?: string | null
  url_imagen?: string | null
  video_url?: string | null
}

export default function SidePanelActivos({ items }: { items: Activity[] }) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>
          <span className={styles.pulseIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
          </span> Últimos Eventos
        </h3>
      </div>

      <div className={styles.list}>
        {items.length === 0 ? (
          <p className={styles.empty}>No hay eventos recientes en este momento.</p>
        ) : (
          items.slice(0, 4).map((item) => {
            const imagen = item.url_imagen || getRutaImagenActividad(item)
            const videoRuta = item.video_url || getRutaVideoActividad(item)

            return (
              <Link key={item.id_actividad} href={`/eventos/${item.id_actividad}`} className={styles.card}>
                <div className={styles.cardImageWrapper}>
                  {imagen ? (
                    <img src={imagen} alt={item.titulo} className={styles.cardImage} loading="lazy" />
                  ) : videoRuta ? (
                    <div className={styles.cardImagePlaceholder} style={{ background: '#1a1a2e' }}>
                      <span style={{ fontSize: '2rem' }}>🎥</span>
                    </div>
                  ) : (
                    <div className={styles.cardImagePlaceholder}>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                      </span>
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
