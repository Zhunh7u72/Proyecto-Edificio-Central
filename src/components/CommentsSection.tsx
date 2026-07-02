'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { publicarComentario } from '@/app/actions/comentarios'
import { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_PDF, nombreArchivoDesdeRuta, ACCEPT_SOLO_IMAGENES } from '@/lib/archivo-constants'
import type { ComentarioPublico } from '@/lib/types/comentarios'
import LoadingOverlay from '@/components/LoadingOverlay'
import styles from './CommentsSection.module.css'

interface CommentsSectionProps {
  idActividad: number
  comentarios: ComentarioPublico[]
}

export default function CommentsSection({ idActividad, comentarios }: CommentsSectionProps) {
  const router = useRouter()
  const [state, action, isPending] = useActionState(publicarComentario, undefined)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      setFileName(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    }
  }, [state?.success, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : null)
  }

  return (
    <div className={styles.section}>
      <LoadingOverlay show={isPending} />
      <h3 className={styles.title}>Comentarios</h3>
      <p className={styles.subtitle}>
        Participa en la conversación y adjunta imágenes o PDF si lo necesitas.
      </p>

      {comentarios.length === 0 ? (
        <p className={styles.empty}>Sé el primero en comentar esta publicación.</p>
      ) : (
        <ul className={styles.list}>
          {comentarios.map((c) => (
            <CommentItem key={c.id_comentario} comentario={c} />
          ))}
        </ul>
      )}

      <div className={styles.formBox}>
        <h4 className={styles.formTitle}>Escribir comentario</h4>

        {state?.error && <div className={styles.error}>{state.error}</div>}
        {state?.success && <div className="form-success">{state.success}</div>}

        <form ref={formRef} action={action} className={styles.form}>
          <input type="hidden" name="id_actividad" value={idActividad} />

          <div className={styles.identityGrid}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="comentario-nombres">
                Nombres *
              </label>
              <input
                id="comentario-nombres"
                name="nombres"
                className="form-input"
                placeholder="Ej. Juan Carlos"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="comentario-apellidos">
                Apellidos *
              </label>
              <input
                id="comentario-apellidos"
                name="apellidos"
                className="form-input"
                placeholder="Ej. Pérez Gómez"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="comentario-correo">
              Correo electrónico *
            </label>
            <input
              id="comentario-correo"
              name="correo"
              type="email"
              className="form-input"
              placeholder="juan.perez@utn.edu.ec"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="comentario-texto">
              Comentario *
            </label>
            <textarea
              id="comentario-texto"
              name="contenido_texto"
              className="form-input"
              rows={4}
              placeholder="Escribe tu comentario o respuesta..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Archivo adjunto (opcional)</label>
            <div className={styles.fileRow}>
              <label className={styles.fileButton}>
                Seleccionar archivo
                <input
                  ref={fileInputRef}
                  type="file"
                  name="archivo"
                  accept={`${ACCEPT_SOLO_IMAGENES},application/pdf,.pdf`}
                  className={styles.fileInput}
                  onChange={handleFileChange}
                />
              </label>
              <span className={styles.fileName}>
                {fileName ?? 'Ningún archivo seleccionado'}
              </span>
            </div>
            <p className={styles.fileHint}>Imágenes o PDF, máximo 5 MB.</p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? 'Publicando...' : 'Publicar comentario'}
          </button>
        </form>
      </div>
    </div>
  )
}

function CommentItem({ comentario }: { comentario: ComentarioPublico }) {
  const autor = comentario.usuarios
    ? `${comentario.usuarios.nombres} ${comentario.usuarios.apellidos}`
    : 'Estudiante'
  const fecha = new Date(comentario.fecha_comentario).toLocaleString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const archivos = comentario.archivos_interaccion ?? []

  return (
    <li className={styles.item}>
      <div className={styles.itemHeader}>
        <strong className={styles.author}>{autor}</strong>
        <time className={styles.date}>{fecha}</time>
      </div>
      <p className={styles.body}>{comentario.contenido_texto}</p>
      {archivos.length > 0 && (
        <div className={styles.attachments}>
          {archivos.map((archivo) => (
            <Attachment key={archivo.id_archivo_inter} archivo={archivo} />
          ))}
        </div>
      )}
    </li>
  )
}

function Attachment({
  archivo,
}: {
  archivo: { id_archivo_inter?: number; ruta_archivo: string; tipo_archivo: string }
}) {
  const nombre = nombreArchivoDesdeRuta(archivo.ruta_archivo)
  const esFoto = archivo.tipo_archivo === TIPO_ARCHIVO_FOTO
  const esPdf = archivo.tipo_archivo === TIPO_ARCHIVO_PDF

  if (esFoto) {
    return (
      <a href={archivo.ruta_archivo} target="_blank" rel="noopener noreferrer" className={styles.attachmentImage}>
        <img src={archivo.ruta_archivo} alt={nombre} loading="lazy" />
        <span>{nombre}</span>
      </a>
    )
  }

  return (
    <a
      href={archivo.ruta_archivo}
      download
      target="_blank"
      rel="noopener noreferrer"
      className={styles.attachmentPdf}
    >
      <span className={styles.pdfIcon}>{esPdf ? 'PDF' : '📎'}</span>
      <span>{nombre}</span>
      <span className={styles.downloadLabel}>Descargar</span>
    </a>
  )
}
