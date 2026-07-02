import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { BUCKET_DOCUMENTOS_INSCRIPCION } from '@/lib/config'

export async function GET(request: NextRequest) {
  // Verificar que el solicitante es administrador
  const session = await getSession()
  if (!session || session.rol !== 'Administrador FEUE') {
    return new NextResponse('No autorizado', { status: 401 })
  }

  const url = new URL(request.url)
  const ruta = url.searchParams.get('ruta')

  if (!ruta || ruta.includes('..') || ruta.includes('\\')) {
    return new NextResponse('Ruta de archivo inválida', { status: 400 })
  }

  if (!/^actividad_\d+\/usuario_\d+_\d+\.[a-z0-9]+$/i.test(ruta)) {
    return new NextResponse('Ruta de archivo no permitida', { status: 400 })
  }

  // Descargar el archivo del bucket privado con privilegios administrativos
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_DOCUMENTOS_INSCRIPCION)
    .download(ruta)

  if (error || !data) {
    console.error('Error descargando PDF:', error?.message)
    return new NextResponse('Archivo no encontrado', { status: 404 })
  }

  const filename = ruta.split('/').pop() ?? 'documento.pdf'
  const buffer = await data.arrayBuffer()
  const descargar = url.searchParams.get('descargar') === '1'
  const disposition = descargar
    ? `attachment; filename="${filename}"`
    : `inline; filename="${filename}"`

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': disposition,
    },
  })
}
