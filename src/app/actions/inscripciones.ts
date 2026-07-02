'use server'

import { query } from '@/lib/db'
import { saveLocalFile, deleteLocalFile } from '@/lib/storage'
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

  let actividad = null
  try {
    const resAct = await query('SELECT id_actividad, visible, fecha_fin, tipo FROM actividades WHERE id_actividad = $1', [id_actividad])
    if (resAct.rows.length === 0) throw new Error()
    actividad = resAct.rows[0]
  } catch (actError) {
    return { error: 'La actividad no existe.' }
  }

  if (actividad.visible === false) {
    return { error: 'Esta actividad no está disponible para inscripción.' }
  }

  if (inscripcionCerrada(actividad)) {
    return { error: 'El plazo de inscripción ha finalizado.' }
  }

  let userId: number

  const existingRes = await query('SELECT id_usuario FROM usuarios WHERE correo = $1', [correo])
  const existingUser = existingRes.rows.length > 0 ? existingRes.rows[0] : null

  if (existingUser) {
    userId = existingUser.id_usuario
  } else {
    try {
      const newRes = await query(
        'INSERT INTO usuarios (nombres, apellidos, correo, rol) VALUES ($1, $2, $3, $4) RETURNING id_usuario',
        [nombres, apellidos, correo, 'Estudiante']
      )
      if (newRes.rowCount === 0) throw new Error()
      userId = newRes.rows[0].id_usuario
    } catch (createError) {
      logErrorInterno('crear usuario', createError)
      return { error: 'No pudimos registrar tus datos. Verifica tu correo e intenta de nuevo.' }
    }
  }

  const matriculaRes = await query(
    'SELECT id_matricula FROM matriculas_eventos WHERE id_usuario = $1 AND id_actividad = $2',
    [userId, id_actividad]
  )
  const existing = matriculaRes.rows.length > 0 ? matriculaRes.rows[0] : null

  if (existing) {
    return { error: 'Ya te encuentras inscrito en esta actividad.' }
  }

  try {
    await query('INSERT INTO matriculas_eventos (id_usuario, id_actividad) VALUES ($1, $2)', [userId, id_actividad])
  } catch (enrollError) {
    logErrorInterno('matrícula', enrollError)
    return { error: 'No se pudo completar la inscripción. Intenta nuevamente en unos minutos.' }
  }

  if (archivoPdf && archivoPdf.size > 0) {
    const extension = archivoPdf.name.split('.').pop() ?? 'pdf'
    const rutaArchivo = `actividad_${id_actividad}/usuario_${userId}_${Date.now()}.${extension}`

    let uploadError = null
    let localRuta = ''
    try {
      localRuta = await saveLocalFile(archivoPdf, `${BUCKET_DOCUMENTOS_INSCRIPCION}/${rutaArchivo}`)
    } catch (err: any) {
      uploadError = err
    }

    if (uploadError) {
      logErrorInterno('subir PDF', uploadError)
      await query('DELETE FROM matriculas_eventos WHERE id_usuario = $1 AND id_actividad = $2', [userId, id_actividad])
      return {
        error:
          'No se pudo subir el documento. La inscripción fue cancelada. Verifica que sea un PDF válido e intenta de nuevo.',
      }
    }

    try {
      await query(
        'INSERT INTO archivos_actividades (id_actividad, id_usuario, ruta_archivo, tipo_archivo) VALUES ($1, $2, $3, $4)',
        [id_actividad, userId, localRuta, TIPO_ARCHIVO_PDF]
      )
    } catch (archivoError) {
      logErrorInterno('registrar PDF en BD', archivoError)
      await deleteLocalFile(`${BUCKET_DOCUMENTOS_INSCRIPCION}/${rutaArchivo}`)
      await query('DELETE FROM matriculas_eventos WHERE id_usuario = $1 AND id_actividad = $2', [userId, id_actividad])
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
