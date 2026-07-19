// Diccionario de palabras clave (en español, sin tildes) -> emoji, para sugerir un ícono
// automáticamente cuando el usuario escribe el nombre de una categoría nueva. Es un match
// local por palabra clave (instantáneo, sin llamar a ningún modelo) en vez de IA en vivo.
const DICCIONARIO_EMOJIS: [string[], string][] = [
  [["maquillaje", "belleza", "cosmetico", "labial", "skincare", "cutis"], "💄"],
  [["ropa", "vestido", "pantalon", "camisa", "franela", "zapato", "moda", "outlet"], "👕"],
  [["comida", "restaurante", "almuerzo", "cena", "desayuno", "delivery"], "🍔"],
  [["mercado", "super", "supermercado", "abasto", "viveres"], "🛒"],
  [["cafe", "cafeteria", "panaderia"], "☕"],
  [["lujo", "joya", "diamante", "reloj", "cartera"], "💎"],
  [["auto", "carro", "vehiculo", "gasolina", "combustible", "taller", "mecanico", "caucho"], "🚗"],
  [["mascota", "perro", "gato", "veterinario", "purina", "dogchow"], "🐶"],
  [["salud", "medico", "medicina", "farmacia", "doctor", "clinica", "odontologo", "dentista"], "💊"],
  [["gimnasio", "gym", "deporte", "ejercicio", "entrenador"], "🏋️"],
  [["viaje", "vacacion", "vuelo", "hotel", "turismo", "maleta"], "✈️"],
  [["casa", "hogar", "alquiler", "renta", "condominio", "mantenimiento", "mudanza"], "🏠"],
  [["internet", "wifi", "telefono", "celular", "servicio", "luz", "electricidad", "agua", "cable", "cantv"], "📶"],
  [["regalo", "cumpleanos", "obsequio", "detalle"], "🎁"],
  [["salario", "sueldo", "ingreso", "pago", "nomina", "quincena"], "💰"],
  [["ahorro", "inversion", "meta", "cripto", "binance"], "📈"],
  [["cine", "pelicula", "juego", "entretenimiento", "streaming", "netflix", "disney"], "🎬"],
  [["educacion", "curso", "libro", "universidad", "colegio", "escuela", "clase"], "📚"],
  [["transporte", "taxi", "uber", "autobus", "metro", "pasaje", "carrito"], "🚕"],
  [["bebe", "panal", "pañal", "guarderia", "biberon"], "🍼"],
  [["cigarro", "tabaco", "vape"], "🚬"],
  [["alcohol", "cerveza", "licor", "bebida", "trago", "ron", "whisky"], "🍺"],
  [["fiesta", "rumba", "cumple", "evento"], "🎉"],
  [["peluqueria", "barberia", "corte", "salon", "unas", "manicure"], "💇"],
  [["arte", "musica", "instrumento", "pintura"], "🎨"],
  [["tecnologia", "electronico", "computadora", "laptop", "gadget"], "💻"],
  [["deuda", "prestamo", "credito", "cashea"], "💳"],
  [["donacion", "iglesia", "caridad", "diezmo"], "🙏"],
];

const normalizar = (texto: string) =>
  texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

// Devuelve el primer emoji cuyo grupo de palabras clave coincida con el texto escrito.
// Cadena vacía si no hay match (el llamador decide el emoji por defecto).
export function sugerirEmoji(nombre: string): string {
  const texto = normalizar(nombre);
  if (!texto) return "";
  for (const [palabras, emoji] of DICCIONARIO_EMOJIS) {
    if (palabras.some(p => texto.includes(p))) return emoji;
  }
  return "";
}

const EMOJIS_GENERICOS = [
  "🏷️", "⭐", "🔥", "❤️", "🎯", "📦", "🧾", "🛠️", "🍕", "🎮",
  "📱", "🚨", "🧴", "🧹", "🧺", "🚿", "🔧", "💡", "🐾", "🍺",
];

export const EMOJIS_DISPONIBLES: string[] = Array.from(new Set([
  ...DICCIONARIO_EMOJIS.map(([, emoji]) => emoji),
  ...EMOJIS_GENERICOS,
]));

// Filtra el picker manual por texto de búsqueda; si no hay coincidencias muestra todo el catálogo.
export function filtrarEmojisPorTexto(query: string): string[] {
  const texto = normalizar(query);
  if (!texto) return EMOJIS_DISPONIBLES;
  const encontrados = DICCIONARIO_EMOJIS
    .filter(([palabras]) => palabras.some(p => p.includes(texto) || texto.includes(p)))
    .map(([, emoji]) => emoji);
  return encontrados.length > 0 ? Array.from(new Set(encontrados)) : EMOJIS_DISPONIBLES;
}

// Separa un emoji al final (o al inicio) de una etiqueta guardada, ej. "Maquillaje 💄" -> { nombre: "Maquillaje", emoji: "💄" }.
// Si la etiqueta no trae emoji (categorías creadas antes de esta función), emoji viene null.
const EMOJI_BORDE = /^(\p{Extended_Pictographic}️?\s*)+|(\s*\p{Extended_Pictographic}️?)+$/gu;

export function separarEmoji(label: string): { nombre: string; emoji: string | null } {
  if (!label) return { nombre: "", emoji: null };
  const encontrados = label.match(EMOJI_BORDE);
  if (!encontrados) return { nombre: label.trim(), emoji: null };
  const emoji = encontrados.join("").trim();
  const nombre = label.replace(EMOJI_BORDE, "").trim();
  return { nombre: nombre || label.trim(), emoji: emoji || null };
}
