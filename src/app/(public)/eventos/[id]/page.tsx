import { supabaseAdmin as supabase } from '@/lib/supabase'
import { ACTIVIDADES_SELECT, getRutasImagenesActividad } from '@/lib/actividad-archivos'
import { fetchComentariosActividad } from '@/lib/comentarios-query'
import CommentsSection from '@/components/CommentsSection'
import ActivityImageCarousel from '@/components/ActivityImageCarousel'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EnrollForm from '@/components/EnrollForm'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  
  // Obtener actividad
  const { data: actividad, error } = await supabase
    .from('actividades')
    .select(`${ACTIVIDADES_SELECT}, usuarios(nombres, apellidos)`)
    .eq('id_actividad', parseInt(id))
    .eq('visible', true)
    .single()

  if (error || !actividad) {
    notFound()
  }

  // Obtener inscritos (solo cuenta)
  const { count: inscritosCount } = await supabase
    .from('matriculas_eventos')
    .select('id_matricula', { count: 'exact', head: true })
    .eq('id_actividad', actividad.id_actividad)

  const fechaPub = new Date(actividad.fecha_publicacion).toLocaleDateString('es-EC', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  
  const esInscripcionAbierta = actividad.fecha_fin && new Date() <= new Date(actividad.fecha_fin)
  const imagenes = getRutasImagenesActividad(actividad)

  const autorRaw = actividad.usuarios as { nombres: string; apellidos: string } | { nombres: string; apellidos: string }[] | null
  const autor = Array.isArray(autorRaw) ? autorRaw[0] : autorRaw

  const { comentarios } = await fetchComentariosActividad(actividad.id_actividad)
    return (
    <div className={styles.pageWrapper}>
      {/* HEADER DE LA ACTIVIDAD */}
      <div className={styles.header}>
        <div className="container">
          <Link href="/#actividades" className={styles.backLink}>← Volver a Actividades</Link>
          <div className={styles.badgeWrapper}>
            <span className={`badge badge-${actividad.tipo.toLowerCase()}`}>{actividad.tipo}</span>
            <span className={styles.date}>Publicado el {fechaPub}</span>
          </div>
          <h1 className={styles.title}>{actividad.titulo}</h1>
          <p className={styles.author}>Publicado por: {autor?.nombres} {autor?.apellidos}</p>
        </div>
      </div>

      <div className={`container ${styles.contentGrid}`}>
        {/* COLUMNA PRINCIPAL */}
        <div className={styles.mainCol}>
          {imagenes && imagenes.length > 0 && (
            <ActivityImageCarousel images={imagenes} title={actividad.titulo} />
          )}
          <div className={styles.contentBox}>
            <h3 className={styles.sectionTitle}>Detalles de la Actividad</h3>
            <div className={styles.description}>
              {actividad.descripcion ? (
                <p>{actividad.descripcion}</p>
              ) : (
                <p><i>No hay descripción detallada para esta actividad.</i></p>
              )}
            </div>
          </div>
          
          <div className={styles.contentBox} style={{ marginTop: '2rem' }}>
            <CommentsSection
              idActividad={actividad.id_actividad}
              comentarios={comentarios}
            />
          </div>
        </div>

        {/* SIDEBAR - INSCRIPCIÓN */}
        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h4>Información de Inscripción</h4>
            <ul className={styles.infoList}>
              <li>
                <strong>Total Inscritos:</strong> {inscritosCount || 0}
              </li>
              {actividad.fecha_fin ? (
                <li>
                  <strong>Cierre de evento e inscripción:</strong><br />
                  <span className={esInscripcionAbierta ? styles.openText : styles.closedText}>
                    {new Date(actividad.fecha_fin).toLocaleDateString('es-EC', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit'
                    })}
                  </span>
                </li>
              ) : (
                <li>
                  <strong>Estado:</strong><br />
                  <span className={styles.openText}>Libre / No requiere inscripción previa estricta</span>
                </li>
              )}
            </ul>
          </div>

          {/* Formulario de inscripción */}
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
