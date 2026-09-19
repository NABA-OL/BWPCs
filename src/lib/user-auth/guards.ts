/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { createHash } from "node:crypto";
import { APIError } from "better-auth/api";
import { PHONE_CO } from "@/lib/user-auth/profile";
import { AVATAR_SEED_RE, isAvatarStyle } from "@/lib/avatar-styles";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import {
  ensureAuthIndexes,
  isEmailVerified,
  purgeUnverifiedUsers,
} from "@/lib/user-auth/users";

/**
 * Defensas de los endpoints públicos de Better Auth que se ejecutan ANTES del
 * handler (hook `before`): reCAPTCHA estricto, límite por correo (el límite por
 * IP de Better Auth no frena a quien rota IPs) y validación de datos.
 */

export const RECAPTCHA_HEADER = "x-recaptcha-token";

interface Guard {
  action: string;
  /** false: no exige reCAPTCHA (paso que ya exige un código de un solo uso). */
  captcha?: boolean;
  /** Intentos por correo dentro de la ventana (segundos), propios de este endpoint. */
  emailLimit?: { max: number; window: number };
  /** El endpoint ENVÍA un correo: aplica el límite compartido por correo y el tope global. */
  mail?: boolean;
}

// Correos de código que puede recibir una misma persona (compartido entre registro,
// reenvío y recuperación). Alias de Gmail (puntos, +etiqueta) cuentan como uno.
const MAIL_PER_EMAIL = [
  { window: 3600, max: 5 },
  { window: 86400, max: 12 },
] as const;

// Tope global de correos de código por día. El plan gratuito de Resend permite 100
// al día y comparte cupo con los avisos de cotización (35, ver `lib/email/budget.ts`):
// al llegar aquí se pausan los registros nuevos en vez de dejar sin cupo lo demás.
// Súbelo al pasar a un plan de pago.
const MAX_OTP_MAILS_PER_DAY = 55;

const GUARDS: Record<string, Guard> = {
  "/sign-up/email": { action: "user_register", mail: true },
  "/sign-in/email": {
    action: "user_login",
    emailLimit: { max: 10, window: 900 },
  },
  "/email-otp/send-verification-otp": { action: "user_send_code", mail: true },
  "/email-otp/request-password-reset": { action: "user_reset", mail: true },
  "/email-otp/reset-password": {
    action: "user_reset_confirm",
    captcha: false,
    emailLimit: { max: 10, window: 900 },
  },
  "/send-verification-email": { action: "user_send_code", mail: true },
};

// Endpoints que no se ofrecen: login sin contraseña por código y la
// comprobación suelta de códigos (sirve para adivinarlos sin gastar intentos
// de la operación real).
const BLOCKED_PATHS = new Set([
  "/sign-in/email-otp",
  "/email-otp/check-verification-otp",
]);

// Único conjunto de endpoints de Better Auth que se atiende por HTTP (los que usa
// la interfaz). Todo lo demás —incluido lo que agreguen futuras versiones— responde
// 404: por defecto se niega. Las llamadas `auth.api.*` desde el servidor no pasan
// por esta lista.
const HTTP_ALLOWED = new Set([
  "/get-session",
  "/sign-out",
  "/sign-up/email",
  "/sign-in/email",
  "/sign-in/social",
  "/callback/:id",
  "/email-otp/send-verification-otp",
  "/email-otp/verify-email",
  "/email-otp/request-password-reset",
  "/email-otp/reset-password",
  "/email-otp/change-email",
  "/change-password",
  "/update-user",
]);

// Solo se pueden llamar desde el servidor (server actions), no por HTTP: allí
// se exige la contraseña antes de enviar el código al correo nuevo.
const SERVER_ONLY_PATHS = new Set(["/email-otp/request-email-change"]);

// Rutas internas (misma regla que `safeNextPath`): una "/" seguida de algo que no sea otra "/" ni "\\".
const SAFE_PATH = /^\/(?![/\\])[^\x00-\x1f\x7f\\]*$/;
const SOCIAL_BODY_KEYS = new Set(["provider", "callbackURL", "errorCallbackURL"]);
const TOO_MANY = "Demasiados intentos. Espera unos minutos e intenta de nuevo.";

interface GuardContext {
  path: string;
  body?: unknown;
  headers?: Headers;
  /** true si la llamada llegó por HTTP; false si es `auth.api.*` desde el servidor. */
  viaHttp: boolean;
}

function bodyField(body: unknown, key: string): unknown {
  return typeof body === "object" && body !== null
    ? (body as Record<string, unknown>)[key]
    : undefined;
}

/**
 * Clave estable de un buzón para los límites: minúsculas, sin "+etiqueta" y, en
 * Gmail, sin puntos (a.b+x@gmail.com y ab@gmail.com son el mismo buzón). No es la
 * identidad de la cuenta, solo la clave del límite; se guarda con hash.
 */
function emailLimitKey(email: string): string {
  const [rawLocal = "", rawDomain = ""] = email.trim().toLowerCase().split("@");
  const domain = rawDomain === "googlemail.com" ? "gmail.com" : rawDomain;
  let local = rawLocal.split("+")[0];
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return createHash("sha256").update(`${local}@${domain}`).digest("hex");
}

/** Valida nombre y teléfono; lanza APIError 400 con mensaje en español. */
function assertProfile(body: unknown, { required }: { required: boolean }) {
  const name = bodyField(body, "name");
  if (name !== undefined || required) {
    const n = typeof name === "string" ? name.trim() : "";
    if (n.length < 2 || n.length > 80) {
      throw new APIError("BAD_REQUEST", {
        message: "El nombre debe tener entre 2 y 80 caracteres.",
      });
    }
  }
  const phone = bodyField(body, "phone");
  if (phone !== undefined || required) {
    if (typeof phone !== "string" || !PHONE_CO.test(phone)) {
      throw new APIError("BAD_REQUEST", {
        message: "Escribe un celular colombiano de 10 dígitos (ej. 3001234567).",
      });
    }
  }
}

/** Avatar: estilo de la lista y semilla corta alfanumérica. */
function assertAvatar(body: unknown) {
  const style = bodyField(body, "avatarStyle");
  if (style !== undefined && !isAvatarStyle(style)) {
    throw new APIError("BAD_REQUEST", { message: "Estilo de avatar no válido." });
  }
  const seed = bodyField(body, "avatarSeed");
  if (seed !== undefined && (typeof seed !== "string" || !AVATAR_SEED_RE.test(seed))) {
    throw new APIError("BAD_REQUEST", { message: "Semilla de avatar no válida." });
  }
}

// Campos de la cuenta que no se editan desde el perfil.
const PROFILE_LOCKED_FIELDS = ["acceptTerms", "image", "email"];

export async function runGuards({
  path,
  body,
  headers,
  viaHttp,
}: GuardContext) {
  if (BLOCKED_PATHS.has(path)) {
    throw new APIError("NOT_FOUND", { message: "No disponible." });
  }

  // La devolución de Google llega como /callback/google (Better Auth la registra como /callback/:id).
  if (viaHttp && !HTTP_ALLOWED.has(path) && !/^\/callback\/[a-z]+$/.test(path)) {
    throw new APIError("NOT_FOUND", { message: "No disponible." });
  }

  if (viaHttp && SERVER_ONLY_PATHS.has(path)) {
    throw new APIError("NOT_FOUND", { message: "No disponible." });
  }

  // Inicio de sesión con Google: solo ese proveedor, solo rutas internas de retorno y nada más
  // (sin `idToken`, `scopes` ni datos adicionales que alteren lo que se pide o se acepta).
  if (path === "/sign-in/social") {
    if (bodyField(body, "provider") !== "google") {
      throw new APIError("NOT_FOUND", { message: "No disponible." });
    }
    const keys = typeof body === "object" && body !== null ? Object.keys(body) : [];
    if (keys.some((k) => !SOCIAL_BODY_KEYS.has(k))) {
      throw new APIError("BAD_REQUEST", { message: "Solicitud no válida." });
    }
    for (const key of ["callbackURL", "errorCallbackURL"]) {
      const value = bodyField(body, key);
      if (value !== undefined && (typeof value !== "string" || !SAFE_PATH.test(value))) {
        throw new APIError("BAD_REQUEST", { message: "Dirección de retorno no válida." });
      }
    }
    return;
  }

  if (path === "/delete-user") {
    // Por HTTP no se atiende (ver HTTP_ALLOWED); desde el servidor la acción decide: con contraseña,
    // o sin ella si la cuenta es solo de Google (entonces Better Auth exige una sesión reciente).
    const password = bodyField(body, "password");
    if (viaHttp && (typeof password !== "string" || password.length === 0)) {
      throw new APIError("BAD_REQUEST", {
        message: "Escribe tu contraseña para eliminar la cuenta.",
      });
    }
    return;
  }

  if (path === "/update-user") {
    if (PROFILE_LOCKED_FIELDS.some((f) => bodyField(body, f) !== undefined)) {
      throw new APIError("BAD_REQUEST", { message: "Ese dato no se puede editar." });
    }
    assertProfile(body, { required: false });
    assertAvatar(body);
    return;
  }

  // Un correo ya verificado no admite este paso: si no, un código enviado a un
  // correo ajeno serviría de "login sin contraseña" sin aviso ni cierre de
  // sesiones. Mismo error que un código incorrecto para no revelar la cuenta.
  if (path === "/email-otp/verify-email") {
    const target = bodyField(body, "email");
    if (typeof target === "string" && (await isEmailVerified(target))) {
      throw new APIError("BAD_REQUEST", { message: "Invalid OTP", code: "INVALID_OTP" });
    }
    return;
  }

  const guard = GUARDS[path];
  if (!guard) return;

  // Solo el código de verificación de correo; los demás tipos no se ofrecen.
  if (
    path === "/email-otp/send-verification-otp" &&
    bodyField(body, "type") !== "email-verification"
  ) {
    throw new APIError("BAD_REQUEST", { message: "Tipo de código no válido." });
  }

  if (guard.captcha !== false) {
    const captcha = await verifyRecaptcha(
      headers?.get(RECAPTCHA_HEADER) ?? undefined,
      guard.action,
      { strict: true },
    );
    if (!captcha.ok) {
      throw new APIError("BAD_REQUEST", {
        message: captcha.error ?? "No se pudo verificar la solicitud.",
      });
    }
  }

  const email = bodyField(body, "email");
  if (typeof email === "string" && email.length > 0 && email.length <= 254) {
    const key = emailLimitKey(email);
    if (guard.emailLimit) {
      const { allowed } = await rateLimitStorage.consume(
        `email:${path}:${key}`,
        guard.emailLimit,
      );
      if (!allowed) throw new APIError("TOO_MANY_REQUESTS", { message: TOO_MANY });
    }
    if (guard.mail) {
      for (const rule of MAIL_PER_EMAIL) {
        const { allowed } = await rateLimitStorage.consume(
          `mail:${key}:${rule.window}`,
          rule,
        );
        if (!allowed) throw new APIError("TOO_MANY_REQUESTS", { message: TOO_MANY });
      }
      // El tope global se gasta al final: quien insiste con un solo correo ya
      // se detuvo arriba y no agota el cupo de todos.
      const { allowed } = await rateLimitStorage.consume("mail:global", {
        window: 86400,
        max: MAX_OTP_MAILS_PER_DAY,
      });
      if (!allowed) {
        throw new APIError("TOO_MANY_REQUESTS", {
          message: "Estamos recibiendo muchas solicitudes. Intenta de nuevo más tarde.",
        });
      }
    }
  }

  if (path === "/sign-up/email") {
    assertProfile(body, { required: true });
    if (bodyField(body, "image") !== undefined) {
      throw new APIError("BAD_REQUEST", { message: "Ese dato no se puede enviar." });
    }
    if (bodyField(body, "acceptTerms") !== true) {
      throw new APIError("BAD_REQUEST", {
        message: "Debes aceptar los términos y la política de datos.",
      });
    }
    // El último registro gana: se borra un registro anterior sin verificar del
    // mismo correo, para que nadie pueda dejar una cuenta "pre-creada" con su
    // contraseña a nombre de otra persona (ver purgeUnverifiedUsers).
    await ensureAuthIndexes();
    if (typeof email === "string") await purgeUnverifiedUsers(email);
  }
}
