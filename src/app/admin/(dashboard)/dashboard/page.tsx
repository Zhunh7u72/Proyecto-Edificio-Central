import { supabaseAdmin as supabase } from '@/lib/supabase'
import { TIPO_ARCHIVO_PDF } from '@/lib/actividad-archivos'
import Link from 'next/link'
import styles from '@/components/admin/admin.module.css'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [
    { count: actCount },
    { count: inscritosCount },
    { count: usersCount },
    { count: anunciosCount },
    { count: eventosCount },
    { count: capacitacionesCount },
    { count: fotosCount },
    { count: pdfsCount },
    { count: facultadesCount },
    { count: comentariosCount },
  ] = await Promise.all([
    supabase.from('actividades').select('id_actividad', { count: 'exact', head: true }),
    supabase.from('matriculas_eventos').select('id_matricula', { count: 'exact', head: true }),
    supabase.from('usuarios').select('id_usuario', { count: 'exact', head: true }).eq('rol', 'Estudiante'),
    supabase.from('actividades').select('id_actividad', { count: 'exact', head: true }).eq('tipo', 'Anuncio'),
    supabase.from('actividades').select('id_actividad', { count: 'exact', head: true }).eq('tipo', 'Evento'),
    supabase.from('actividades').select('id_actividad', { count: 'exact', head: true }).eq('tipo', 'Capacitacion'),
    supabase.from('fotos_carreras').select('id_foto_carre', { count: 'exact', head: true }),
    supabase
      .from('archivos_actividades')
      .select('id_archivo_activi', { count: 'exact', head: true })
      .eq('tipo_archivo', TIPO_ARCHIVO_PDF)
      .is('id_usuario', null),
    supabase.from('facultades').select('id_facultad', { count: 'exact', head: true }),
    supabase.from('comentarios').select('id_comentario', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Actividades', value: actCount ?? 0 },
    { label: 'Anuncios', value: anunciosCount ?? 0 },
    { label: 'Eventos', value: eventosCount ?? 0 },
    { label: 'Capacitaciones', value: capacitacionesCount ?? 0 },
    { label: 'Fotos en galería', value: fotosCount ?? 0, alt: true },
    { label: 'Documentos PDF', value: pdfsCount ?? 0, alt: true },
    { label: 'Inscripciones', value: inscritosCount ?? 0, alt: true },
    { label: 'Estudiantes', value: usersCount ?? 0, alt: true },
    { label: 'Facultades', value: facultadesCount ?? 0, alt: true },
    { label: 'Comentarios', value: comentariosCount ?? 0, alt: true },
  ]

  const quickLinks = [
    { href: '/admin/anuncios', label: 'Gestionar Anuncios' },
    { href: '/admin/eventos', label: 'Gestionar Eventos' },
    { href: '/admin/capacitaciones', label: 'Gestionar Capacitaciones' },
    { href: '/admin/inscripciones', label: 'Ver Inscripciones' },
    { href: '/admin/galerias', label: 'Gestionar Galerías' },
    { href: '/admin/documentos', label: 'Gestionar Documentos PDF' },
  ]

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>Resumen general del panel administrativo FEUE — RU07</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={`${styles.statCard} ${stat.alt ? styles.statCardAlt : ''}`}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className={styles.tableWrapper} style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--utn-dark)' }}>
          Accesos rápidos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="btn btn-outline btn-sm"
              style={{ textAlign: 'center' }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
