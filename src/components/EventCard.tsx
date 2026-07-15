import Link from 'next/link'
import styles from './EventCard.module.css'

interface EventCardProps {
  id: number
  titulo: string
  descripcion: string | null
  tipo: string
  fecha_publicacion: string
  fecha_fin: string | null
  url_imagen?: string | null
  url_video?: string | null
}

function tipoLabel(tipo: string) {
  if (tipo === 'Capacitacion') return 'Capacitación'
  return tipo
}

export default function EventCard({
  id,
  titulo,
  descripcion,
  tipo,
  fecha_publicacion,
  fecha_fin,
  url_imagen,
  url_video,
}: EventCardProps) {
  const fecha = new Date(fecha_publicacion)
  const dia = fecha.getDate()
  const mes = fecha.toLocaleDateString('es-EC', { month: 'short' }).replace('.', '').toUpperCase()

  const resumen = descripcion
    ? descripcion.length > 100
      ? descripcion.substring(0, 100) + '...'
      : descripcion
    : 'Sin descripción disponible.'

  return (
    <Link href={`/eventos/${id}`} className={styles.card}>
      <div className={styles.cardImageWrapper}>
        {url_imagen ? (
          <img src={url_imagen} alt={titulo} className={styles.cardImage} loading="lazy" />
        ) : url_video ? (
          <video 
            src={`${url_video}#t=0.1`} 
            preload="metadata" 
            className={styles.cardImage} 
            style={{ objectFit: 'cover' }} 
            muted 
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <span className={styles.cardImageIcon}>📰</span>
          </div>
        )}
        <div className={styles.dateBadge} aria-hidden="true">
          <span className={styles.dateDay}>{dia}</span>
          <span className={styles.dateMonth}>{mes}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.tipoLabel}>{tipoLabel(tipo)}</p>
        <h3 className={styles.title}>{titulo}</h3>
        <p className={styles.excerpt}>{resumen}</p>
        {fecha_fin && (
          <p className={styles.deadline}>
            Inscripción hasta{' '}
            {new Date(fecha_fin).toLocaleDateString('es-EC', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
        <span className={styles.readMore}>Ver más →</span>
      </div>
    </Link>
  )
}
