import styles from './LoadingScreen.module.css'

const LOGO_SRC = '/logo-feue.jpeg'

interface LoadingScreenProps {
  /** Pantalla completa fija (navegación). Si es false, ocupa el contenedor padre. */
  fullScreen?: boolean
}

export default function LoadingScreen({ fullScreen = true }: LoadingScreenProps) {
  return (
    <div
      className={fullScreen ? styles.screen : styles.inline}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <div className={styles.loader}>
        <div className={styles.ring} aria-hidden="true" />
        <img src={LOGO_SRC} alt="FEUE" className={styles.logo} />
      </div>
    </div>
  )
}
