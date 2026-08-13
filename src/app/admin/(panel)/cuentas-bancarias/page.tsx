/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
import {
  BankAccountManager,
  type BankAccountRow,
} from "@/components/admin/bank-account-manager";

export const metadata: Metadata = {
  title: "Cuentas bancarias",
  robots: { index: false, follow: false },
};

export default async function CuentasBancariasPage() {
  let rows: BankAccountRow[] = [];
  let error: string | null = null;

  try {
    const col = await collections.bankAccounts();
    const docs = await col.find({}).sort({ banco: 1 }).toArray();
    rows = docs.map((b) => ({
      id: b._id!.toString(),
      banco: b.banco,
      tipoCuenta: b.tipoCuenta,
      numero: b.numero,
      llave: b.llave,
      titular: b.titular,
    }));
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Error al cargar cuentas bancarias.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Cuentas bancarias
        </h1>
        <p className="mt-1 text-component">
          Cuentas guardadas para reutilizar en cuentas de cobro.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <BankAccountManager rows={rows} />
      )}
    </>
  );
}
