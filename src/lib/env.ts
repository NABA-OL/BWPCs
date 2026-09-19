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

/** Tipos de aviso de Telegram: cada uno puede tener su propio tema en el grupo. */
export type TelegramThreadName =
  | "solicitudes"
  | "cotizaciones"
  | "compras"
  | "pagos"
  | "resenas"
  | "cuentas"
  | "contenido";

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
  /**
   * Tema del grupo de Telegram para un tipo de aviso. Cada tema tiene su variable
   * `TELEGRAM_THREAD_<TEMA>`; si no está, se usan las variables anteriores
   * (`TELEGRAM_THREAD_ID` para todo lo de ventas, `TELEGRAM_CONTENT_THREAD_ID` para
   * contenido y reseñas), así un despliegue con la configuración vieja sigue igual.
   */
  telegramThread(thread: TelegramThreadName): string | null {
    const legacy = process.env.TELEGRAM_THREAD_ID ?? null;
    const legacyContent = process.env.TELEGRAM_CONTENT_THREAD_ID ?? null;
    const own = process.env[`TELEGRAM_THREAD_${thread.toUpperCase()}`] || null;
    if (own) return own;
    if (thread === "contenido") return legacyContent;
    if (thread === "resenas") return legacyContent ?? legacy;
    return legacy;
  },
  // Anti-spam del formulario de cotización — opcional, se omite la
  // verificación si no está configurado (no bloquea el flujo).
  get recaptchaSecretKey() {
    return process.env.RECAPTCHA_SECRET_KEY ?? null;
  },
};
