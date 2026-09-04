/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { collections } from "@/lib/db/collections";
import { ButtonLink } from "@/components/ui/button";
import { CuentaCobroList } from "@/components/admin/cuenta-cobro-list";

export const metadata: Metadata = {
  title: "Cuentas de cobro",
  robots: { index: false, follow: false },
};

const fmtDate = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function CuentasCobroPage() {
  let rows: {
    id: string;
    numero: string;
    clienteNombre: string;
    fecha: string;
    total: number;
  }[] = [];
  let error: string | null = null;

  try {
    const col = await collections.cuentasCobro();
    const docs = await col.find({}).sort({ creado: -1 }).toArray();
    rows = docs.map((c) => ({
      id: c._id!.toString(),
      numero: c.numero,
      clienteNombre: c.cliente.nombre,
      fecha: fmtDate.format(new Date(c.fecha)),
      total: c.total,
    }));
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Error al cargar cuentas de cobro.";
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Cuentas de cobro
          </h1>
          <p className="mt-1 text-component">
            Crea, edita y descarga tus cuentas de cobro en PDF.
          </p>
        </div>
        <ButtonLink href="/admin/cuentas-cobro/nueva">Nueva</ButtonLink>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-component">
          Aún no hay cuentas de cobro.{" "}
          <Link
            href="/admin/cuentas-cobro/nueva"
            className="text-accent hover:underline"
          >
            Crea la primera
          </Link>
          .
        </p>
      ) : (
        <CuentaCobroList rows={rows} />
      )}
    </>
  );
}
