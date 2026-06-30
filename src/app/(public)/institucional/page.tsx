import { supabaseAdmin as supabase } from '@/lib/supabase'
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
    .select(`*, facultades_carreras(*, contactos_carreras(*))`)

  return (
    <div className={styles.pageWrapper}>
      {/* ENCABEZADO */}
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>FEUE — Edificio Central UTN</h1>
          <p className={styles.subtitle}>Federación de Estudiantes Universitarios del Ecuador — UTN</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem', marginBottom: '4rem' }}>

        {/* MISIÓN Y VISIÓN */}
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

        {/* REPRESENTANTES ESTUDIANTILES */}
        {autoridades && autoridades.length > 0 && (
          <>
            <div className="section-title-accent"></div>
            <h2 className="section-title">Representantes Estudiantiles</h2>
            <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
              Conoce a quienes forman parte del Gobierno y Cogobierno Estudiantil de la UTN
            </p>
            <div className={styles.autoridadesGrid}>
              {autoridades.map((aut) => (
                <div key={aut.id_autoridades_info_institu} className={styles.autoridadCard}>
                  <div className={styles.autoridadFotoWrapper}>
                    {aut.ruta_foto ? (
                      <img src={aut.ruta_foto} alt={`${aut.nombres} ${aut.apellidos}`} className={styles.autoridadFoto} />
                    ) : (
                      <div className={styles.autoridadFotoPlaceholder}>
                        <span>👤</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.autoridadInfo}>
                    <h4 className={styles.autoridadNombre}>{aut.nombres} {aut.apellidos}</h4>
                    <a href={`mailto:${aut.correo_contactos}`} className={styles.autoridadCorreo}>
                      ✉️ {aut.correo_contactos}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.sectionDivider}></div>
          </>
        )}

        {/* DIRECTORIO DE ASOCIACIONES POR CARRERA */}
        <div className="section-title-accent"></div>
        <h2 className="section-title">Directorio de Asociaciones</h2>
        <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
          Encuentra los contactos de las Asociaciones Estudiantiles de cada carrera
        </p>

        {(!facultades || facultades.length === 0) ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
            El directorio está siendo actualizado. Vuelve pronto.
          </p>
        ) : (
          facultades.map((fac) => (
            <div key={fac.id_facultad} className={styles.facultadSection}>
              <h3 className={styles.facultadTitle}>🏛️ {fac.nombre_facultad}</h3>
              {fac.facultades_carreras && fac.facultades_carreras.length > 0 ? (
                <div className={styles.carrerasGrid}>
                  {(fac.facultades_carreras as any[]).map((car) => (
                    <div key={car.id_facultad_carrera} className={styles.carreraCard}>
                      <h4 className={styles.carreraNombre}>{car.nombre_carrera}</h4>
                      {car.contactos_carreras && car.contactos_carreras.length > 0 ? (
                        <ul className={styles.contactosList}>
                          {(car.contactos_carreras as any[]).map((ct) => (
                            <li key={ct.id_carreras_contac} className={styles.contactoItem}>
                              {ct.tipo_contacto === 'mail' && <span>✉️</span>}
                              {ct.tipo_contacto === 'telf' && <span>📞</span>}
                              {ct.tipo_contacto === 'whatsapp' && <span>💬</span>}
                              {ct.tipo_contacto === 'mail' ? (
                                <a href={`mailto:${ct.contacto}`} className={styles.contactoLink}>{ct.contacto}</a>
                              ) : (
                                <span className={styles.contactoText}>{ct.contacto}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.textMuted}>Sin contactos registrados.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.textMuted}>No hay carreras registradas para esta facultad.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
