'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-admin'
import { TIPO_ARCHIVO_FOTO } from '@/lib/archivo-constants'
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
  const id_actividad = parseInt(formData.get('id_actividad') as string)
  const resumen = (formData.get('resumen') as string)?.trim()

  if (!id_actividad) return { error: 'Actividad inválida.' }

  const fotosFiles = formData.getAll('fotos_archivos') as File[]
  const validFiles = fotosFiles.filter((f) => f.size > 0)

  if (!resumen) {
    return { error: 'Debes escribir el resumen del evento antes de guardar la memoria.' }
  }

  if (validFiles.length === 0) {
    return { error: 'Debes seleccionar al menos una fotografía de evidencia.' }
  }

  const { error: descErr } = await supabaseAdmin
    .from('actividades')
    .update({ descripcion: resumen })
    .eq('id_actividad', id_actividad)
  if (descErr) return { error: 'Error al guardar el resumen: ' + descErr.message }

  const urls: string[] = []

  for (const file of validFiles) {
      const extension = file.name.split('.').pop()
      const safeName = `memoria-${id_actividad}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('archivos_publicos')
        .upload(`actividades/${id_actividad}/${safeName}`, file, { contentType: file.type })
        
      if (!uploadError) {
        const { data } = supabaseAdmin.storage.from('archivos_publicos').getPublicUrl(`actividades/${id_actividad}/${safeName}`)
        urls.push(data.publicUrl)
      }
    }

  if (urls.length === 0) {
    return { error: 'No se pudieron subir las fotografías. Verifica el formato e intenta de nuevo.' }
  }

  const inserts = urls.map((url) => ({
    id_actividad,
    ruta_archivo: url,
    tipo_archivo: TIPO_ARCHIVO_FOTO,
  }))

  const { error: fotosErr } = await supabaseAdmin
    .from('archivos_actividades')
    .insert(inserts)

  if (fotosErr) return { error: 'Error al guardar las referencias de fotos: ' + fotosErr.message }

  revalidatePath('/admin/actividades')
  revalidatePath(`/eventos/${id_actividad}`)
  revalidatePath('/historial')

  return { success: '¡Memoria guardada! Las fotos ya aparecen en la página pública del evento.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
