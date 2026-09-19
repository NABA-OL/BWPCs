/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { expirationNanos } from "@/lib/bold-signature";

const API = "https://integrations.api.bold.co/online/link/v1";
const TIMEOUT_MS = 8_000;

export type BoldMode = "test" | "live";

export interface BoldConfig {
  apiKey: string;
  /** Llave secreta (validar webhooks). En pruebas Bold firma con clave vacía. */
  secret: string;
  mode: BoldMode;
}

const isProductionDeploy = () =>
  process.env.VERCEL_ENV === "production" || (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV);

/**
 * Configuración de Bold, o null si no está lista (y el pago con tarjeta no se ofrece).
 * `BOLD_MODE` = test | live; sin ella, producción usa live y todo lo demás test. Nunca se
 * acepta modo de pruebas en producción: su firma de webhook (clave vacía) se puede falsificar.
 */
export function boldConfig(): BoldConfig | null {
  const apiKey = process.env.BOLD_API_KEY;
  if (!apiKey) return null;
  const forced = process.env.BOLD_MODE;
  const mode: BoldMode = forced === "live" || forced === "test" ? forced : isProductionDeploy() ? "live" : "test";
  if (mode === "test" && isProductionDeploy()) {
    console.error("[bold] BOLD_MODE=test no se permite en producción: el pago con tarjeta queda desactivado.");
    return null;
  }
  const secret = process.env.BOLD_SECRET_KEY ?? "";
  if (mode === "live" && !secret) {
    console.error("[bold] Falta BOLD_SECRET_KEY: el pago con tarjeta queda desactivado.");
    return null;
  }
  return { apiKey, secret, mode };
}

export class BoldError extends Error {}

async function boldFetch(config: BoldConfig, path: string, init: RequestInit = {}) {
  try {
    return await fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: `x-api-key ${config.apiKey}`, "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new BoldError("No pudimos conectar con Bold. Intenta de nuevo en un momento.");
  }
}

interface CreateLinkInput {
  totalCop: number;
  reference: string;
  /** Sin "&" ni símbolos raros: Bold los elimina. */
  description: string;
  payerEmail: string;
  expiresAtMs: number;
  /** Solo https (Bold no acepta otra cosa); en desarrollo local se omite. */
  callbackUrl?: string;
}

/** Crea un enlace de pago con tarjeta por un valor fijo. */
export async function createPaymentLink(config: BoldConfig, input: CreateLinkInput) {
  // La vigencia va como número JSON de 19 dígitos: se arma el texto a mano para no perder precisión.
  const body = JSON.stringify({
    amount_type: "CLOSE",
    amount: { currency: "COP", total_amount: input.totalCop, tip_amount: 0 },
    reference: input.reference,
    description: input.description,
    expiration_date: "__EXP__",
    payment_methods: ["CREDIT_CARD"],
    payer_email: input.payerEmail,
    ...(input.callbackUrl?.startsWith("https://") ? { callback_url: input.callbackUrl } : {}),
  }).replace('"__EXP__"', expirationNanos(input.expiresAtMs));

  const res = await boldFetch(config, "", { method: "POST", body });
  const data = (await res.json().catch(() => null)) as {
    payload?: { payment_link?: string; url?: string };
    errors?: unknown[];
  } | null;
  const linkId = data?.payload?.payment_link;
  const url = data?.payload?.url;
  if (!res.ok || !linkId || !url) {
    console.error("[bold] no se pudo crear el enlace", res.status, JSON.stringify(data?.errors ?? null));
    throw new BoldError("No pudimos crear el enlace de pago con tarjeta. Prueba con Bre-B o transferencia.");
  }
  return { linkId, url };
}

export type BoldLinkStatus = "ACTIVE" | "PROCESSING" | "PAID" | "REJECTED" | "CANCELLED" | "EXPIRED";

export interface BoldLink {
  status: BoldLinkStatus | string;
  totalCop: number;
  reference: string | null;
  /** Id del pago en Bold cuando ya hay uno. */
  transactionId: string | null;
  isSandbox: boolean;
}

/** Estado de un enlace (consulta de servidor a servidor, con nuestra llave: es una fuente confiable). */
export async function getPaymentLink(config: BoldConfig, linkId: string): Promise<BoldLink> {
  const res = await boldFetch(config, `/${encodeURIComponent(linkId)}`, { method: "GET" });
  const data = (await res.json().catch(() => null)) as {
    status?: string;
    total?: number;
    reference?: string | null;
    transaction_id?: string | null;
    is_sandbox?: boolean;
  } | null;
  if (!res.ok || !data?.status) {
    console.error("[bold] no se pudo consultar el enlace", res.status);
    throw new BoldError("No pudimos consultar el pago en Bold. Intenta de nuevo en un momento.");
  }
  return {
    status: data.status,
    totalCop: Math.round(Number(data.total) || 0),
    reference: data.reference ?? null,
    transactionId: data.transaction_id ?? null,
    isSandbox: data.is_sandbox === true,
  };
}
