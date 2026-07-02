'use server'

import { supabaseAdmin } from '@/lib/supabase'
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

  const { data: usuario, error } = await supabaseAdmin
    .from('usuarios')
    .select('id_usuario, rol, password_hash')
    .eq('correo', correo)
    .eq('rol', 'Administrador FEUE')
    .single()

  if (error || !usuario) {
    return { error: 'Credenciales inválidas o usuario no autorizado.' }
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
