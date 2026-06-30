'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import styles from '../../app/admin/(dashboard)/layout.module.css'

import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { 
    label: 'Actividades', 
    icon: '📝', 
    href: '/admin/actividades',
    children: [
      { href: '/admin/anuncios', label: 'Anuncios', icon: '📢' },
      { href: '/admin/eventos', label: 'Eventos', icon: '📅' },
      { href: '/admin/capacitaciones', label: 'Capacitaciones', icon: '🎓' },
    ]
  },
  { href: '/admin/inscripciones', label: 'Inscripciones', icon: '📋' },
  { href: '/admin/institucional', label: 'Representantes', icon: '🏛️' },
  { href: '/admin/asociaciones', label: 'Asociaciones', icon: '🤝', disabled: true },
  { href: '/admin/galerias', label: 'Galerías', icon: '🖼️' },
  { href: '/admin/documentos', label: 'Documentos PDF', icon: '📄' },
  { href: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [actividadesOpen, setActividadesOpen] = useState(
    pathname.startsWith('/admin/actividades') || 
    pathname.startsWith('/admin/anuncios') || 
    pathname.startsWith('/admin/eventos') || 
    pathname.startsWith('/admin/capacitaciones')
  )

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
        {NAV_ITEMS.map((item) => {
          if (item.disabled) {
            return (
              <span key={item.label} className={`${styles.navLink} ${styles.navLinkDisabled}`} title="Próximamente">
                {item.icon} {item.label}
              </span>
            )
          }

          if (item.children) {
            const isActive = pathname === item.href
            return (
              <div key={item.label}>
                <div style={{ display: 'flex' }}>
                  <Link href={item.href} className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} style={{ flex: 1 }}>
                    {item.icon} {item.label}
                  </Link>
                  <button 
                    onClick={() => setActividadesOpen(!actividadesOpen)}
                    style={{ background: 'none', border: 'none', color: 'white', padding: '0 15px', cursor: 'pointer', opacity: 0.7 }}
                  >
                    {actividadesOpen ? '▲' : '▼'}
                  </button>
                </div>
                {actividadesOpen && (
                  <div style={{ background: 'rgba(0,0,0,0.1)' }}>
                    {item.children.map(child => (
                      <Link key={child.href} href={child.href} className={`${styles.navLink} ${styles.navSubLink} ${pathname === child.href ? styles.navLinkActive : ''}`}>
                        {child.icon} {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link key={item.href} href={item.href!} className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}>
              {item.icon} {item.label}
            </Link>
          )
        })}
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
