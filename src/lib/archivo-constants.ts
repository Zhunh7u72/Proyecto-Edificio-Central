/** Valores del enum tipo_archivo_enum según SCRIP-BASE */
export const TIPO_ARCHIVO_FOTO = 'Fotografia'
export const TIPO_ARCHIVO_PDF = 'PDF'

export const MAX_IMAGEN_BYTES = 5 * 1024 * 1024

export const IMAGEN_MIME_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

/** Atributo accept para inputs de solo imágenes */
export const ACCEPT_SOLO_IMAGENES =
  'image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp'

export const ETIQUETA_FORMATOS_IMAGEN = 'JPG, PNG, GIF o WEBP'

export function esImagenPermitida(file: File): boolean {
  const nombre = file.name.toLowerCase()
  if (IMAGEN_MIME_PERMITIDOS.includes(file.type as (typeof IMAGEN_MIME_PERMITIDOS)[number])) {
    return true
  }
  return /\.(jpe?g|png|gif|webp)$/i.test(nombre)
}

export function nombreArchivoDesdeRuta(ruta: string) {
  try {
    return decodeURIComponent(ruta.split('/').pop() || 'archivo').replace(/^\d+-/, '')
  } catch {
    return 'archivo'
  }
}
