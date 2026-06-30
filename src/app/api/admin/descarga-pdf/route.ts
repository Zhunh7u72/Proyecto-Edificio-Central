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

  if (!ruta) {
    return new NextResponse('Ruta de archivo requerida', { status: 400 })
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

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
