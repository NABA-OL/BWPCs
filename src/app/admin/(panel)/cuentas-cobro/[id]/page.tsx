/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { getCuentaCobroBuilderData } from "@/lib/admin/cuenta-cobro-data";
import { CuentaCobroBuilder } from "@/components/admin/cuenta-cobro-builder";
import { CuentaCobroStatusPanel } from "@/components/admin/cuenta-cobro-status-panel";
import { esEditable } from "@/lib/cuenta-cobro-estado";
import { getPublicUser } from "@/lib/user-auth/users";
import type { CuentaCobroInput } from "@/lib/cuenta-cobro";

export const metadata: Metadata = {
  title: "Editar cuenta de cobro",
  robots: { index: false, follow: false },
};

export default async function EditarCuentaCobroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const col = await collections.cuentasCobro();
  const cuenta = await col.findOne({ _id: new ObjectId(id) });
  if (!cuenta) notFound();

  const [data, owner] = await Promise.all([
    getCuentaCobroBuilderData(),
    cuenta.userId ? getPublicUser(cuenta.userId) : null,
  ]);

  const initial: CuentaCobroInput = {
    numero: cuenta.numero,
    userId: cuenta.userId ?? "",
    fecha: new Date(cuenta.fecha).toISOString().slice(0, 10),
    cliente: { ...cuenta.cliente },
    cuentaBanco: { ...cuenta.cuentaBanco },
    firmante: { ...cuenta.firmante },
    items: cuenta.items.map((i) => ({ ...i })),
    descuentoPct: cuenta.descuentoPct,
  };

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Cuenta de cobro {cuenta.numero}
        </h1>
        <p className="mt-1 text-component">
          {esEditable(cuenta) ? "Edita y descarga el PDF." : "Ya no se puede editar en este estado. Puedes descargar el PDF."}
        </p>
      </header>

      <CuentaCobroStatusPanel
        cuenta={cuenta}
        ownerLabel={owner ? `${owner.name} (${owner.email})` : null}
      />

      <CuentaCobroBuilder
        id={id}
        users={data.users}
        locked={!esEditable(cuenta)}
        initial={initial}
        clients={data.clients}
        bankAccounts={data.bankAccounts}
        signers={data.signers}
        catalog={data.catalog}
        pdfHref={`/admin/cuentas-cobro/${id}/pdf`}
      />
    </>
  );
}
