import { fetchFotosGaleria } from '@/lib/public-media'
import GalleryGrid from '@/components/GalleryGrid'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function GaleriaPage() {
  const { fotos, error } = await fetchFotosGaleria()

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Galería</h1>
          <p className={styles.subtitle}>
            Fotografías de las actividades y eventos del Edificio Central UTN
          </p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {error && (
          <div className={styles.errorMsg}>
            <p>No se pudieron cargar las fotografías. Intenta más tarde.</p>
            <code>{error}</code>
          </div>
        )}

        {!error && <GalleryGrid fotos={fotos} />}
      </div>
    </div>
  )
}
