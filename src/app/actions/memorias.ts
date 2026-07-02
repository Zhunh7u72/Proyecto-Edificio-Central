'use server'

import { query } from '@/lib/db'
import { saveLocalFile } from '@/lib/storage'
import { requireAdmin } from '@/lib/auth-admin'
import { TIPO_ARCHIVO_FOTO } from '@/lib/archivo-constants'
import { validarArchivoImagen } from '@/lib/validar-contenido-archivo'
import { parsePositiveInt, sanitizarTexto } from '@/lib/validar-input'
import { revalidatePath } from 'next/cache'

export type MemoriaState = { error?: string; success?: string } | undefined

/**
 * Guarda múltiples fotografías y un texto resumen para una actividad concluida.
 * Las fotos se registran en archivos_actividades (tipo = 'Fotografia').
 */
export async function guardarMemoriaActividad(
  state: MemoriaState,
  formData: FormData
): Promise<MemoriaState> {
  try {
    await requireAdmin()
    const id_actividad = parsePositiveInt(formData.get('id_actividad'))
    const resumen = sanitizarTexto(formData.get('resumen'), 5000)

    if (!id_actividad) return { error: 'Actividad inválida.' }

    const fotosFiles = formData.getAll('fotos_archivos') as File[]
    const validFiles = fotosFiles.filter((f) => f.size > 0)

    if (!resumen) {
      return { error: 'Debes escribir el resumen del evento antes de guardar la memoria.' }
    }

    if (validFiles.length === 0) {
      return { error: 'Debes seleccionar al menos una fotografía de evidencia.' }
    }

    try {
      await query('UPDATE actividades SET descripcion = $1 WHERE id_actividad = $2', [resumen, id_actividad])
    } catch (descErr: any) {
      return { error: 'Error al guardar el resumen: ' + descErr.message }
    }

    const urls: string[] = []

    for (const file of validFiles) {
      const validacion = await validarArchivoImagen(file)
      if ('error' in validacion) {
        return { error: validacion.error }
      }

      const extension = file.name.split('.').pop()?.toLowerCase()
      const safeName = `memoria-${id_actividad}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

      try {
        const localRuta = await saveLocalFile(file, `imagenes/${safeName}`)
        urls.push(localRuta)
      } catch (uploadError) {
        console.error('Error uploading', uploadError)
      }
    }

    if (urls.length === 0) {
      return { error: 'No se pudieron subir las fotografías. Verifica el formato e intenta de nuevo.' }
    }

    try {
      for (const url of urls) {
        await query(
          'INSERT INTO archivos_actividades (id_actividad, ruta_archivo, tipo_archivo) VALUES ($1, $2, $3)',
          [id_actividad, url, TIPO_ARCHIVO_FOTO]
        )
      }
    } catch (fotosErr: any) {
      return { error: 'Error al guardar las referencias de fotos: ' + fotosErr.message }
    }

    revalidatePath('/admin/actividades')
    revalidatePath(`/eventos/${id_actividad}`)
    revalidatePath('/historial')

    return { success: '¡Memoria guardada! Las fotos ya aparecen en la página pública del evento.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
