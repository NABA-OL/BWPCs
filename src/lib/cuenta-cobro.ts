/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
export interface CuentaCobroItemInput {
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  /** Renglón de recargo por el medio de pago (ver `withPaymentMethod`). */
  recargo?: boolean;
}

export interface CuentaCobroPartyInput {
  nombre: string;
  identificacion: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface CuentaCobroBankInput {
  banco: string;
  tipoCuenta: "Ahorros" | "Corriente" | null; // presente si tiene cuenta normal
  numero: string | null; // presente si tiene cuenta normal
  llave: string | null; // presente si tiene llave Bre-B
  titular: string;
}

export interface CuentaCobroSignerInput {
  nombre: string;
  cedula: string;
  firmaBase64: string | null;
}

export interface CuentaCobroInput {
  /** Solo informativo: el servidor lo asigna al crear y nunca lo cambia. */
  numero: string;
  /** Cuenta de usuario (id) que verá y pagará la cuenta de cobro; "" = ninguna. */
  userId: string;
  /** Medio de pago (id de `PaymentMethod`); "" = sin definir (lo elige el cliente). */
  formaPago: string;
  /** Enlace de pago con tarjeta creado en Bold ("" = ninguno). Solo aplica con tarjeta. */
  enlacePagoTarjeta: string;
  fecha: string; // ISO yyyy-mm-dd
  cliente: CuentaCobroPartyInput;
  cuentaBanco: CuentaCobroBankInput;
  firmante: CuentaCobroSignerInput;
  items: CuentaCobroItemInput[];
  descuentoPct: number;
}

/**
 * Recalcula subtotal/descuento/total desde los ítems crudos (fuente de verdad server-side).
 * El descuento se aplica solo a los ítems normales: el recargo del medio de pago no se descuenta.
 */
export function computeCuentaCobro(
  items: CuentaCobroItemInput[],
  descuentoPct: number,
): { subtotal: number; descuentoValor: number; total: number } {
  const line = (i: CuentaCobroItemInput) => Math.max(0, i.cantidad) * Math.max(0, i.valorUnitario);
  const subtotal = items.reduce((acc, i) => acc + line(i), 0);
  const discountable = items.filter((i) => !i.recargo).reduce((acc, i) => acc + line(i), 0);
  const pct = Math.min(100, Math.max(0, descuentoPct || 0));
  const descuentoValor = Math.round(discountable * (pct / 100));
  return { subtotal, descuentoValor, total: subtotal - descuentoValor };
}

/**
 * Deja los ítems según el medio de pago: quita el recargo anterior y, si el medio lo
 * tiene (`surchargePct` > 0, p. ej. tarjeta), agrega un renglón de recargo sobre el
 * valor base. Con Bre-B, transferencia o efectivo el total vuelve al valor original.
 */
export function withPaymentMethod(
  items: CuentaCobroItemInput[],
  descuentoPct: number,
  surchargePct: number,
  concept: string,
): { items: CuentaCobroItemInput[]; subtotal: number; descuentoValor: number; total: number } {
  const base = items.filter((i) => !i.recargo);
  const baseTotal = computeCuentaCobro(base, descuentoPct).total;
  const surcharge = surchargePct > 0 ? Math.round(baseTotal * (1 + surchargePct)) - baseTotal : 0;
  const next = surcharge > 0 ? [...base, { descripcion: concept, cantidad: 1, valorUnitario: surcharge, recargo: true }] : base;
  return { items: next, ...computeCuentaCobro(next, descuentoPct) };
}
