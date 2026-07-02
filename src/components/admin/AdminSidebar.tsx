'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import styles from '../../app/admin/(dashboard)/layout.module.css'

import { useState } from 'react'

const IconDashboard = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
const IconFileText = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const IconMegaphone = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconGraduationCap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const IconClipboardList = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconHandshake = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const IconImage = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconFile = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
  { 
    label: 'Actividades', 
    icon: <IconFileText />, 
    href: '/admin/actividades',
    children: [
      { href: '/admin/anuncios', label: 'Anuncios', icon: <IconMegaphone /> },
      { href: '/admin/eventos', label: 'Eventos', icon: <IconCalendar /> },
      { href: '/admin/capacitaciones', label: 'Capacitaciones', icon: <IconGraduationCap /> },
    ]
  },
  { href: '/admin/inscripciones', label: 'Inscripciones', icon: <IconClipboardList /> },
  { href: '/admin/institucional', label: 'Representantes', icon: <IconUsers />, disabled: true },
  { href: '/admin/asociaciones', label: 'Asociaciones', icon: <IconHandshake />, disabled: true },
  { href: '/admin/galerias', label: 'Galerías', icon: <IconImage />, disabled: true },
  { href: '/admin/documentos', label: 'Documentos PDF', icon: <IconFile /> },
  { href: '/admin/configuracion', label: 'Configuración', icon: <IconSettings /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [actividadesOpen, setActividadesOpen] = useState(
    pathname.startsWith('/admin/actividades') || 
    pathname.startsWith('/admin/anuncios') || 
    pathname.startsWith('/admin/eventos') || 
    pathname.startsWith('/admin/capacitaciones')
  )

  const closeMobileMenu = () => setIsMobileOpen(false)

  return (
    <>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKsTaAxYxsfEjB4Go6B3ucJ-17d-ayMWMsGlCGDD99R8Ocx7Jh61hAm_P&s=10"
            alt="Logo UTN"
            style={{ width: '35px', height: '35px', borderRadius: '50%' }}
          />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Admin Panel</h3>
        </div>
        <button className={styles.hamburgerBtn} onClick={() => setIsMobileOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      {/* Overlay */}
      <div 
        className={`${styles.sidebarOverlay} ${isMobileOpen ? styles.open : ''}`} 
        onClick={closeMobileMenu}
      />

      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKsTaAxYxsfEjB4Go6B3ucJ-17d-ayMWMsGlCGDD99R8Ocx7Jh61hAm_P&s=10"
            alt="Logo UTN"
            className={styles.logo}
          />
          <div style={{ flex: 1 }}>
            <h3>Admin Panel</h3>
            <p>Edificio Central</p>
          </div>
          <button className={styles.hamburgerBtn} style={{ display: isMobileOpen ? 'block' : 'none' }} onClick={closeMobileMenu}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            if (item.disabled) {
              return (
                <span key={item.label} className={`${styles.navLink} ${styles.navLinkDisabled}`} title="Próximamente">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>{item.icon} {item.label}</span>
                </span>
              )
            }

            if (item.children) {
              const isActive = pathname === item.href
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex' }}>
                    <Link href={item.href} onClick={closeMobileMenu} className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`} style={{ flex: 1 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>{item.icon} {item.label}</span>
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
                        <Link key={child.href} onClick={closeMobileMenu} href={child.href} className={`${styles.navLink} ${styles.navSubLink} ${pathname === child.href ? styles.navLinkActive : ''}`}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>{child.icon} {child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link key={item.href} href={item.href!} onClick={closeMobileMenu} className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>{item.icon} {item.label}</span>
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
    </>
  )
}
