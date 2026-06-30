'use client'

import { useState, useActionState } from 'react'
import { crearActividad, eliminarActividad } from '@/app/actions/actividades'
import { guardarMemoriaActividad } from '@/app/actions/memorias'
import type { MemoriaState } from '@/app/actions/memorias'

interface Actividad {
  id_actividad: number
  titulo: string
  tipo: string
  fecha_publicacion: string
  fecha_fin: string | null
}

export default function ActividadesClient({ actividades }: { actividades: Actividad[] }) {
  const [showModal, setShowModal] = useState(false)
  const [memoriaActividadId, setMemoriaActividadId] = useState<number | null>(null)
  const [memoriaActividadTitulo, setMemoriaActividadTitulo] = useState<string>('')
  const [state, action, isPending] = useActionState(crearActividad, undefined)
  const [memoriaState, memoriaAction, memoriaPending] = useActionState<MemoriaState, FormData>(
    guardarMemoriaActividad,
    undefined
  )

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta actividad?')) {
      await eliminarActividad(id)
    }
  }

  const abrirMemoria = (id: number, titulo: string) => {
    setMemoriaActividadId(id)
    setMemoriaActividadTitulo(titulo)
  }

  const cerrarMemoria = () => {
    setMemoriaActividadId(null)
    setMemoriaActividadTitulo('')
  }

  // Auto-cerrar modal de memoria si la acción fue exitosa
  if (memoriaState?.success && memoriaActividadId !== null) {
    cerrarMemoria()
  }

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nueva Actividad
        </button>
      </div>

      {/* Tabla principal */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-bg-alt)' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Título</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Tipo</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Publicación</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Fecha de Cierre</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividades.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No hay actividades registradas.
                </td>
              </tr>
            ) : (
              actividades.map((act) => (
                <tr key={act.id_actividad}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <strong>{act.titulo}</strong>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span className={`badge badge-${act.tipo.toLowerCase()}`}>{act.tipo}</span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    {new Date(act.fecha_publicacion).toLocaleDateString('es-EC')}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    {act.fecha_fin
                      ? new Date(act.fecha_fin).toLocaleDateString('es-EC')
                      : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {/* Botón Memoria Fotográfica */}
                      <button
                        onClick={() => abrirMemoria(act.id_actividad, act.titulo)}
                        style={{
                          background: 'none', border: '1.5px solid #706f6f', color: '#706f6f',
                          borderRadius: '6px', padding: '0.2rem 0.6rem',
                          cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem'
                        }}
                        title="Añadir memoria fotográfica"
                      >
                        📷 Memoria
                      </button>
                      <button
                        onClick={() => handleDelete(act.id_actividad)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
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

      {/* ────── MODAL CREAR ACTIVIDAD ────── */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-secondary)' }}>Crear Nueva Actividad</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {state?.error && <div className="form-error" style={{ marginBottom: '1rem' }}>{state.error}</div>}
            {state?.success && <div className="form-success" style={{ marginBottom: '1rem' }}>{state.success}</div>}

            <form action={action}>
              <div className="form-group">
                <label className="form-label">Título</label>
                <input type="text" name="titulo" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea name="descripcion" className="form-input" rows={4}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Actividad</label>
                <select name="tipo" className="form-input" required>
                  <option value="Anuncio">Anuncio</option>
                  <option value="Evento">Evento</option>
                  <option value="Capacitacion">Capacitación</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Inicio *</label>
                <input type="datetime-local" name="fecha_inicio" className="form-input" required />
                <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  ¿Cuándo empieza el evento? (Aparecerá en el carrusel y en el catálogo del mes)
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Fin (Opcional)</label>
                <input type="datetime-local" name="fecha_fin" className="form-input" />
                <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  ¿Cuándo termina? Cuando pase esta fecha, el evento pasará al Historial automáticamente.
                </small>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isPending} style={{ flex: 1 }}>
                  {isPending ? 'Guardando...' : 'Guardar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────── MODAL MEMORIA FOTOGRÁFICA ────── */}
      {memoriaActividadId !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-secondary)' }}>📷 Memoria del evento</h3>
              <button onClick={cerrarMemoria} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <strong>{memoriaActividadTitulo}</strong> — Añade un resumen de cómo salió el evento y las URLs de las fotos.
            </p>

            {memoriaState?.error && <div className="form-error" style={{ marginBottom: '1rem' }}>{memoriaState.error}</div>}

            <form action={memoriaAction}>
              <input type="hidden" name="id_actividad" value={memoriaActividadId} />

              <div className="form-group">
                <label className="form-label">Resumen del evento (actualiza la descripción)</label>
                <textarea
                  name="resumen"
                  className="form-input"
                  rows={4}
                  placeholder="Describe cómo salió el evento, logros, agradecimientos..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">URLs de fotografías (una por línea)</label>
                <textarea
                  name="fotos_urls"
                  className="form-input"
                  rows={5}
                  placeholder={"https://ejemplo.com/foto1.jpg\nhttps://ejemplo.com/foto2.jpg\nhttps://ejemplo.com/foto3.jpg"}
                />
                <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Sube las fotos a Supabase Storage o a un servicio externo y pega aquí cada URL en una línea separada.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={cerrarMemoria} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={memoriaPending} style={{ flex: 1 }}>
                  {memoriaPending ? 'Guardando...' : '💾 Guardar Memoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
