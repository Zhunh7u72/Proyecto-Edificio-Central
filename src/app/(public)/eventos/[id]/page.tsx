import { supabaseAdmin as supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EnrollForm from '@/components/EnrollForm'
import CommentsSection from '@/components/CommentsSection'
import ActivityImageCarousel from '@/components/ActivityImageCarousel'
import { TIPO_ARCHIVO_FOTO, esFotoMemoria } from '@/lib/actividad-archivos'
import { fetchComentariosActividad } from '@/lib/comentarios-query'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const idActividad = parseInt(id)

  const [{ data: actividad, error }, inscritosRes, { data: archivos }, { comentarios }] =
    await Promise.all([
      supabase
        .from('actividades')
        .select('*, usuarios(nombres, apellidos)')
        .eq('id_actividad', idActividad)
        .single(),
      supabase
        .from('matriculas_eventos')
        .select('*', { count: 'exact', head: true })
        .eq('id_actividad', idActividad),
      supabase
        .from('archivos_actividades')
        .select('ruta_archivo, tipo_archivo')
        .eq('id_actividad', idActividad)
        .eq('tipo_archivo', TIPO_ARCHIVO_FOTO),
      fetchComentariosActividad(idActividad),
    ])

  const inscritosCount = inscritosRes.count

  if (error || !actividad) {
    notFound()
  }

  const fotosMemoria = (archivos ?? [])
    .map((a) => a.ruta_archivo)
    .filter((ruta) => esFotoMemoria(ruta))

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
            <span className={styles.date}>Publicado el {fechaPub}</span>
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
