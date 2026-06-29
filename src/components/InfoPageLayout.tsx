import Link from 'next/link'
import styles from './InfoPageLayout.module.css'

interface InfoPageLayoutProps {
  title: string
  children: React.ReactNode
}

export default function InfoPageLayout({ title, children }: InfoPageLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>{title.toUpperCase()}</h1>
        </div>
      </div>

      <div className={styles.breadcrumb}>
        <div className="container">
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSep}> - </span>
          <span className={styles.breadcrumbCurrent}>{title.toUpperCase()}</span>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        <h2 className={styles.sectionTitle}>{title.toUpperCase()}</h2>
        <div className={styles.contentBox}>{children}</div>
      </div>

      <a href="#" className={styles.backToTop} aria-label="Volver arriba">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </a>
    </div>
  )
}
