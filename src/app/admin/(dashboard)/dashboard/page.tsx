import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Estadísticas básicas
  const { count: actCount } = await supabase
    .from('actividades')
    .select('*', { count: 'exact', head: true })

  const { count: inscritosCount } = await supabase
    .from('matriculas_eventos')
    .select('*', { count: 'exact', head: true })

  const { count: usersCount } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true })
    .eq('rol', 'Estudiante')

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-secondary)' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Resumen general de la plataforma.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total Actividades</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{actCount || 0}</p>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total Inscripciones</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a' }}>{inscritosCount || 0}</p>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Estudiantes Registrados</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{usersCount || 0}</p>
        </div>
      </div>
    </div>
  )
}
