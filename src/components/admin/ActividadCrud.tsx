'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import {
  crearActividad,
  actualizarActividad,
  eliminarActividad,
} from '@/app/actions/actividades'
import type { Actividad } from '@/lib/types/admin'
import type { ComentarioPublico } from '@/lib/types/comentarios'
import type { InscripcionAdmin } from '@/lib/inscripciones-query'
import AdminComentariosModal from '@/components/admin/AdminComentariosModal'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ACCEPT_SOLO_IMAGENES, ETIQUETA_FORMATOS_IMAGEN } from '@/lib/archivo-constants'
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

            <form action={action}>
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
                  <label className="form-label">Imágenes</label>
                  <input
                    type="file"
                    name="archivos"
                    className="form-input"
                    accept={ACCEPT_SOLO_IMAGENES}
                    multiple
                  />
                  <small className={styles.fileHint}>Solo {ETIQUETA_FORMATOS_IMAGEN} (máx. 5MB c/u)</small>
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
