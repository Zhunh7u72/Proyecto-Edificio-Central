import { query } from '@/lib/db'
import { TIPO_ARCHIVO_PDF } from '@/lib/actividad-archivos'
import DocumentosClient from './DocumentosClient'
import type { DocumentoPdf } from '@/lib/types/admin'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  let dbError = null
  let items: any[] = []
  let actividades: any[] = []
  
  try {
    const dataRes = await query(`
      SELECT aa.id_archivo_activi, aa.id_actividad, aa.ruta_archivo, aa.tipo_archivo, aa.nombre, a.titulo as titulo_actividad
      FROM archivos_actividades aa
      LEFT JOIN actividades a ON aa.id_actividad = a.id_actividad
      WHERE aa.tipo_archivo = $1 AND aa.id_usuario IS NULL
      ORDER BY aa.id_archivo_activi DESC
    `, [TIPO_ARCHIVO_PDF])
    items = dataRes.rows
    
    const actRes = await query('SELECT id_actividad, titulo FROM actividades ORDER BY titulo')
    actividades = actRes.rows
  } catch(e: any) {
    dbError = e.message
  }

  return (
    <DocumentosClient
      items={items}
      actividades={actividades}
      dbError={dbError}
    />
  )
}
