'use client'

import GenericCrud from '@/components/admin/GenericCrud'
import {
  crearAsociacion,
  actualizarAsociacion,
  eliminarAsociacion,
} from '@/app/actions/asociaciones'
import type { Carrera, Facultad, SelectOption } from '@/lib/types/admin'

type CarreraRow = Carrera & {
  nombre_facultad: string
  contacto: string
  tipo_contacto: string
}

export default function AsociacionesClient({
  items,
  facultades,
  dbError,
}: {
  items: CarreraRow[]
  facultades: Facultad[]
  dbError?: string | null
}) {
  const facultadOptions: SelectOption[] = facultades.map((f) => ({
    value: String(f.id_facultad),
    label: f.nombre_facultad,
  }))

  const fields = [
    {
      name: 'id_facultad',
      label: 'Facultad',
      type: 'select' as const,
      required: true,
      options: facultadOptions,
    },
    { name: 'nombre_carrera', label: 'Carrera / Asociación', required: true },
    { name: 'contacto', label: 'Contacto', placeholder: 'Teléfono, correo o WhatsApp' },
    {
      name: 'tipo_contacto',
      label: 'Tipo de contacto',
      type: 'select' as const,
      options: [
        { value: 'mail', label: 'Correo' },
        { value: 'telf', label: 'Teléfono' },
        { value: 'whatsapp', label: 'WhatsApp' },
      ],
    },
  ]

  return (
    <GenericCrud<CarreraRow>
      pageTitle="Gestión de Asociaciones"
      pageDescription="Administrar carreras y asociaciones por facultad (facultades_carreras)."
      entityName="Asociación"
      idField="id_facultad_carrera"
      items={items}
      fields={fields}
      dbError={dbError}
      columns={[
        { key: 'nombre_carrera', label: 'Carrera' },
        { key: 'nombre_facultad', label: 'Facultad' },
        { key: 'contacto', label: 'Contacto' },
        {
          key: 'tipo_contacto',
          label: 'Tipo',
          render: (item) =>
            item.tipo_contacto === 'telf'
              ? 'Teléfono'
              : item.tipo_contacto === 'whatsapp'
                ? 'WhatsApp'
                : 'Correo',
        },
      ]}
      onCreate={crearAsociacion}
      onUpdate={actualizarAsociacion}
      onDelete={eliminarAsociacion}
    />
  )
}
