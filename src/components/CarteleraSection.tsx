'use client'

import EventCard from '@/components/EventCard'
import ScrollReveal from '@/components/ScrollReveal'
import styles from '@/app/(public)/page.module.css'

export interface CarteleraActividad {
  id_actividad: number
  titulo: string
  descripcion: string | null
  tipo: string
  fecha_publicacion: string
  fecha_fin: string | null
  url_imagen: string | null
}

interface CarteleraSectionProps {
  actividades: CarteleraActividad[]
}

export default function CarteleraSection({ actividades }: CarteleraSectionProps) {
  return (
    <section id="actividades" className={styles.cartelera}>
      <div className={styles.carteleraContainer}>
        <ScrollReveal>
          <header className={styles.carteleraHeader}>
            <h2 className={styles.carteleraTitle}>Anuncios, Cursos y Eventos</h2>
            <div className={styles.carteleraLine} />
          </header>
        </ScrollReveal>

        <div className={styles.carteleraGrid}>
          {actividades.map((act, index) => (
            <ScrollReveal key={act.id_actividad} delay={index * 100}>
              <EventCard
                id={act.id_actividad}
                titulo={act.titulo}
                descripcion={act.descripcion}
                tipo={act.tipo}
                fecha_publicacion={act.fecha_publicacion}
                fecha_fin={act.fecha_fin}
                url_imagen={act.url_imagen}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
