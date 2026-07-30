import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { asegurarCategoriasSembradas, buscarEnCatalogo, fetchTasaBcv, getVistaPorCategorias, refrescarPrecio, syncCatalogoDesdeSitemap } from "@/lib/gamaScraper";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function tasaBcvConFallback(): Promise<number> {
  try {
    return await fetchTasaBcv();
  } catch {
    const { data } = await supabaseAdmin
      .from("precios_mercado")
      .select("tasa_bcv")
      .order("scraped_at", { ascending: false })
      .limit(1);
    return data?.[0]?.tasa_bcv || 0;
  }
}

async function asegurarCatalogo() {
  const { count } = await supabaseAdmin
    .from("precios_mercado_catalogo")
    .select("id", { count: "exact", head: true });
  if (!count) {
    try {
      await syncCatalogoDesdeSitemap();
    } catch (e) {
      console.error("No se pudo sincronizar el catálogo de Gama:", e);
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const tasaBcv = await tasaBcvConFallback();

    if (q) {
      await asegurarCatalogo();
      const candidatos = await buscarEnCatalogo(q, 8);

      const resultados = [];
      for (const candidato of candidatos) {
        const precio = await refrescarPrecio(candidato.codigo_producto, tasaBcv);
        if (precio) {
          resultados.push({
            producto: precio.nombre_producto,
            precio_ref: precio.precio_ref,
            iva_ref: precio.iva_ref,
            precio_total: precio.precio_total,
            tasa_bcv: precio.tasa_bcv,
            url_producto: precio.url_producto,
            scraped_at: precio.scraped_at,
          });
        }
      }

      return NextResponse.json({ q, resultados, tasa_bcv: tasaBcv });
    }

    // Primera vez que se pide el panel y aún no hay nada categorizado: sembramos
    // en el momento (rápido, 4 por categoría) en vez de obligar a esperar al cron.
    await asegurarCategoriasSembradas(tasaBcv, 4);

    const categorias = await getVistaPorCategorias(8);
    return NextResponse.json({ categorias, tasa_bcv: tasaBcv, updated_at: new Date().toISOString() });
  } catch (error: any) {
    // Nunca un 500 pelón: si algo se rompe, devolvemos vacío en vez de tumbar la pantalla.
    console.error("Error en /api/precios:", error);
    return NextResponse.json({ categorias: [], resultados: [], tasa_bcv: 0, error: "No se pudo consultar precios en este momento" });
  }
}
