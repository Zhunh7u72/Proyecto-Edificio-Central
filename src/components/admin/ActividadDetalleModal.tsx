'use client'

import { useState, useEffect, useActionState } from 'react'
import { toggleVisibilidadActividad, actualizarInfoActividad, eliminarActividad } from '@/app/actions/actividades'
import { eliminarComentario } from '@/app/actions/comentarios'
import { guardarMemoriaActividad } from '@/app/actions/memorias'
import type { MemoriaState } from '@/app/actions/memorias'
import type { Actividad } from '@/lib/types/admin'
import type { ComentarioPublico } from '@/lib/types/comentarios'
import type { InscripcionAdmin } from '@/lib/inscripciones-query'
import { urlPdfInscripcionAdmin } from '@/lib/inscripcion-pdf-url'
import { ACCEPT_SOLO_IMAGENES, ETIQUETA_FORMATOS_IMAGEN } from '@/lib/archivo-constants'
import styles from './ActividadDetalleModal.module.css'

type Tab = 'info' | 'inscritos' | 'comentarios' | 'memoria'

interface Props {
  actividad: Actividad
  comentarios: ComentarioPublico[]
  inscripciones: InscripcionAdmin[]
  onClose: () => void
  onRefresh: () => void
}

export default function ActividadDetalleModal({ actividad, comentarios, inscripciones, onClose, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Info state
  const [titulo, setTitulo] = useState(actividad.titulo)
  const [descripcion, setDescripcion] = useState(actividad.descripcion || '')
  const [fechaInicio, setFechaInicio] = useState(actividad.fecha_inicio || '')
  const [fechaFin, setFechaFin] = useState(actividad.fecha_fin || '')
  const [saving, setSaving] = useState(false)
  const [isVisible, setIsVisible] = useState(actividad.visible !== false)

  // Memoria
  const [memoriaState, memoriaAction, memoriaPending] = useActionState<MemoriaState, FormData>(
    guardarMemoriaActividad,
    undefined
  )

  // Calcular si es vigente
  const now = new Date()
  const fechaFinDate = actividad.fecha_fin ? new Date(actividad.fecha_fin) : null
  const esVigente = !fechaFinDate || fechaFinDate >= now

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Memoria success
  useEffect(() => {
    if (memoriaState?.success) {
      setToast({ type: 'success', text: memoriaState.success })
      onRefresh()
    } else if (memoriaState?.error) {
      setToast({ type: 'error', text: memoriaState.error })
    }
  }, [memoriaState])

  const showToast = (type: 'success' | 'error', text: string) => setToast({ type, text })

  const handleToggleVisibility = async () => {
    const newVisible = !isVisible
    const result = await toggleVisibilidadActividad(actividad.id_actividad, newVisible)
    if (result?.error) {
      showToast('error', result.error)
    } else {
      setIsVisible(newVisible)
      showToast('success', result?.success || 'Visibilidad actualizada.')
      onRefresh()
    }
  }

  const handleSaveInfo = async () => {
    setSaving(true)
    const result = await actualizarInfoActividad(actividad.id_actividad, {
      titulo,
      descripcion,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    })
    setSaving(false)
    if (result?.error) {
      showToast('error', result.error)
    } else {
      showToast('success', result?.success || 'Guardado.')
      onRefresh()
    }
  }

  const handleDeleteComment = async (id: number) => {
    if (!confirm('¿Eliminar este comentario?')) return
    const result = await eliminarComentario(id)
    if (result?.error) {
      showToast('error', result.error)
    } else {
      showToast('success', 'Comentario eliminado.')
      onRefresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${actividad.titulo}" PERMANENTEMENTE? Esta acción no se puede deshacer.`)) return
    const result = await eliminarActividad(actividad.id_actividad)
    if (result?.error) {
      showToast('error', result.error)
    } else {
      onClose()
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* ── Header ── */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={`badge badge-${actividad.tipo.toLowerCase()}`}>{actividad.tipo}</span>
              <span className={styles.headerTitle}>{actividad.titulo}</span>
            </div>
            <div className={styles.headerActions}>
              <span className={`${styles.statusBadge} ${esVigente ? styles.statusVigente : styles.statusPasado}`}>
                {esVigente ? '● Vigente' : '● Finalizado'}
              </span>
              <button
                className={`${styles.visibilityToggle} ${!isVisible ? styles.hidden : ''}`}
                onClick={handleToggleVisibility}
                title={isVisible ? 'Ocultar del público' : 'Mostrar al público'}
              >
                {isVisible ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Visible</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Oculto</>
                )}
              </button>
              <button className={styles.closeBtn} onClick={onClose}>×</button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'info' ? styles.tabActive : ''}`} onClick={() => setActiveTab('info')}>
              📋 Info
            </button>
            <button className={`${styles.tab} ${activeTab === 'inscritos' ? styles.tabActive : ''}`} onClick={() => setActiveTab('inscritos')}>
              👥 Inscritos <span className={styles.tabCount}>{inscripciones.length}</span>
            </button>
            <button className={`${styles.tab} ${activeTab === 'comentarios' ? styles.tabActive : ''}`} onClick={() => setActiveTab('comentarios')}>
              💬 Comentarios <span className={styles.tabCount}>{comentarios.length}</span>
            </button>
            <button className={`${styles.tab} ${activeTab === 'memoria' ? styles.tabActive : ''}`} onClick={() => setActiveTab('memoria')}>
              📸 Memoria
            </button>
          </div>

          {/* ── Content ── */}
          <div className={styles.content}>

            {/* ─── TAB: INFO ─── */}
            {activeTab === 'info' && (
              <div className={styles.infoGrid}>
                <div className={styles.infoField}>
                  <label>Título</label>
                  {esVigente ? (
                    <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                  ) : (
                    <div className={styles.readonlyText}>{titulo}</div>
                  )}
                </div>

                <div className={styles.infoField}>
                  <label>Descripción</label>
                  {esVigente ? (
                    <textarea rows={4} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                  ) : (
                    <div className={styles.readonlyText}>{descripcion || 'Sin descripción'}</div>
                  )}
                </div>

                <div className={styles.dateRow}>
                  <div className={styles.infoField}>
                    <label>Fecha de Inicio</label>
                    {esVigente ? (
                      <input type="datetime-local" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                    ) : (
                      <div className={styles.readonlyText}>
                        {fechaInicio ? new Date(fechaInicio).toLocaleString('es-EC') : 'N/A'}
                      </div>
                    )}
                  </div>
                  <div className={styles.infoField}>
                    <label>Fecha de Fin</label>
                    {esVigente ? (
                      <input type="datetime-local" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                    ) : (
                      <div className={styles.readonlyText}>
                        {fechaFin ? new Date(fechaFin).toLocaleString('es-EC') : 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                {esVigente && (
                  <button className={`btn btn-primary ${styles.saveBtn}`} onClick={handleSaveInfo} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                )}

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={handleDelete}
                    style={{
                      background: 'none', border: '1.5px solid #ef4444', color: '#ef4444',
                      padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
                    }}
                  >
                    🗑️ Eliminar Actividad Permanentemente
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB: INSCRITOS ─── */}
            {activeTab === 'inscritos' && (
              inscripciones.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <h4>No hay inscritos</h4>
                  <p>Aún nadie se ha inscrito en esta actividad.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Fecha</th>
                        <th>PDF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscripciones.map((ins, i) => (
                        <tr key={ins.id_matricula}>
                          <td>{i + 1}</td>
                          <td>{ins.usuarios ? `${ins.usuarios.nombres} ${ins.usuarios.apellidos}` : 'N/A'}</td>
                          <td>{ins.usuarios?.correo || 'N/A'}</td>
                          <td>{new Date(ins.fecha_registro).toLocaleDateString('es-EC')}</td>
                          <td>
                            {ins.pdf_ruta ? (
                              <div className={styles.pdfLinks}>
                                <a
                                  href={urlPdfInscripcionAdmin(ins.pdf_ruta, 'ver')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Ver
                                </a>
                                <a href={urlPdfInscripcionAdmin(ins.pdf_ruta, 'descargar')}>
                                  Descargar
                                </a>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* ─── TAB: COMENTARIOS ─── */}
            {activeTab === 'comentarios' && (
              comentarios.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <h4>Sin comentarios</h4>
                  <p>No hay comentarios en esta actividad.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Comentario</th>
                        <th>Fecha</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {comentarios.map((com) => (
                        <tr key={com.id_comentario}>
                          <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                            {com.usuarios ? `${com.usuarios.nombres} ${com.usuarios.apellidos}` : 'Anónimo'}
                          </td>
                          <td>
                            {com.contenido_texto}
                            {com.archivos_interaccion && com.archivos_interaccion.length > 0 && (
                              <div style={{ marginTop: '0.3rem' }}>
                                {com.archivos_interaccion.map((arch) => (
                                  <a key={arch.id_archivo_inter} href={arch.ruta_archivo} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--utn-red)', fontSize: '0.82rem', fontWeight: 600 }}>
                                    📎 Adjunto
                                  </a>
                                ))}
                              </div>
                            )}
                          </td>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                            {new Date(com.fecha_comentario).toLocaleDateString('es-EC')}
                          </td>
                          <td>
                            <button
                              className={styles.deleteCommentBtn}
                              onClick={() => handleDeleteComment(com.id_comentario)}
                              title="Eliminar comentario"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* ─── TAB: MEMORIA ─── */}
            {activeTab === 'memoria' && (
              esVigente ? (
                <div className={styles.memoriaDisabled}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <h4>Evento aún vigente</h4>
                  <p>La sección de memoria se habilita cuando el evento haya finalizado (fecha de fin pasada).</p>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    Fecha de cierre: <strong>{fechaFinDate ? fechaFinDate.toLocaleDateString('es-EC') : 'Sin definir'}</strong>
                  </p>
                </div>
              ) : (
                <form action={memoriaAction}>
                  <input type="hidden" name="id_actividad" value={actividad.id_actividad} />

                  <div className={styles.infoGrid}>
                    <div className={styles.infoField}>
                      <label>Resumen del Evento <span style={{ color: 'var(--color-danger, #c00)' }}>*</span></label>
                      <textarea
                        name="resumen"
                        rows={4}
                        required
                        placeholder="Describe cómo salió el evento, logros, agradecimientos..."
                      />
                    </div>

                    <div className={styles.infoField}>
                      <label>Subir Fotografías de Evidencia <span style={{ color: 'var(--color-danger, #c00)' }}>*</span></label>
                      <input type="file" name="fotos_archivos" multiple accept={ACCEPT_SOLO_IMAGENES} required />
                      <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                        Obligatorio: resumen y al menos una imagen ({ETIQUETA_FORMATOS_IMAGEN}).
                      </small>
                    </div>

                    <button type="submit" className={`btn btn-primary ${styles.saveBtn}`} disabled={memoriaPending}>
                      {memoriaPending ? 'Guardando...' : '📸 Guardar Memoria'}
                    </button>
                  </div>
                </form>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          {toast.text}
          <button className={styles.toastClose} onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </>
  )
}
