'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { crearActividad } from '@/app/actions/actividades'
import type { Actividad } from '@/lib/types/admin'
import type { ComentarioPublico } from '@/lib/types/comentarios'
import type { InscripcionAdmin } from '@/lib/inscripciones-query'
import ActividadDetalleModal from '@/components/admin/ActividadDetalleModal'

interface Props {
  actividades: Actividad[]
  comentariosPorActividad?: Record<number, ComentarioPublico[]>
  inscripcionesPorActividad?: Record<number, InscripcionAdmin[]>
}

export default function ActividadesClient({ actividades, comentariosPorActividad = {}, inscripcionesPorActividad = {} }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null)
  const [state, action, isPending] = useActionState(crearActividad, undefined)

  const handleRowClick = (act: Actividad) => {
    setSelectedActividad(act)
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
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Estado</th>
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
              actividades.map((act) => {
                const fechaFin = act.fecha_fin ? new Date(act.fecha_fin) : null
                const esVigente = !fechaFin || fechaFin >= new Date()
                const esOculto = act.visible === false

                return (
                  <tr
                    key={act.id_actividad}
                    onClick={() => handleRowClick(act)}
                    style={{ cursor: 'pointer', transition: 'background 0.15s', opacity: esOculto ? 0.55 : 1 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-alt)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                      <strong>{act.titulo}</strong>
                      {esOculto && (
                        <span style={{
                          marginLeft: '0.5rem', fontSize: '0.72rem', background: '#fef2f2',
                          color: '#991b1b', padding: '2px 8px', borderRadius: '10px', fontWeight: 600
                        }}>
                          Oculto
                        </span>
                      )}
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
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: esVigente ? '#dcfce7' : '#fef3c7',
                        color: esVigente ? '#166534' : '#92400e',
                      }}>
                        {esVigente ? '● Vigente' : '● Finalizado'}
                      </span>
                    </td>
                  </tr>
                )
              })
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

      {/* ────── MODAL DETALLE ────── */}
      {selectedActividad && (
        <ActividadDetalleModal
          actividad={selectedActividad}
          comentarios={comentariosPorActividad[selectedActividad.id_actividad] || []}
          inscripciones={inscripcionesPorActividad[selectedActividad.id_actividad] || []}
          onClose={() => setSelectedActividad(null)}
          onRefresh={() => router.refresh()}
        />
      )}
    </>
  )
}
