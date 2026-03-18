import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERROR: Claves de Supabase no encontradas en el entorno (Vite).");
  console.log("URL:", supabaseUrl ? "Presente" : "Faltante");
  console.log("Key:", supabaseAnonKey ? "Presente" : "Faltante");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)
