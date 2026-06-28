'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export type LoginState = {
  error?: string
} | undefined

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const correo = formData.get('correo') as string
  const password = formData.get('password') as string

  if (!correo || !password) {
    return { error: 'Correo y contraseña son obligatorios.' }
  }

  // Buscar usuario con rol Administrador FEUE
  const { data: usuario, error } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('correo', correo)
    .eq('rol', 'Administrador FEUE')
    .single()

  if (error || !usuario) {
    return { error: 'Credenciales inválidas o usuario no autorizado.' }
  }

  if (!usuario.password_hash) {
    return { error: 'Este usuario no tiene contraseña configurada.' }
  }

  // Comparar contraseña
  const valid = await bcrypt.compare(password, usuario.password_hash)
  if (!valid) {
    return { error: 'Contraseña incorrecta.' }
  }

  // Crear sesión
  await createSession(usuario.id_usuario, usuario.rol)

  redirect('/admin/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
