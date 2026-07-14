import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const photo = formData.get("photo");
    const caption = formData.get("caption");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Falta configurar TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID" }, { status: 500 });
    }

    let res;
    if (photo && photo instanceof Blob) {
      const telegramForm = new FormData();
      telegramForm.append("chat_id", chatId);
      telegramForm.append("caption", caption as string);
      telegramForm.append("parse_mode", "Markdown");
      telegramForm.append("photo", photo);

      res = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: telegramForm,
      });
    } else {
      res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: "Markdown" }),
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: "Fallo al enviar" }, { status: 500 });
  }
}