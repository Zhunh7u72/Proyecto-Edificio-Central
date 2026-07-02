import 'server-only'
import { getSession } from '@/lib/session'

export const ADMIN_ROL = 'Administrador FEUE'

export async function requireAdmin() {
  const session = await getSession()
  if (!session || session.rol !== ADMIN_ROL) {
    throw new Error('No autorizado.')
  }
  return session
}

export function parsePositiveInt(value: FormDataEntryValue | null): number | null {
  const id = parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(id) || id <= 0) return null
  return id
}
