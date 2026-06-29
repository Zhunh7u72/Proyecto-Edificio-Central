'use client'

import GenericCrud from '@/components/admin/GenericCrud'
import {
  crearGaleria,
  actualizarGaleria,
  eliminarGaleria,
} from '@/app/actions/galerias'
import type { FotoCarrera, SelectOption } from '@/lib/types/admin'
import styles from '@/components/admin/admin.module.css'

type FotoRow = FotoCarrera & { carrera_label: string }

type CarreraOption = {
  id_facultad_carrera: number
  nombre_carrera: string
  facultades?: { nombre_facultad: string } | null
}

export default function GaleriasClient({
  items,
  carreras,
  dbError,
}: {
  items: FotoRow[]
  carreras: CarreraOption[]
  dbError?: string | null
}) {
  const carreraOptions: SelectOption[] = carreras.map((c) => ({
    value: String(c.id_facultad_carrera),
    label: `${c.facultades?.nombre_facultad ?? 'Facultad'} — ${c.nombre_carrera}`,
  }))

  const fields = [
    {
      name: 'id_facultad_carrera',
      label: 'Carrera',
      type: 'select' as const,
      required: true,
      options: carreraOptions,
    },
    {
      name: 'ruta_foto',
      label: 'Link de imagen',
      type: 'url' as const,
      required: true,
      placeholder: 'https://...',
    },
  ]

  return (
    <GenericCrud<FotoRow>
      pageTitle="Gestión de Galerías"
      pageDescription="Administrar fotos de carreras (fotos_carreras)."
      entityName="Imagen"
      idField="id_foto_carre"
      items={items}
      fields={fields}
      dbError={dbError}
      columns={[
        {
          key: 'ruta_foto',
          label: 'Vista previa',
          render: (item) =>
            item.ruta_foto ? (
              <img src={item.ruta_foto} alt="" className={styles.thumb} />
            ) : (
              <div className={styles.thumbPlaceholder}>🖼️</div>
            ),
        },
        { key: 'carrera_label', label: 'Carrera' },
      ]}
      onCreate={crearGaleria}
      onUpdate={actualizarGaleria}
      onDelete={eliminarGaleria}
    />
  )
}
