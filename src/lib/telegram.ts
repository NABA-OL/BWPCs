/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import "server-only";
import { env } from "@/lib/env";

/**
 * Notifica al bot de Telegram configurado por variables de entorno
 * (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_THREAD_ID). Nunca lanza —
 * si falla o no está configurado, solo lo registra. No debe bloquear al
 * flujo que la llama.
 */
export async function sendTelegramMessage(
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const { telegramBotToken, telegramChatId, telegramThreadId } = env;
  if (!telegramBotToken || !telegramChatId) {
    return { ok: false, error: "Telegram no está configurado." };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          ...(telegramThreadId
            ? { message_thread_id: Number(telegramThreadId) }
            : {}),
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
