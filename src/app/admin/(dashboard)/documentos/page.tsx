import { supabaseAdmin as supabase } from '@/lib/supabase'
import { TIPO_ARCHIVO_PDF } from '@/lib/actividad-archivos'
import DocumentosClient from './DocumentosClient'
import type { DocumentoPdf } from '@/lib/types/admin'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  const [{ data, error }, { data: actividades }] = await Promise.all([
    supabase
      .from('archivos_actividades')
      .select('*, actividades(titulo)')
      .eq('tipo_archivo', TIPO_ARCHIVO_PDF)
      .order('id_archivo_activi', { ascending: false }),
    supabase.from('actividades').select('id_actividad, titulo').order('titulo'),
  ])

  const items = ((data as DocumentoPdf[]) ?? []).map((d) => ({
    ...d,
    titulo_actividad: d.actividades?.titulo ?? '',
  }))

  return (
    <DocumentosClient
      items={items}
      actividades={actividades ?? []}
      dbError={error?.message ?? null}
    />
  )
}
