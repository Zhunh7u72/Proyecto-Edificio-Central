'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './HistorialClient.module.css'

interface Actividad {
  id_actividad: number
  titulo: string
  descripcion: string | null
  tipo: string
  fecha_publicacion: string
  fecha_inicio: string | null
  fecha_fin: string | null
}

interface HistorialClientProps {
  actividades: Actividad[]
}

export default function HistorialClient({ actividades }: HistorialClientProps) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState<'todo' | 'anio' | 'mes' | 'semana'>('todo')
  const [filtroTipo, setFiltroTipo] = useState<string>('todo')

  const now = new Date()

  const filtradas = actividades.filter((act) => {
    // Filtro de búsqueda por texto
    const coincideTexto =
      busqueda === '' ||
      act.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (act.descripcion?.toLowerCase() ?? '').includes(busqueda.toLowerCase())

    // Usamos fecha_inicio si existe, si no caemos en fecha_publicacion
    const fechaRef = act.fecha_inicio ? new Date(act.fecha_inicio) : new Date(act.fecha_publicacion)

    // Filtro de periodo
    let coincidePeriodo = true
    if (filtroPeriodo === 'semana') {
      const hace7dias = new Date(now)
      hace7dias.setDate(now.getDate() - 7)
      coincidePeriodo = fechaRef >= hace7dias
    } else if (filtroPeriodo === 'mes') {
      coincidePeriodo =
        fechaRef.getMonth() === now.getMonth() &&
        fechaRef.getFullYear() === now.getFullYear()
    } else if (filtroPeriodo === 'anio') {
      coincidePeriodo = fechaRef.getFullYear() === now.getFullYear()
    }

    // Filtro por tipo
    const coincideTipo = filtroTipo === 'todo' || act.tipo.toLowerCase() === filtroTipo.toLowerCase()

    return coincideTexto && coincidePeriodo && coincideTipo
  })

  return (
    <div>
      {/* FILTROS */}
      <div className={styles.filtros}>
        <div className={styles.filtroGrupo}>
          <label className={styles.filtroLabel}>🔍 Buscar</label>
          <input
            type="text"
            className={`form-input ${styles.buscador}`}
            placeholder="Buscar por título o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className={styles.filtroGrupo}>
          <label className={styles.filtroLabel}>📅 Periodo</label>
          <div className={styles.btnGroup}>
            {(['todo', 'anio', 'mes', 'semana'] as const).map((p) => (
              <button
                key={p}
                className={`${styles.btnFiltro} ${filtroPeriodo === p ? styles.btnFiltroActivo : ''}`}
                onClick={() => setFiltroPeriodo(p)}
              >
                {p === 'todo' ? 'Todo' : p === 'anio' ? 'Este año' : p === 'mes' ? 'Este mes' : 'Esta semana'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filtroGrupo}>
          <label className={styles.filtroLabel}>🏷️ Tipo</label>
          <div className={styles.btnGroup}>
            {(['todo', 'Evento', 'Anuncio', 'Capacitacion'] as const).map((t) => (
              <button
                key={t}
                className={`${styles.btnFiltro} ${filtroTipo === t ? styles.btnFiltroActivo : ''}`}
                onClick={() => setFiltroTipo(t)}
              >
                {t === 'todo' ? 'Todos' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      <p className={styles.resultadosInfo}>
        Se encontraron <strong>{filtradas.length}</strong> resultado{filtradas.length !== 1 ? 's' : ''}
      </p>

      {filtradas.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🕰️</span>
          <h3>Sin resultados</h3>
          <p>No se encontraron eventos con los filtros aplicados. Intenta ampliar la búsqueda.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtradas.map((act) => (
            <Link key={act.id_actividad} href={`/eventos/${act.id_actividad}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`badge badge-${act.tipo.toLowerCase()}`}>{act.tipo}</span>
                <time className={styles.fecha}>
                  {new Date(act.fecha_inicio ?? act.fecha_publicacion).toLocaleDateString('es-EC', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </time>
              </div>
              <h4 className={styles.titulo}>{act.titulo}</h4>
              {act.descripcion && (
                <p className={styles.descripcion}>
                  {act.descripcion.length > 120 ? act.descripcion.substring(0, 120) + '...' : act.descripcion}
                </p>
              )}
              <span className={styles.verMas}>Ver detalles →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
