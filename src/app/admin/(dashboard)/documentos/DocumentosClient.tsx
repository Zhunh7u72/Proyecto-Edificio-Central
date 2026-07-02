'use client'

import GenericCrud from '@/components/admin/GenericCrud'
import {
  crearDocumento,
  actualizarDocumento,
  eliminarDocumento,
  eliminarDocumentoArchivo,
} from '@/app/actions/documentos'
import type { DocumentoPdf, SelectOption } from '@/lib/types/admin'

type DocumentoRow = DocumentoPdf & { titulo_actividad: string }

type ActividadOption = { id_actividad: number; titulo: string }

export default function DocumentosClient({
  items,
  actividades,
  dbError,
}: {
  items: DocumentoRow[]
  actividades: ActividadOption[]
  dbError?: string | null
}) {
  const actividadOptions: SelectOption[] = actividades.map((a) => ({
    value: String(a.id_actividad),
    label: a.titulo,
  }))

  const fields = [
    {
      name: 'id_actividad',
      label: 'Actividad',
      type: 'select' as const,
      required: true,
      options: actividadOptions,
    },
    {
      name: 'archivo_pdf',
      label: 'Documento PDF (Archivo)',
      type: 'file' as const,
      accept: '.pdf',
      required: true,
      placeholder: 'Selecciona un archivo PDF...',
    },
  ]

  return (
    <GenericCrud<DocumentoRow>
      pageTitle="Gestión de Documentos PDF"
      pageDescription="Administrar archivos PDF vinculados a actividades (archivos_actividades)."
      entityName="Documento"
      idField="id_archivo_activi"
      items={items}
      fields={fields}
      dbError={dbError}
      columns={[
        { key: 'titulo_actividad', label: 'Actividad' },
        {
          key: 'ruta_archivo',
          label: 'PDF',
          render: (item) =>
            item.ruta_archivo ? (
              <a
                href={item.ruta_archivo}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--utn-red)' }}
              >
                Ver PDF ↗
              </a>
            ) : (
              '—'
            ),
        },
      ]}
      onCreate={crearDocumento}
      onUpdate={actualizarDocumento}
      onDelete={eliminarDocumento}
      onDeleteFile={eliminarDocumentoArchivo}
    />
  )
}
