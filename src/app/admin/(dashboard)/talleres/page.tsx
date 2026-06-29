import styles from '@/components/admin/admin.module.css'
import layoutStyles from '../layout.module.css'

export const dynamic = 'force-dynamic'

export default function TalleresPage() {
  return (
    <div className={layoutStyles.disabledPage}>
      <div className={styles.pageHeader}>
        <h1 className={`${styles.pageTitle} ${layoutStyles.disabledTitle}`}>Gestión de Talleres</h1>
        <p className={styles.pageSubtitle}>
          Módulo temporalmente desactivado. El esquema actual no incluye el tipo &quot;Taller&quot; en
          actividades.
        </p>
      </div>

      <div className={layoutStyles.disabledCard}>
        <span className={layoutStyles.disabledIcon}>🛠️</span>
        <p>
          Los talleres estarán disponibles cuando se habilite el tipo en la base de datos. Por ahora
          puedes gestionar <strong>Anuncios</strong>, <strong>Eventos</strong> y{' '}
          <strong>Capacitaciones</strong>.
        </p>
      </div>
    </div>
  )
}
