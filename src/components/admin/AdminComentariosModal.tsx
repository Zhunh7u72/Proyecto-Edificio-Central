'use client'

import { TIPO_ARCHIVO_FOTO, nombreArchivoDesdeRuta } from '@/lib/archivo-constants'
import type { ComentarioPublico } from '@/lib/types/comentarios'
import styles from './admin.module.css'

interface AdminComentariosModalProps {
  tituloActividad: string
  comentarios: ComentarioPublico[]
  onClose: () => void
}

export default function AdminComentariosModal({
  tituloActividad,
  comentarios,
  onClose,
}: AdminComentariosModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Comentarios — {tituloActividad}</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        {comentarios.length === 0 ? (
          <p className={styles.comentariosEmpty}>No hay comentarios en esta actividad.</p>
        ) : (
          <ul className={styles.comentariosList}>
            {comentarios.map((c) => (
              <li key={c.id_comentario} className={styles.comentarioItem}>
                <div className={styles.comentarioMeta}>
                  <strong>
                    {c.usuarios
                      ? `${c.usuarios.nombres} ${c.usuarios.apellidos}`
                      : 'Estudiante'}
                  </strong>
                  <time>
                    {new Date(c.fecha_comentario).toLocaleString('es-EC', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <p className={styles.comentarioTexto}>{c.contenido_texto}</p>
                {(c.archivos_interaccion?.length ?? 0) > 0 && (
                  <div className={styles.comentarioArchivos}>
                    {c.archivos_interaccion!.map((archivo) => {
                      const nombre = nombreArchivoDesdeRuta(archivo.ruta_archivo)
                      const esFoto = archivo.tipo_archivo === TIPO_ARCHIVO_FOTO
                      return (
                        <a
                          key={archivo.id_archivo_inter}
                          href={archivo.ruta_archivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.comentarioArchivoLink}
                        >
                          {esFoto ? '🖼️' : '📄'} {nombre}
                        </a>
                      )
                    })}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
