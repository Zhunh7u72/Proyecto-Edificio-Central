'use server'

import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import { TIPO_ARCHIVO_PDF } from '@/lib/actividad-archivos'
import { saveLocalFile, deleteLocalFile } from '@/lib/storage'
import { assertIdEntero, parsePositiveInt } from '@/lib/validar-input'
import type { ActionState } from '@/lib/types/admin'

function revalidate() {
  revalidatePath('/admin/documentos')
  revalidatePath('/admin/dashboard')
}

export async function crearDocumento(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id_actividad = parsePositiveInt(formData.get('id_actividad'))

    if (!id_actividad) return { error: 'Selecciona una actividad.' }

    const archivo = formData.get('archivo_pdf') as File | null
    if (!archivo || archivo.size === 0) {
      return { error: 'El archivo PDF es obligatorio.' }
    }
    if (archivo.type !== 'application/pdf' && !archivo.name.toLowerCase().endsWith('.pdf')) {
      return { error: 'El archivo debe ser un documento PDF.' }
    }

    const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`
    const storagePath = `pdf/${safeName}`

    let localRuta = ''
    try {
      localRuta = await saveLocalFile(archivo, storagePath)
    } catch (uploadError: any) {
      return { error: 'Error al subir el archivo: ' + uploadError.message }
    }

    try {
      await query(
        'INSERT INTO archivos_actividades (id_actividad, ruta_archivo, tipo_archivo) VALUES ($1, $2, $3)',
        [id_actividad, localRuta, TIPO_ARCHIVO_PDF]
      )
    } catch (error: any) {
      return { error: 'Error al crear: ' + error.message }
    }
    revalidate()
    return { success: 'Documento PDF subido exitosamente.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function actualizarDocumento(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id = parsePositiveInt(formData.get('id_archivo_activi'))
    const id_actividad = parsePositiveInt(formData.get('id_actividad'))

    if (!id) return { error: 'ID de documento inválido.' }
    if (!id_actividad) return { error: 'Selecciona una actividad.' }

    const archivo = formData.get('archivo_pdf') as File | null
    let nuevaRuta: string | undefined = undefined

    if (archivo && archivo.size > 0) {
      if (archivo.type !== 'application/pdf' && !archivo.name.toLowerCase().endsWith('.pdf')) {
        return { error: 'El archivo debe ser un documento PDF.' }
      }
      const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`
      const storagePath = `pdf/${safeName}`
      try {
        nuevaRuta = await saveLocalFile(archivo, storagePath)
        
        // Remove old file physically
        const oldFileRes = await query('SELECT ruta_archivo FROM archivos_actividades WHERE id_archivo_activi = $1', [id])
        if (oldFileRes.rows.length > 0 && oldFileRes.rows[0].ruta_archivo) {
          const oldRelativePath = oldFileRes.rows[0].ruta_archivo.replace('/uploads/', '')
          await deleteLocalFile(oldRelativePath)
        }
      } catch (uploadError: any) {
        return { error: 'Error al subir el archivo: ' + uploadError.message }
      }
    }

    try {
      if (nuevaRuta) {
        await query(
          'UPDATE archivos_actividades SET id_actividad = $1, ruta_archivo = $2, tipo_archivo = $3 WHERE id_archivo_activi = $4',
          [id_actividad, nuevaRuta, TIPO_ARCHIVO_PDF, id]
        )
      } else {
        await query(
          'UPDATE archivos_actividades SET id_actividad = $1, tipo_archivo = $2 WHERE id_archivo_activi = $3',
          [id_actividad, TIPO_ARCHIVO_PDF, id]
        )
      }
    } catch (error: any) {
      return { error: 'Error al actualizar: ' + error.message }
    }
    revalidate()
    return { success: 'Documento actualizado exitosamente.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarDocumento(id: number): Promise<ActionState> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID de documento inválido.' }

    try {
      const res = await query('SELECT ruta_archivo FROM archivos_actividades WHERE id_archivo_activi = $1', [safeId])
      if (res.rows.length > 0 && res.rows[0].ruta_archivo) {
        const relativePath = res.rows[0].ruta_archivo.replace('/uploads/', '')
        await deleteLocalFile(relativePath)
      }
      await query('DELETE FROM archivos_actividades WHERE id_archivo_activi = $1', [safeId])
    } catch (error: any) {
      return { error: 'Error al eliminar: ' + error.message }
    }
    revalidate()
    return { success: 'Documento eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarDocumentoArchivo(id: number): Promise<ActionState> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID de documento inválido.' }

    try {
      const res = await query('SELECT ruta_archivo FROM archivos_actividades WHERE id_archivo_activi = $1', [safeId])
      if (res.rows.length > 0 && res.rows[0].ruta_archivo) {
        const relativePath = res.rows[0].ruta_archivo.replace('/uploads/', '')
        await deleteLocalFile(relativePath)
        await query('UPDATE archivos_actividades SET ruta_archivo = NULL WHERE id_archivo_activi = $1', [safeId])
      }
    } catch (error: any) {
      return { error: 'Error al eliminar archivo: ' + error.message }
    }
    revalidate()
    return { success: 'Archivo PDF eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
