import { query } from '@/lib/db'
import ConfiguracionClient from './ConfiguracionClient'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const res = await query('SELECT id_info_inst, logo_url, carrusel_urls, mision, vision FROM informacion_institucional LIMIT 1')
  const config = res.rows.length > 0 ? res.rows[0] : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-secondary)' }}>
            Configuración del Sitio
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gestiona el logo y las imágenes del carrusel de inicio.</p>
        </div>
      </div>

      <ConfiguracionClient initialConfig={config || {}} />
    </div>
  )
}
