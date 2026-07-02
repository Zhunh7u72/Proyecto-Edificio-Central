export type FotoGaleria = {
  id: string
  ruta: string
  titulo: string
  subtitulo?: string
  fuente: 'actividad' | 'carrera'
  id_actividad?: number
}

export type DocumentoPublico = {
  id_archivo_activi: number
  nombre: string
  ruta_archivo: string
  actividad_tipo?: string
}
