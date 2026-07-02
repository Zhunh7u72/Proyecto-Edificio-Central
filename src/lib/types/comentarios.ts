export interface ArchivoInteraccion {
  id_archivo_inter: number
  ruta_archivo: string
  tipo_archivo: string
}

export interface ComentarioPublico {
  id_comentario: number
  contenido_texto: string
  fecha_comentario: string
  usuarios: { nombres: string; apellidos: string } | null
  archivos_interaccion: ArchivoInteraccion[] | null
}

export type ComentarioState = {
  error?: string
  success?: string
} | undefined
