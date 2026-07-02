'use server'

import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import { deleteLocalFile } from '@/lib/storage'
import {
  parsePositiveInt,
  parseCorreo,
  sanitizarTexto,
  assertIdEntero,
} from '@/lib/validar-input'
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

  revalidatePath(`/eventos/${id_actividad}`)
  return { success: 'Comentario publicado correctamente.' }
}

export async function eliminarComentario(id_comentario: number): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id_comentario)
    if (!safeId) return { error: 'ID de comentario inválido.' }

    const res = await query('SELECT ruta_archivo FROM archivos_interaccion WHERE id_comentario = $1', [safeId])
    for (const f of res.rows) {
      if (f.ruta_archivo) await deleteLocalFile(f.ruta_archivo.replace('/uploads/', ''))
    }
    await query('DELETE FROM archivos_interaccion WHERE id_comentario = $1', [safeId])
    try {
      await query('DELETE FROM comentarios WHERE id_comentario = $1', [safeId])
    } catch (error: any) {
      return { error: 'Error al eliminar el comentario: ' + error.message }
    }

    revalidatePath('/admin')
    return {}
  } catch {
    return { error: 'No autorizado.' }
  }
}
