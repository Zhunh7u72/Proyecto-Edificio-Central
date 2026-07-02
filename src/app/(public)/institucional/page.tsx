import { supabaseAdmin as supabase } from '@/lib/supabase'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function InstitucionalPage() {
  const { data: autoridades } = await supabase
    .from('autoridades_info_institucional')
    .select('id_autoridades_info_institu, nombres, apellidos, correo_contactos, ruta_foto')

  const { data: facultades } = await supabase
    .from('facultades')
    .select(
      'id_facultad, nombre_facultad, facultades_carreras(id_facultad_carrera, nombre_carrera, contactos_carreras(contacto, tipo_contacto))'
    )

  return (
    <div className={styles.pageWrapper}>
      {/* ENCABEZADO */}
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Representantes Estudiantiles</h1>
          <p className={styles.subtitle}>Federación de Estudiantes Universitarios del Ecuador — UTN</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem', marginBottom: '4rem' }}>

        {/* ════════════════════════════════
            GOBIERNO ESTUDIANTIL
            ════════════════════════════════ */}
        <div className={styles.representantesSection}>
          <div className="section-title-accent"></div>
          <h2 className="section-title">Gobierno Estudiantil</h2>
          <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
            Miembros del Gobierno Estudiantil de la Universidad Técnica del Norte
          </p>

          {autoridades && autoridades.length > 0 ? (
            <div className={styles.autoridadesGrid}>
              {autoridades.map((aut) => (
                <div key={aut.id_autoridades_info_institu} className={styles.autoridadCard}>
                  <div className={styles.autoridadFotoWrapper}>
                    {aut.ruta_foto ? (
                      <img src={aut.ruta_foto} alt={`${aut.nombres} ${aut.apellidos}`} className={styles.autoridadFoto} loading="lazy" />
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
          ) : (
            <div className={styles.emptySection}>
              <span className={styles.emptyIcon}>🏛️</span>
              <h3>Sección en construcción</h3>
              <p>Los representantes del Gobierno Estudiantil serán publicados próximamente por el administrador.</p>
            </div>
          )}
        </div>

        <div className={styles.sectionDivider}></div>

        {/* ════════════════════════════════
            COGOBIERNO ESTUDIANTIL
            ════════════════════════════════ */}
        <div className={styles.representantesSection}>
          <div className="section-title-accent"></div>
          <h2 className="section-title">Cogobierno Estudiantil</h2>
          <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
            Miembros del Cogobierno Estudiantil de la Universidad Técnica del Norte
          </p>

          <div className={styles.emptySection}>
            <span className={styles.emptyIcon}>🤝</span>
            <h3>Sección en construcción</h3>
            <p>Los representantes del Cogobierno Estudiantil serán publicados próximamente por el administrador.</p>
          </div>
        </div>

        <div className={styles.sectionDivider}></div>

        {/* ════════════════════════════════
            DIRECTORIO DE ASOCIACIONES
            ════════════════════════════════ */}
        <div className="section-title-accent"></div>
        <h2 className="section-title">Directorio de Asociaciones</h2>
        <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
          Encuentra los contactos de las Asociaciones Estudiantiles de cada carrera
        </p>

        {(!facultades || facultades.length === 0) ? (
          <div className={styles.emptySection}>
            <span className={styles.emptyIcon}>📋</span>
            <h3>Directorio en actualización</h3>
            <p>El directorio de asociaciones está siendo actualizado. Vuelve pronto.</p>
          </div>
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
