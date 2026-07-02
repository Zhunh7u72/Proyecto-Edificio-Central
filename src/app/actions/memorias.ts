'use server'

import { query } from '@/lib/db'
import { saveLocalFile } from '@/lib/storage'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'

export type MemoriaState = { error?: string; success?: string } | undefined

/**
 * Guarda múltiples fotografías y un texto resumen para una actividad concluida.
 * Las fotos se registran en archivos_actividades (tipo = 'foto').
 */
export async function guardarMemoriaActividad(
  state: MemoriaState,
  formData: FormData
): Promise<MemoriaState> {
  try {
    await requireAdmin()
  const id_actividad = parseInt(formData.get('id_actividad') as string)
  const resumen = (formData.get('resumen') as string)?.trim()

  if (!id_actividad) return { error: 'Actividad inválida.' }

  if (resumen) {
    try {
      await query('UPDATE actividades SET descripcion = $1 WHERE id_actividad = $2', [resumen, id_actividad])
    } catch (descErr: any) {
      return { error: 'Error al guardar el resumen: ' + descErr.message }
    }
  }

  // Procesar archivos subidos
  const fotosFiles = formData.getAll('fotos_archivos') as File[]
  const validFiles = fotosFiles.filter(f => f.size > 0)
  
  if (validFiles.length > 0) {
    const urls: string[] = []
    
    for (const file of validFiles) {
      const extension = file.name.split('.').pop()
      const safeName = `memoria-${id_actividad}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
      
      try {
        const localRuta = await saveLocalFile(file, `actividades/${id_actividad}/${safeName}`)
        urls.push(localRuta)
      } catch (uploadError) {
        console.error('Error uploading', uploadError)
      }
    }

    if (urls.length > 0) {
      for (const url of urls) {
        try {
          await query(
            'INSERT INTO archivos_actividades (id_actividad, ruta_archivo, tipo_archivo) VALUES ($1, $2, $3)',
            [id_actividad, url, 'foto']
          )
        } catch (fotosErr: any) {
          return { error: 'Error al guardar las referencias de fotos: ' + fotosErr.message }
        }
      }
    }
  }

  revalidatePath('/admin/actividades')
  revalidatePath(`/eventos/${id_actividad}`)
  revalidatePath('/historial')

  return { success: '¡Memoria guardada! Las fotos ya aparecen en la página pública del evento.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
