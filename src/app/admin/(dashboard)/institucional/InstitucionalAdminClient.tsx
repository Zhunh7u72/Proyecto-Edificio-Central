'use client'

import { useActionState, useState } from 'react'
import { crearAutoridad, eliminarAutoridad } from '@/app/actions/autoridades'
import type { AutoridadState } from '@/app/actions/autoridades'
import styles from '@/components/admin/admin.module.css'

interface Autoridad {
  id_autoridades_info_institu: number
  nombres: string
  apellidos: string
  correo_contactos: string
  ruta_foto: string
}

export default function InstitucionalAdminClient({
  autoridades,
}: {
  autoridades: Autoridad[]
}) {
  const [showModal, setShowModal] = useState(false)
  const [state, action, isPending] = useActionState<AutoridadState, FormData>(
    crearAutoridad,
    undefined
  )

  const handleEliminar = async (id: number, nombre: string) => {
    if (confirm(`¿Eliminar al representante ${nombre}?`)) {
      await eliminarAutoridad(id)
    }
  }

  // Cerrar modal si la acción tuvo éxito
  if (state?.success && showModal) setShowModal(false)

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Representantes Estudiantiles</h1>
        <p className={styles.pageSubtitle}>
          Gestiona el directorio de Gobierno y Cogobierno que aparece en la página pública de la FEUE.
        </p>
      </div>

      <div className={styles.toolbar}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Agregar Representante
        </button>
        <span className={styles.filterCount}>{autoridades.length} representante(s)</span>
      </div>

      {state?.success && (
        <div className="form-success" style={{ marginBottom: '1rem' }}>{state.success}</div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nombre</th>
              <th>Correo de Contacto</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {autoridades.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyRow}>
                  No hay representantes registrados. Agrega el primero con el botón de arriba.
                </td>
              </tr>
            ) : (
              autoridades.map((aut) => (
                <tr key={aut.id_autoridades_info_institu}>
                  <td>
                    {aut.ruta_foto ? (
                      <img src={aut.ruta_foto} alt={aut.nombres} className={styles.thumb} />
                    ) : (
                      <div className={styles.thumbPlaceholder}>👤</div>
                    )}
                  </td>
                  <td>
                    <strong>{aut.nombres} {aut.apellidos}</strong>
                  </td>
                  <td>
                    <a href={`mailto:${aut.correo_contactos}`} style={{ color: 'var(--utn-red)' }}>
                      {aut.correo_contactos}
                    </a>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.btnDelete}
                        onClick={() =>
                          handleEliminar(
                            aut.id_autoridades_info_institu,
                            `${aut.nombres} ${aut.apellidos}`
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR */}
      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Agregar Representante</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>

            {state?.error && (
              <div className={styles.errorBanner} style={{ marginBottom: '1rem' }}>{state.error}</div>
            )}

            <form action={action}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Nombres *</label>
                  <input name="nombres" className="form-input" placeholder="Ej. María José" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellidos *</label>
                  <input name="apellidos" className="form-input" placeholder="Ej. García López" required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Correo de Contacto *</label>
                  <input
                    name="correo_contactos"
                    type="email"
                    className="form-input"
                    placeholder="maria.garcia@utn.edu.ec"
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">URL de Fotografía (opcional)</label>
                  <input
                    name="ruta_foto"
                    type="url"
                    className="form-input"
                    placeholder="https://... (URL de la foto de perfil)"
                  />
                  <small style={{ color: 'var(--utn-gray)', marginTop: '0.25rem', display: 'block' }}>
                    Puedes guardar las imágenes localmente o pegar un enlace directo.
                  </small>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Guardando...' : 'Guardar Representante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
