export interface Actividad {
  id_actividad: number
  id_usuario: number
  titulo: string
  descripcion: string | null
  tipo: string
  fecha_publicacion: string
  fecha_fin: string | null
  url_imagen?: string | null
  url_video?: string | null
  visible?: boolean
  /** Alias de formulario / UI */
  fecha_inicio?: string | null
  video_url?: string | null
  archivos_actividades?: {
    id_archivo_activi: number
    ruta_archivo: string
    tipo_archivo: string
  }[] | null
}

export interface Facultad {
  id_facultad: number
  nombre_facultad: string
}

export interface Carrera {
  id_facultad_carrera: number
  id_facultad: number
  nombre_carrera: string
  facultades?: { nombre_facultad: string } | null
  contactos_carreras?: { contacto: string; tipo_contacto: string }[] | null
}

export interface FotoCarrera {
  id_foto_carre: number
  id_facultad_carrera: number
  ruta_foto: string
  facultades_carreras?: {
    nombre_carrera: string
    facultades?: { nombre_facultad: string } | null
  } | null
}

export interface DocumentoPdf {
  id_archivo_activi: number
  id_actividad: number
  ruta_archivo: string
  tipo_archivo: string
  actividades?: { titulo: string } | null
}

export interface SelectOption {
  value: string
  label: string
}

export type ActionState = {
  error?: string
  success?: string
} | undefined
