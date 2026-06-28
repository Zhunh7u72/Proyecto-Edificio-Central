import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function InstitucionalPage() {
  const { data: info } = await supabase
    .from('informacion_institucional')
    .select('*')
    .limit(1)
    .single()

  const { data: autoridades } = await supabase
    .from('autoridades_info_institucional')
    .select('*')

  const { data: facultades } = await supabase
    .from('facultades')
    .select('*, facultades_carreras(*)')

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Información Institucional</h1>
          <p className={styles.subtitle}>Conoce más sobre el Edificio Central de la Universidad Técnica del Norte</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem', marginBottom: '4rem' }}>
        <div className="grid-2">
          <div className={styles.card}>
            <div className="section-title-accent"></div>
            <h3>Nuestra Misión</h3>
            <p className={styles.text}>{info?.mision || 'Información no disponible.'}</p>
          </div>
          
          <div className={styles.card}>
            <div className="section-title-accent"></div>
            <h3>Nuestra Visión</h3>
            <p className={styles.text}>{info?.vision || 'Información no disponible.'}</p>
          </div>
        </div>

        <div className={styles.sectionDivider}></div>

        <div className="section-title-accent"></div>
        <h2 className="section-title">Directorio de Facultades</h2>
        <div className={styles.facultadesGrid}>
          {facultades?.map(fac => (
            <div key={fac.id_facultad} className={styles.facultadCard}>
              <h4>{fac.nombre_facultad}</h4>
              {fac.facultades_carreras && fac.facultades_carreras.length > 0 ? (
                <ul>
                  {fac.facultades_carreras.map((car: any) => (
                    <li key={car.id_facultad_carrera}>{car.nombre_carrera}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.textMuted}>No hay carreras registradas.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
