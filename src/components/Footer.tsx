import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
        {/* Columna 1 - Sobre */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Edificio Central</h4>
          <p className={styles.colText}>
            Portal de información, noticias y eventos del Edificio Central de la 
            Universidad Técnica del Norte. Mantente al día con las actividades académicas.
          </p>
        </div>

        {/* Columna 2 - Enlaces */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Enlaces Rápidos</h4>
          <ul className={styles.links}>
            <li><a href="/">Inicio</a></li>
            <li><a href="/galeria">Galería</a></li>
            <li><a href="/documentos">Documentos PDF</a></li>
            <li><a href="/institucional">Institucional</a></li>
            <li><a href="https://www.utn.edu.ec" target="_blank" rel="noopener noreferrer">Portal UTN</a></li>
          </ul>
        </div>

        {/* Columna 3 - Contacto */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contacto</h4>
          <ul className={styles.links}>
            <li>Av. 17 de Julio 5-21 y Gral. José María Córdova</li>
            <li>Ibarra — Ecuador</li>
            <li>Tel: (06) 299 7800</li>
          </ul>
        </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerInner}>
          <p>© {new Date().getFullYear()} Universidad Técnica del Norte — Edificio Central. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
