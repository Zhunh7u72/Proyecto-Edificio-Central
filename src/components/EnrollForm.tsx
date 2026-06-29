'use client'

import { useActionState } from 'react'
import { inscribirEstudiante } from '@/app/actions/inscripciones'
import LoadingOverlay from '@/components/LoadingOverlay'
import styles from './EnrollForm.module.css'

interface EnrollFormProps {
  idActividad: number
}

export default function EnrollForm({ idActividad }: EnrollFormProps) {
  const [state, action, isPending] = useActionState(inscribirEstudiante, undefined)

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

        <div className="form-group">
          <label htmlFor="nombres" className="form-label">Nombres Completos</label>
          <input 
            type="text" 
            id="nombres" 
            name="nombres" 
            className="form-input" 
            placeholder="Ej. Juan Carlos"
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="apellidos" className="form-label">Apellidos Completos</label>
          <input 
            type="text" 
            id="apellidos" 
            name="apellidos" 
            className="form-input" 
            placeholder="Ej. Pérez Gómez"
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="correo" className="form-label">Correo Electrónico (Institucional preferiblemente)</label>
          <input 
            type="email" 
            id="correo" 
            name="correo" 
            className="form-input" 
            placeholder="juan.perez@utn.edu.ec"
            required 
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isPending} style={{ width: '100%' }}>
          {isPending ? 'Inscribiendo...' : 'Inscribirse al Evento'}
        </button>
        <p className={styles.privacyNote}>
          Al inscribirte, aceptas recibir notificaciones relacionadas con este evento.
        </p>
      </form>
    </div>
  )
}
