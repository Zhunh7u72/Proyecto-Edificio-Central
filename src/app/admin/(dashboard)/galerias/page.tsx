import { query } from '@/lib/db'
import GaleriasClient from './GaleriasClient'
import type { FotoCarrera } from '@/lib/types/admin'

export const dynamic = 'force-dynamic'

export default async function GaleriasPage() {
  let dbError = null
  const items: any[] = []
  const carreraRows: any[] = []
  try {
    const dataRes = await query(`
      SELECT fc.id_foto_carre, fc.id_facultad_carrera, fc.ruta_foto, facc.nombre_carrera, fac.nombre_facultad
      FROM fotos_carreras fc
      LEFT JOIN facultades_carreras facc ON fc.id_facultad_carrera = facc.id_facultad_carrera
      LEFT JOIN facultades fac ON facc.id_facultad = fac.id_facultad
      ORDER BY fc.id_foto_carre DESC
    `)
    for (const f of dataRes.rows) {
      items.push({
        id_foto_carre: f.id_foto_carre,
        id_facultad_carrera: f.id_facultad_carrera,
        ruta_foto: f.ruta_foto,
        facultades_carreras: f.nombre_carrera ? { nombre_carrera: f.nombre_carrera, facultades: f.nombre_facultad ? { nombre_facultad: f.nombre_facultad } : null } : null,
        carrera_label: f.nombre_carrera ? `${f.nombre_facultad ?? ''} — ${f.nombre_carrera}` : '',
      })
    }

    const carRes = await query(`
      SELECT fc.id_facultad_carrera, fc.nombre_carrera, fac.nombre_facultad
      FROM facultades_carreras fc
      LEFT JOIN facultades fac ON fc.id_facultad = fac.id_facultad
      ORDER BY fc.nombre_carrera
    `)
    for (const c of carRes.rows) {
      carreraRows.push({
        id_facultad_carrera: c.id_facultad_carrera,
        nombre_carrera: c.nombre_carrera,
        facultades: c.nombre_facultad ? { nombre_facultad: c.nombre_facultad } : null,
      })
    }
  } catch (e: any) {
    dbError = e.message
  }

  return (
    <GaleriasClient
      items={items}
      carreras={carreraRows}
      dbError={dbError}
    />
  )
}
