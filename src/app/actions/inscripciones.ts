'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import {
  PDF_INSCRIPCION_MAX_BYTES,
  PDF_INSCRIPCION_TIPOS,
  BUCKET_DOCUMENTOS_INSCRIPCION,
} from '@/lib/config'

export type InscripcionState = {
  error?: string
  success?: string
} | undefined

export async function inscribirEstudiante(
  state: InscripcionState,
  formData: FormData
): Promise<InscripcionState> {
  try {
    const nombres = formData.get('nombres') as string
    const apellidos = formData.get('apellidos') as string
    const correo = formData.get('correo') as string
    const id_actividad = parseInt(formData.get('id_actividad') as string)
    const requiereDocumento = formData.get('requiere_documento') === 'true'
    const archivoPdf = formData.get('pdf_documento') as File | null

    if (!nombres || !apellidos || !correo || !id_actividad) {
      return { error: 'Todos los campos son obligatorios.' }
    }

    // Validación del PDF (lado servidor — nunca confiar solo en el cliente)
    if (requiereDocumento && (!archivoPdf || archivoPdf.size === 0)) {
      return { error: 'Este evento requiere que adjuntes un documento PDF.' }
    }

    if (archivoPdf && archivoPdf.size > 0) {
      if (!PDF_INSCRIPCION_TIPOS.includes(archivoPdf.type)) {
        return { error: 'Solo se permiten archivos PDF.' }
      }
      if (archivoPdf.size > PDF_INSCRIPCION_MAX_BYTES) {
        const maxMB = PDF_INSCRIPCION_MAX_BYTES / 1024 / 1024
        return { error: `El archivo supera el límite permitido de ${maxMB} MB.` }
      }
    }

    // Verificar que la actividad existe y tiene inscripción abierta
    const { data: actividad, error: actError } = await supabaseAdmin
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

    const { data: existingUser } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('correo', correo)
      .single()

    if (existingUser) {
      userId = existingUser.id_usuario
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('usuarios')
        .insert({ nombres, apellidos, correo, rol: 'Estudiante' })
        .select('id_usuario')
        .single()

      if (createError || !newUser) {
        return { error: 'Error al registrar el usuario. El correo podría estar duplicado.' }
      }
      userId = newUser.id_usuario
    }

    // Verificar si ya está inscrito
    const { data: existing } = await supabaseAdmin
      .from('matriculas_eventos')
      .select('id_matricula')
      .eq('id_usuario', userId)
      .eq('id_actividad', id_actividad)
      .single()

    if (existing) {
      return { error: 'Ya te encuentras inscrito en esta actividad.' }
    }

    // Inscribir
    const { error: enrollError } = await supabaseAdmin
      .from('matriculas_eventos')
      .insert({ id_usuario: userId, id_actividad })

    if (enrollError) {
      return { error: 'Error al realizar la inscripción. Intenta nuevamente.' }
    }

    // Subir el PDF si se adjuntó uno
    if (archivoPdf && archivoPdf.size > 0) {
      const extension = archivoPdf.name.split('.').pop() ?? 'pdf'
      const rutaArchivo = `actividad_${id_actividad}/usuario_${userId}_${Date.now()}.${extension}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_DOCUMENTOS_INSCRIPCION)
        .upload(rutaArchivo, archivoPdf, { contentType: 'application/pdf', upsert: false })

      if (uploadError) {
        // La inscripción ya se guardó; solo informamos que el documento falló
        console.error('Error subiendo PDF:', uploadError.message)
        revalidatePath(`/eventos/${id_actividad}`)
        return {
          success:
            '¡Inscripción exitosa! Sin embargo, no se pudo subir el documento adjunto. Contáctanos si lo necesitas.',
        }
      }

      // Registrar el archivo en la tabla Archivos_Actividades
      await supabaseAdmin.from('archivos_actividades').insert({
        id_actividad,
        id_usuario: userId,
        ruta_archivo: rutaArchivo,
        tipo_archivo: 'pdf',
      })
    }

    revalidatePath(`/eventos/${id_actividad}`)
    return { success: '¡Inscripción exitosa! Te has registrado correctamente.' }
  } catch (err) {
    console.error('Error inesperado en inscribirEstudiante:', err)
    return { error: 'Ocurrió un error inesperado al procesar la inscripción.' }
  }
}
