'use client'

import { useState, useActionState } from 'react'
import { crearActividad, eliminarActividad } from '@/app/actions/actividades'

interface Actividad {
  id_actividad: number
  titulo: string
  tipo: string
  fecha_publicacion: string
  fecha_limite_inscripcion: string | null
}

export default function ActividadesClient({ actividades }: { actividades: Actividad[] }) {
  const [showModal, setShowModal] = useState(false)
  const [state, action, isPending] = useActionState(crearActividad, undefined)

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta actividad?')) {
      await eliminarActividad(id)
    }
  }

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nueva Actividad
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--color-bg-alt)' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Título</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Tipo</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Publicación</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Cierre Inscripción</th>
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
                    {act.fecha_limite_inscripcion 
                      ? new Date(act.fecha_limite_inscripcion).toLocaleDateString('es-EC') 
                      : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(act.id_actividad)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
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
                <label className="form-label">Fecha Límite de Inscripción (Opcional)</label>
                <input type="datetime-local" name="fecha_limite_inscripcion" className="form-input" />
                <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>Si se deja vacío, no requerirá inscripción con límite.</small>
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
    </>
  )
}
