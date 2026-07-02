/** Validación de entradas antes de consultas a Supabase (defensa en profundidad). */

export const TIPOS_ACTIVIDAD = ['Anuncio', 'Evento', 'Capacitacion'] as const
export type TipoActividad = (typeof TIPOS_ACTIVIDAD)[number]

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/

export function parsePositiveInt(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const raw = String(value).trim()
  if (!/^\d+$/.test(raw)) return null
  const id = Number(raw)
  if (!Number.isSafeInteger(id) || id <= 0) return null
  return id
}

export function parsePositiveIntList(values: unknown[]): number[] {
  const ids: number[] = []
  for (const value of values) {
    const id = parsePositiveInt(value)
    if (id !== null) ids.push(id)
  }
  return ids
}

export function sanitizarTexto(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(CONTROL_CHARS, '').trim()
  if (!cleaned) return null
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned
}

export function esCorreoValido(email: string): boolean {
  if (email.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function parseCorreo(value: unknown): string | null {
  const correo = sanitizarTexto(value, 254)
  if (!correo || !esCorreoValido(correo)) return null
  return correo.toLowerCase()
}

export function esFechaDatetimeLocal(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false
  const d = new Date(value)
  return !Number.isNaN(d.getTime())
}

export function parseFechaDatetimeLocal(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (!esFechaDatetimeLocal(trimmed)) return null
  return new Date(trimmed).toISOString()
}

export function parseTipoActividad(value: unknown): TipoActividad | null {
  if (typeof value !== 'string') return null
  return TIPOS_ACTIVIDAD.includes(value as TipoActividad) ? (value as TipoActividad) : null
}

export function esUrlHttpPermitida(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    return url.length <= 2048
  } catch {
    return false
  }
}

export function parseUrlHttp(value: unknown): string | null {
  const url = sanitizarTexto(value, 2048)
  if (!url || !esUrlHttpPermitida(url)) return null
  return url
}

/** Fecha ISO segura para filtros PostgREST (.or, .lt, etc.). Solo valores generados en servidor. */
export function isoParaFiltroPostgrest(date: Date = new Date()): string {
  const iso = date.toISOString()
  if (!/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(iso)) {
    throw new Error('Fecha ISO inválida para filtro')
  }
  return iso
}

export function assertIdEntero(id: unknown): number | null {
  if (typeof id === 'number') {
    return Number.isSafeInteger(id) && id > 0 ? id : null
  }
  return parsePositiveInt(id)
}
