import Link from 'next/link'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { ACTIVIDADES_SELECT, getRutaImagenActividad } from '@/lib/actividad-archivos'
import CarteleraSection from '@/components/CarteleraSection'
import HeroSlider from '@/components/HeroSlider'
import SidePanelActivos from '@/components/SidePanelActivos'
import ScrollReveal from '@/components/ScrollReveal'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // 1. Últimos 4 eventos para el panel lateral izquierdo
  const { data: recientes } = await supabase
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .order('fecha_publicacion', { ascending: false })
    .limit(4)

  // 2. Agenda completa del mes actual para la cartelera inferior
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: agendaMes, error: errorAgenda } = await supabase
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .gte('fecha_publicacion', firstDayOfMonth)
    .lte('fecha_publicacion', lastDayOfMonth)
    .order('fecha_publicacion', { ascending: false })
    .limit(12)

  // 3. Obtener configuración institucional (carrusel)
  const { data: config } = await supabase
    .from('informacion_institucional')
    .select('carrusel_urls')
    .limit(1)
    .single()

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          RF01 — HERO SECTION: Panel Lateral + Carrusel Grande
          ═══════════════════════════════════════════════════════════ */}
      <section className={styles.heroSection}>
        <div className={styles.heroLayout}>
          {/* Izquierda: 4 últimos eventos con imagen y título */}
          <div className={styles.panelWrapper}>
            <SidePanelActivos items={recientes || []} />
          </div>
          {/* Derecha: Carrusel rotativo grande */}
          <div className={styles.carouselWrapper}>
            <HeroSlider carruselUrls={config?.carrusel_urls} />
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════════
          RF01 (Parte 2) — CARTELERA: Agenda del mes en tarjetas
          ═══════════════════════════════════════════════════════════ */}
      {!errorAgenda && agendaMes && agendaMes.length > 0 ? (
        <CarteleraSection
          actividades={agendaMes.map((act) => ({
            id_actividad: act.id_actividad,
            titulo: act.titulo,
            descripcion: act.descripcion,
            tipo: act.tipo,
            fecha_publicacion: act.fecha_publicacion,
            fecha_limite_inscripcion: act.fecha_limite_inscripcion,
            url_imagen: getRutaImagenActividad(act),
          }))}
        />
      ) : !errorAgenda ? (
        <section id="actividades" className={styles.cartelera}>
          <div className={styles.carteleraContainer}>
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <h3>No hay actividades publicadas este mes</h3>
              <p>Cuando el administrador FEUE publique eventos o anuncios, aparecerán aquí.</p>
            </div>
          </div>
        </section>
      ) : (
        <section id="actividades" className={styles.cartelera}>
          <div className={styles.carteleraContainer}>
            <div className={styles.errorMsg}>
              <p>⚠️ Error al conectar con la base de datos.</p>
              <code>{errorAgenda.message}</code>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
