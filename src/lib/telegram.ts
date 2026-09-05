/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import "server-only";
import { env } from "@/lib/env";

export type TelegramThread = "solicitudes" | "contenido";

/**
 * Notifica al bot de Telegram configurado por variables de entorno
 * (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID). El tema del grupo depende de
 * `thread`: "solicitudes" usa TELEGRAM_THREAD_ID, "contenido" usa
 * TELEGRAM_CONTENT_THREAD_ID — dos temas separados a propósito, para no
 * mezclar avisos de cotizaciones con avisos de borradores de blog/noticias.
 * Nunca lanza — si falla o no está configurado, solo lo registra.
 */
export async function sendTelegramMessage(
  text: string,
  thread: TelegramThread = "solicitudes",
): Promise<{ ok: boolean; error?: string }> {
  const { telegramBotToken, telegramChatId, telegramThreadId, telegramContentThreadId } =
    env;
  if (!telegramBotToken || !telegramChatId) {
    return { ok: false, error: "Telegram no está configurado." };
  }

  const threadId =
    thread === "contenido" ? telegramContentThreadId : telegramThreadId;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          ...(threadId ? { message_thread_id: Number(threadId) } : {}),
          text,
          parse_mode: "HTML",
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("[telegram] sendMessage falló:", res.status, body);
      return { ok: false, error: `Telegram respondió ${res.status}.` };
    }
    return { ok: true };
  } catch (error) {
    console.error("[telegram] error de red:", error);
    return { ok: false, error: "No se pudo conectar con Telegram." };
  }
}
