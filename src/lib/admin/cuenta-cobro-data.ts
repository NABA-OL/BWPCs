/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { getCatalogOptions, type CatalogOption } from "@/lib/admin/catalog-data";
import { boldAvailable } from "@/lib/bold-payments";
import { peekNextCuentaNumero } from "@/lib/cuentas-cobro";
import { listPublicUsers } from "@/lib/user-auth/users";
import type { PickerUser } from "@/components/admin/quote-user-picker";
import type { ClientOption } from "@/components/admin/cuenta-cobro-builder";
import type { BankAccountOption } from "@/components/admin/cuenta-cobro-builder";
import type { SignerOption } from "@/components/admin/cuenta-cobro-builder";

export interface CuentaCobroBuilderData {
  clients: ClientOption[];
  bankAccounts: BankAccountOption[];
  signers: SignerOption[];
  catalog: CatalogOption[];
  servicioBase: number;
  users: PickerUser[];
  /** Recargo de la tarjeta (fracción) y si Bold cobra solo: para armar el formulario según el medio de pago. */
  tarjetaPct: number;
  boldEnabled: boolean;
  /** Número que se asignará al guardar una cuenta nueva (solo informativo). */
  nextNumero: string;
}

export async function getCuentaCobroBuilderData(): Promise<CuentaCobroBuilderData> {
  const settings = await getSettings();

  const [clientCol, bankCol, adminCol] = await Promise.all([
    collections.clients(),
    collections.bankAccounts(),
    collections.admins(),
  ]);

  const [clientDocs, bankDocs, adminDocs, users, catalog] = await Promise.all([
    clientCol.find({}).sort({ nombre: 1 }).toArray(),
    bankCol.find({}).sort({ banco: 1 }).toArray(),
    adminCol.find({}).sort({ usuario: 1 }).toArray(),
    listPublicUsers(),
    getCatalogOptions(settings),
  ]);

  return {
    clients: clientDocs.map((c) => ({
      id: c._id!.toString(),
      nombre: c.nombre,
      identificacion: c.identificacion,
      direccion: c.direccion,
      telefono: c.telefono,
      email: c.email,
      userId: c.userId ?? "",
    })),
    bankAccounts: bankDocs.map((b) => ({
      id: b._id!.toString(),
      banco: b.banco,
      tipoCuenta: b.tipoCuenta,
      numero: b.numero,
      llave: b.llave,
      titular: b.titular,
    })),
    signers: adminDocs.map((a) => ({
      id: a._id!.toString(),
      usuario: a.usuario,
      nombre: a.nombreCompleto?.trim() || a.usuario,
      cedula: a.cedula ?? "",
      firmaBase64: a.firmaBase64 ?? null,
    })),
    catalog,
    servicioBase: settings.servicioBase,
    users,
    tarjetaPct: settings.mediosPago.tarjeta,
    boldEnabled: boldAvailable(),
    nextNumero: await peekNextCuentaNumero(),
  };
}
