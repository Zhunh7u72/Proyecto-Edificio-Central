import { supabaseAdmin as supabase } from '@/lib/supabase'
import GaleriasClient from './GaleriasClient'
import type { FotoCarrera } from '@/lib/types/admin'

export const dynamic = 'force-dynamic'

export default async function GaleriasPage() {
  const [{ data, error }, { data: carreras }] = await Promise.all([
    supabase
      .from('fotos_carreras')
      .select('id_foto_carre, id_facultad_carrera, ruta_foto, facultades_carreras(nombre_carrera, facultades(nombre_facultad))')
      .order('id_foto_carre', { ascending: false }),
    supabase
      .from('facultades_carreras')
      .select('id_facultad_carrera, nombre_carrera, facultades(nombre_facultad)')
      .order('nombre_carrera'),
  ])

  const items = (data ?? []).map((f) => {
    const carrera = Array.isArray(f.facultades_carreras) ? f.facultades_carreras[0] : f.facultades_carreras
    const facRaw = carrera?.facultades
    const fac = Array.isArray(facRaw) ? facRaw[0] : facRaw
    return {
      id_foto_carre: f.id_foto_carre,
      id_facultad_carrera: f.id_facultad_carrera,
      ruta_foto: f.ruta_foto,
      facultades_carreras: carrera
        ? { nombre_carrera: carrera.nombre_carrera, facultades: fac ? { nombre_facultad: fac.nombre_facultad } : null }
        : null,
      carrera_label: carrera
        ? `${fac?.nombre_facultad ?? ''} — ${carrera.nombre_carrera}`
        : '',
    }
  })
  const carreraRows = (carreras ?? []).map((c) => {
    const fac = Array.isArray(c.facultades) ? c.facultades[0] : c.facultades
    return {
      id_facultad_carrera: c.id_facultad_carrera,
      nombre_carrera: c.nombre_carrera,
      facultades: fac ? { nombre_facultad: fac.nombre_facultad } : null,
    }
  })

  return (
    <GaleriasClient
      items={items}
      carreras={carreraRows}
      dbError={error?.message ?? null}
    />
  )
}
