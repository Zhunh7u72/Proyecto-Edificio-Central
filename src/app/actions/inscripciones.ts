'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import {
  PDF_INSCRIPCION_MAX_BYTES,
  BUCKET_DOCUMENTOS_INSCRIPCION,
} from '@/lib/config'
import { TIPO_ARCHIVO_PDF } from '@/lib/archivo-constants'
import { validarArchivoPdf } from '@/lib/validar-contenido-archivo'
import {
  parsePositiveInt,
  parseCorreo,
  sanitizarTexto,
} from '@/lib/validar-input'

export type InscripcionState = {
  error?: string
  success?: string
} | undefined

function inscripcionCerrada(actividad: { fecha_fin: string | null }): boolean {
  if (!actividad.fecha_fin) return false
  return new Date() > new Date(actividad.fecha_fin)
}

function logErrorInterno(contexto: string, error: unknown) {
  console.error(`[inscripcion] ${contexto}:`, error)
}

export async function inscribirEstudiante(
  state: InscripcionState,
  formData: FormData
): Promise<InscripcionState> {
  const nombres = sanitizarTexto(formData.get('nombres'), 100)
  const apellidos = sanitizarTexto(formData.get('apellidos'), 100)
  const correo = parseCorreo(formData.get('correo'))
  const id_actividad = parsePositiveInt(formData.get('id_actividad'))
  const requiereDocumento = formData.get('requiere_documento') === 'true'
  const archivoPdf = formData.get('pdf_documento') as File | null

  if (!nombres || !apellidos || !correo || !id_actividad) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  if (requiereDocumento && (!archivoPdf || archivoPdf.size === 0)) {
    return { error: 'Este evento requiere que adjuntes un documento PDF.' }
  }

  if (archivoPdf && archivoPdf.size > 0) {
    const validacion = await validarArchivoPdf(archivoPdf, PDF_INSCRIPCION_MAX_BYTES)
    if ('error' in validacion) {
      return { error: validacion.error }
    }
  }

  const { data: actividad, error: actError } = await supabaseAdmin
    .from('actividades')
    .select('id_actividad, visible, fecha_fin, tipo')
    .eq('id_actividad', id_actividad)
    .single()

  if (actError || !actividad) {
    return { error: 'La actividad no existe.' }
  }

  if (actividad.visible === false) {
    return { error: 'Esta actividad no está disponible para inscripción.' }
  }

  if (inscripcionCerrada(actividad)) {
    return { error: 'El plazo de inscripción ha finalizado.' }
  }

  let userId: number

  const { data: existingUser } = await supabaseAdmin
    .from('usuarios')
    .select('id_usuario')
    .eq('correo', correo)
    .maybeSingle()

  if (existingUser) {
    userId = existingUser.id_usuario
  } else {
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('usuarios')
      .insert({ nombres, apellidos, correo, rol: 'Estudiante' })
      .select('id_usuario')
      .single()

    if (createError || !newUser) {
      logErrorInterno('crear usuario', createError)
      return { error: 'No pudimos registrar tus datos. Verifica tu correo e intenta de nuevo.' }
    }
    userId = newUser.id_usuario
  }

  const { data: existing } = await supabaseAdmin
    .from('matriculas_eventos')
    .select('id_matricula')
    .eq('id_usuario', userId)
    .eq('id_actividad', id_actividad)
    .maybeSingle()

  if (existing) {
    return { error: 'Ya te encuentras inscrito en esta actividad.' }
  }

  const { error: enrollError } = await supabaseAdmin
    .from('matriculas_eventos')
    .insert({ id_usuario: userId, id_actividad })

  if (enrollError) {
    logErrorInterno('matrícula', enrollError)
    return { error: 'No se pudo completar la inscripción. Intenta nuevamente en unos minutos.' }
  }

  if (archivoPdf && archivoPdf.size > 0) {
    const extension = archivoPdf.name.split('.').pop() ?? 'pdf'
    const rutaArchivo = `actividad_${id_actividad}/usuario_${userId}_${Date.now()}.${extension}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_DOCUMENTOS_INSCRIPCION)
      .upload(rutaArchivo, archivoPdf, { contentType: 'application/pdf', upsert: false })

    if (uploadError) {
      logErrorInterno('subir PDF', uploadError)
      await supabaseAdmin
        .from('matriculas_eventos')
        .delete()
        .eq('id_usuario', userId)
        .eq('id_actividad', id_actividad)

      return {
        error:
          'No se pudo subir el documento. La inscripción fue cancelada. Verifica que sea un PDF válido e intenta de nuevo.',
      }
    }

    const { error: archivoError } = await supabaseAdmin.from('archivos_actividades').insert({
      id_actividad,
      id_usuario: userId,
      ruta_archivo: rutaArchivo,
      tipo_archivo: TIPO_ARCHIVO_PDF,
    })

    if (archivoError) {
      logErrorInterno('registrar PDF en BD', archivoError)
      await supabaseAdmin.storage.from(BUCKET_DOCUMENTOS_INSCRIPCION).remove([rutaArchivo])
      await supabaseAdmin
        .from('matriculas_eventos')
        .delete()
        .eq('id_usuario', userId)
        .eq('id_actividad', id_actividad)

      return {
        error:
          'No se pudo completar la inscripción con el documento adjunto. Intenta nuevamente o contacta a la FEUE.',
      }
    }
  }

  revalidatePath(`/eventos/${id_actividad}`)
  revalidatePath('/admin/inscripciones')
  return { success: '¡Inscripción exitosa! Te has registrado correctamente.' }
}
