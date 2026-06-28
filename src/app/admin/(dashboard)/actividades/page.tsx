import { supabase } from '@/lib/supabase'
import ActividadesClient from './ActividadesClient'

export const dynamic = 'force-dynamic'

export default async function ActividadesPage() {
  const { data: actividades } = await supabase
    .from('actividades')
    .select('*')
    .order('fecha_publicacion', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-secondary)' }}>
            Gestión de Actividades
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Crea, edita o elimina noticias y eventos (Cumple RU07).</p>
        </div>
      </div>

      <ActividadesClient actividades={actividades || []} />
    </div>
  )
}
