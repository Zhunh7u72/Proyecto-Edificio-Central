/** URL segura para ver o descargar PDFs de inscripción (solo admin autenticado). */
export function urlPdfInscripcionAdmin(ruta: string, modo: 'ver' | 'descargar' = 'ver') {
  const params = new URLSearchParams({ ruta })
  if (modo === 'descargar') params.set('descargar', '1')
  return `/api/admin/descarga-pdf?${params.toString()}`
}
