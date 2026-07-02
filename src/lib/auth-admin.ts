import 'server-only'
import { getSession } from '@/lib/session'
import { parsePositiveInt as parsePositiveIntBase } from '@/lib/validar-input'

export const ADMIN_ROL = 'Administrador FEUE'

export const parsePositiveInt = parsePositiveIntBase

export async function requireAdmin() {
  const session = await getSession()
  if (!session || session.rol !== ADMIN_ROL) {
    throw new Error('No autorizado.')
  }
  return session
}
