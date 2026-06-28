import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import styles from './layout.module.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.adminWrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKsTaAxYxsfEjB4Go6B3ucJ-17d-ayMWMsGlCGDD99R8Ocx7Jh61hAm_P&s=10" 
            alt="Logo UTN" 
            className={styles.logo}
          />
          <div>
            <h3>Admin Panel</h3>
            <p>Edificio Central</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navLink}>
            📊 Dashboard
          </Link>
          <Link href="/admin/actividades" className={styles.navLink}>
            📅 Actividades
          </Link>
          {/* Otros enlaces en el futuro (Usuarios, Configuración, etc.) */}
        </nav>

        <div className={styles.sidebarFooter}>
          <form action={logout}>
            <button type="submit" className={styles.logoutBtn}>
              🚪 Cerrar Sesión
            </button>
          </form>
          <Link href="/" className={styles.publicLink}>
            Ver Portal Público ↗
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}
