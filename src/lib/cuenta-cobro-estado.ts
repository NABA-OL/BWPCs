/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { CuentaCobro, CuentaCobroEstado } from "@/lib/db/types";

export const ESTADO_LABEL: Record<CuentaCobroEstado, string> = {
  borrador: "Borrador",
  enviada: "Por pagar",
  correccion_solicitada: "Corrección pedida",
  pago_reportado: "Pago por confirmar",
  pagada: "Pagada",
  anulada: "Anulada",
};

/** Las cuentas anteriores a los estados no lo traen: se consideran ya emitidas. */
export function estadoDe(cuenta: Pick<CuentaCobro, "estado">): CuentaCobroEstado {
  return cuenta.estado ?? "enviada";
}

/** El contenido solo se edita antes de enviarlo o cuando el cliente pidió corrección. */
export function esEditable(cuenta: Pick<CuentaCobro, "estado">): boolean {
  return cuenta.estado === undefined || cuenta.estado === "borrador" || cuenta.estado === "correccion_solicitada";
}

/** Estados que el cliente puede ver (nunca el borrador). */
export const ESTADOS_VISIBLES: readonly CuentaCobroEstado[] = [
  "enviada",
  "correccion_solicitada",
  "pago_reportado",
  "pagada",
  "anulada",
];

/** Lo que falta para poder enviar la cuenta al cliente (vacío = lista para enviar). */
export function sendMissing(
  cuenta: Pick<CuentaCobro, "userId" | "cliente" | "cuentaBanco" | "firmante" | "total" | "formaPago" | "enlacePagoTarjeta">,
  /** La tarjeta se cobra con un enlace que crea el admin (sobre el tope de Bold o sin Bold). */
  cardManual: boolean,
): string[] {
  const card = cuenta.formaPago === "tarjeta";
  return [
    !cuenta.userId && "elige la cuenta del cliente",
    !cuenta.cliente.identificacion.trim() && "falta su cédula o NIT",
    !card && !cuenta.cuentaBanco.numero && !cuenta.cuentaBanco.llave && "falta la cuenta bancaria o la llave Bre-B",
    card && cardManual && !cuenta.enlacePagoTarjeta && "falta el enlace de pago con tarjeta",
    !cuenta.firmante.nombre.trim() && "falta el firmante",
    cuenta.total <= 0 && "el total es cero",
  ].filter((m): m is string => typeof m === "string");
}
