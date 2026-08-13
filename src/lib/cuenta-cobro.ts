/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
export interface CuentaCobroItemInput {
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
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
  numero: string;
  fecha: string; // ISO yyyy-mm-dd
  cliente: CuentaCobroPartyInput;
  cuentaBanco: CuentaCobroBankInput;
  firmante: CuentaCobroSignerInput;
  items: CuentaCobroItemInput[];
  descuentoPct: number;
}

/** Recalcula subtotal/descuento/total desde los ítems crudos (fuente de verdad server-side). */
export function computeCuentaCobro(
  items: CuentaCobroItemInput[],
  descuentoPct: number,
): { subtotal: number; descuentoValor: number; total: number } {
  const subtotal = items.reduce(
    (acc, i) => acc + Math.max(0, i.cantidad) * Math.max(0, i.valorUnitario),
    0,
  );
  const pct = Math.min(100, Math.max(0, descuentoPct || 0));
  const descuentoValor = Math.round(subtotal * (pct / 100));
  return { subtotal, descuentoValor, total: subtotal - descuentoValor };
}
