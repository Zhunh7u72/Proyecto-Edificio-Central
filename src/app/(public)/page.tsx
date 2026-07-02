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
  const [{ data: agendaMes, error: errorAgenda }, { data: config }] = await Promise.all([
    supabase
      .from('actividades')
      .select(ACTIVIDADES_SELECT)
      .eq('visible', true)
      .order('fecha_publicacion', { ascending: false })
      .limit(12),
    supabase
      .from('informacion_institucional')
      .select('carrusel_urls')
      .limit(1)
      .maybeSingle(),
  ])

  const recientes = (agendaMes ?? []).slice(0, 4)

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
            fecha_fin: act.fecha_fin,
            url_imagen: getRutaImagenActividad(act),
          }))}
        />
      ) : !errorAgenda ? (
        <section id="actividades" className={styles.cartelera}>
          <div className={styles.carteleraContainer}>
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <h3>No hay actividades publicadas</h3>
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
