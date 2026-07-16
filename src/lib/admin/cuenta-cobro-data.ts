// Desarrollado por BlacKraken Solutions
import "server-only";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { getCatalogOptions, type CatalogOption } from "@/lib/admin/catalog-data";
import { suggestCode } from "@/lib/quote";
import type { ClientOption } from "@/components/admin/cuenta-cobro-builder";
import type { BankAccountOption } from "@/components/admin/cuenta-cobro-builder";
import type { SignerOption } from "@/components/admin/cuenta-cobro-builder";

export interface CuentaCobroBuilderData {
  clients: ClientOption[];
  bankAccounts: BankAccountOption[];
  signers: SignerOption[];
  catalog: CatalogOption[];
  nextNumero: string;
}

export async function getCuentaCobroBuilderData(): Promise<CuentaCobroBuilderData> {
  const settings = await getSettings();

  const [clientCol, bankCol, adminCol, cuentaCol] = await Promise.all([
    collections.clients(),
    collections.bankAccounts(),
    collections.admins(),
    collections.cuentasCobro(),
  ]);

  const [clientDocs, bankDocs, adminDocs, cuentaCount, catalog] = await Promise.all([
    clientCol.find({}).sort({ nombre: 1 }).toArray(),
    bankCol.find({}).sort({ banco: 1 }).toArray(),
    adminCol.find({}).sort({ usuario: 1 }).toArray(),
    cuentaCol.countDocuments(),
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
    nextNumero: suggestCode(new Date().getFullYear(), cuentaCount + 1),
  };
}
