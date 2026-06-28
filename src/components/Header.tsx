'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from './Header.module.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={styles.header}>
      {/* Barra superior de info */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarInner}`}>
          <span>Universidad Técnica del Norte — Edificio Central</span>
          <div className={styles.topBarLinks}>
            <a href="https://www.utn.edu.ec" target="_blank" rel="noopener noreferrer">
              Portal UTN
            </a>
          </div>
        </div>
      </div>

      {/* Navbar principal */}
      <nav className={styles.navbar}>
        <div className={`container ${styles.navInner}`}>
          <Link href="/" className={styles.brand}>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKsTaAxYxsfEjB4Go6B3ucJ-17d-ayMWMsGlCGDD99R8Ocx7Jh61hAm_P&s=10"
              alt="Logo UTN"
              className={styles.logo}
            />
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>FEUE</span>
              <span className={styles.brandSubtitle}>UTN</span>
            </div>
          </Link>

          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <li><Link href="/" onClick={() => setMenuOpen(false)}>Inicio</Link></li>
            <li><Link href="/institucional" onClick={() => setMenuOpen(false)}>Institucional</Link></li>            
          </ul>
        </div>
      </nav>
    </header>
  )
}
