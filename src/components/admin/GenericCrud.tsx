'use client'

import { useState, useActionState, useEffect, useRef, type ReactNode } from 'react'
import type { ActionState } from '@/lib/types/admin'
import styles from './admin.module.css'

export interface CrudField {
  name: string
  label: string
  type?: 'text' | 'email' | 'url' | 'textarea' | 'tel' | 'select' | 'file'
  required?: boolean
  placeholder?: string
  fullWidth?: boolean
  options?: { value: string; label: string }[]
  accept?: string
}

interface GenericCrudProps<T extends object> {
  pageTitle: string
  pageDescription: string
  entityName: string
  idField: keyof T & string
  items: T[]
  fields: CrudField[]
  dbError?: string | null
  columns: { key: keyof T & string; label: string; render?: (item: T) => ReactNode }[]
  onCreate: (state: ActionState, formData: FormData) => Promise<ActionState>
  onUpdate: (state: ActionState, formData: FormData) => Promise<ActionState>
  onDelete: (id: number) => Promise<ActionState>
  onDeleteFile?: (id: number) => Promise<ActionState>
}

export default function GenericCrud<T extends object>({
  pageTitle,
  pageDescription,
  entityName,
  idField,
  items,
  fields,
  dbError,
  columns,
  onCreate,
  onUpdate,
  onDelete,
  onDeleteFile,
}: GenericCrudProps<T>) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [createState, createAction, createPending] = useActionState(onCreate, undefined)
  const [updateState, updateAction, updatePending] = useActionState(onUpdate, undefined)

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

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
  }

  const handleDelete = async (id: number) => {
    if (confirm(`¿Eliminar este registro?`)) {
      await onDelete(id)
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        <p className={styles.pageSubtitle}>{pageDescription}</p>
      </div>

      {dbError && <div className={styles.errorBanner}>{dbError}</div>}

      <div className={styles.toolbar}>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>
          + Nuevo {entityName}
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className={styles.emptyRow}>
                  No hay registros.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={String((item as Record<string, unknown>)[idField])}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnEdit} onClick={() => { setEditing(item); setShowModal(true) }}>
                        Editar
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(Number((item as Record<string, unknown>)[idField]))}
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

      {showModal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editing ? `Editar ${entityName}` : `Crear ${entityName}`}
              </h3>
              <button className={styles.modalClose} onClick={closeModal}>×</button>
            </div>

            {state?.error && <div className="form-error" style={{ marginBottom: '1rem' }}>{state.error}</div>}

            <form action={action} encType="multipart/form-data">
              {editing && (
                <input type="hidden" name={idField} value={String((editing as Record<string, unknown>)[idField])} />
              )}

              <div className={styles.formGrid}>
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className={`form-group ${field.fullWidth !== false ? styles.formGridFull : ''}`}
                  >
                    <label className="form-label">
                      {field.label}{field.required ? ' *' : ''}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        className="form-input"
                        rows={3}
                        defaultValue={String((editing as Record<string, unknown>)?.[field.name] ?? '')}
                        required={field.required}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        name={field.name}
                        className="form-input"
                        defaultValue={String((editing as Record<string, unknown>)?.[field.name] ?? '')}
                        required={field.required}
                      >
                        <option value="">Seleccionar...</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'file' ? (
                      <div className={styles.fileField}>
                        {editing && String((editing as Record<string, unknown>)['ruta_archivo'] || '') && (
                          <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>Archivo actual existe.</span>
                            {onDeleteFile && (
                              <button 
                                type="button" 
                                className="btn btn-outline" 
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderColor: 'var(--utn-red)', color: 'var(--utn-red)' }}
                                onClick={async () => {
                                  if (confirm('¿Borrar este archivo físicamente del servidor? Esta acción no se puede deshacer.')) {
                                    const res = await onDeleteFile(Number((editing as Record<string, unknown>)[idField]))
                                    if (res?.success) {
                                      alert(res.success)
                                      closeModal()
                                    } else if (res?.error) {
                                      alert(res.error)
                                    }
                                  }
                                }}
                              >
                                🗑️ Borrar Archivo
                              </button>
                            )}
                          </div>
                        )}
                        <input
                          type="file"
                          name={field.name}
                          className="form-input"
                          accept={field.accept}
                          required={!editing && field.required}
                        />
                      </div>
                    ) : (
                      <input
                        type={field.type ?? 'text'}
                        name={field.name}
                        className="form-input"
                        defaultValue={String((editing as Record<string, unknown>)?.[field.name] ?? '')}
                        required={field.required}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
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
    </>
  )
}
