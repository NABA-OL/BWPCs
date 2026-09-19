/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { getCuentaCobroBuilderData } from "@/lib/admin/cuenta-cobro-data";
import { CuentaCobroBuilder } from "@/components/admin/cuenta-cobro-builder";
import type { CuentaCobroInput } from "@/lib/cuenta-cobro";

export const metadata: Metadata = {
  title: "Nueva cuenta de cobro",
  robots: { index: false, follow: false },
};

export default async function NuevaCuentaCobroPage() {
  let error: string | null = null;
  let data = null;
  try {
    data = await getCuentaCobroBuilderData();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar datos.";
  }

  const initial: CuentaCobroInput | null = data
    ? {
        numero: data.nextNumero,
        userId: "",
        formaPago: "",
        enlacePagoTarjeta: "",
        fecha: new Date().toISOString().slice(0, 10),
        cliente: {
          nombre: "",
          identificacion: "",
          direccion: "",
          telefono: "",
          email: "",
        },
        cuentaBanco: {
          banco: "",
          tipoCuenta: null,
          numero: "",
          llave: "",
          titular: "",
        },
        firmante: { nombre: "", cedula: "", firmaBase64: null },
        items: [
          {
            descripcion: "Servicio de ensamblaje",
            cantidad: 1,
            valorUnitario: data.servicioBase,
          },
        ],
        descuentoPct: 0,
      }
    : null;

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Nueva cuenta de cobro
        </h1>
        <p className="mt-1 text-component">
          Elige cliente, cuenta bancaria y firmante, agrega los ítems.
        </p>
      </header>

      {error || !data || !initial ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">
            {error ?? "No se pudieron cargar los datos."}
          </p>
        </div>
      ) : (
        <CuentaCobroBuilder
          users={data.users}
        tarjetaPct={data.tarjetaPct}
        boldEnabled={data.boldEnabled}
          id=""
          initial={initial}
          clients={data.clients}
          bankAccounts={data.bankAccounts}
          signers={data.signers}
          catalog={data.catalog}
        />
      )}
    </>
  );
}
