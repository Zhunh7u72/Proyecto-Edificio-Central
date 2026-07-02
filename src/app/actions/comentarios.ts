'use server'

import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-admin'
import { guardarArchivoComentario } from '@/lib/comentario-archivos'
import { revalidatePath } from 'next/cache'
import type { ComentarioState } from '@/lib/types/comentarios'

async function findOrCreateEstudiante(nombres: string, apellidos: string, correo: string) {
  const existingRes = await query('SELECT id_usuario FROM usuarios WHERE correo = $1', [correo])
  if (existingRes.rows.length > 0) return { userId: existingRes.rows[0].id_usuario as number }

  try {
    const newRes = await query(
      'INSERT INTO usuarios (nombres, apellidos, correo, rol) VALUES ($1, $2, $3, $4) RETURNING id_usuario',
      [nombres, apellidos, correo, 'Estudiante']
    )
    if (newRes.rowCount === 0) throw new Error()
    return { userId: newRes.rows[0].id_usuario as number }
  } catch (error) {
    return { error: 'No se pudo registrar al estudiante. Verifica tu correo.' }
  }
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

  const resAct = await query('SELECT id_actividad FROM actividades WHERE id_actividad = $1', [id_actividad])
  if (resAct.rows.length === 0) return { error: 'La publicación no existe.' }

  const estudiante = await findOrCreateEstudiante(nombres, apellidos, correo)
  if ('error' in estudiante && estudiante.error) return { error: estudiante.error }

  let comentario = null
  try {
    const resCom = await query(
      'INSERT INTO comentarios (id_actividad, id_usuario, contenido_texto) VALUES ($1, $2, $3) RETURNING id_comentario',
      [id_actividad, estudiante.userId, contenido_texto]
    )
    if (resCom.rowCount === 0) throw new Error()
    comentario = resCom.rows[0]
  } catch (comentarioError) {
    console.error('[comentario] publicar:', comentarioError)
    return { error: 'No se pudo publicar el comentario. Intenta nuevamente.' }
  }

  const hasFile = archivo && archivo.size > 0 && archivo.name
  if (hasFile) {
    const saved = await guardarArchivoComentario(archivo, id_actividad)
    if ('error' in saved) {
      await query('DELETE FROM comentarios WHERE id_comentario = $1', [comentario.id_comentario])
      return { error: saved.error }
    }

    try {
      await query(
        'INSERT INTO archivos_interaccion (id_comentario, ruta_archivo, tipo_archivo) VALUES ($1, $2, $3)',
        [comentario.id_comentario, saved.ruta, saved.tipo]
      )
    } catch (archivoError) {
      await query('DELETE FROM comentarios WHERE id_comentario = $1', [comentario.id_comentario])
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

    const resCom = await query('SELECT id_comentario FROM comentarios WHERE id_comentario = $1', [id_comentario])
    if (resCom.rows.length === 0) return { error: 'Comentario no encontrado.' }

    await query('DELETE FROM archivos_interaccion WHERE id_comentario = $1', [id_comentario])

    try {
      await query('DELETE FROM comentarios WHERE id_comentario = $1', [id_comentario])
    } catch (error: any) {
      return { error: 'Error al eliminar el comentario: ' + error.message }
    }

    revalidatePath('/admin')
    return {}
  } catch {
    return { error: 'No autorizado.' }
  }
}
