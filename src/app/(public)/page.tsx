import { supabase } from '@/lib/supabase'
import EventCard from '@/components/EventCard'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Obtener actividades de Supabase
  const { data: actividades, error } = await supabase
    .from('actividades')
    .select('*')
    .order('fecha_publicacion', { ascending: false })
    .limit(9)

  return (
    <>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}>
          <div className={`container ${styles.heroContent}`}>
            <h1 className={styles.heroTitle}>
              Federación de Estudiantes Universitarios del Ecuador
            </h1>
            <p className={styles.heroSubtitle}>
              Universidad Técnica del Norte — Ciencia y Técnica al Servicio del Pueblo
            </p>
            <div className={styles.heroActions}>
              <a href="#actividades" className="btn btn-primary btn-lg">
                Ver Actividades
              </a>
              <a href="/institucional" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
                Conocer más
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className={styles.quickAccess}>
        <div className="container">
          <div className={styles.quickGrid}>
            <div className={styles.quickCard}>
              <span className={styles.quickIcon}>📢</span>
              <h3>Anuncios</h3>
              <p>Últimas noticias y comunicados del Edificio Central</p>
            </div>
            <div className={styles.quickCard}>
              <span className={styles.quickIcon}>🎓</span>
              <h3>Eventos</h3>
              <p>Inscríbete a eventos académicos y culturales</p>
            </div>
            <div className={styles.quickCard}>
              <span className={styles.quickIcon}>📚</span>
              <h3>Capacitaciones</h3>
              <p>Cursos y talleres disponibles para estudiantes</p>
            </div>
            <div className={styles.quickCard}>
              <span className={styles.quickIcon}>🏛️</span>
              <h3>Institucional</h3>
              <p>Misión, visión y directorio de la universidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVIDADES */}
      <section id="actividades" className={`section ${styles.actividades}`}>
        <div className="container">
          <div className="section-title-accent"></div>
          <h2 className="section-title">Noticias y Actividades</h2>
          <p className="section-subtitle">
            Mantente informado de las últimas novedades del Edificio Central
          </p>

          {error && (
            <div className={styles.errorMsg}>
              <p>⚠️ Error al conectar con la base de datos. Verifica la configuración de Supabase.</p>
              <code>{error.message}</code>
            </div>
          )}

          {!error && actividades && actividades.length > 0 ? (
            <div className="grid-3">
              {actividades.map((act) => (
                <EventCard
                  key={act.id_actividad}
                  id={act.id_actividad}
                  titulo={act.titulo}
                  descripcion={act.descripcion}
                  tipo={act.tipo}
                  fecha_publicacion={act.fecha_publicacion}
                  fecha_limite_inscripcion={act.fecha_limite_inscripcion}
                />
              ))}
            </div>
          ) : !error ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <h3>No hay actividades publicadas</h3>
              <p>Cuando el administrador FEUE publique eventos o anuncios, aparecerán aquí.</p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
