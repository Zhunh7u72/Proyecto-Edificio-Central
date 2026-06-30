import Link from 'next/link'
import styles from './SidePanelActivos.module.css'

interface Activity {
  id_actividad: number
  titulo: string
  tipo: string
  fecha_fin?: string | null
}

export default function SidePanelActivos({ items }: { items: Activity[] }) {
  return (
    <div className={styles.panelContainer}>
      <h3 className={styles.panelTitle}>
        <span className={styles.pulseIcon}>📅</span> Esta Semana
      </h3>
      
      <div className={styles.list}>
        {items.length === 0 ? (
          <p className={styles.empty}>No hay eventos urgentes activos en este momento.</p>
        ) : (
          items.map((item) => (
            <Link key={item.id_actividad} href={`/eventos/${item.id_actividad}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`badge badge-${item.tipo.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                  {item.tipo}
                </span>
                {item.fecha_fin && (
                  <span className={styles.date}>
                    Cierra: {new Date(item.fecha_fin).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              <h4 className={styles.title}>{item.titulo}</h4>
              <span className={styles.linkText}>Ver detalles →</span>
            </Link>
          ))
        )}
      </div>
      
      <div className={styles.panelFooter}>
        <Link href="/#actividades" className={styles.viewAll}>Ver toda la agenda</Link>
      </div>
    </div>
  )
}
