import {
  ETIQUETA_FORMATOS_IMAGEN,
  esImagenPermitida,
  MAX_IMAGEN_BYTES,
} from '@/lib/archivo-constants'

const PDF_SCAN_BYTES = 1024

function coincideBytes(buffer: Uint8Array, firma: number[], offset = 0): boolean {
  if (buffer.length < offset + firma.length) return false
  return firma.every((byte, i) => buffer[offset + i] === byte)
}

function esCabeceraJpeg(buffer: Uint8Array): boolean {
  return coincideBytes(buffer, [0xff, 0xd8, 0xff])
}

function esCabeceraPng(buffer: Uint8Array): boolean {
  return coincideBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
}

function esCabeceraGif(buffer: Uint8Array): boolean {
  return (
    coincideBytes(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    coincideBytes(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  )
}

function esCabeceraWebp(buffer: Uint8Array): boolean {
  return (
    buffer.length >= 12 &&
    coincideBytes(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    coincideBytes(buffer, [0x57, 0x45, 0x42, 0x50], 8)
  )
}

function esCabeceraImagen(buffer: Uint8Array): boolean {
  return (
    esCabeceraJpeg(buffer) ||
    esCabeceraPng(buffer) ||
    esCabeceraGif(buffer) ||
    esCabeceraWebp(buffer)
  )
}

function esCabeceraPdf(buffer: Uint8Array): boolean {
  return coincideBytes(buffer, [0x25, 0x50, 0x44, 0x46])
}

function contieneFirmaPdf(buffer: Uint8Array): boolean {
  if (esCabeceraPdf(buffer)) return true
  const limite = Math.min(buffer.length - 4, PDF_SCAN_BYTES)
  for (let i = 0; i <= limite; i++) {
    if (esCabeceraPdf(buffer.subarray(i))) return true
  }
  return false
}

async function leerInicioArchivo(file: File, bytes = 16): Promise<Uint8Array> {
  const fragmento = file.slice(0, bytes)
  const buffer = await fragmento.arrayBuffer()
  return new Uint8Array(buffer)
}

export async function esImagenReal(file: File): Promise<boolean> {
  const cabecera = await leerInicioArchivo(file, 16)
  return esCabeceraImagen(cabecera)
}

export async function esPdfReal(file: File): Promise<boolean> {
  const cabecera = await leerInicioArchivo(file, PDF_SCAN_BYTES)
  return contieneFirmaPdf(cabecera)
}

export async function validarArchivoImagen(
  file: File,
  maxBytes = MAX_IMAGEN_BYTES
): Promise<{ ok: true } | { error: string }> {
  if (file.size > maxBytes) {
    return { error: 'Las imágenes no pueden superar 5 MB.' }
  }

  if (!esImagenPermitida(file)) {
    return { error: `Solo se permiten imágenes (${ETIQUETA_FORMATOS_IMAGEN}).` }
  }

  const cabecera = await leerInicioArchivo(file, 16)

  if (contieneFirmaPdf(cabecera)) {
    return {
      error: 'El archivo no es una imagen válida. No se permiten archivos disfrazados.',
    }
  }

  if (!esCabeceraImagen(cabecera)) {
    return {
      error: `El contenido del archivo no coincide con una imagen real (${ETIQUETA_FORMATOS_IMAGEN}).`,
    }
  }

  return { ok: true }
}

export async function validarArchivoPdf(
  file: File,
  maxBytes: number
): Promise<{ ok: true } | { error: string }> {
  if (file.size > maxBytes) {
    const maxMB = maxBytes / 1024 / 1024
    return { error: `El archivo supera el límite permitido de ${maxMB} MB.` }
  }

  const nombrePdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!nombrePdf) {
    return { error: 'Solo se permiten archivos PDF.' }
  }

  const cabecera = await leerInicioArchivo(file, PDF_SCAN_BYTES)

  if (esCabeceraImagen(cabecera)) {
    return {
      error: 'El archivo no es un PDF válido. No se permiten archivos disfrazados.',
    }
  }

  if (!contieneFirmaPdf(cabecera)) {
    return { error: 'El archivo no es un PDF válido.' }
  }

  return { ok: true }
}

export async function detectarTipoArchivoComentario(
  file: File
): Promise<'imagen' | 'pdf' | null> {
  const cabecera = await leerInicioArchivo(file, PDF_SCAN_BYTES)

  if (contieneFirmaPdf(cabecera) && !esCabeceraImagen(cabecera)) {
    const esPdfPorNombre =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    return esPdfPorNombre ? 'pdf' : null
  }

  if (esCabeceraImagen(cabecera) && esImagenPermitida(file)) {
    return 'imagen'
  }

  return null
}
