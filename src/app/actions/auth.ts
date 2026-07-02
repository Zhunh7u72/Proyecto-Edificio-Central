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
  const correo = parseCorreo(formData.get('correo'))
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

export async function actualizarAdminPrueba(formData: FormData) {
  const rawEmail = formData.get('new_email')?.toString();
  const newEmail = rawEmail ? rawEmail.trim().toLowerCase() : null;
  const newPassword = formData.get('new_password')?.toString();

  if (!newEmail || !newPassword) return;

  const hash = await bcrypt.hash(newPassword, 10)
  try {
    await query(
      `INSERT INTO usuarios (nombres, apellidos, correo, password_hash, rol) 
       VALUES ('Administrador', 'FEUE', $1, $2, 'Administrador FEUE')
       ON CONFLICT (correo) DO UPDATE SET password_hash = $2`,
      [newEmail, hash]
    )
  } catch (e) {
    console.error('Error actualizando admin de prueba:', e)
  }
}
