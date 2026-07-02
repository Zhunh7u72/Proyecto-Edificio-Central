import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'
import {
  TIPO_ARCHIVO_FOTO,
  TIPO_ARCHIVO_PDF,
  MAX_IMAGEN_BYTES,
  ETIQUETA_FORMATOS_IMAGEN,
} from '@/lib/archivo-constants'
import {
  detectarTipoArchivoComentario,
  validarArchivoImagen,
  validarArchivoPdf,
} from '@/lib/validar-contenido-archivo'

export async function guardarArchivoComentario(
  file: File,
  id_actividad: number
): Promise<{ ruta: string; tipo: string } | { error: string }> {
  const tipoDetectado = await detectarTipoArchivoComentario(file)
  if (!tipoDetectado) {
    return { error: `Solo se permiten imágenes (${ETIQUETA_FORMATOS_IMAGEN}) o PDF válidos.` }
  }

  if (tipoDetectado === 'pdf') {
    const validacion = await validarArchivoPdf(file, MAX_IMAGEN_BYTES)
    if ('error' in validacion) return { error: validacion.error }
  } else {
    const validacion = await validarArchivoImagen(file, MAX_IMAGEN_BYTES)
    if ('error' in validacion) return { error: validacion.error }
  }

  const tipo = tipoDetectado === 'pdf' ? TIPO_ARCHIVO_PDF : TIPO_ARCHIVO_FOTO

  const extension = file.name.split('.').pop()
  const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
  const storagePath = `comentarios/${id_actividad}/${safeName}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('archivos_publicos')
    .upload(storagePath, file, { contentType: file.type })

  if (uploadError) {
    return { error: 'Error al subir el archivo: ' + uploadError.message }
  }

  const { data } = supabaseAdmin.storage.from('archivos_publicos').getPublicUrl(storagePath)

  return {
    ruta: data.publicUrl,
    tipo,
  }
}
