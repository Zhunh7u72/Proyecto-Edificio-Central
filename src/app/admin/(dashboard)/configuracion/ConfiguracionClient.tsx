'use client'

import { useState, useRef } from 'react'
import { actualizarConfiguracionSitio, eliminarImagenCarrusel } from '@/app/actions/configuracion'
import styles from '@/components/admin/admin.module.css'

interface ConfiguracionClientProps {
  initialConfig: {
    logo_url?: string | null
    carrusel_urls?: string[] | null
  }
}

const DEFAULT_LOGO = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKsTaAxYxsfEjB4Go6B3ucJ-17d-ayMWMsGlCGDD99R8Ocx7Jh61hAm_P&s=10'
const DEFAULT_CARRUSEL = [
  'https://www.utn.edu.ec/wp-content/uploads/2021/06/planta-central-utn.png',
  'https://www.utn.edu.ec/wp-content/uploads/slider/cache/582999c6872cac31eb8bd19d3b1411af/planta-cental.jpg',
  'https://www.utn.edu.ec/wp-content/uploads/slider/cache/c8a3ff23710beddb36c5cea6593f42d1/posgrado2.jpg',
  'https://www.utn.edu.ec/wp-content/uploads/slider/cache/88e33474650777c670250e56c3fdd8a9/biblioteca2.jpg'
]

export default function ConfiguracionClient({ initialConfig }: ConfiguracionClientProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(initialConfig.logo_url || DEFAULT_LOGO)
  const [carruselUrls, setCarruselUrls] = useState<string[]>(
    initialConfig.carrusel_urls && initialConfig.carrusel_urls.length > 0
      ? initialConfig.carrusel_urls
      : DEFAULT_CARRUSEL
  )
  const [newCarruselFiles, setNewCarruselFiles] = useState<{file: File, preview: string}[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const removeCarruselImage = async (indexToRemove: number, url: string) => {
    if (confirm('¿Estás seguro de que quieres borrar esta imagen del servidor?')) {
      const res = await eliminarImagenCarrusel(url)
      if (res.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: res.success || 'Imagen eliminada' })
        setCarruselUrls((prev) => prev.filter((_, i) => i !== indexToRemove))
      }
    }
  }

  const moveCarruselImage = (index: number, direction: 'left' | 'right') => {
    setCarruselUrls((prev) => {
      const newArr = [...prev]
      if (direction === 'left' && index > 0) {
        [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]]
      } else if (direction === 'right' && index < newArr.length - 1) {
        [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]]
      }
      return newArr
    })
  }

  const handleNewCarruselChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newPreviews = files.map(file => ({ file, preview: URL.createObjectURL(file) }))
      setNewCarruselFiles(prev => [...prev, ...newPreviews])
      
      // Limpiar el input para permitir volver a seleccionar los mismos si es necesario
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeNewFile = (indexToRemove: number) => {
    setNewCarruselFiles(prev => prev.filter((_, i) => i !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    formData.delete('carrusel') // Remove any empty input value
    formData.append('existingCarrusel', JSON.stringify(carruselUrls))
    
    // Append all new files manually
    newCarruselFiles.forEach(item => {
      formData.append('carrusel', item.file)
    })

    const res = await actualizarConfiguracionSitio(formData)
    
    if (res.error) {
      setMessage({ type: 'error', text: res.error })
    } else if (res.success) {
      setMessage({ type: 'success', text: res.success })
      setNewCarruselFiles([]) // Limpiar previsualizaciones nuevas
      if (formRef.current) formRef.current.reset()
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className={styles.crudWrapper}>
      {message && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: message.type === 'error' ? '#991b1b' : '#166534',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${message.type === 'error' ? '#f87171' : '#4ade80'}`,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontWeight: 600,
          transform: 'translateY(0)',
          transition: 'all 0.3s ease-in-out'
        }}>
          <span style={{ fontSize: '1.25rem' }}>{message.type === 'error' ? '⚠️' : '✅'}</span>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', marginLeft: '0.5rem', color: 'inherit', opacity: 0.7, padding: '0 5px' }}>&times;</button>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formGrid}>
          {/* Logo Section */}
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1rem' }}>Logo Principal Actual</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {logoPreview ? (
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '150px' }}>
                  <img src={logoPreview} alt="Logo preview" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ padding: '1.5rem', border: '1px dashed #ccc', borderRadius: '12px', color: '#888', fontStyle: 'italic', display: 'flex', alignItems: 'center', minWidth: '150px' }}>
                  No hay logo.
                </div>
              )}
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cambiar Logo</label>
                <input
                  type="file"
                  name="logo"
                  className={styles.formInput}
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  style={{ width: '100%' }}
                />
                <small className={styles.fileHint} style={{ display: 'block', marginTop: '0.5rem' }}>
                  Sube el logo de la institución (PNG o SVG recomendado) para reemplazar el actual.
                </small>
              </div>
            </div>
          </div>

          <hr style={{ gridColumn: '1 / -1', margin: '1rem 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

          {/* Carrusel Section */}
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1rem' }}>Imágenes del Carrusel de Inicio</h3>
            
            {(carruselUrls.length > 0 || newCarruselFiles.length > 0) ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--color-bg-alt)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                {/* PREVIEW IMAGENES EXISTENTES */}
                {carruselUrls.map((url, i) => (
                  <div key={url} style={{ position: 'relative', width: '180px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '2px solid transparent', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }} className="carrusel-item">
                    <img src={url} alt={`Carrusel ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                      <button
                        type="button"
                        onClick={() => moveCarruselImage(i, 'left')}
                        disabled={i === 0}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '4px', padding: '4px 8px', color: i === 0 ? 'rgba(255,255,255,0.3)' : 'white', cursor: i === 0 ? 'default' : 'pointer' }}
                        title="Mover a la izquierda"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCarruselImage(i, 'right')}
                        disabled={i === carruselUrls.length - 1}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '4px', padding: '4px 8px', color: i === carruselUrls.length - 1 ? 'rgba(255,255,255,0.3)' : 'white', cursor: i === carruselUrls.length - 1 ? 'default' : 'pointer' }}
                        title="Mover a la derecha"
                      >
                        ▶
                      </button>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => removeCarruselImage(i, url)}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                      title="Eliminar imagen"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* PREVIEW NUEVAS IMAGENES (Aun no guardadas) */}
                {newCarruselFiles.map((item, i) => (
                  <div key={item.preview} style={{ position: 'relative', width: '180px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--color-primary)', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', opacity: 0.9 }} className="carrusel-item">
                    <img src={item.preview} alt={`Nueva ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', pointerEvents: 'none' }}>
                      Nueva
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeNewFile(i)}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                      title="Quitar nueva imagen"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem', color: '#888', fontStyle: 'italic', padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px' }}>
                No hay imágenes configuradas. Se mostrarán las imágenes por defecto del sistema.
              </div>
            )}

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Agregar más imágenes</label>
              <input
                type="file"
                name="carrusel"
                ref={fileInputRef}
                className={styles.formInput}
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleNewCarruselChange}
                style={{ width: '100%', maxWidth: '400px' }}
              />
              <small className={styles.fileHint} style={{ display: 'block', marginTop: '0.5rem' }}>
                Sube nuevas imágenes para agregar al final del carrusel principal.
              </small>
            </div>
          </div>
        </div>

        <div className={styles.formActions} style={{ marginTop: '2rem', position: 'relative' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting} style={{ width: '100%', maxWidth: '300px', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
            {isSubmitting ? 'Guardando Configuración...' : 'Guardar Configuración'}
            {isSubmitting && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '4px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                animation: 'progress-indeterminate 1.5s infinite linear',
                width: '30%'
              }} />
            )}
          </button>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes progress-indeterminate {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(350%); }
            }
          `}} />
        </div>
      </form>
    </div>
  )
}
