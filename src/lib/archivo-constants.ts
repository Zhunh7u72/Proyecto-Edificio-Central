/** Valores del enum tipo_archivo_enum según SCRIP-BASE */
export const TIPO_ARCHIVO_FOTO = 'Fotografia'
export const TIPO_ARCHIVO_PDF = 'PDF'
export const TIPO_ARCHIVO_VIDEO = 'Video'

export const MAX_IMAGEN_BYTES = 5 * 1024 * 1024
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024

export const IMAGEN_MIME_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export const VIDEO_MIME_PERMITIDOS = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const

/** Atributo accept para inputs de solo imágenes */
export const ACCEPT_SOLO_IMAGENES =
  'image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp'

export const ACCEPT_SOLO_VIDEOS =
  'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'

export const ETIQUETA_FORMATOS_IMAGEN = 'JPG, PNG, GIF o WEBP'
export const ETIQUETA_FORMATOS_VIDEO = 'MP4, WEBM o MOV'

export function esImagenPermitida(file: File): boolean {
  const nombre = file.name.toLowerCase()
  if (IMAGEN_MIME_PERMITIDOS.includes(file.type as (typeof IMAGEN_MIME_PERMITIDOS)[number])) {
    return true
  }
  return /\.(jpe?g|png|gif|webp)$/i.test(nombre)
}

export function esVideoPermitido(file: File): boolean {
  const nombre = file.name.toLowerCase()
  if (VIDEO_MIME_PERMITIDOS.includes(file.type as (typeof VIDEO_MIME_PERMITIDOS)[number])) {
    return true
  }
  return /\.(mp4|webm|mov)$/i.test(nombre)
}

export function nombreArchivoDesdeRuta(ruta: string) {
  try {
    return decodeURIComponent(ruta.split('/').pop() || 'archivo').replace(/^\d+-/, '')
  } catch {
    return 'archivo'
  }
}

