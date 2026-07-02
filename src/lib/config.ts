// Configuración central de parámetros del negocio.
// Edita aquí para cambiar límites sin tocar el código de la aplicación.

/** Tamaño máximo permitido para archivos PDF de inscripción (en bytes). */
export const PDF_INSCRIPCION_MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/** Extensiones y tipos MIME permitidos para archivos de inscripción. */
export const PDF_INSCRIPCION_TIPOS = ['application/pdf']

/** Nombre de la carpeta local donde se guardan los PDFs de inscripción. */
export const BUCKET_DOCUMENTOS_INSCRIPCION = 'pdf'
