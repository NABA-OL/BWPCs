/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { betterAuth } from "better-auth";
import { createAuthMiddleware, isAPIError } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { randomBytes, randomInt } from "node:crypto";
import { MongoClient } from "mongodb";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { otpEmail } from "@/lib/email/otp-email";
import { sendEmail } from "@/lib/email/resend";
import { AVATAR_STYLES } from "@/lib/avatar-styles";
import { collections } from "@/lib/db/collections";
import { siteConfig } from "@/lib/site-config";
import { runGuards } from "@/lib/user-auth/guards";
import {
  notifyEmailChanged,
  notifyPasswordChanged,
} from "@/lib/user-auth/notices";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { deleteRevisionsOfUser } from "@/lib/quote-requests";
import { deleteUserReview, detachKeptReview } from "@/lib/reviews/reviews";
import { deleteAllUserPhotos } from "@/lib/uploads/review-photos";
import { notifyDeletedAccount, notifyNewAccount } from "@/lib/user-auth/account-telegram";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { siteUrl } from "@/lib/user-auth/site-url";

/**
 * Autenticación de USUARIOS públicos (Better Auth). Está separada a propósito
 * de la del admin (`lib/auth`, cookie `bw_session`, `AUTH_SECRET`): otro
 * secreto, otro prefijo de cookie y colecciones propias, para que un token de
 * usuario nunca valide contra /admin.
 */

const isProd = process.env.NODE_ENV === "production";
const OTP_MINUTES = 5;

// Cliente propio, cacheado en globalThis para sobrevivir al hot-reload. Se
// conecta en la primera operación (comportamiento del driver 7).
const globalForAuth = globalThis as unknown as { _userAuthMongo?: MongoClient };

function getMongoClient(): MongoClient {
  if (!globalForAuth._userAuthMongo) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Falta la variable de entorno MONGODB_URI.");
    globalForAuth._userAuthMongo = new MongoClient(uri);
  }
  return globalForAuth._userAuthMongo;
}

/**
 * Secreto de las sesiones de usuarios. Con las cuentas activas es obligatorio,
 * de al menos 32 caracteres y distinto de AUTH_SECRET (el del admin): sin esto
 * Better Auth caería en silencio en AUTH_SECRET. Apagadas (las rutas dan 404) no
 * se exige, para no romper el build de entornos sin la variable.
 */
function authSecret(): string | undefined {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!ACCOUNTS_ENABLED) return secret;
  if (!secret || secret.length < 32 || secret === process.env.AUTH_SECRET) {
    throw new Error(
      "BETTER_AUTH_SECRET falta, tiene menos de 32 caracteres o es igual a AUTH_SECRET.",
    );
  }
  return secret;
}

/**
 * Con las cuentas activas TODO lo que necesitan debe estar configurado. Sin esto
 * el fallo es silencioso y confuso: sin Upstash el límite de intentos falla
 * cerrado y todo responde "demasiados intentos"; sin Resend no salen los
 * códigos; sin reCAPTCHA nadie pasa. Falla el build/arranque con la lista exacta.
 */
function assertAccountsEnv() {
  if (!ACCOUNTS_ENABLED) return;
  const required = [
    "MONGODB_URI",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "RECAPTCHA_SECRET_KEY",
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
  ];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `NEXT_PUBLIC_ACCOUNTS_ENABLED=true pero faltan variables de entorno: ${missing.join(", ")}.`,
    );
  }
}

assertAccountsEnv();

// Correo anterior de quien está cambiando su correo, hasta que el cambio se
// confirma (el aviso de seguridad va al correo viejo).
const pendingEmailChange = new Map<string, string>();

const client = getMongoClient();

export const auth = betterAuth({
  appName: "B & W",
  baseURL: siteUrl,
  basePath: "/api/user-auth",
  secret: authSecret(),
  trustedOrigins: [siteUrl],
  database: mongodbAdapter(client.db(process.env.MONGODB_DB ?? "bwpcs"), {
    client,
  }),
  user: {
    modelName: "users",
    // Borrado de cuenta: exige la contraseña (ver guards.ts).
    deleteUser: {
      enabled: true,
      // Selecciones guardadas: se borran. Solicitudes y cotizaciones: se
      // conservan como registro comercial pero sin vínculo con la cuenta, y las
      // cotizaciones vuelven a borrador (ya no tienen a quién mostrarse).
      beforeDelete: async (user) => {
                // Reseña aprobada que la autora eligió conservar: queda sin vínculo a la
        // cuenta (y sus fotos con ella); si no, se borra con todo lo demás.
        const keptReview = await detachKeptReview(user.id);
        await deleteAllUserPhotos(user.id);
        if (!keptReview) await deleteUserReview(user.id);
        try {
          revalidatePath("/"); // la reseña (si estaba aprobada) sale de la home
        } catch {
          // fuera de un contexto de petición no hay caché que invalidar
        }
        const [leads, quotes, clients] = await Promise.all([
          collections.leads(),
          collections.quotes(),
          collections.clients(),
        ]);
        // El cliente creado por la propia persona (compra) se borra con su cuenta; el que
        // el admin registró a mano queda como registro suyo, sin vínculo con la cuenta.
        await clients.deleteMany({ userId: user.id, origen: { $in: ["compra", "cuenta"] } });
        await clients.updateMany({ userId: user.id }, { $set: { userId: null } });
        await leads.deleteMany({ userId: user.id, tipo: "guardada" });
        await leads.updateMany({ userId: user.id }, { $set: { userId: null } });
        await quotes.updateMany(
          { userId: user.id },
          {
            $set: {
              userId: null,
              estado: "borrador",
              publicadaEn: null,
              avisoEnviadoEn: null,
            },
            $unset: { estadoComercial: "" },
          },
        );
        await deleteRevisionsOfUser(user.id);
        // Las cuentas de cobro son soporte contable: se conservan, sin vínculo con la cuenta.
        await (await collections.cuentasCobro()).updateMany({ userId: user.id }, { $set: { userId: null } });
        notifyDeletedAccount(user.name);
      },
    },
    additionalFields: {
      phone: { type: "string", required: true, input: true },
      // Aceptación de términos y tratamiento de datos (Ley 1581): la envía el
      // cliente; la fecha y la versión las fija el servidor (databaseHooks).
      acceptTerms: { type: "boolean", required: true, input: true },
      consentAt: { type: "date", required: false, input: false },
      consentVersion: { type: "string", required: false, input: false },
      // Avatar DiceBear: se guarda estilo + semilla, no la imagen (ver lib/avatar).
      avatarStyle: { type: "string", required: false, input: true },
      avatarSeed: { type: "string", required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            consentAt: new Date(),
            consentVersion: siteConfig.legal.versionPolitica,
            // Avatar inicial al azar; la persona lo cambia en su perfil.
            avatarStyle: AVATAR_STYLES[randomInt(AVATAR_STYLES.length)].id,
            avatarSeed: randomBytes(9).toString("base64url"),
          },
        }),
      },
      update: {
        before: async (data, context) => {
          const current = context?.context.session?.user;
          const next = typeof data.email === "string" ? data.email : undefined;
          if (current && next && next.toLowerCase() !== current.email.toLowerCase()) {
            pendingEmailChange.set(current.id, current.email);
          }
          return { data };
        },
        after: async (user) => {
          const oldEmail = pendingEmailChange.get(user.id);
          if (!oldEmail) return;
          pendingEmailChange.delete(user.id);
          if (oldEmail.toLowerCase() !== user.email.toLowerCase()) {
            notifyEmailChanged(oldEmail, user.email);
          }
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      await runGuards({
        path: ctx.path,
        body: ctx.body,
        headers: ctx.headers,
        viaHttp: ctx.request !== undefined,
      });
      // El aviso "cerramos tus otras sesiones" debe ser cierto: no lo decide el
      // cliente (un atacante con la sesión robada lo omitiría).
      if (ctx.path === "/change-password") {
        return {
          context: { ...ctx, body: { ...ctx.body, revokeOtherSessions: true } },
        };
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (isAPIError(ctx.context.returned)) return;
      // Registro: misma respuesta exista o no el correo. Better Auth devuelve un
      // usuario sintético para correos ya registrados, distinguible del real.
      if (ctx.path === "/sign-up/email") return ctx.json({ ok: true });
      if (ctx.path === "/email-otp/verify-email") {
        // Solo el primer correo verificado (registro): el cambio de correo usa otra ruta.
        const returned = ctx.context.returned as { user?: { name?: string } } | undefined;
        notifyNewAccount(returned?.user?.name);
      } else if (ctx.path === "/email-otp/reset-password") {
        const email = (ctx.body as { email?: unknown } | undefined)?.email;
        if (typeof email === "string") notifyPasswordChanged(email);
      } else if (ctx.path === "/change-password") {
        const returned = ctx.context.returned as
          | { user?: { email?: string } }
          | undefined;
        if (returned?.user?.email) notifyPasswordChanged(returned.user.email);
      }
    }),
  },
  session: { modelName: "user_sessions" },
  account: { modelName: "user_accounts" },
  verification: { modelName: "user_verifications" },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    // Al restablecer la contraseña se cierran todas las sesiones abiertas.
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: { autoSignInAfterVerification: true },
  advanced: {
    cookiePrefix: "bw_user",
    useSecureCookies: isProd,
    ipAddress: { ipAddressHeaders: ["x-real-ip"] },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customStorage: rateLimitStorage,
    customRules: {
      // Baratas y sin efectos: no deben gastar Redis ni fallar si Redis cae.
      "/get-session": false,
      "/sign-out": false,
      "/sign-in/email": { window: 600, max: 5 },
      "/sign-up/email": { window: 600, max: 5 },
      "/email-otp/send-verification-otp": { window: 60, max: 3 },
      "/email-otp/verify-email": { window: 600, max: 10 },
      "/email-otp/request-password-reset": { window: 60, max: 3 },
      "/email-otp/reset-password": { window: 600, max: 10 },
      "/email-otp/change-email": { window: 600, max: 10 },
      "/change-password": { window: 600, max: 5 },
      "/delete-user": { window: 600, max: 5 },
    },
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      // Sin auto-registro por código: las cuentas nacen solo en /sign-up/email.
      disableSignUp: true,
      // Cambio de correo: el código llega al correo NUEVO (la contraseña se
      // exige en la server action, ver cuenta/seguridad/actions.ts).
      changeEmail: { enabled: true },
      // Los códigos se guardan con hash: quien lea la BD no puede usarlos.
      storeOTP: "hashed",
      otpLength: 6,
      expiresIn: OTP_MINUTES * 60,
      allowedAttempts: 3,
      async sendVerificationOTP({ email, otp, type }) {
        // Sin await: evita filtrar por tiempo si el correo existe o no.
        after(() =>
          sendEmail({ to: email, ...otpEmail({ otp, type, minutes: OTP_MINUTES }) }).catch(
            (error: unknown) => {
              console.error("[user-auth] fallo al enviar OTP", error);
            },
          ),
        );
      },
    }),
    nextCookies(), // siempre el último
  ],
});
