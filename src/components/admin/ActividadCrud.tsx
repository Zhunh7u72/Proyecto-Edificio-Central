'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import {
  crearActividad,
  actualizarActividad,
  eliminarActividad,
  eliminarArchivoActividadAction
} from '@/app/actions/actividades'
import type { Actividad } from '@/lib/types/admin'
import type { ComentarioPublico } from '@/lib/types/comentarios'
import type { InscripcionAdmin } from '@/lib/inscripciones-query'
import AdminComentariosModal from '@/components/admin/AdminComentariosModal'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ACCEPT_SOLO_IMAGENES, ETIQUETA_FORMATOS_IMAGEN, ACCEPT_SOLO_VIDEOS, ETIQUETA_FORMATOS_VIDEO } from '@/lib/archivo-constants'
import styles from './admin.module.css'

interface ActividadCrudProps {
  tipo: string
  pageTitle: string
  pageDescription: string
  actividades: Actividad[]
  comentariosPorActividad?: Record<number, ComentarioPublico[]>
  inscripcionesPorActividad?: Record<number, InscripcionAdmin[]>
  dbError?: string | null
}

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function getFechaInicio(act: Actividad) {
  return act.fecha_inicio || act.fecha_publicacion
}

function getFechaFin(act: Actividad) {
  return act.fecha_fin
}

export default function ActividadCrud({
  tipo,
  pageTitle,
  pageDescription,
  actividades,
  comentariosPorActividad = {},
  dbError,
}: ActividadCrudProps) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Actividad | null>(null)
  const [comentariosView, setComentariosView] = useState<{
    titulo: string
    comentarios: ComentarioPublico[]
  } | null>(null)
  const [createState, createAction, createPending] = useActionState(crearActividad, undefined)
  const [updateState, updateAction, updatePending] = useActionState(actualizarActividad, undefined)

  const state = editing ? updateState : createState
  const action = editing ? updateAction : createAction
  const isPending = editing ? updatePending : createPending

  const [refreshKey, setRefreshKey] = useState(0) // Used to force refresh when an image is deleted

  const wasPendingRef = useRef(false)

  useEffect(() => {
    if (wasPendingRef.current && !isPending && state?.success) {
      setShowModal(false)
      setEditing(null)
    }
    wasPendingRef.current = isPending
  }, [isPending, state?.success])

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (act: Actividad) => {
    setEditing(act)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
  }

  const handleDelete = async (id: number) => {
    if (confirm(`¿Eliminar este ${tipo.toLowerCase()}?`)) {
      await eliminarActividad(id)
    }
  }

  const handleDeletePhoto = async (idArchivo: number) => {
    if (confirm('¿Borrar esta imagen permanentemente del servidor?')) {
      const res = await eliminarArchivoActividadAction(idArchivo)
      if (res?.error) alert(res.error)
      else {
        alert(res?.success || 'Archivo eliminado')
        closeModal()
      }
    }
  }

  return (
    <>
      <LoadingOverlay show={isPending} />
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        <p className={styles.pageSubtitle}>{pageDescription}</p>
      </div>

      {dbError && <div className={styles.errorBanner}>{dbError}</div>}

      <div className={styles.toolbar}>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo {tipo}
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Comentarios</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividades.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  No hay {tipo.toLowerCase()}s registrados.
                </td>
              </tr>
            ) : (
              actividades.map((act) => {
                const comentarios = comentariosPorActividad[act.id_actividad] ?? []
                return (
                  <tr key={act.id_actividad}>
                    <td>
                      {act.url_imagen ? (
                        <img src={act.url_imagen} alt="" className={styles.thumb} />
                      ) : (
                        <div className={styles.thumbPlaceholder}>📷</div>
                      )}
                    </td>
                    <td><strong>{act.titulo}</strong></td>
                    <td>
                      {getFechaInicio(act)
                        ? new Date(getFechaInicio(act)!).toLocaleDateString('es-EC')
                        : '—'}
                    </td>
                    <td>
                      {getFechaFin(act)
                        ? new Date(getFechaFin(act)!).toLocaleDateString('es-EC')
                        : '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.btnView}
                        onClick={() =>
                          setComentariosView({ titulo: act.titulo, comentarios })
                        }
                      >
                        Ver ({comentarios.length})
                      </button>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnEdit} onClick={() => openEdit(act)}>
                          Editar
                        </button>
                        <button className={styles.btnDelete} onClick={() => handleDelete(act.id_actividad)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editing ? `Editar ${tipo}` : `Crear ${tipo}`}
              </h3>
              <button className={styles.modalClose} onClick={closeModal}>×</button>
            </div>

            {state?.error && <div className="form-error" style={{ marginBottom: '1rem' }}>{state.error}</div>}
            {state?.success && <div className="form-success" style={{ marginBottom: '1rem' }}>{state.success}</div>}

            <form action={action} encType="multipart/form-data">
              <input type="hidden" name="tipo" value={tipo} />
              {editing && <input type="hidden" name="id_actividad" value={editing.id_actividad} />}

              <div className={styles.formGrid}>
                <div className={`form-group ${styles.formGridFull}`}>
                  <label className="form-label">Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    className="form-input"
                    defaultValue={editing?.titulo ?? ''}
                    required
                  />
                </div>

                <div className={`form-group ${styles.formGridFull}`}>
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-input"
                    rows={4}
                    defaultValue={editing?.descripcion ?? ''}
                  />
                </div>

                <div className={`form-group ${styles.formGridFull}`}>
                  <label className="form-label">Foto / Imágenes</label>
                  {editing && editing.archivos_actividades && editing.archivos_actividades.filter(a => a.tipo_archivo !== 'Video').length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {editing.archivos_actividades.filter(a => a.tipo_archivo !== 'Video').map(archivo => (
                        <div key={archivo.id_archivo_activi} style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                          <img src={archivo.ruta_archivo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(archivo.id_archivo_activi!)}
                            style={{ position: 'absolute', top: 4, right: 4, background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                            title="Eliminar imagen"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    name="archivos"
                    className="form-input"
                    accept={ACCEPT_SOLO_IMAGENES}
                    multiple
                  />
                  <small className={styles.fileHint}>Solo {ETIQUETA_FORMATOS_IMAGEN} (máx. 5MB c/u). Subir nuevas reemplazará las anteriores.</small>
                </div>

                <div className={`form-group ${styles.formGridFull}`} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🎬 Video (Opcional)
                  </label>
                  
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Enlace de Video (YouTube, Facebook, etc.)</label>
                  <input
                    type="url"
                    name="video_url"
                    className="form-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    defaultValue={editing?.video_url ?? ''}
                  />
                  <small className={styles.fileHint}>Pega un enlace de YouTube o Facebook y se reproducirá automáticamente.</small>

                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '0.75rem' }}>O sube un archivo de video</label>
                  {editing && editing.archivos_actividades && editing.archivos_actividades.filter(a => a.tipo_archivo === 'Video').length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {editing.archivos_actividades.filter(a => a.tipo_archivo === 'Video').map(archivo => (
                        <div key={archivo.id_archivo_activi} style={{ position: 'relative', background: '#1a1a2e', borderRadius: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#fff', fontSize: '0.85rem' }}>🎥 Video subido</span>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(archivo.id_archivo_activi!)}
                            style={{ background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                            title="Eliminar video"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    name="video_archivo"
                    className="form-input"
                    accept={ACCEPT_SOLO_VIDEOS}
                  />
                  <small className={styles.fileHint}>Solo {ETIQUETA_FORMATOS_VIDEO} (máx. 100MB). Subir uno nuevo reemplazará el anterior.</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha inicio</label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    className="form-input"
                    defaultValue={editing ? toDatetimeLocal(getFechaInicio(editing)) : ''}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha fin</label>
                  <input
                    type="datetime-local"
                    name="fecha_fin"
                    className="form-input"
                    defaultValue={editing ? toDatetimeLocal(getFechaFin(editing)) : ''}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Guardando...' : editing ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {comentariosView && (
        <AdminComentariosModal
          tituloActividad={comentariosView.titulo}
          comentarios={comentariosView.comentarios}
          onClose={() => setComentariosView(null)}
        />
      )}
    </>
  )
}
