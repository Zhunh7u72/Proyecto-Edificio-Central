import { notFound } from 'next/navigation'
import InfoPageLayout from '@/components/InfoPageLayout'
import { supabaseAdmin as supabase } from '@/lib/supabase'
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

async function getPageContent(slug: InformacionSlug) {
  switch (slug) {
    case 'principios':
      return renderParagraphs(PRINCIPIOS_CONTENT)
    case 'objetivos':
      return renderParagraphs(OBJETIVOS_CONTENT)
    case 'fines':
      return renderParagraphs(FINES_CONTENT)
    case 'mision': {
      const { data } = await supabase
        .from('informacion_institucional')
        .select('mision')
        .limit(1)
        .single()
      return <p>{data?.mision || 'Información no disponible.'}</p>
    }
    case 'vision': {
      const { data } = await supabase
        .from('informacion_institucional')
        .select('vision')
        .limit(1)
        .single()
      return <p>{data?.vision || 'Información no disponible.'}</p>
    }
    case 'autoridades': {
      const { data: autoridades } = await supabase
        .from('autoridades_info_institucional')
        .select('*')

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
