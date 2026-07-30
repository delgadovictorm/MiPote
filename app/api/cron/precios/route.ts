import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CATEGORIAS_PRINCIPALES, fetchTasaBcv, refrescarPrecio, seedCategoria, syncCatalogoDesdeSitemap } from "@/lib/gamaScraper";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Refresco diario del Consultor de precios (Vercel Cron, ver vercel.json).
// 1) Resincroniza el catálogo desde el sitemap de Gama (productos nuevos).
// 2) Completa categorías que aún no lleguen al mínimo de productos.
// 3) Refresca el precio de todo lo que ya está categorizado, uno por uno.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const resumen: Record<string, any> = {};

  try {
    resumen.catalogo = await syncCatalogoDesdeSitemap();
  } catch (e: any) {
    resumen.catalogo = { error: e.message };
  }

  let tasaBcv = 0;
  try {
    tasaBcv = await fetchTasaBcv();
  } catch (e: any) {
    resumen.tasaBcvError = e.message;
  }

  resumen.seed = {};
  for (const { nombre, keywords } of CATEGORIAS_PRINCIPALES) {
    try {
      resumen.seed[nombre] = await seedCategoria(nombre, keywords, 6, tasaBcv);
    } catch (e: any) {
      resumen.seed[nombre] = `error: ${e.message}`;
    }
  }

  const { data: categorizados } = await supabaseAdmin
    .from("precios_mercado_catalogo")
    .select("codigo_producto")
    .not("categoria_nombre", "is", null);

  let refrescados = 0;
  for (const fila of categorizados || []) {
    const resultado = await refrescarPrecio(fila.codigo_producto, tasaBcv);
    if (resultado) refrescados++;
    await new Promise((r) => setTimeout(r, 200));
  }
  resumen.refrescados = refrescados;

  return NextResponse.json({ ok: true, resumen });
}
