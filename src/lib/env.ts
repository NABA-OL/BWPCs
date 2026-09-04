/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
/**
 * Acceso centralizado a variables de entorno del servidor.
 * Lanza temprano si falta algo crítico (mejor fallar en build que en runtime).
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Defínela en .env.local (local) y en Vercel (producción).`,
    );
  }
  return value;
}

export const env = {
  get mongodbUri() {
    return required("MONGODB_URI");
  },
  get mongodbDb() {
    // Nombre de la base; por defecto "bwpcs" si no se especifica.
    return process.env.MONGODB_DB ?? "bwpcs";
  },
  get authSecret() {
    return required("AUTH_SECRET");
  },
  // Notificación de solicitudes por Telegram — opcional, no bloquea nada si falta.
  get telegramBotToken() {
    return process.env.TELEGRAM_BOT_TOKEN ?? null;
  },
  get telegramChatId() {
    return process.env.TELEGRAM_CHAT_ID ?? null;
  },
  get telegramThreadId() {
    return process.env.TELEGRAM_THREAD_ID ?? null;
  },
};
