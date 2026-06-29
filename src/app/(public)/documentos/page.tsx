import { fetchDocumentosPublicos } from '@/lib/public-media'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

function tipoLabel(tipo?: string) {
  if (tipo === 'Evento') return 'Evento'
  if (tipo === 'Capacitacion') return 'Capacitación'
  if (tipo === 'Anuncio') return 'Anuncio'
  return null
}

export default async function DocumentosPage() {
  const { documentos, error } = await fetchDocumentosPublicos()

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Documentos Oficiales</h1>
          <p className={styles.subtitle}>
            Descarga documentos PDF de las actividades del Edificio Central
          </p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        {error && (
          <div className={styles.errorMsg}>
            <p>No se pudieron cargar los documentos. Intenta más tarde.</p>
            <code>{error}</code>
          </div>
        )}

        {!error && documentos.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📄</span>
            <h3>No hay documentos disponibles</h3>
            <p>Los PDF oficiales aparecerán aquí cuando el administrador los publique.</p>
          </div>
        )}

        {!error && documentos.length > 0 && (
          <ul className={styles.list}>
            {documentos.map((doc) => {
              const label = tipoLabel(doc.actividad_tipo)
              return (
                <li key={doc.id_archivo_activi} className={styles.item}>
                  <div className={styles.itemIcon} aria-hidden="true">
                    PDF
                  </div>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{doc.nombre}</h3>
                    {label && <span className={styles.itemBadge}>{label}</span>}
                  </div>
                  <a
                    href={doc.ruta_archivo}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn btn-primary ${styles.downloadBtn}`}
                  >
                    Descargar
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
