/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-25
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { CuentaCobro, Quote } from "@/lib/db/types";
import { estadoDe } from "./cuenta-cobro-estado.ts";

/**
 * Cuánto vale el precio de una cuenta de cobro que sale de una solicitud de compra (y cuánto puede
 * tener de antigüedad la cotización para que la cuenta se emita sola). Los precios cambian con el
 * dólar, las ofertas y la disponibilidad: pasado este plazo el admin los revisa antes de cobrar.
 */
export const VIGENCIA_HORAS = 72;

const HORA_MS = 3_600_000;

/** Mensaje al cliente cuando intenta pagar o cambiar el medio de una cuenta que ya venció. */
export const VENCIDA_ERROR =
  "Esta cuenta de cobro venció y los precios pueden haber cambiado. Envíala a revisión para que B & W los confirme antes de pagar.";

/** Hora en que vence una cuenta enviada en `now`. */
export function vencimientoDesde(now: Date): Date {
  return new Date(now.getTime() + VIGENCIA_HORAS * HORA_MS);
}

/** ¿Está "por pagar" con el precio ya vencido? (sin `venceEn` nunca vence). */
export function estaVencida(cuenta: Pick<CuentaCobro, "estado" | "venceEn">, now = new Date()): boolean {
  return estadoDe(cuenta) === "enviada" && !!cuenta.venceEn && new Date(cuenta.venceEn).getTime() <= now.getTime();
}

/** Última vez que se le envió la cotización al cliente (publicación o versión nueva). */
export function ultimoEnvioCotizacion(quote: Pick<Quote, "historial" | "publicadaEn">): Date | null {
  const last = quote.historial?.at(-1)?.enviadaEn ?? quote.publicadaEn ?? null;
  return last ? new Date(last) : null;
}

/** ¿La cotización se envió hace menos de la vigencia? Si no, el precio hay que revisarlo antes de emitir la cuenta. */
export function cotizacionVigente(quote: Pick<Quote, "historial" | "publicadaEn">, now = new Date()): boolean {
  const sent = ultimoEnvioCotizacion(quote);
  return !!sent && now.getTime() - sent.getTime() <= VIGENCIA_HORAS * HORA_MS;
}
