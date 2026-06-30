import Link from 'next/link'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { ACTIVIDADES_SELECT, getRutaImagenActividad } from '@/lib/actividad-archivos'
import EventCard from '@/components/EventCard'
import Carousel from '@/components/Carousel'
import SidePanelActivos from '@/components/SidePanelActivos'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // 1. Obtener destacados para el carrusel (los 5 más recientes)
  const { data: destacados } = await supabase
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .order('fecha_publicacion', { ascending: false })
    .limit(5)

  // 2. Panel lateral: eventos cuya fecha_inicio cae en la semana actual
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1) // Lunes
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // Domingo
  endOfWeek.setHours(23, 59, 59, 999)

  const { data: urgentes } = await supabase
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .gte('fecha_inicio', startOfWeek.toISOString())
    .lte('fecha_inicio', endOfWeek.toISOString())
    .order('fecha_inicio', { ascending: true })
    .limit(6)

  // 3. Agenda del mes actual — basada en fecha_inicio
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: agendaMes, error: errorAgenda } = await supabase
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .gte('fecha_inicio', firstDayOfMonth)
    .lte('fecha_inicio', lastDayOfMonth)
    .order('fecha_inicio', { ascending: true })

  return (
    <>
      {/* SECCIÓN PRINCIPAL: CARRUSEL Y PANEL LATERAL */}
      <section className={`section ${styles.heroSection}`}>
        <div className={`container ${styles.heroLayout}`}>
          <div className={styles.carouselWrapper}>
            <Carousel items={(destacados || []).map(d => ({...d, url_imagen: getRutaImagenActividad(d)}))} />
          </div>
          <div className={styles.panelWrapper}>
            <SidePanelActivos items={urgentes || []} />
          </div>
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className={styles.quickAccess}>
        <div className="container">
          <div className={styles.quickGrid}>
            <Link href="/institucional" className={styles.quickCard}>
              <span className={styles.quickIcon}>🏛️</span>
              <h3>Institucional</h3>
              <p>Misión, visión y directorio de la FEUE y Asos</p>
            </Link>
            <Link href="/galerias" className={styles.quickCard}>
              <span className={styles.quickIcon}>📷</span>
              <h3>Galería</h3>
              <p>Fotografías de actividades y eventos</p>
            </Link>
            <Link href="/documentos" className={styles.quickCard}>
              <span className={styles.quickIcon}>📄</span>
              <h3>Documentos</h3>
              <p>Descarga documentos oficiales y resoluciones</p>
            </Link>
            <Link href="/historial" className={styles.quickCard}>
              <span className={styles.quickIcon}>🕰️</span>
              <h3>Historial</h3>
              <p>Baúl de los recuerdos de eventos pasados</p>
            </Link>
          </div>
        </div>
      </section>

      {/* AGENDA DEL MES */}
      <section id="actividades" className={`section ${styles.actividades}`}>
        <div className="container">
          <div className="section-title-accent"></div>
          <h2 className="section-title">Agenda del Mes</h2>
          <p className="section-subtitle">
            Catálogo completo de eventos y actividades programadas para este mes
          </p>

          {errorAgenda && (
            <div className={styles.errorMsg}>
              <p>⚠️ Error al conectar con la base de datos.</p>
              <code>{errorAgenda.message}</code>
            </div>
          )}

          {!errorAgenda && agendaMes && agendaMes.length > 0 ? (
            <div className="grid-3">
              {agendaMes.map((act) => (
                <EventCard
                  key={act.id_actividad}
                  id={act.id_actividad}
                  titulo={act.titulo}
                  descripcion={act.descripcion}
                  tipo={act.tipo}
                  fecha_publicacion={act.fecha_publicacion}
                  fecha_inicio={act.fecha_inicio}
                  fecha_fin={act.fecha_fin}
                  url_imagen={getRutaImagenActividad(act)}
                />
              ))}
            </div>
          ) : !errorAgenda ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📅</span>
              <h3>Mes sin actividades</h3>
              <p>No se han publicado eventos para este mes todavía.</p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
