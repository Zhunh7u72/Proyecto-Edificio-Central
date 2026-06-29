import Link from 'next/link'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { ACTIVIDADES_SELECT, getRutaImagenActividad } from '@/lib/actividad-archivos'
import EventCard from '@/components/EventCard'
import HeroSlider from '@/components/HeroSlider'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { data: actividades, error } = await supabase
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .order('fecha_publicacion', { ascending: false })
    .limit(9)

  return (
    <>
      <HeroSlider />

      {/* ACCESOS RÁPIDOS */}
      <section className={styles.quickAccess}>
        <div className="container">
          <div className={styles.quickGrid}>
            <Link href="/#actividades" className={styles.quickCard}>
              <span className={styles.quickIcon}>📢</span>
              <h3>Anuncios</h3>
              <p>Últimas noticias y comunicados del Edificio Central</p>
            </Link>
            <Link href="/#actividades" className={styles.quickCard}>
              <span className={styles.quickIcon}>🎓</span>
              <h3>Eventos</h3>
              <p>Inscríbete a eventos académicos y culturales</p>
            </Link>
            <Link href="/galeria" className={styles.quickCard}>
              <span className={styles.quickIcon}>📷</span>
              <h3>Galería</h3>
              <p>Fotografías de actividades y eventos institucionales</p>
            </Link>
            <Link href="/documentos" className={styles.quickCard}>
              <span className={styles.quickIcon}>📄</span>
              <h3>Documentos PDF</h3>
              <p>Descarga documentos oficiales en formato PDF</p>
            </Link>
            <Link href="/#actividades" className={styles.quickCard}>
              <span className={styles.quickIcon}>📚</span>
              <h3>Capacitaciones</h3>
              <p>Cursos y talleres disponibles para estudiantes</p>
            </Link>
            <Link href="/institucional" className={styles.quickCard}>
              <span className={styles.quickIcon}>🏛️</span>
              <h3>Institucional</h3>
              <p>Misión, visión y directorio de la universidad</p>
            </Link>
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
                  url_imagen={getRutaImagenActividad(act)}
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
