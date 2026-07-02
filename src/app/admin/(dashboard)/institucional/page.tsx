import { query } from '@/lib/db'
import InstitucionalAdminClient from './InstitucionalAdminClient'

export const dynamic = 'force-dynamic'

export default async function InstitucionalAdminPage() {
  const res = await query('SELECT id_autoridades_info_institu, nombres, apellidos, correo_contactos, ruta_foto FROM autoridades_info_institucional ORDER BY id_autoridades_info_institu ASC')
  const autoridades = res.rows

  return <InstitucionalAdminClient autoridades={autoridades ?? []} />
}
