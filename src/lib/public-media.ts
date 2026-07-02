import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'
import { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_PDF } from '@/lib/actividad-archivos'
import type { DocumentoPublico, FotoGaleria } from '@/lib/types/public-media'

export type { DocumentoPublico, FotoGaleria } from '@/lib/types/public-media'

function pdfNameFromUrl(url: string) {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || '')
    return name.replace(/\.pdf$/i, '') || 'Documento oficial'
  } catch {
    return 'Documento oficial'
  }
}

export async function fetchFotosGaleria() {
  const [actividadesRes, carrerasRes] = await Promise.all([
    supabaseAdmin
      .from('archivos_actividades')
      .select('id_archivo_activi, id_actividad, ruta_archivo, actividades(titulo, tipo)')
      .eq('tipo_archivo', TIPO_ARCHIVO_FOTO)
      .order('id_archivo_activi', { ascending: false }),
    supabaseAdmin
      .from('fotos_carreras')
      .select('id_foto_carre, ruta_foto, facultades_carreras(nombre_carrera, facultades(nombre_facultad))')
      .order('id_foto_carre', { ascending: false }),
  ])

  const fotos: FotoGaleria[] = []

  for (const row of actividadesRes.data ?? []) {
    const act = Array.isArray(row.actividades) ? row.actividades[0] : row.actividades
    if (!row.ruta_archivo) continue
    fotos.push({
      id: `act-${row.id_archivo_activi}`,
      ruta: row.ruta_archivo,
      titulo: act?.titulo ?? 'Actividad',
      subtitulo: act?.tipo ?? undefined,
      fuente: 'actividad',
      id_actividad: row.id_actividad ?? undefined,
    })
  }

  for (const row of carrerasRes.data ?? []) {
    const carrera = Array.isArray(row.facultades_carreras)
      ? row.facultades_carreras[0]
      : row.facultades_carreras
    const facRaw = carrera?.facultades as { nombre_facultad?: string } | { nombre_facultad?: string }[] | null | undefined
    const nombreFac = Array.isArray(facRaw) ? facRaw[0]?.nombre_facultad : facRaw?.nombre_facultad
    if (!row.ruta_foto) continue
    fotos.push({
      id: `car-${row.id_foto_carre}`,
      ruta: row.ruta_foto,
      titulo: carrera?.nombre_carrera ?? 'Galería',
      subtitulo: nombreFac ?? undefined,
      fuente: 'carrera',
    })
  }

  return {
    fotos,
    error: actividadesRes.error?.message ?? carrerasRes.error?.message ?? null,
  }
}

export async function fetchDocumentosPublicos() {
  const { data, error } = await supabaseAdmin
    .from('archivos_actividades')
    .select('id_archivo_activi, ruta_archivo, actividades(titulo, tipo)')
    .eq('tipo_archivo', TIPO_ARCHIVO_PDF)
    .is('id_usuario', null)
    .order('id_archivo_activi', { ascending: false })

  const documentos: DocumentoPublico[] = (data ?? []).map((row) => {
    const act = Array.isArray(row.actividades) ? row.actividades[0] : row.actividades
    return {
      id_archivo_activi: row.id_archivo_activi,
      nombre: act?.titulo?.trim() || pdfNameFromUrl(row.ruta_archivo),
      ruta_archivo: row.ruta_archivo,
      actividad_tipo: act?.tipo ?? undefined,
    }
  })

  return { documentos, error: error?.message ?? null }
}
