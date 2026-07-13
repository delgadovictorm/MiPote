import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const PROMPTS: Record<string, string> = {
  factura: "Analiza esta factura, recibo o captura de transferencia (ej. Pago Móvil/Zelle). Extrae: 'comercio' (o a quién se le pagó), 'monto_total' (número puro), 'moneda' (bs o usdt), 'iva_total' (número), 'fecha', 'hora', 'categoria_sugerida' (comida, cashea, internet, mascotas, condominio, regalos, otro) y un arreglo llamado 'productos' que contenga objetos con 'nombre' y 'precio'. Responde SOLO un JSON puro.",
  item: "Analiza esta foto de un producto o etiqueta de precio de un supermercado. Extrae 'nombre' (nombre del producto, corto) y 'precio' (número puro, sin símbolos) y 'moneda' ('bs' o 'usd'). Si hay varios productos visibles, usa el más prominente/enfocado. Responde SOLO un JSON puro con esas 3 claves.",
};

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
            { type: "text", text: PROMPTS[mode] || PROMPTS.factura },
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