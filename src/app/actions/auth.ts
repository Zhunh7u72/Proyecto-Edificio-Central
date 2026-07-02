'use server'

import { query } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { parseCorreo, sanitizarTexto } from '@/lib/validar-input'

export type LoginState = {
  error?: string
} | undefined

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const correo = sanitizarTexto(formData.get('correo'), 254)?.toLowerCase()
  const password = sanitizarTexto(formData.get('password'), 128)

  if (!correo || !password) {
    return { error: 'Correo y contraseña son obligatorios.' }
  }

  let usuario = null
  try {
    const res = await query(
      'SELECT id_usuario, rol, password_hash FROM usuarios WHERE correo = $1 AND rol = $2',
      [correo, 'Administrador FEUE']
    )
    if (res.rows.length === 0) {
      return { error: 'Credenciales inválidas o usuario no autorizado.' }
    }
    usuario = res.rows[0]
  } catch (error) {
    return { error: 'Error al conectar con la base de datos.' }
  }

  if (!usuario.password_hash) {
    return { error: 'Este usuario no tiene contraseña configurada.' }
  }

  const valid = await bcrypt.compare(password, usuario.password_hash)
  if (!valid) {
    return { error: 'Contraseña incorrecta.' }
  }

  await createSession(usuario.id_usuario, usuario.rol)

  redirect('/admin/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}

export async function crearAdminPrueba() {
  const hash = await bcrypt.hash('admin123', 10)
  try {
    await query(
      `INSERT INTO usuarios (nombres, apellidos, correo, password_hash, rol) 
       VALUES ('Admin', 'Prueba', 'admin', $1, 'Administrador FEUE')
       ON CONFLICT (correo) DO UPDATE SET password_hash = $1`,
      [hash]
    )
  } catch (e) {
    console.error('Error creando admin de prueba:', e)
  }
}
