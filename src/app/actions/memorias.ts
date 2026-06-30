'use server'

import { supabaseAdmin } from '@/lib/supabase'
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
  const id_actividad = parseInt(formData.get('id_actividad') as string)
  const resumen = (formData.get('resumen') as string)?.trim()
  const fotosStr = (formData.get('fotos_urls') as string)?.trim()

  if (!id_actividad) return { error: 'Actividad inválida.' }

  // Guardar el resumen actualizando la descripción (o puedes crear un campo separado)
  if (resumen) {
    const { error: descErr } = await supabaseAdmin
      .from('actividades')
      .update({ descripcion: resumen })
      .eq('id_actividad', id_actividad)
    if (descErr) return { error: 'Error al guardar el resumen: ' + descErr.message }
  }

  // Parsear y guardar las URLs de las fotos
  if (fotosStr) {
    const urls = fotosStr
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0)

    if (urls.length > 0) {
      const inserts = urls.map((url) => ({
        id_actividad,
        ruta_archivo: url,
        tipo_archivo: 'foto',
      }))

      const { error: fotosErr } = await supabaseAdmin
        .from('archivos_actividades')
        .insert(inserts)

      if (fotosErr) return { error: 'Error al guardar las fotos: ' + fotosErr.message }
    }
  }

  revalidatePath('/admin/actividades')
  revalidatePath(`/eventos/${id_actividad}`)
  revalidatePath('/historial')

  return { success: '¡Memoria guardada! Las fotos ya aparecen en la página pública del evento.' }
}
