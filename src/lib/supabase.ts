import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en las variables de entorno.'
  )
}

if (!supabaseServiceKey) {
  throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/** Cliente administrativo (ignora RLS) — solo en servidor. */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
