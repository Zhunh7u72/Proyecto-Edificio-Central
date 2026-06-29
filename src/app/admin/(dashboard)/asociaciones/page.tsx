import styles from '@/components/admin/admin.module.css'
import layoutStyles from '../layout.module.css'

export const dynamic = 'force-dynamic'

export default function AsociacionesPage() {
  return (
    <div className={layoutStyles.disabledPage}>
      <div className={styles.pageHeader}>
        <h1 className={`${styles.pageTitle} ${layoutStyles.disabledTitle}`}>
          Gestión de Asociaciones
        </h1>
        <p className={styles.pageSubtitle}>
          Módulo temporalmente desactivado. La gestión de asociaciones estará disponible próximamente.
        </p>
      </div>

      <div className={layoutStyles.disabledCard}>
        <span className={layoutStyles.disabledIcon}>🤝</span>
        <p>
          Las asociaciones estudiantiles se habilitarán en una próxima versión. Por ahora puedes
          gestionar <strong>Galerías</strong> y <strong>Documentos PDF</strong>.
        </p>
      </div>
    </div>
  )
}
