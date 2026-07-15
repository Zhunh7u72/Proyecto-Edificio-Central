'use client'

import Link from 'next/link'
import { useState } from 'react'
import { INFORMACION_SECTIONS } from '@/lib/informacion-content'
import styles from './Header.module.css'

interface HeaderProps {
  logoUrl?: string | null
  isAuthenticated?: boolean
}

export default function Header({ logoUrl, isAuthenticated = false }: HeaderProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [feueOpen, setFeueOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
    setFeueOpen(false)
  }

  const adminLinkHref = isAuthenticated ? '/admin/dashboard' : '/admin/login'
  const adminLinkLabel = isAuthenticated ? 'Gestionar' : 'LOGIN'

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarInner}`}>
          <span>Universidad Técnica del Norte — FEUE</span>
          <div className={styles.topBarLinks}>
            <a href="https://www.utn.edu.ec" target="_blank" rel="noopener noreferrer">
              Portal UTN
            </a>
          </div>
        </div>
      </div>

      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand} onClick={closeMenu}>
            <img
              src={logoUrl || "/logo-feue.jpeg"}
              alt="Logo FEUE"
              className={styles.logo}
            />
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>FEUE</span>
              <span className={styles.brandSubtitle}>UTN</span>
            </div>
          </Link>

          <button
            className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <li>
              <Link href="/" onClick={closeMenu}>Inicio</Link>
            </li>
            <li>
              <Link href="/galeria" onClick={closeMenu}>Galería</Link>
            </li>
            <li>
              <Link href="/documentos" onClick={closeMenu}>Documentos</Link>
            </li>
            <li>
              <Link href="/institucional" onClick={closeMenu}>Institucional</Link>
            </li>

            <li
              className={`${styles.dropdown} ${feueOpen ? styles.dropdownOpen : ''}`}
              onMouseEnter={() => setFeueOpen(true)}
              onMouseLeave={() => setFeueOpen(false)}
            >
              <button
                className={styles.dropdownToggle}
                onClick={() => setFeueOpen(!feueOpen)}
                aria-expanded={feueOpen}
                aria-haspopup="true"
              >
                LA FEUE
                <svg className={styles.dropdownArrow} width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </button>

              <ul className={styles.dropdownMenu}>
                {INFORMACION_SECTIONS.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/informacion/${item.slug}`} onClick={closeMenu}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li>
              <Link href={adminLinkHref} onClick={closeMenu}>{adminLinkLabel}</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
