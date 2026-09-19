/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { PaymentMethod, QuoteOption, Settings } from "@/lib/db/types";
import { SHOW_PSE } from "./site-config.ts";

export const PAYMENT_METHODS: readonly { id: PaymentMethod; label: string }[] = [
  { id: "transferencia", label: "Transferencia bancaria" },
  { id: "bre-b", label: "Bre-B" },
  { id: "efectivo", label: "Efectivo" },
  { id: "tarjeta", label: "Tarjeta" },
  { id: "pse", label: "PSE" },
];

/** Medios que se ofrecen al cliente (PSE queda oculto mientras `SHOW_PSE` sea false). */
export const OFFERED_PAYMENT_METHODS = PAYMENT_METHODS.filter((m) => m.id !== "pse" || SHOW_PSE);

/** Tope de Bold por enlace de pago con tarjeta: sobre este valor no se ofrece la tarjeta. */
export const CARD_MAX_COP = 5_000_000;

export const PAYMENT_LABEL: Record<PaymentMethod, string> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.id, m.label]),
) as Record<PaymentMethod, string>;

/** Total de una opción según el medio de pago (tarjeta y PSE llevan recargo). */
export function totalFor(method: PaymentMethod, totales: QuoteOption["totales"]): number {
  if (method === "tarjeta") return totales.conTarjeta;
  if (method === "pse") return totales.conPse;
  return totales.base;
}

/** Recargo (fracción, p. ej. 0.06) que lleva un medio de pago según la configuración. */
export function surchargePct(method: PaymentMethod, medios: Settings["mediosPago"]): number {
  if (method === "tarjeta") return medios.tarjeta;
  if (method === "pse") return medios.pse;
  if (method === "bre-b") return medios.breB;
  return 0;
}

/** Texto del renglón de recargo en la cuenta de cobro. */
export const surchargeConcept = (method: PaymentMethod) =>
  `Recargo por pago con ${PAYMENT_LABEL[method].toLowerCase()}`;
