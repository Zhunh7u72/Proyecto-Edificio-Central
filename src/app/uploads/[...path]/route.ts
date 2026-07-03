import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params
    // Construir la ruta absoluta al archivo dentro de public/uploads
    // resolvedParams.path es un arreglo con las partes de la URL, ej: ['imagenes', 'foto.jpg']
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...resolvedParams.path)
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Archivo no encontrado', { status: 404 })
    }

    // Leer el archivo de forma síncrona (o asíncrona)
    const file = fs.readFileSync(filePath)
    const stat = fs.statSync(filePath)

    // Determinar el tipo de contenido basado en la extensión
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.gif') contentType = 'image/gif'
    else if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.svg') contentType = 'image/svg+xml'
    else if (ext === '.pdf') contentType = 'application/pdf'

    // Retornar el archivo con las cabeceras correctas para que el navegador lo muestre y lo cachee
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error al servir archivo:', error)
    return new NextResponse('Error interno', { status: 500 })
  }
}
