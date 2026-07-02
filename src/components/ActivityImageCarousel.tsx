'use client'

import { useState, useEffect } from 'react'
import styles from './ActivityImageCarousel.module.css'

interface ActivityImageCarouselProps {
  images: string[]
  title: string
}

export default function ActivityImageCarousel({ images, title }: ActivityImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className={styles.carouselContainer}>
        <img src={images[0]} alt={title} className={styles.image} />
      </div>
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className={styles.carouselContainer}>
      <div 
        className={styles.slidesWrapper}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, index) => (
          <img key={index} src={img} alt={`${title} - foto ${index + 1}`} className={styles.slide} />
        ))}
      </div>
      
      <button className={`${styles.navButton} ${styles.prevButton}`} onClick={prevSlide} aria-label="Anterior foto">
        ‹
      </button>
      <button className={`${styles.navButton} ${styles.nextButton}`} onClick={nextSlide} aria-label="Siguiente foto">
        ›
      </button>

      <div className={styles.indicators}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir a la foto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
