import { supabaseAdmin as supabase } from '@/lib/supabase'
import { ACTIVIDADES_SELECT, getRutaImagenActividad } from '@/lib/actividad-archivos'
import CarteleraSection from '@/components/CarteleraSection'
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

      {!error && actividades && actividades.length > 0 ? (
        <CarteleraSection
          actividades={actividades.map((act) => ({
            id_actividad: act.id_actividad,
            titulo: act.titulo,
            descripcion: act.descripcion,
            tipo: act.tipo,
            fecha_publicacion: act.fecha_publicacion,
            fecha_limite_inscripcion: act.fecha_limite_inscripcion,
            url_imagen: getRutaImagenActividad(act),
          }))}
        />
      ) : !error ? (
        <section id="actividades" className={styles.cartelera}>
          <div className={styles.carteleraContainer}>
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <h3>No hay actividades publicadas</h3>
              <p>Cuando el administrador FEUE publique eventos o anuncios, aparecerán aquí.</p>
            </div>
          </div>
        </section>
      ) : (
        <section id="actividades" className={styles.cartelera}>
          <div className={styles.carteleraContainer}>
            {error && (
              <div className={styles.errorMsg}>
                <p>⚠️ Error al conectar con la base de datos. Verifica la configuración de Supabase.</p>
                <code>{error.message}</code>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
