import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    
    // Leemos la llave segura directamente del servidor
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "No hay API Key" }, { status: 500 });

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analiza esta factura, recibo o captura de transferencia (ej. Pago Móvil/Zelle). Extrae: 'comercio' (o a quién se le pagó), 'monto_total' (número puro), 'moneda' (bs o usdt), 'iva_total' (número), 'fecha', 'hora', 'categoria_sugerida' (comida, cashea, internet, mascotas, condominio, regalos, otro) y un arreglo llamado 'productos' que contenga objetos con 'nombre' y 'precio'. Responde SOLO un JSON puro." },
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