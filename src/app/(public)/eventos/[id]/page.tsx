import { query } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EnrollForm from '@/components/EnrollForm'
import CommentsSection from '@/components/CommentsSection'
import ActivityImageCarousel from '@/components/ActivityImageCarousel'
import VideoPlayer from '@/components/VideoPlayer'
import { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_VIDEO, esFotoMemoria } from '@/lib/actividad-archivos'
import { fetchComentariosActividad } from '@/lib/comentarios-query'
import { parsePositiveInt } from '@/lib/validar-input'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const idActividad = parsePositiveInt(id)

  if (!idActividad) {
    notFound()
  }

  const [archivosRes, videoRes, inscritosRes, { comentarios }] = await Promise.all([
    query('SELECT ruta_archivo, tipo_archivo FROM archivos_actividades WHERE id_actividad = $1 AND tipo_archivo = $2', [idActividad, TIPO_ARCHIVO_FOTO]),
    query('SELECT ruta_archivo FROM archivos_actividades WHERE id_actividad = $1 AND tipo_archivo = $2', [idActividad, TIPO_ARCHIVO_VIDEO]),
    query('SELECT COUNT(*) as count FROM matriculas_eventos WHERE id_actividad = $1', [idActividad]),
    fetchComentariosActividad(idActividad)
  ])

  const inscritosCount = parseInt(inscritosRes.rows[0]?.count || '0')
  const archivos = archivosRes.rows ?? []
  const videoArchivo = videoRes.rows.length > 0 ? videoRes.rows[0].ruta_archivo : null

  // Obtener actividad (incluyendo video_url)
  const res = await query(`
    SELECT a.*, 
           (SELECT row_to_json(u) FROM (SELECT nombres, apellidos FROM usuarios WHERE id_usuario = a.id_usuario) u) as usuarios
    FROM actividades a
    WHERE a.id_actividad = $1
  `, [parseInt(id)])
  const actividad = res.rows[0]

  if (!actividad) {
    notFound()
  }

  const fotosMemoria = (archivos ?? [])
    .map((a) => a.ruta_archivo)
    .filter((ruta) => esFotoMemoria(ruta))

  const mainImage = (archivos ?? [])
    .map((a) => a.ruta_archivo)
    .find((ruta) => !esFotoMemoria(ruta))

  const fechaPub = new Date(actividad.fecha_publicacion).toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const esInscripcionAbierta = actividad.fecha_fin && new Date() <= new Date(actividad.fecha_fin)
  const fechaFinDate = actividad.fecha_fin ? new Date(actividad.fecha_fin) : null
  const eventoFinalizado = fechaFinDate !== null && fechaFinDate < new Date()

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className="container">
          <Link href="/#actividades" className={styles.backLink}>
            ← Volver a Actividades
          </Link>
          <div className={styles.badgeWrapper}>
            <span className={`badge badge-${actividad.tipo.toLowerCase()}`}>{actividad.tipo}</span>
            {(actividad.mostrar_fecha ?? true) && (
              <span className={styles.date}>Publicado el {fechaPub}</span>
            )}
          </div>
          <h1 className={styles.title}>{actividad.titulo}</h1>
          <p className={styles.author}>
            Publicado por: {actividad.usuarios?.nombres} {actividad.usuarios?.apellidos}
          </p>
        </div>
      </div>

      <div className={`container ${styles.contentGrid}`}>
        <div className={styles.mainCol}>
          <div className={styles.contentBox}>
            <h3 className={styles.sectionTitle}>
              {eventoFinalizado ? 'Resumen del evento' : 'Detalles de la Actividad'}
            </h3>
            
            {mainImage && (
              <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <img src={mainImage} alt={actividad.titulo} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', backgroundColor: '#f3f4f6' }} />
              </div>
            )}

            <div className={styles.description}>
              {actividad.descripcion ? (
                <p>{actividad.descripcion}</p>
              ) : (
                <p>
                  <i>
                    {eventoFinalizado
                      ? 'Aún no hay resumen publicado para este evento.'
                      : 'No hay descripción detallada para esta actividad.'}
                  </i>
                </p>
              )}
            </div>
          </div>

          {(videoArchivo || actividad.video_url) && (
            <div className={styles.contentBox} style={{ marginTop: '2rem' }}>
              <h3 className={styles.sectionTitle}>Video</h3>
              <VideoPlayer videoFile={videoArchivo} videoUrl={actividad.video_url} title={actividad.titulo} />
            </div>
          )}

          {fotosMemoria.length > 0 && (
            <div className={styles.contentBox} style={{ marginTop: '2rem' }}>
              <h3 className={styles.sectionTitle}>Fotografías de evidencia</h3>
              <p className={styles.sectionSubtitle}>
                Imágenes registradas al cerrar la memoria del evento.
              </p>
              <ActivityImageCarousel images={fotosMemoria} title={actividad.titulo} />
            </div>
          )}

          <div className={styles.contentBox} style={{ marginTop: '2rem' }}>
            <CommentsSection idActividad={actividad.id_actividad} comentarios={comentarios} />
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h4>Información de Inscripción</h4>
            <ul className={styles.infoList}>
              <li>
                <strong>Total Inscritos:</strong> {inscritosCount || 0}
              </li>
              {actividad.fecha_fin ? (
                <li>
                  <strong>Cierre de inscripción:</strong>
                  <br />
                  <span className={esInscripcionAbierta ? styles.openText : styles.closedText}>
                    {new Date(actividad.fecha_fin).toLocaleDateString('es-EC', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              ) : (
                <li>
                  <strong>Estado:</strong>
                  <br />
                  <span className={styles.openText}>Libre / No requiere inscripción previa estricta</span>
                </li>
              )}
            </ul>
          </div>

          <div className={styles.formWrapper}>
            {esInscripcionAbierta || !actividad.fecha_fin ? (
              <EnrollForm idActividad={actividad.id_actividad} />
            ) : (
              <div className={styles.closedMessage}>
                <h3>Inscripciones Cerradas</h3>
                <p>El plazo para inscribirse en esta actividad ha finalizado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
