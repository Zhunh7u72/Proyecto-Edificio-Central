"use client";

import { useState, useEffect, useCallback } from 'react';
import styles from './HeroSlider.module.css';

const DEFAULT_IMAGES = [
  { id: 1, src: 'https://www.utn.edu.ec/wp-content/uploads/2021/06/planta-central-utn.png', alt: 'FEUE' },
  { id: 2, src: 'https://www.utn.edu.ec/wp-content/uploads/slider/cache/582999c6872cac31eb8bd19d3b1411af/planta-cental.jpg', alt: 'FEUE' },
  { id: 3, src: 'https://www.utn.edu.ec/wp-content/uploads/slider/cache/c8a3ff23710beddb36c5cea6593f42d1/posgrado2.jpg', alt: 'Postgrado' },
  { id: 4, src: 'https://www.utn.edu.ec/wp-content/uploads/slider/cache/88e33474650777c670250e56c3fdd8a9/biblioteca2.jpg', alt: 'Biblioteca' },
]

interface HeroSliderProps {
  carruselUrls?: string[] | null
}

export default function HeroSlider({ carruselUrls }: HeroSliderProps = {}) {
  const images = carruselUrls && carruselUrls.length > 0 
    ? carruselUrls.map((url, i) => ({ id: i + 1, src: url, alt: `Carrusel ${i + 1}` }))
    : DEFAULT_IMAGES;

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 6000)
    return () => clearInterval(slideInterval)
  }, [nextSlide])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <section className={styles.hero}>
      <div className={styles.sliderContainer}>
        {images.map((img, index) => (
          <div key={img.id} className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}>
            <img src={img.src} alt={img.alt} className={styles.image} />
          </div>
        ))}
      </div>

      <div className={styles.heroOverlay}>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>Federación de Estudiantes Universitarios del Ecuador</h1>
          <p className={styles.heroSubtitle}>Universidad Técnica del Norte — Ciencia y Técnica al Servicio del Pueblo</p>
          <div className={styles.heroActions}>
            <a href="#actividades" className="btn btn-primary btn-lg">Ver Actividades</a>
            <a href="/institucional" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>Conocer más</a>
          </div>
        </div>
      </div>

      <div className={styles.thumbnailsContainer}>
        {images.map((img, index) => (
          <div key={img.id} className={`${styles.thumbnail} ${index === currentIndex ? styles.activeThumbnail : ''}`} onClick={() => setCurrentIndex(index)}>
            <img src={img.src} alt={`Miniatura ${img.alt}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
