'use client'

import { useMemo, useState } from 'react'
import type { FotoGaleria } from '@/lib/types/public-media'
import styles from './GalleryGrid.module.css'

export default function GalleryGrid({ fotos }: { fotos: FotoGaleria[] }) {
  const [selected, setSelected] = useState<FotoGaleria | null>(null)
  const [eventoFiltro, setEventoFiltro] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const eventos = useMemo(() => {
    const map = new Map<number, string>()
    for (const foto of fotos) {
      if (foto.fuente === 'actividad' && foto.id_actividad) {
        map.set(foto.id_actividad, foto.titulo)
      }
    }
    return Array.from(map.entries())
      .map(([id, titulo]) => ({ id, titulo }))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
  }, [fotos])

  const fotosFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    const eventoId = eventoFiltro ? parseInt(eventoFiltro, 10) : null

    return fotos.filter((foto) => {
      if (foto.fuente === 'carrera') {
        if (eventoId) return false
        if (!termino) return true
        return (
          foto.titulo.toLowerCase().includes(termino) ||
          (foto.subtitulo?.toLowerCase().includes(termino) ?? false)
        )
      }

      if (eventoId && foto.id_actividad !== eventoId) return false
      if (!termino) return true
      return foto.titulo.toLowerCase().includes(termino)
    })
  }, [fotos, eventoFiltro, busqueda])

  if (fotos.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📷</span>
        <h3>No hay fotografías publicadas</h3>
        <p>Las imágenes de actividades y galerías aparecerán aquí cuando el administrador las publique.</p>
      </div>
    )
  }

  const actividadFotos = fotosFiltradas.filter((f) => f.fuente === 'actividad')
  const carreraFotos = fotosFiltradas.filter((f) => f.fuente === 'carrera')
  const sinResultados = fotosFiltradas.length === 0

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <label htmlFor="galeria-busqueda">Buscar</label>
          <input
            id="galeria-busqueda"
            type="search"
            className={styles.filterInput}
            placeholder="Buscar por nombre de evento o carrera..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className={styles.filterField}>
          <label htmlFor="galeria-evento">Evento</label>
          <select
            id="galeria-evento"
            className={styles.filterSelect}
            value={eventoFiltro}
            onChange={(e) => setEventoFiltro(e.target.value)}
          >
            <option value="">Todos los eventos</option>
            {eventos.map((evento) => (
              <option key={evento.id} value={String(evento.id)}>
                {evento.titulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sinResultados ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔍</span>
          <h3>Sin resultados</h3>
          <p>No hay fotografías que coincidan con el filtro seleccionado.</p>
        </div>
      ) : (
        <>
          {actividadFotos.length > 0 && (
            <section className={styles.section}>
              <div className="section-title-accent" />
              <h2 className="section-title">Fotografías de actividades</h2>
              <p className="section-subtitle">Imágenes de anuncios, eventos y capacitaciones de la FEUE</p>
              <div className={styles.grid}>
                {actividadFotos.map((foto) => (
                  <GalleryItem key={foto.id} foto={foto} onSelect={setSelected} />
                ))}
              </div>
            </section>
          )}

          {carreraFotos.length > 0 && (
            <section className={styles.section}>
              <div className="section-title-accent" />
              <h2 className="section-title">Galería institucional</h2>
              <p className="section-subtitle">Fotografías de carreras y asociaciones estudiantiles</p>
              <div className={styles.grid}>
                {carreraFotos.map((foto) => (
                  <GalleryItem key={foto.id} foto={foto} onSelect={setSelected} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {selected && (
        <div className={styles.lightbox} onClick={() => setSelected(null)} role="dialog" aria-modal="true">
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setSelected(null)} aria-label="Cerrar">
              ×
            </button>
            <img src={selected.ruta} alt={selected.titulo} className={styles.lightboxImage} />
            <div className={styles.lightboxCaption}>
              <strong>{selected.titulo}</strong>
              {selected.subtitulo && <span>{selected.subtitulo}</span>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function GalleryItem({
  foto,
  onSelect,
}: {
  foto: FotoGaleria
  onSelect: (foto: FotoGaleria) => void
}) {
  return (
    <button type="button" className={styles.item} onClick={() => onSelect(foto)}>
      <img src={foto.ruta} alt={foto.titulo} className={styles.image} loading="lazy" />
      <div className={styles.caption}>
        <span className={styles.captionTitle}>{foto.titulo}</span>
        {foto.subtitulo && <span className={styles.captionSub}>{foto.subtitulo}</span>}
      </div>
    </button>
  )
}
