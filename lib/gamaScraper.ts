import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ============================================================================
// Consultor de precios — scraper propio de gamaenlinea.com (SAP Commerce Cloud /
// Spartacus). Investigado a mano contra el sitio real:
//
// - `occ/v2/egb2c-spa/products/search` (el buscador oficial) devuelve 400
//   NullPointerError SIEMPRE, con o sin auth — está roto en su backend. Por eso
//   NO lo usamos: nuestro propio "buscador" corre contra precios_mercado_catalogo
//   (sincronizado desde su sitemap público), no contra Gama en vivo.
// - `occ/v2/egb2c-spa/products/{codigo}` sí funciona perfecto, sin auth ni
//   headers especiales, y devuelve precio/IVA/categoría reales.
// - El host de la API sale literal en el <meta name="occ-backend-base-url">
//   del HTML de gamaenlinea.com — no es un endpoint escondido, lo usa su propio
//   frontend Angular desde el navegador (CORS abierto a "*").
// ============================================================================

const GAMA_OCC_BASE = "https://api.cl94ncbhsi-excelsior1-p1-public.model-t.cc.commerce.ondemand.com/occ/v2/egb2c-spa";
const GAMA_SITEMAP_ENTRY = `${GAMA_OCC_BASE}/sitemap`;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const CACHE_HORAS = 24;

// Categorías que mostramos en el Consultor de precios. "keywords" solo se usa
// para ELEGIR qué productos del catálogo vale la pena consultarle a Gama primero
// (sembrar la caché) — la categoría real que se guarda sale de la respuesta de
// Gama en products/{codigo}, no de estas palabras.
// Ojo: nombre_producto siempre tiene espacios (nunca guiones, incluso viniendo
// del slug del sitemap slugANombre() ya los convierte) — las keywords van con
// espacio, no con guión.
export const CATEGORIAS_PRINCIPALES: { nombre: string; keywords: string[] }[] = [
  { nombre: "Despensa", keywords: ["harina", "arroz", "aceite", "pasta", "cafe", "sal", "azucar"] },
  { nombre: "Lácteos", keywords: ["leche", "yogurt", "queso blanco", "queso amarillo", "queso crema"] },
  { nombre: "Carnicería", keywords: ["pollo", "carne", "pernil", "lomo", "chuleta", "res"] },
  { nombre: "Charcutería", keywords: ["jamon", "salchicha", "mortadela", "tocineta", "chorizo"] },
  { nombre: "Panadería", keywords: ["pan", "tostada", "cachito"] },
  { nombre: "Limpieza", keywords: ["detergente", "cloro", "jabon", "lavaplatos"] },
];

function parseNumeroVenezolano(valor: string | number | null | undefined): number {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;
  return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
}

function slugANombre(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchTasaBcv(): Promise<number> {
  const res = await fetch(`${GAMA_OCC_BASE}/currencies`, {
    headers: { "User-Agent": UA },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`currencies HTTP ${res.status}`);
  const data = await res.json();
  const ref = (data.currencies || []).find((c: any) => c.isocode === "REF");
  if (!ref) throw new Error("No se encontró la moneda REF");
  return parseNumeroVenezolano(ref.conversion);
}

interface ProductoGama {
  codigo: string;
  nombre: string;
  precio_ref: number;
  iva_ref: number;
  precio_total: number;
  categoria_code: string | null;
  categoria_nombre: string | null;
  url_producto: string;
}

async function fetchProductoGama(codigo: string): Promise<ProductoGama | null> {
  try {
    const res = await fetch(`${GAMA_OCC_BASE}/products/${encodeURIComponent(codigo)}?lang=es&curr=REF`, {
      headers: { "User-Agent": UA },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.code) return null;

    const categorias = data.categories || [];
    const categoriaMasEspecifica = categorias.length > 0 ? categorias[categorias.length - 1] : null;

    return {
      codigo: data.code,
      nombre: data.name || "",
      precio_ref: Number(data.price?.value ?? 0),
      iva_ref: Number(data.taxWithDiscount?.value ?? 0),
      precio_total: Number(data.totalWithVatPrice?.value ?? data.price?.value ?? 0),
      categoria_code: categoriaMasEspecifica?.code || null,
      categoria_nombre: categoriaMasEspecifica?.name || null,
      url_producto: data.url ? `https://gamaenlinea.com/es${data.url}` : "",
    };
  } catch {
    return null;
  }
}

// Recorre sitemap.xml -> sitemapindex -> sitemap hijo "Product-*.xml" -> ~1000
// URLs de producto reales (con nombre y código en la URL). Es la única forma
// confiable de "buscar" productos ya que el buscador propio de Gama está roto.
export async function syncCatalogoDesdeSitemap(): Promise<{ sincronizados: number }> {
  const indexRes = await fetch(GAMA_SITEMAP_ENTRY, { headers: { "User-Agent": UA }, cache: "no-store" });
  if (!indexRes.ok) throw new Error(`sitemap index HTTP ${indexRes.status}`);
  const indexXml = await indexRes.text();

  const locs = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const productSitemapUrl = locs.find((u) => u.includes("/medias/Product-"));
  if (!productSitemapUrl) throw new Error("No se encontró el sitemap de productos");

  const productRes = await fetch(productSitemapUrl, { headers: { "User-Agent": UA }, cache: "no-store" });
  if (!productRes.ok) throw new Error(`sitemap productos HTTP ${productRes.status}`);
  const productXml = await productRes.text();

  const matches = [...productXml.matchAll(/https:\/\/gamaenlinea\.com\/es\/([a-z0-9-]+)\/p\/(\d+)/g)];
  const filas = matches.map(([url, slug, codigo]) => ({
    codigo_producto: codigo,
    nombre_producto: slugANombre(slug),
    slug,
    url_producto: url,
    synced_at: new Date().toISOString(),
  }));

  // Dedup por código (el sitemap puede repetir la misma URL más de una vez).
  const porCodigo = new Map(filas.map((f) => [f.codigo_producto, f]));
  const filasUnicas = [...porCodigo.values()];

  if (filasUnicas.length === 0) return { sincronizados: 0 };

  // Upsert solo toca las columnas que mandamos: no pisa categoria_code/categoria_nombre
  // ya asignadas por refrescarPrecio/seedCategorias.
  const { error } = await supabaseAdmin
    .from("precios_mercado_catalogo")
    .upsert(filasUnicas, { onConflict: "codigo_producto" });

  if (error) throw new Error(`upsert catalogo: ${error.message}`);
  return { sincronizados: filasUnicas.length };
}

// Guarda un snapshot de precio fresco para `codigo` y, de paso, completa la
// categoría real y el nombre acentuado del catálogo si aún no los tenía.
async function guardarSnapshot(producto: ProductoGama, tasaBcv: number, categoriaNombreCurada?: string | null) {
  await supabaseAdmin.from("precios_mercado").insert([{
    codigo_producto: producto.codigo,
    nombre_producto: producto.nombre,
    precio_ref: producto.precio_ref,
    iva_ref: producto.iva_ref,
    precio_total: producto.precio_total,
    tasa_bcv: tasaBcv,
    categoria_code: producto.categoria_code,
    categoria_nombre: categoriaNombreCurada ?? producto.categoria_nombre,
    url_producto: producto.url_producto,
    scraped_at: new Date().toISOString(),
  }]);

  const updateCatalogo: Record<string, any> = { nombre_producto: producto.nombre || undefined };
  if (categoriaNombreCurada) {
    updateCatalogo.categoria_code = producto.categoria_code;
    updateCatalogo.categoria_nombre = categoriaNombreCurada;
  }
  await supabaseAdmin.from("precios_mercado_catalogo").update(updateCatalogo).eq("codigo_producto", producto.codigo);
}

// Precio "en vivo o de caché" para un código puntual, respetando las 24h.
// Nunca lanza al usuario un error si Gama falla: si hay algo cacheado (aunque
// esté viejo) lo devuelve; si no hay nada, devuelve null.
export async function refrescarPrecio(codigo: string, tasaBcv: number): Promise<any | null> {
  const { data: cacheReciente } = await supabaseAdmin
    .from("precios_mercado")
    .select("*")
    .eq("codigo_producto", codigo)
    .order("scraped_at", { ascending: false })
    .limit(1);

  const ultimo = cacheReciente?.[0] || null;
  if (ultimo && Date.now() - new Date(ultimo.scraped_at).getTime() < CACHE_HORAS * 60 * 60 * 1000) {
    return ultimo;
  }

  const fresco = await fetchProductoGama(codigo);
  if (!fresco) return ultimo; // Gama falló: devolvemos lo último que tengamos (o null).

  await guardarSnapshot(fresco, tasaBcv, ultimo?.categoria_nombre ?? null);
  return {
    codigo_producto: fresco.codigo,
    nombre_producto: fresco.nombre,
    precio_ref: fresco.precio_ref,
    iva_ref: fresco.iva_ref,
    precio_total: fresco.precio_total,
    tasa_bcv: tasaBcv,
    categoria_nombre: ultimo?.categoria_nombre ?? fresco.categoria_nombre,
    url_producto: fresco.url_producto,
    scraped_at: new Date().toISOString(),
  };
}

// Siembra/completa una categoría curada: busca en el catálogo local candidatos
// por palabra clave que todavía no tengan categoría asignada, y les pide el
// precio real a Gama uno por uno (rate limit suave, nunca en paralelo).
export async function seedCategoria(nombre: string, keywords: string[], limite: number, tasaBcv: number): Promise<number> {
  const { count } = await supabaseAdmin
    .from("precios_mercado_catalogo")
    .select("id", { count: "exact", head: true })
    .eq("categoria_nombre", nombre);

  const faltan = limite - (count || 0);
  if (faltan <= 0) return 0;

  // Regex con límites de palabra (\y en Postgres) en vez de ILIKE %termino% —
  // si no, una keyword como "sal" matchea "SALSA" o "aceite" matchea cualquier
  // cosa con esas letras adentro. Con \y solo matchea "sal" como palabra suelta.
  const patron = `\\y(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\y`;

  const { data: candidatos } = await supabaseAdmin
    .from("precios_mercado_catalogo")
    .select("codigo_producto")
    .is("categoria_nombre", null)
    .filter("nombre_producto", "imatch", patron)
    .limit(faltan * 4);
  if (!candidatos || candidatos.length === 0) return 0;

  let categorizados = 0;
  for (const candidato of candidatos) {
    if (categorizados >= faltan) break;
    const producto = await fetchProductoGama(candidato.codigo_producto);
    if (producto) {
      await guardarSnapshot(producto, tasaBcv, nombre);
      categorizados++;
    }
    await delay(200); // una query a la vez, sin martillar a Gama
  }
  return categorizados;
}

// Auto-siembra la primera vez que se pide el panel y todavía no hay nada
// categorizado (ej. el cron diario aún no corrió, o es la primera vez que se
// usa la feature). Solo hace el trabajo pesado UNA vez — de ahí en adelante
// ya hay datos en caché y el cron diario se encarga de mantenerlos frescos.
export async function asegurarCategoriasSembradas(tasaBcv: number, limitePorCategoria = 4) {
  const { count } = await supabaseAdmin
    .from("precios_mercado_catalogo")
    .select("id", { count: "exact", head: true })
    .not("categoria_nombre", "is", null);

  if (count && count > 0) return;

  try {
    await syncCatalogoDesdeSitemap();
  } catch (e) {
    console.error("No se pudo sincronizar el catálogo de Gama:", e);
    return;
  }

  for (const { nombre, keywords } of CATEGORIAS_PRINCIPALES) {
    try {
      await seedCategoria(nombre, keywords, limitePorCategoria, tasaBcv);
    } catch (e) {
      console.error(`No se pudo sembrar la categoría ${nombre}:`, e);
    }
  }
}

export async function buscarEnCatalogo(termino: string, limite = 8) {
  const { data } = await supabaseAdmin
    .from("precios_mercado_catalogo")
    .select("codigo_producto, nombre_producto")
    .ilike("nombre_producto", `%${termino}%`)
    .limit(limite);
  return data || [];
}

export async function getVistaPorCategorias(limitePorCategoria = 8) {
  const resultado: { nombre: string; productos: any[] }[] = [];
  for (const { nombre } of CATEGORIAS_PRINCIPALES) {
    const { data } = await supabaseAdmin
      .from("precios_mercado")
      .select("codigo_producto, nombre_producto, precio_ref, iva_ref, precio_total, url_producto, scraped_at")
      .eq("categoria_nombre", nombre)
      .order("scraped_at", { ascending: false })
      .limit(limitePorCategoria * 3);

    const vistos = new Set<string>();
    const productos: any[] = [];
    for (const fila of data || []) {
      if (vistos.has(fila.codigo_producto)) continue;
      vistos.add(fila.codigo_producto);
      productos.push(fila);
      if (productos.length >= limitePorCategoria) break;
    }
    if (productos.length > 0) resultado.push({ nombre, productos });
  }
  return resultado;
}
