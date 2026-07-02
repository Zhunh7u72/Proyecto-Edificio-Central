import { supabaseAdmin as supabase } from '@/lib/supabase'
import ConfiguracionClient from './ConfiguracionClient'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const { data: config } = await supabase
    .from('informacion_institucional')
    .select('*')
    .limit(1)
    .single()

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
