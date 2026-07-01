export const dynamic = 'force-dynamic'

export default async function TalleresPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-secondary)' }}>Talleres</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Los talleres estarán disponibles cuando se habilite el tipo en la base de datos. Por ahora
            puedes gestionar <strong>Anuncios</strong>, <strong>Eventos</strong> y{' '}
            <strong>Capacitaciones</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
