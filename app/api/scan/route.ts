import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const PROMPTS: Record<string, string> = {
  factura: "Analiza esta factura, recibo o captura de transferencia (ej. Pago Móvil/Zelle). Extrae: 'comercio' (o a quién se le pagó), 'monto_total' (número puro), 'moneda' (bs o usdt), 'iva_total' (número), 'fecha', 'hora', 'categoria_sugerida' (comida, cashea, internet, mascotas, condominio, regalos, otro) y un arreglo llamado 'productos' que contenga objetos con 'nombre' y 'precio'. Responde SOLO un JSON puro.",
  item: "Analiza esta foto de un producto o etiqueta de precio de un supermercado. Extrae 'nombre' (nombre del producto, corto) y 'precio' (número puro, sin símbolos) y 'moneda' ('bs' o 'usd'). Si hay varios productos visibles, usa el más prominente/enfocado. Responde SOLO un JSON puro con esas 3 claves.",
};

function getPrompt(mode: string): string {
  if (mode === 'cashea') {
    const hoy = new Date().toISOString().slice(0, 10);
    return `Analiza esta captura de pantalla de la app Cashea que muestra una lista de cuotas pendientes por pagar. Para CADA cuota/compra que veas en la lista, extrae: 'articulo' (nombre del comercio o producto), 'monto_cuota' (número puro, sin símbolo de $), 'fecha_pago' (formato YYYY-MM-DD; las fechas en la imagen vienen como "día de mes" sin año, así que asume el año actual usando como referencia la fecha de hoy que es ${hoy}, y si el mes ya pasó respecto a hoy asume el año siguiente), 'cuota_actual' y 'cuota_total' (números, de "Cuota X de Y"). Responde SOLO un JSON puro con una clave 'items' que sea un arreglo de esos objetos, uno por cada cuota visible en la imagen.`;
  }
  if (mode === 'estado_cuenta') {
    const hoy = new Date().toISOString().slice(0, 10);
    return `Analiza esta captura de pantalla de un estado de cuenta o historial de movimientos de un banco o billetera venezolana (ej. Bancamiga, Banesco, Mercantil, BNC, BDV, Pago Móvil). Cada app muestra el tipo de movimiento de forma distinta: algunas ponen el signo "+"/"-" junto al monto o lo pintan de verde/rojo; otras dejan el monto siempre en el mismo color y en su lugar usan un ÍCONO circular junto al movimiento (círculo verde con "+" = ingreso, círculo rojo/naranja con "−" = egreso).

Para CADA movimiento visible, determina 'tipo' ('ingreso' o 'egreso') priorizando SIEMPRE la señal visual de ESA fila (signo, color del monto, o ícono del círculo) por encima del texto de la descripción. Es común que la MISMA descripción (ej. "TRANS.CTAS. A TERCEROS BANESCO") aparezca en distintas filas como ingreso en una y egreso en otra según el ícono/signo de cada una — nunca asumas el tipo solo por el texto del concepto, solo como último recurso si no hay ninguna señal visual de signo, color ni ícono.

Para cada movimiento extrae:
- 'tipo': 'ingreso' o 'egreso' (según la señal visual de esa fila, como se explicó arriba).
- 'descripcion': el concepto o comercio del movimiento (ej. "Pago Móvil CCE", "Envío de SMS"), SIN incluir el número de referencia ni la fecha/hora.
- 'monto': tipo numérico JSON puro (no string), siempre positivo y sin el signo. Usa punto como separador decimal y NO incluyas separador de miles, ej. 1442.69 en vez de "1.442,69".
- 'moneda': 'bs' o 'usdt', según la moneda del estado de cuenta (casi siempre 'bs' en bancos venezolanos).
- 'fecha': formato YYYY-MM-DD. Las fechas pueden venir como DD/MM/YY o DD/MM/YYYY; conviértelas. Si no aparece año usa como referencia hoy, ${hoy}. Si no hay fecha visible en absoluto usa null.
- 'categoria_sugerida': una de salario, comida, mercado, internet, mascotas, cashea, otro. Usa 'salario' para depósitos o transferencias de ingreso recibidas, 'internet' para comisiones y cargos bancarios (envío de SMS, emisión de estado de cuenta, mantenimiento, etc) y 'otro' si ninguna aplica bien.

Responde SOLO un JSON puro con una clave 'items' que sea un arreglo de esos objetos, uno por cada movimiento visible en la imagen.`;
  }
  return PROMPTS[mode] || PROMPTS.factura;
}

export async function POST(req: Request) {
  try {
    const { imageUrl, mode } = await req.json();

    // Leemos la llave segura directamente del servidor
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "No hay API Key" }, { status: 500 });

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
          role: "user",
          content: [
            { type: "text", text: getPrompt(mode) },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageUrl}` } }
          ],
      }],
      temperature: 0,
    });

    return NextResponse.json({ result: response.choices[0]?.message?.content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}