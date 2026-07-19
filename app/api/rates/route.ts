import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let tasaBcv = 0;
    let tasaUsdt = 0;

    // Disfrazamos la petición para que Cloudflare no la bloquee
    const misHeaders = {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    const [reqBcv, reqParalelo] = await Promise.allSettled([
      fetch("https://ve.dolarapi.com/v1/dolares/oficial", { cache: "no-store", headers: misHeaders }),
      fetch("https://admin.somosgamerslatam.com/api/products/public/exchange-rate/VES", { cache: "no-store", headers: misHeaders })
    ]);

    if (reqBcv.status === "fulfilled" && reqBcv.value.ok) {
      try {
        const dataBcv = await reqBcv.value.json();
        tasaBcv = dataBcv.promedio || dataBcv.venta || 0;
      } catch (e) {
        console.error("Error procesando BCV");
      }
    }

    if (reqParalelo.status === "fulfilled" && reqParalelo.value.ok) {
      try {
        const dataParalelo = await reqParalelo.value.json();
        tasaUsdt = dataParalelo.rate || 0;
      } catch (e) {
        console.error("Error procesando Paralelo");
      }
    }

    if (!tasaBcv && !tasaUsdt) {
      return NextResponse.json({ success: false, error: "DolarAPI bloqueando conexión" }, { status: 502 });
    }

    return NextResponse.json({ success: true, bcv: tasaBcv, usdt: tasaUsdt });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Fallo interno" }, { status: 500 });
  }
}