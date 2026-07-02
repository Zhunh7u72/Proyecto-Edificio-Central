'use client'

import { useActionState, useRef, useState } from 'react'
import { inscribirEstudiante } from '@/app/actions/inscripciones'
import { PDF_INSCRIPCION_MAX_BYTES, PDF_INSCRIPCION_TIPOS } from '@/lib/config'
import LoadingOverlay from '@/components/LoadingOverlay'
import styles from './EnrollForm.module.css'

interface EnrollFormProps {
  idActividad: number
  /** Si es true, el formulario mostrará el campo para subir el PDF requerido */
  requiereDocumento?: boolean
}

export default function EnrollForm({ idActividad, requiereDocumento = false }: EnrollFormProps) {
  const [state, action, isPending] = useActionState(inscribirEstudiante, undefined)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxMB = PDF_INSCRIPCION_MAX_BYTES / 1024 / 1024

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setFileName(null)
      setFileError(null)
      return
    }

    // Validación de tipo
    if (!PDF_INSCRIPCION_TIPOS.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Solo se permiten archivos PDF.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFileName(null)
      return
    }

    // Validación de tamaño
    if (file.size > PDF_INSCRIPCION_MAX_BYTES) {
      setFileError(`El archivo supera el límite de ${maxMB} MB.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFileName(null)
      return
    }

    setFileError(null)
    setFileName(file.name)
  }

  if (state?.success) {
    return (
      <div className="form-success">
        <h4>¡Inscripción Confirmada!</h4>
        <p>{state.success}</p>
        <p className={styles.successNote}>Nos pondremos en contacto contigo pronto.</p>
      </div>
    )
  }

  return (
    <div className={styles.formContainer}>
      <LoadingOverlay show={isPending} />
      <h3 className={styles.formTitle}>Formulario de Inscripción</h3>
      <p className={styles.formSubtitle}>Llena tus datos para registrarte en este evento.</p>

      {state?.error && (
        <div className="form-error" style={{ marginBottom: '1rem', padding: '0.8rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
          {state.error}
        </div>
      )}

      <form action={action} className={styles.form}>
        <input type="hidden" name="id_actividad" value={idActividad} />
        <input type="hidden" name="requiere_documento" value={requiereDocumento ? 'true' : 'false'} />

        <div className="form-group">
          <label htmlFor="nombres" className="form-label">Nombres Completos</label>
          <input type="text" id="nombres" name="nombres" className="form-input" placeholder="Ej. Juan Carlos" required />
        </div>

        <div className="form-group">
          <label htmlFor="apellidos" className="form-label">Apellidos Completos</label>
          <input type="text" id="apellidos" name="apellidos" className="form-input" placeholder="Ej. Pérez Gómez" required />
        </div>

        <div className="form-group">
          <label htmlFor="correo" className="form-label">Correo Electrónico</label>
          <input type="email" id="correo" name="correo" className="form-input" placeholder="juan.perez@utn.edu.ec" required />
        </div>

        {/* Campo PDF */}
        <div className="form-group">
          <label className="form-label">
            Documento PDF {requiereDocumento ? <span style={{ color: 'var(--color-primary)' }}>*</span> : '(opcional)'}
          </label>
          <div className={styles.fileRow}>
            <label className={styles.fileButton}>
              📎 Adjuntar PDF
              <input
                ref={fileInputRef}
                type="file"
                name="pdf_documento"
                accept=".pdf,application/pdf"
                className={styles.fileInput}
                onChange={handleFileChange}
                required={requiereDocumento}
              />
            </label>
            <span className={styles.fileName}>
              {fileName ?? 'Ningún archivo seleccionado'}
            </span>
          </div>
          {fileError && <p style={{ color: 'var(--color-primary)', fontSize: '0.82rem', marginTop: '0.4rem' }}>{fileError}</p>}
          <p className={styles.fileHint}>
            Solo PDF · Máximo {maxMB} MB
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending || !!fileError}
          style={{ width: '100%' }}
        >
          {isPending ? 'Inscribiendo...' : 'Inscribirse al Evento'}
        </button>
        <p className={styles.privacyNote}>
          Al inscribirte, aceptas recibir notificaciones relacionadas con este evento.
        </p>
      </form>
    </div>
  )
}
