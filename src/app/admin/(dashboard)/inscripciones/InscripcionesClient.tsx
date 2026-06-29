'use client'

import { useMemo, useState } from 'react'
import type { InscripcionAdmin } from '@/lib/inscripciones-query'
import styles from '@/components/admin/admin.module.css'

export default function InscripcionesClient({
  inscripciones,
  dbError,
}: {
  inscripciones: InscripcionAdmin[]
  dbError?: string | null
}) {
  const [filtroTipo, setFiltroTipo] = useState('')

  const filtradas = useMemo(() => {
    if (!filtroTipo) return inscripciones
    return inscripciones.filter((i) => i.actividades?.tipo === filtroTipo)
  }, [inscripciones, filtroTipo])

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Inscripciones</h1>
        <p className={styles.pageSubtitle}>
          Estudiantes inscritos en las actividades del Edificio Central.
        </p>
      </div>

      {dbError && <div className={styles.errorBanner}>{dbError}</div>}

      <div className={styles.toolbar}>
        <label className={styles.filterLabel}>
          Filtrar por tipo:
          <select
            className="form-input"
            style={{ width: 'auto', minWidth: '180px', marginLeft: '0.5rem' }}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="Anuncio">Anuncios</option>
            <option value="Evento">Eventos</option>
            <option value="Capacitacion">Capacitaciones</option>
          </select>
        </label>
        <span className={styles.filterCount}>{filtradas.length} inscripción(es)</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Correo</th>
              <th>Actividad</th>
              <th>Tipo</th>
              <th>Fecha inscripción</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  No hay inscripciones registradas.
                </td>
              </tr>
            ) : (
              filtradas.map((ins) => (
                <tr key={ins.id_matricula}>
                  <td>
                    <strong>
                      {ins.usuarios
                        ? `${ins.usuarios.nombres} ${ins.usuarios.apellidos}`
                        : '—'}
                    </strong>
                  </td>
                  <td>{ins.usuarios?.correo ?? '—'}</td>
                  <td>{ins.actividades?.titulo ?? '—'}</td>
                  <td>
                    {ins.actividades?.tipo ? (
                      <span className={styles.tipoBadge}>{ins.actividades.tipo}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {ins.fecha_registro
                      ? new Date(ins.fecha_registro).toLocaleString('es-EC', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
