'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import styles from '../../app/admin/(dashboard)/layout.module.css'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/actividades', label: 'Actividades', icon: '📝' },
  { href: '/admin/anuncios', label: 'Anuncios', icon: '📢' },
  { href: '/admin/eventos', label: 'Eventos', icon: '📅' },
  { href: '/admin/capacitaciones', label: 'Capacitaciones', icon: '🎓' },
  { href: '/admin/inscripciones', label: 'Inscripciones', icon: '📋' },
  { href: '/admin/institucional', label: 'Representantes', icon: '🏛️' },
  { href: '/admin/asociaciones', label: 'Asociaciones', icon: '🤝', disabled: true },
  { href: '/admin/galerias', label: 'Galerías', icon: '🖼️' },
  { href: '/admin/documentos', label: 'Documentos PDF', icon: '📄' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
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
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <span
              key={item.href}
              className={`${styles.navLink} ${styles.navLinkDisabled}`}
              title="Próximamente"
            >
              {item.icon} {item.label}
            </span>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
            >
              {item.icon} {item.label}
            </Link>
          )
        )}
      </nav>

      <div className={styles.sidebarFooter}>
        <form action={logout}>
          <button type="submit" className={styles.logoutBtn}>
            Cerrar Sesión
          </button>
        </form>
        <Link href="/" className={styles.publicLink}>
          Ver Portal Público ↗
        </Link>
      </div>
    </aside>
  )
}
