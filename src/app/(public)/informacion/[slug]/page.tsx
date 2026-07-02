import { notFound } from 'next/navigation'
import InfoPageLayout from '@/components/InfoPageLayout'
import { query } from '@/lib/db'
import {
  INFORMACION_SECTIONS,
  PRINCIPIOS_CONTENT,
  FINES_CONTENT,
  OBJETIVOS_CONTENT,
  getSectionLabel,
  type InformacionSlug,
} from '@/lib/informacion-content'
import styles from '@/components/InfoPageLayout.module.css'

export const dynamic = 'force-dynamic'

const VALID_SLUGS = INFORMACION_SECTIONS.map((s) => s.slug)

function renderParagraphs(text: string) {
  return text.split('\n\n').map((paragraph, i) => (
    <p key={i}>{paragraph}</p>
  ))
}

async function getPageContent(slug: string) {
  switch (slug) {
    case 'principios':
      return renderParagraphs(PRINCIPIOS_CONTENT)
    case 'objetivos':
      return renderParagraphs(OBJETIVOS_CONTENT)
    case 'fines':
      return renderParagraphs(FINES_CONTENT)
    case 'mision':
    case 'vision': {
      const res = await query('SELECT mision, vision FROM informacion_institucional LIMIT 1')
      const data = res.rows.length > 0 ? res.rows[0] : null
      const text = slug === 'mision' ? data?.mision : data?.vision
      return <p>{text || 'Información no disponible.'}</p>
    }
    case 'autoridades': {
      const resAut = await query('SELECT id_autoridades_info_institu, nombres, apellidos, correo_contactos, ruta_foto FROM autoridades_info_institucional')
      const autoridades = resAut.rows

      if (!autoridades || autoridades.length === 0) {
        return <p>Información no disponible.</p>
      }

      return (
        <ul>
          {autoridades.map((aut) => (
            <li key={aut.id_autoridades_info_institu}>
              <div className={styles.autoridadCard}>
                {aut.ruta_foto && (
                  <img src={aut.ruta_foto} alt="" className={styles.autoridadFoto} />
                )}
                <div className={styles.autoridadInfo}>
                  <h4>{aut.nombres} {aut.apellidos}</h4>
                  {aut.correo_contactos && <p>{aut.correo_contactos}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )
    }
    default:
      return null
  }
}

export default async function InformacionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!VALID_SLUGS.includes(slug as InformacionSlug)) {
    notFound()
  }

  const title = getSectionLabel(slug)
  const content = await getPageContent(slug as InformacionSlug)

  return (
    <InfoPageLayout title={title}>
      {content}
    </InfoPageLayout>
  )
}
