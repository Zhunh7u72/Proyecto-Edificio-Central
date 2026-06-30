import Link from 'next/link'
import styles from './EventCard.module.css'

interface EventCardProps {
  id: number
  titulo: string
  descripcion: string | null
  tipo: string
  fecha_publicacion: string
  fecha_inicio?: string | null
  fecha_fin?: string | null
  url_imagen?: string | null
}

export default function EventCard({
  id,
  titulo,
  descripcion,
  tipo,
  fecha_publicacion,
  fecha_inicio,
  fecha_fin,
  url_imagen,
}: EventCardProps) {
  const badgeClass =
    tipo === 'Evento'
      ? styles.badgeEvento
      : tipo === 'Anuncio'
        ? styles.badgeAnuncio
        : tipo === 'Taller'
          ? styles.badgeTaller
          : styles.badgeCapacitacion

  const fechaPub = new Date(fecha_inicio ?? fecha_publicacion).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className={styles.card}>
      <div className={styles.cardImageWrapper}>
        {url_imagen ? (
          <img src={url_imagen} alt={titulo} className={styles.cardImage} />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <span className={styles.cardImageIcon}>📰</span>
          </div>
        )}
        <span className={`${styles.badge} ${badgeClass}`}>{tipo}</span>
      </div>
      <div className={styles.cardBody}>
        <span className={styles.date}>{fechaPub}</span>
        <h3 className={styles.title}>{titulo}</h3>
        <p className={styles.excerpt}>
          {descripcion
            ? descripcion.length > 120
              ? descripcion.substring(0, 120) + '...'
              : descripcion
            : 'Sin descripción disponible.'}
        </p>
        <div className={styles.cardFooter}>
          {fecha_fin && (
            <span className={styles.deadline}>
              ⏰ Cierre: {new Date(fecha_fin).toLocaleDateString('es-EC')}
            </span>
          )}
          <Link href={`/eventos/${id}`} className={styles.readMore}>
            Ver más →
          </Link>
        </div>
      </div>
    </div>
  )
}
