'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import styles from './page.module.css'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, undefined)

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKsTaAxYxsfEjB4Go6B3ucJ-17d-ayMWMsGlCGDD99R8Ocx7Jh61hAm_P&s=10" 
            alt="Logo UTN" 
            className={styles.logo}
          />
          <h2>Portal Administrativo</h2>
          <p>Edificio Central UTN</p>
        </div>

        {state?.error && (
          <div className="form-error" style={{ marginBottom: '1rem', padding: '0.8rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', textAlign: 'center' }}>
            {state.error}
          </div>
        )}

        <form action={action} className={styles.loginForm}>
          <div className="form-group">
            <label htmlFor="correo" className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              id="correo" 
              name="correo" 
              className="form-input" 
              placeholder="Correo"
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="form-input" 
              placeholder="password"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isPending} style={{ width: '100%', marginTop: '1rem' }}>
            {isPending ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <Link href="/" className={styles.backLink}>
            ← Volver al Portal Público
          </Link>
        </div>
      </div>
    </div>
  )
}
