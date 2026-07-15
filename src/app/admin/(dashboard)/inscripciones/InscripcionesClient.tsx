'use client'

import { useMemo, useState } from 'react'
import type { InscripcionAdmin } from '@/lib/inscripciones-query'
import { urlPdfInscripcionAdmin } from '@/lib/inscripcion-pdf-url'
import styles from '@/components/admin/admin.module.css'

export default function InscripcionesClient({
  inscripciones,
  dbError,
}: {
  inscripciones: InscripcionAdmin[]
  dbError?: string | null
}) {
  const [filtroTipo, setFiltroTipo] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [descargando, setDescargando] = useState<string | null>(null)

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return inscripciones.filter((i) => {
      const cumpleTipo = !filtroTipo || i.actividades?.tipo === filtroTipo
      if (!cumpleTipo) return false

      if (!texto) return true

      const nombreCompleto = `${i.usuarios?.nombres ?? ''} ${i.usuarios?.apellidos ?? ''}`.toLowerCase()
      const correo = (i.usuarios?.correo ?? '').toLowerCase()
      const actividad = (i.actividades?.titulo ?? '').toLowerCase()

      return (
        nombreCompleto.includes(texto) ||
        correo.includes(texto) ||
        actividad.includes(texto)
      )
    })
  }, [inscripciones, filtroTipo, busqueda])

  const handleDescargarPdf = (ruta: string) => {
    setDescargando(ruta)
    const a = document.createElement('a')
    a.href = urlPdfInscripcionAdmin(ruta, 'descargar')
    a.download = ruta.split('/').pop() ?? 'documento.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setDescargando(null)
  }

  const totalConPdf = inscripciones.filter((i) => i.pdf_ruta).length

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Inscripciones</h1>
        <p className={styles.pageSubtitle}>
          Estudiantes inscritos en las actividades de la FEUE.
        </p>
      </div>

      {dbError && <div className={styles.errorBanner}>{dbError}</div>}

      {/* Stats rápidas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Inscripciones</div>
          <div className={styles.statValue}>{inscripciones.length}</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardAlt}`}>
          <div className={styles.statLabel}>Con Documento PDF</div>
          <div className={styles.statValue}>{totalConPdf}</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <span>Filtrar por tipo:</span>
            <select
              className="form-input"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="Anuncio">Anuncios</option>
              <option value="Evento">Eventos</option>
              <option value="Capacitacion">Capacitaciones</option>
            </select>
          </label>

          <label className={styles.filterLabel}>
            <span>Buscar:</span>
            <input
              className="form-input"
              type="text"
              placeholder="Estudiante, actividad o correo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>
        </div>
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
              <th style={{ textAlign: 'center' }}>Documento</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
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
                  <td style={{ textAlign: 'center' }}>
                    {ins.pdf_ruta ? (
                      <div className={styles.pdfActions}>
                        <a
                          href={urlPdfInscripcionAdmin(ins.pdf_ruta, 'ver')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnPdfAction}
                          title="Visualizar PDF en el navegador"
                        >
                          Ver
                        </a>
                        <button
                          type="button"
                          className={styles.btnPdfAction}
                          onClick={() => handleDescargarPdf(ins.pdf_ruta!)}
                          disabled={descargando === ins.pdf_ruta}
                          title="Descargar PDF"
                        >
                          {descargando === ins.pdf_ruta ? '...' : 'Descargar'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--utn-gray)', fontSize: '0.82rem' }}>
                        Sin documento
                      </span>
                    )}
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
