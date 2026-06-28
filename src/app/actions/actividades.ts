'use server'

import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export type ActividadState = {
  error?: string
  success?: string
} | undefined

export async function crearActividad(
  state: ActividadState,
  formData: FormData
): Promise<ActividadState> {
  const session = await getSession()
  if (!session) return { error: 'No autorizado.' }

  const titulo = formData.get('titulo') as string
  const descripcion = formData.get('descripcion') as string
  const tipo = formData.get('tipo') as string
  const fecha_limite = formData.get('fecha_limite_inscripcion') as string

  if (!titulo || !tipo) {
    return { error: 'El título y tipo son obligatorios.' }
  }

  const { error } = await supabase
    .from('actividades')
    .insert({
      id_usuario: session.userId,
      titulo,
      descripcion: descripcion || null,
      tipo,
      fecha_limite_inscripcion: fecha_limite || null,
    })

  if (error) {
    return { error: 'Error al crear la actividad: ' + error.message }
  }

  revalidatePath('/admin/actividades')
  revalidatePath('/')

  return { success: 'Actividad creada exitosamente.' }
}

export async function eliminarActividad(id: number): Promise<ActividadState> {
  const session = await getSession()
  if (!session) return { error: 'No autorizado.' }

  const { error } = await supabase
    .from('actividades')
    .delete()
    .eq('id_actividad', id)

  if (error) {
    return { error: 'Error al eliminar: ' + error.message }
  }

  revalidatePath('/admin/actividades')
  revalidatePath('/')

  return { success: 'Actividad eliminada.' }
}
