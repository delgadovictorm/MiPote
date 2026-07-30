import { createClient } from "@supabase/supabase-js";

// Cliente con la SERVICE ROLE key: SOLO se debe importar desde route handlers
// (app/api/**/route.ts). Nunca importar desde un componente "use client" —
// SUPABASE_SERVICE_ROLE_KEY no lleva NEXT_PUBLIC_ así que Next no la expone al
// bundle del navegador, pero el import en sí no debe hacerse desde código cliente.
// Mismo fallback que lib/supabase.ts: evita que el build/pre-renderizado truene
// si la env var no está disponible en ese momento (ej. Vercel analizando rutas).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
