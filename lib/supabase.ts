import { createClient } from '@supabase/supabase-js';

// Fallback solo para que el build/pre-renderizado nunca truene si estas variables
// no están disponibles en ese momento (ej. Vercel al analizar rutas estáticas).
// En el navegador real, las variables NEXT_PUBLIC_* siempre están inyectadas.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);