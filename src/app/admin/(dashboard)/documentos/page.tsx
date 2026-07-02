import { supabaseAdmin as supabase } from '@/lib/supabase'
import { TIPO_ARCHIVO_PDF } from '@/lib/actividad-archivos'
import DocumentosClient from './DocumentosClient'
import type { DocumentoPdf } from '@/lib/types/admin'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  const [{ data, error }, { data: actividades }] = await Promise.all([
    supabase
      .from('archivos_actividades')
      .select('id_archivo_activi, id_actividad, ruta_archivo, tipo_archivo, actividades(titulo)')
      .eq('tipo_archivo', TIPO_ARCHIVO_PDF)
      .is('id_usuario', null)
      .order('id_archivo_activi', { ascending: false }),
    supabase.from('actividades').select('id_actividad, titulo').order('titulo'),
  ])

  const items = (data ?? []).map((d) => {
    const act = Array.isArray(d.actividades) ? d.actividades[0] : d.actividades
    return {
      id_archivo_activi: d.id_archivo_activi,
      id_actividad: d.id_actividad,
      ruta_archivo: d.ruta_archivo,
      tipo_archivo: d.tipo_archivo,
      titulo_actividad: act?.titulo ?? '',
    }
  })

  return (
    <DocumentosClient
      items={items}
      actividades={actividades ?? []}
      dbError={error?.message ?? null}
    />
  )
}
