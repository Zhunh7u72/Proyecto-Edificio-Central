import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import fs from 'fs/promises'
import path from 'path'

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

  let filePath = ruta
  if (filePath.startsWith('/uploads/')) {
    filePath = filePath.replace('/uploads/', '')
  }

  const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath)

  try {
    const buffer = await fs.readFile(fullPath)
    const filename = filePath.split('/').pop() ?? 'documento.pdf'
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
  } catch (error) {
    console.error('Error descargando PDF:', error)
    return new NextResponse('Archivo no encontrado', { status: 404 })
  }
}
