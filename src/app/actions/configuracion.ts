'use server'

import { query } from '@/lib/db'
import { saveLocalFile } from '@/lib/storage'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'

export async function actualizarConfiguracionSitio(formData: FormData): Promise<{ error?: string, success?: string }> {
  try {
    await requireAdmin()
    
    // We expect logo (File) and carrusel (multiple Files)
    const logoFile = formData.get('logo') as File | null
    const carruselFiles = formData.getAll('carrusel') as File[]
    let existingCarrusel: string[] = []
    try {
      const raw = formData.get('existingCarrusel') as string
      const parsed = JSON.parse(raw || '[]')
      if (Array.isArray(parsed)) {
        existingCarrusel = parsed.filter((u): u is string => typeof u === 'string').slice(0, 20)
      }
    } catch {
      return { error: 'Datos del carrusel inválidos.' }
    }

    const infoRes = await query('SELECT id_info_inst, logo_url, carrusel_urls FROM informacion_institucional LIMIT 1')
    const config = infoRes.rows.length > 0 ? infoRes.rows[0] : null
    let newLogoUrl = config?.logo_url || null
    
    // Upload Logo
    if (logoFile && logoFile.size > 0) {
      const extension = logoFile.name.split('.').pop()
      const safeName = `logo-${Date.now()}.${extension}`
      
      try {
        newLogoUrl = await saveLocalFile(logoFile, `config/${safeName}`)
      } catch (uploadError) {
        console.error(uploadError)
      }
    }
    
    // Upload Carousel Images
    const newCarruselUrls = [...existingCarrusel]
    const validCarruselFiles = carruselFiles.filter(f => f.size > 0)
    
    for (const file of validCarruselFiles) {
      const extension = file.name.split('.').pop()
      const safeName = `carrusel-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
      
      try {
        const localRuta = await saveLocalFile(file, `config/carrusel/${safeName}`)
        newCarruselUrls.push(localRuta)
      } catch (uploadError) {
        console.error(uploadError)
      }
    }
    
    // Update DB
    let updateError = null
    
    if (config) {
      try {
        await query(
          'UPDATE informacion_institucional SET logo_url = $1, carrusel_urls = $2 WHERE id_info_inst = $3',
          [newLogoUrl, JSON.stringify(newCarruselUrls), config.id_info_inst]
        )
      } catch (e: any) {
        updateError = e
      }
    } else {
      try {
        await query(
          'INSERT INTO informacion_institucional (logo_url, carrusel_urls, mision, vision) VALUES ($1, $2, $3, $4)',
          [newLogoUrl, JSON.stringify(newCarruselUrls), '', '']
        )
      } catch (e: any) {
        updateError = e
      }
    }
      
    if (updateError) {
      return { error: 'Error al actualizar configuración: ' + updateError.message }
    }
    
    revalidatePath('/')
    revalidatePath('/admin/configuracion')
    
    return { success: 'Configuración actualizada exitosamente.' }
  } catch (err: any) {
    return { error: err.message || 'Error al actualizar.' }
  }
}
