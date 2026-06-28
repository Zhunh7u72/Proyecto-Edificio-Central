import { supabase } from '@/lib/supabase'
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
    .select('*, usuarios(nombres, apellidos)')
    .eq('id_actividad', parseInt(id))
    .single()

  if (error || !actividad) {
    notFound()
  }

  // Obtener inscritos (solo cuenta)
  const { count: inscritosCount } = await supabase
    .from('matriculas_eventos')
    .select('*', { count: 'exact', head: true })
    .eq('id_actividad', actividad.id_actividad)

  const fechaPub = new Date(actividad.fecha_publicacion).toLocaleDateString('es-EC', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  
  const esInscripcionAbierta = actividad.fecha_limite_inscripcion && new Date() <= new Date(actividad.fecha_limite_inscripcion)
  
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
          <p className={styles.author}>Publicado por: {actividad.usuarios?.nombres} {actividad.usuarios?.apellidos}</p>
        </div>
      </div>

      <div className={`container ${styles.contentGrid}`}>
        {/* COLUMNA PRINCIPAL */}
        <div className={styles.mainCol}>
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
          
          {/* Aquí iría la sección de Comentarios y Archivos según el diseño */}
          <div className={styles.contentBox} style={{ marginTop: '2rem' }}>
            <h3 className={styles.sectionTitle}>Material y Comentarios</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Módulo en construcción...</p>
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
              {actividad.fecha_limite_inscripcion ? (
                <li>
                  <strong>Cierre de inscripción:</strong><br />
                  <span className={esInscripcionAbierta ? styles.openText : styles.closedText}>
                    {new Date(actividad.fecha_limite_inscripcion).toLocaleDateString('es-EC', {
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
            {esInscripcionAbierta || !actividad.fecha_limite_inscripcion ? (
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
