'use server'

import { query } from '@/lib/db'
import { requireAdmin, parsePositiveInt } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import { syncImagenActividad, syncVideoActividad, eliminarDependenciasActividad, eliminarArchivoActividadIndividual } from '@/lib/actividad-archivos'
import {
  parseTipoActividad,
  parseFechaDatetimeLocal,
  sanitizarTexto,
  assertIdEntero,
} from '@/lib/validar-input'
import type { ActionState } from '@/lib/types/admin'

function buildActividadPayload(formData: FormData, tipo: string) {
  const titulo = sanitizarTexto(formData.get('titulo'), 200)
  const descripcion = sanitizarTexto(formData.get('descripcion'), 5000)
  const fecha_inicio = parseFechaDatetimeLocal(formData.get('fecha_inicio'))
  const fecha_fin = parseFechaDatetimeLocal(formData.get('fecha_fin'))

  if (!titulo) return { error: 'El título es obligatorio.' as const, payload: null }

  const payload: Record<string, unknown> = {
    titulo,
    descripcion,
    tipo,
    fecha_inicio,
    fecha_fin,
    video_url: sanitizarTexto(formData.get('video_url'), 500) || null,
  }

  return { error: null, payload }
}

function revalidateActividadPaths() {
  revalidatePath('/admin/anuncios')
  revalidatePath('/admin/eventos')
  revalidatePath('/admin/capacitaciones')
  revalidatePath('/admin/talleres')
  revalidatePath('/admin/actividades')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/inscripciones')
  revalidatePath('/')
}

export async function crearActividad(
  state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireAdmin()
    const tipo = parseTipoActividad(formData.get('tipo'))
    if (!tipo) return { error: 'Tipo de actividad inválido.' }

    const { error, payload } = buildActividadPayload(formData, tipo)
    if (error || !payload) return { error: error ?? 'Datos inválidos.' }

    let inserted = null
    try {
      const res = await query(
        `INSERT INTO actividades (titulo, descripcion, tipo, fecha_inicio, fecha_fin, video_url, id_usuario) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_actividad`,
        [payload.titulo, payload.descripcion, payload.tipo, payload.fecha_inicio, payload.fecha_fin, payload.video_url, session.userId]
      )
      if (res.rowCount === 0) throw new Error('sin respuesta')
      inserted = res.rows[0]
    } catch (dbError: any) {
      return { error: 'Error al crear: ' + (dbError?.message ?? 'sin respuesta') }
    }

    const imageResult = await syncImagenActividad(inserted.id_actividad, formData)
    if (imageResult.error) return { error: imageResult.error }

    const videoResult = await syncVideoActividad(inserted.id_actividad, formData)
    if (videoResult.error) return { error: videoResult.error }

    revalidateActividadPaths()
    return { success: `${tipo} creado exitosamente.` }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function actualizarActividad(
  state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id = parsePositiveInt(formData.get('id_actividad'))
    if (!id) return { error: 'ID de actividad inválido.' }

    const tipo = parseTipoActividad(formData.get('tipo'))
    if (!tipo) return { error: 'Tipo de actividad inválido.' }

    const { error, payload } = buildActividadPayload(formData, tipo)
    if (error || !payload) return { error: error ?? 'Datos inválidos.' }

    try {
      await query(
        `UPDATE actividades SET titulo = $1, descripcion = $2, tipo = $3, fecha_inicio = $4, fecha_fin = $5, video_url = $6 WHERE id_actividad = $7`,
        [payload.titulo, payload.descripcion, payload.tipo, payload.fecha_inicio, payload.fecha_fin, payload.video_url, id]
      )
    } catch (dbError: any) {
      return { error: 'Error al actualizar: ' + dbError.message }
    }

    const imageResult = await syncImagenActividad(id, formData)
    if (imageResult.error) return { error: imageResult.error }

    const videoResult = await syncVideoActividad(id, formData)
    if (videoResult.error) return { error: videoResult.error }

    revalidateActividadPaths()
    return { success: `${tipo} actualizado exitosamente.` }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarActividad(id: number): Promise<ActionState> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID de actividad inválido.' }

    await eliminarDependenciasActividad(safeId)

    try {
      await query('DELETE FROM actividades WHERE id_actividad = $1', [safeId])
    } catch (dbError: any) {
      return { error: 'Error al eliminar: ' + dbError.message }
    }

    revalidateActividadPaths()
    return { success: 'Registro eliminado.' }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido.'
    if (message === 'No autorizado.') return { error: 'No autorizado.' }
    return { error: 'Error al eliminar: ' + message }
  }
}

export async function toggleVisibilidadActividad(id: number, visible: boolean): Promise<ActionState> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID de actividad inválido.' }

    try {
      await query('UPDATE actividades SET visible = $1 WHERE id_actividad = $2', [Boolean(visible), safeId])
    } catch (error: any) {
      return { error: 'Error al cambiar visibilidad: ' + error.message }
    }

    revalidateActividadPaths()
    return { success: visible ? 'Actividad visible al público.' : 'Actividad oculta del público.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function actualizarInfoActividad(
  id: number,
  data: { titulo?: string; descripcion?: string; fecha_inicio?: string; fecha_fin?: string }
): Promise<ActionState> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID de actividad inválido.' }

    const payload: Record<string, unknown> = {}
    if (data.titulo !== undefined) {
      const titulo = sanitizarTexto(data.titulo, 200)
      if (!titulo) return { error: 'El título no puede estar vacío.' }
      payload.titulo = titulo
    }
    if (data.descripcion !== undefined) {
      payload.descripcion = sanitizarTexto(data.descripcion, 5000)
    }
    if (data.fecha_inicio !== undefined) {
      payload.fecha_inicio = data.fecha_inicio ? parseFechaDatetimeLocal(data.fecha_inicio) : null
      if (data.fecha_inicio && payload.fecha_inicio === null) {
        return { error: 'Fecha de inicio inválida.' }
      }
    }
    if (data.fecha_fin !== undefined) {
      payload.fecha_fin = data.fecha_fin ? parseFechaDatetimeLocal(data.fecha_fin) : null
      if (data.fecha_fin && payload.fecha_fin === null) {
        return { error: 'Fecha de fin inválida.' }
      }
    }

    const keys = Object.keys(payload)
    if (keys.length === 0) return { success: 'Información actualizada.' }
    
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ')
    const values = keys.map(k => payload[k])
    values.push(safeId)

    try {
      await query(`UPDATE actividades SET ${setClause} WHERE id_actividad = $${keys.length + 1}`, values)
    } catch (error: any) {
      return { error: 'Error al actualizar: ' + error.message }
    }

    revalidateActividadPaths()
    return { success: 'Información actualizada.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarArchivoActividadAction(id: number): Promise<ActionState> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID de archivo inválido.' }

    const res = await eliminarArchivoActividadIndividual(safeId)
    if (res.error) return { error: res.error }
    
    revalidateActividadPaths()
    return { success: res.success || 'Archivo eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
