import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  asegurarCatalogoSincronizado,
  buscarEnCatalogo,
  CATEGORIAS_PRINCIPALES,
  fetchTasaBcv,
  obtenerCategoriaConSiembra,
  refrescarPrecio,
} from "@/lib/gamaScraper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const LIMITE_PRODUCTOS = 6;

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const categoria = searchParams.get("categoria")?.trim();
    const tasaBcv = await tasaBcvConFallback();

    if (q) {
      await asegurarCatalogoSincronizado().catch((e) => console.error("No se pudo sincronizar el catálogo:", e));
      const candidatos = await buscarEnCatalogo(q, LIMITE_PRODUCTOS);

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

    // Una sola categoría: mucho más rápido que sembrar las 6 de un jaque, así el
    // panel puede pedir cada sección por separado y mostrarlas a medida que llegan.
    if (categoria) {
      const productos = await obtenerCategoriaConSiembra(categoria, tasaBcv, LIMITE_PRODUCTOS);
      return NextResponse.json({ categoria, productos, tasa_bcv: tasaBcv });
    }

    // Sin parámetros: solo la lista de nombres de categoría (barato, sin sembrar
    // nada) para que el front sepa qué secciones pedir una por una.
    return NextResponse.json({
      categoriasDisponibles: CATEGORIAS_PRINCIPALES.map((c) => c.nombre),
      tasa_bcv: tasaBcv,
    });
  } catch (error: any) {
    // Nunca un 500 pelón: si algo se rompe, devolvemos vacío en vez de tumbar la pantalla.
    console.error("Error en /api/precios:", error);
    return NextResponse.json({ categoriasDisponibles: [], productos: [], resultados: [], tasa_bcv: 0, error: "No se pudo consultar precios en este momento" });
  }
}
