import { supabaseAdmin as supabase } from '@/lib/supabase'
import EventCard from '@/components/EventCard'
import styles from './page.module.css'
import HeroSlider from '@/components/HeroSlider'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Obtener actividades y sus archivos relacionados de Supabase
  const { data: actividades, error } = await supabase
    .from('actividades')
    // AQUÍ ESTÁ EL CAMBIO CLAVE: Pedimos también la ruta del archivo
    .select('*, archivos_actividades(ruta_archivo, tipo_archivo)')
    .order('fecha_publicacion', { ascending: false })
    .limit(9)

  return (
    <>
      {/* HERO SECTION */}
      <HeroSlider />
      
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
                  
                  imagenUrl={act.archivos_actividades?.[0]?.ruta_archivo || null}
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
