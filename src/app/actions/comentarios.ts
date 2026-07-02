'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-admin'
import { guardarArchivoComentario } from '@/lib/comentario-archivos'
import { revalidatePath } from 'next/cache'
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
  const id_actividad = parseInt(formData.get('id_actividad') as string)
  const nombres = (formData.get('nombres') as string)?.trim()
  const apellidos = (formData.get('apellidos') as string)?.trim()
  const correo = (formData.get('correo') as string)?.trim()
  const contenido_texto = (formData.get('contenido_texto') as string)?.trim()
  const archivo = formData.get('archivo') as File | null

  if (!id_actividad) return { error: 'Actividad no válida.' }
  if (!nombres || !apellidos || !correo) {
    return { error: 'Nombre, apellidos y correo son obligatorios.' }
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

  const hasFile = archivo && archivo.size > 0 && archivo.name
  if (hasFile) {
    const saved = await guardarArchivoComentario(archivo, id_actividad)
    if ('error' in saved) {
      await supabaseAdmin.from('comentarios').delete().eq('id_comentario', comentario.id_comentario)
      return { error: saved.error }
    }

    const { error: archivoError } = await supabaseAdmin.from('archivos_interaccion').insert({
      id_comentario: comentario.id_comentario,
      ruta_archivo: saved.ruta,
      tipo_archivo: saved.tipo,
    })

    if (archivoError) {
      await supabaseAdmin.from('comentarios').delete().eq('id_comentario', comentario.id_comentario)
      return { error: 'Error al guardar el archivo adjunto.' }
    }
  }

  revalidatePath(`/eventos/${id_actividad}`)
  return { success: 'Comentario publicado correctamente.' }
}

export async function eliminarComentario(id_comentario: number): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    if (!Number.isFinite(id_comentario) || id_comentario <= 0) {
      return { error: 'ID de comentario inválido.' }
    }

    const { data: comentario } = await supabaseAdmin
      .from('comentarios')
      .select('id_comentario')
      .eq('id_comentario', id_comentario)
      .maybeSingle()

    if (!comentario) return { error: 'Comentario no encontrado.' }

    await supabaseAdmin.from('archivos_interaccion').delete().eq('id_comentario', id_comentario)

    const { error } = await supabaseAdmin
      .from('comentarios')
      .delete()
      .eq('id_comentario', id_comentario)

    if (error) {
      return { error: 'Error al eliminar el comentario: ' + error.message }
    }

    revalidatePath('/admin')
    return {}
  } catch {
    return { error: 'No autorizado.' }
  }
}
