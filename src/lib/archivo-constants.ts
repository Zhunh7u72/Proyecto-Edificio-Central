/** Valores del enum tipo_archivo_enum según SCRIP-BASE */
export const TIPO_ARCHIVO_FOTO = 'Fotografia'
export const TIPO_ARCHIVO_PDF = 'PDF'

export function nombreArchivoDesdeRuta(ruta: string) {
  try {
    return decodeURIComponent(ruta.split('/').pop() || 'archivo').replace(/^\d+-/, '')
  } catch {
    return 'archivo'
  }
}
