'use client'

import { useState, useRef } from 'react'
import { actualizarConfiguracionSitio } from '@/app/actions/configuracion'
import styles from '@/components/admin/admin.module.css'

interface ConfiguracionClientProps {
  initialConfig: {
    logo_url?: string | null
    carrusel_urls?: string[] | null
  }
}

export default function ConfiguracionClient({ initialConfig }: ConfiguracionClientProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(initialConfig.logo_url || null)
  const [carruselUrls, setCarruselUrls] = useState<string[]>(initialConfig.carrusel_urls || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const removeCarruselImage = (indexToRemove: number) => {
    setCarruselUrls((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    formData.append('existingCarrusel', JSON.stringify(carruselUrls))

    const res = await actualizarConfiguracionSitio(formData)
    
    if (res.error) {
      setMessage({ type: 'error', text: res.error })
    } else if (res.success) {
      setMessage({ type: 'success', text: res.success })
      if (formRef.current) formRef.current.reset()
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className={styles.crudWrapper}>
      {message && (
        <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formGrid}>
          {/* Logo Section */}
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1rem' }}>Logo Principal Actual</h3>
            {logoPreview ? (
              <div style={{ marginBottom: '1rem', background: '#f5f5f5', padding: '1rem', borderRadius: '8px', display: 'inline-block', border: '1px solid #ddd' }}>
                <img src={logoPreview} alt="Logo preview" style={{ height: '80px', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ marginBottom: '1rem', color: '#888', fontStyle: 'italic' }}>
                No hay logo guardado actualmente.
              </div>
            )}
            <input
              type="file"
              name="logo"
              className={styles.formInput}
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={handleLogoChange}
            />
            <small className={styles.fileHint}>Sube el logo de la institución (PNG o SVG recomendado) para reemplazar el actual.</small>
          </div>

          <hr style={{ gridColumn: '1 / -1', margin: '2rem 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

          {/* Carrusel Section */}
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1rem' }}>Imágenes Actuales del Carrusel de Inicio</h3>
            
            {carruselUrls.length > 0 ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                {carruselUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: '150px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                    <img src={url} alt={`Carrusel ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      onClick={() => removeCarruselImage(i)}
                      style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Eliminar imagen"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: '1rem', color: '#888', fontStyle: 'italic' }}>
                No hay imágenes configuradas. Se mostrarán las imágenes por defecto del sistema.
              </div>
            )}

            <input
              type="file"
              name="carrusel"
              className={styles.formInput}
              accept="image/jpeg,image/png,image/webp"
              multiple
            />
            <small className={styles.fileHint}>Sube nuevas imágenes para agregar al carrusel principal.</small>
          </div>
        </div>

        <div className={styles.formActions} style={{ marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}
