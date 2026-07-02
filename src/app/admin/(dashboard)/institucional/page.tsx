import { supabaseAdmin } from '@/lib/supabase'
import InstitucionalAdminClient from './InstitucionalAdminClient'

export const dynamic = 'force-dynamic'

export default async function InstitucionalAdminPage() {
  const { data: autoridades } = await supabaseAdmin
    .from('autoridades_info_institucional')
    .select('id_autoridades_info_institu, nombres, apellidos, correo_contactos, ruta_foto')
    .order('id_autoridades_info_institu', { ascending: true })

  return <InstitucionalAdminClient autoridades={autoridades ?? []} />
}
