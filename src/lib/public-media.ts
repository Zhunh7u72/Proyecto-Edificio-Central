import 'server-only'
import { query } from '@/lib/db'
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
  const fotos: FotoGaleria[] = []
  let errorMsg = null

  try {
    const actRes = await query(`
      SELECT aa.id_archivo_activi, aa.id_actividad, aa.ruta_archivo, a.titulo, a.tipo
      FROM archivos_actividades aa
      LEFT JOIN actividades a ON aa.id_actividad = a.id_actividad
      WHERE aa.tipo_archivo = $1
      ORDER BY aa.id_archivo_activi DESC
    `, [TIPO_ARCHIVO_FOTO])

    for (const row of actRes.rows) {
      if (!row.ruta_archivo) continue
      fotos.push({
        id: `act-${row.id_archivo_activi}`,
        ruta: row.ruta_archivo,
        titulo: row.titulo ?? 'Actividad',
        subtitulo: row.tipo ?? undefined,
        fuente: 'actividad',
        id_actividad: row.id_actividad ?? undefined,
      })
    }

    const carRes = await query(`
      SELECT fc.id_foto_carre, fc.ruta_foto, facc.nombre_carrera, fac.nombre_facultad
      FROM fotos_carreras fc
      LEFT JOIN facultades_carreras facc ON fc.id_facultad_carrera = facc.id_facultad_carrera
      LEFT JOIN facultades fac ON facc.id_facultad = fac.id_facultad
      ORDER BY fc.id_foto_carre DESC
    `)

    for (const row of carRes.rows) {
      if (!row.ruta_foto) continue
      fotos.push({
        id: `car-${row.id_foto_carre}`,
        ruta: row.ruta_foto,
        titulo: row.nombre_carrera ?? 'Galería',
        subtitulo: row.nombre_facultad ?? undefined,
        fuente: 'carrera',
      })
    }
  } catch (e: any) {
    errorMsg = e.message
  }

  return { fotos, error: errorMsg }
}

export async function fetchDocumentosPublicos() {
  try {
    const res = await query(`
      SELECT aa.id_archivo_activi, aa.ruta_archivo, a.titulo, a.tipo
      FROM archivos_actividades aa
      LEFT JOIN actividades a ON aa.id_actividad = a.id_actividad
      WHERE aa.tipo_archivo = $1 AND aa.id_usuario IS NULL
      ORDER BY aa.id_archivo_activi DESC
    `, [TIPO_ARCHIVO_PDF])

    const documentos: DocumentoPublico[] = res.rows.map((row) => ({
      id_archivo_activi: row.id_archivo_activi,
      nombre: row.titulo?.trim() || pdfNameFromUrl(row.ruta_archivo),
      ruta_archivo: row.ruta_archivo,
      actividad_tipo: row.tipo ?? undefined,
    }))

    return { documentos, error: null }
  } catch (error: any) {
    return { documentos: [], error: error.message }
  }
}
