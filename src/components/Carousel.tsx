'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './Carousel.module.css'

interface Activity {
  id_actividad: number
  titulo: string
  descripcion: string
  tipo: string
  url_imagen?: string | null
}

export default function Carousel({ items }: { items: Activity[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (items.length <= 1) return

    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, 5000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [items.length])

  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyCarousel}>
        <p>No hay eventos destacados por el momento.</p>
      </div>
    )
  }

  return (
    <div className={styles.carouselContainer}>
      {items.map((item, index) => (
        <div
          key={item.id_actividad}
          className={`${styles.carouselSlide} ${index === activeIndex ? styles.active : ''}`}
        >
          {/* Si tuviéramos imagen real, la pondríamos aquí. Por ahora un gradiente */}
          <div 
            className={styles.imageBackground}
            style={{ 
              backgroundImage: item.url_imagen ? `url(${item.url_imagen})` : 'linear-gradient(135deg, var(--color-bg-dark) 0%, #343a40 100%)' 
            }}
          />
          <div className={styles.slideContent}>
            <span className={`badge badge-${item.tipo.toLowerCase()}`}>{item.tipo}</span>
            <h2 className={styles.title}>{item.titulo}</h2>
            <p className={styles.description}>
              {item.descripcion ? (item.descripcion.length > 100 ? item.descripcion.substring(0, 100) + '...' : item.descripcion) : 'Sin descripción detallada'}
            </p>
            <Link href={`/eventos/${item.id_actividad}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Ver detalles
            </Link>
          </div>
        </div>
      ))}

      {items.length > 1 && (
        <div className={styles.indicators}>
          {items.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.indicator} ${idx === activeIndex ? styles.activeIndicator : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Ir a la diapositiva ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
