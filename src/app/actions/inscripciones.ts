'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export type InscripcionState = {
  error?: string
  success?: string
} | undefined

export async function inscribirEstudiante(
  state: InscripcionState,
  formData: FormData
): Promise<InscripcionState> {
  const nombres = formData.get('nombres') as string
  const apellidos = formData.get('apellidos') as string
  const correo = formData.get('correo') as string
  const id_actividad = parseInt(formData.get('id_actividad') as string)

  if (!nombres || !apellidos || !correo || !id_actividad) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  // Verificar que la actividad existe y tiene inscripción abierta
  const { data: actividad, error: actError } = await supabase
    .from('actividades')
    .select('*')
    .eq('id_actividad', id_actividad)
    .single()

  if (actError || !actividad) {
    return { error: 'La actividad no existe.' }
  }

  if (actividad.fecha_limite_inscripcion) {
    const deadline = new Date(actividad.fecha_limite_inscripcion)
    if (new Date() > deadline) {
      return { error: 'El plazo de inscripción ha finalizado.' }
    }
  }

  // Buscar o crear usuario estudiante
  let userId: number

  const { data: existingUser } = await supabase
    .from('usuarios')
    .select('id_usuario')
    .eq('correo', correo)
    .single()

  if (existingUser) {
    userId = existingUser.id_usuario
  } else {
    const { data: newUser, error: createError } = await supabase
      .from('usuarios')
      .insert({
        nombres,
        apellidos,
        correo,
        rol: 'Estudiante',
      })
      .select('id_usuario')
      .single()

    if (createError || !newUser) {
      return { error: 'Error al registrar el usuario. El correo podría estar duplicado.' }
    }
    userId = newUser.id_usuario
  }

  // Verificar si ya está inscrito
  const { data: existing } = await supabase
    .from('matriculas_eventos')
    .select('id_matricula')
    .eq('id_usuario', userId)
    .eq('id_actividad', id_actividad)
    .single()

  if (existing) {
    return { error: 'Ya te encuentras inscrito en esta actividad.' }
  }

  // Inscribir
  const { error: enrollError } = await supabase
    .from('matriculas_eventos')
    .insert({
      id_usuario: userId,
      id_actividad: id_actividad,
    })

  if (enrollError) {
    return { error: 'Error al realizar la inscripción. Intenta nuevamente.' }
  }

  revalidatePath(`/eventos/${id_actividad}`)

  return { success: '¡Inscripción exitosa! Te has registrado correctamente.' }
}
