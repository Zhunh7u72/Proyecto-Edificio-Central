'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import {
  parsePositiveInt,
  parseCorreo,
  sanitizarTexto,
  assertIdEntero,
} from '@/lib/validar-input'
import type { ComentarioState } from '@/lib/types/comentarios'

async function findOrCreateEstudiante(nombres: string, apellidos: string, correo: string) {
  const { data: existing } = await supabaseAdmin
    .from('usuarios')
    .select('id_usuario')
    .eq('correo', correo)
    .maybeSingle()

  if (existing) return { userId: existing.id_usuario as number }

  const { data: newUser, error } = await supabaseAdmin
    .from('usuarios')
    .insert({ nombres, apellidos, correo, rol: 'Estudiante' })
    .select('id_usuario')
    .single()

  if (error || !newUser) {
    return { error: 'No se pudo registrar al estudiante. Verifica tu correo.' }
  }

  return { userId: newUser.id_usuario as number }
}

export async function publicarComentario(
  _state: ComentarioState,
  formData: FormData
): Promise<ComentarioState> {
  const id_actividad = parsePositiveInt(formData.get('id_actividad'))
  const nombres = sanitizarTexto(formData.get('nombres'), 100)
  const apellidos = sanitizarTexto(formData.get('apellidos'), 100)
  const correo = parseCorreo(formData.get('correo'))
  const contenido_texto = sanitizarTexto(formData.get('contenido_texto'), 2000)

  if (!id_actividad) return { error: 'Actividad no válida.' }
  if (!nombres || !apellidos || !correo) {
    return { error: 'Nombre, apellidos y correo válidos son obligatorios.' }
  }
  if (!contenido_texto) return { error: 'Escribe un comentario antes de publicar.' }

  const { data: actividad } = await supabaseAdmin
    .from('actividades')
    .select('id_actividad')
    .eq('id_actividad', id_actividad)
    .single()

  if (!actividad) return { error: 'La publicación no existe.' }

  const estudiante = await findOrCreateEstudiante(nombres, apellidos, correo)
  if ('error' in estudiante && estudiante.error) return { error: estudiante.error }

  const { data: comentario, error: comentarioError } = await supabaseAdmin
    .from('comentarios')
    .insert({
      id_actividad,
      id_usuario: estudiante.userId,
      contenido_texto,
    })
    .select('id_comentario')
    .single()

  if (comentarioError || !comentario) {
    console.error('[comentario] publicar:', comentarioError)
    return { error: 'No se pudo publicar el comentario. Intenta nuevamente.' }
  }

  revalidatePath(`/eventos/${id_actividad}`)
  return { success: 'Comentario publicado correctamente.' }
}

export async function eliminarComentario(id_comentario: number): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id_comentario)
    if (!safeId) return { error: 'ID de comentario inválido.' }

    const { data: comentario } = await supabaseAdmin
      .from('comentarios')
      .select('id_comentario')
      .eq('id_comentario', safeId)
      .maybeSingle()

    if (!comentario) return { error: 'Comentario no encontrado.' }

    await supabaseAdmin.from('archivos_interaccion').delete().eq('id_comentario', safeId)

    const { error } = await supabaseAdmin
      .from('comentarios')
      .delete()
      .eq('id_comentario', safeId)

    if (error) {
      return { error: 'Error al eliminar el comentario: ' + error.message }
    }

    revalidatePath('/admin')
    return {}
  } catch {
    return { error: 'No autorizado.' }
  }
}
