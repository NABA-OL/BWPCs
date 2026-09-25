/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyCuentasCobro } from "@/lib/account/cuentas-cobro";
import { ESTADO_LABEL, estadoDe } from "@/lib/cuenta-cobro-estado";
import { estaVencida } from "@/lib/cuenta-cobro-vigencia";
import { formatCOP } from "@/lib/format";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Cuentas de cobro" };

const fmtFecha = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function CuentasCobroPage() {
  const session = await getUserSession();
  if (!session) redirect("/cuenta/ingresar?next=/cuenta/cuentas-cobro");

  const cuentas = await getMyCuentasCobro(session.user.id);

  return (
    <section className="max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Cuentas de cobro</h1>
      <p className="mt-1 text-sm text-component">
        Las que te enviamos por tus compras, con los datos para pagar.
      </p>

      {cuentas.length === 0 ? (
        <p className="mt-8 border border-hairline p-6 text-sm text-component">
          Todavía no tienes cuentas de cobro. Cuando compres, aparecerán aquí.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-hairline border border-hairline">
          {cuentas.map((c) => {
            const estado = estadoDe(c);
            const id = c._id!.toString();
            return (
              <li key={id}>
                <Link
                  href={`/cuenta/cuentas-cobro/${id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-hairline/30"
                >
                  <div>
                    <p className="font-mono font-medium">{c.numero}</p>
                    <p className="text-xs text-component">{fmtFecha.format(new Date(c.creado))}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`border px-2 py-0.5 text-xs ${
                        estado === "enviada" ? "border-accent/40 text-accent" : "border-hairline text-component"
                      }`}
                    >
                      {estaVencida(c) ? "Vencida" : ESTADO_LABEL[estado]}
                    </span>
                    <span className="font-mono">{formatCOP(c.total)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
