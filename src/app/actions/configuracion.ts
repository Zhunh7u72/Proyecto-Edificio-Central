'use server'

import { supabaseAdmin } from '@/lib/supabase'
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

    const { data: config } = await supabaseAdmin
      .from('informacion_institucional')
      .select('id_info_inst, logo_url, carrusel_urls')
      .limit(1)
      .maybeSingle()
      
    let newLogoUrl = config?.logo_url || null
    
    // Upload Logo
    if (logoFile && logoFile.size > 0) {
      const extension = logoFile.name.split('.').pop()
      const safeName = `logo-${Date.now()}.${extension}`
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('archivos_publicos')
        .upload(`config/${safeName}`, logoFile, { contentType: logoFile.type })
        
      if (!uploadError) {
        const { data } = supabaseAdmin.storage.from('archivos_publicos').getPublicUrl(`config/${safeName}`)
        newLogoUrl = data.publicUrl
      }
    }
    
    // Upload Carousel Images
    const newCarruselUrls = [...existingCarrusel]
    const validCarruselFiles = carruselFiles.filter(f => f.size > 0)
    
    for (const file of validCarruselFiles) {
      const extension = file.name.split('.').pop()
      const safeName = `carrusel-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('archivos_publicos')
        .upload(`config/carrusel/${safeName}`, file, { contentType: file.type })
        
      if (!uploadError) {
        const { data } = supabaseAdmin.storage.from('archivos_publicos').getPublicUrl(`config/carrusel/${safeName}`)
        newCarruselUrls.push(data.publicUrl)
      }
    }
    
    // Update DB
    let updateError = null
    
    if (config) {
      const { error } = await supabaseAdmin
        .from('informacion_institucional')
        .update({
          logo_url: newLogoUrl,
          carrusel_urls: newCarruselUrls
        })
        .eq('id_info_inst', config.id_info_inst)
      updateError = error
    } else {
      const { error } = await supabaseAdmin
        .from('informacion_institucional')
        .insert({
          logo_url: newLogoUrl,
          carrusel_urls: newCarruselUrls,
          mision: '',
          vision: ''
        })
      updateError = error
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
