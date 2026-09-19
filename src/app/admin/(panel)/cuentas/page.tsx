/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { LinkPagination } from "@/components/admin/link-pagination";
import { listAccounts, type AccountsPage } from "@/lib/admin/accounts";
import type { Review } from "@/lib/db/types";

export const metadata: Metadata = {
  title: "Cuentas de clientes",
  robots: { index: false, follow: false },
};

const REVIEW_LABEL: Record<Review["estado"], string> = {
  pendiente: "Por aprobar",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

const fmtFecha = (d: Date | null) =>
  d
    ? new Date(d).toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default async function CuentasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 80);
  const requestedPage = Number.parseInt(params.page ?? "1", 10) || 1;

  let data: AccountsPage | null = null;
  let error: string | null = null;
  try {
    data = await listAccounts(q, requestedPage);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar las cuentas.";
  }

  const hrefFor = (page: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (page > 1) qs.set("page", String(page));
    const s = qs.toString();
    return `/admin/cuentas${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Cuentas de clientes</h1>
        <p className="mt-1 text-component">
          Personas que se registraron en la web. Solo lectura: cada quien administra su cuenta.
          {data && (
            <span className="ml-1 font-mono text-xs">{data.total} en total</span>
          )}
        </p>
      </header>

      <form action="/admin/cuentas" className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          maxLength={80}
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar cuentas"
          className="w-full max-w-sm border border-hairline bg-vanilla px-3 py-2 text-sm outline-none focus:border-panda"
        />
        <button
          type="submit"
          className="border border-hairline px-4 py-2 text-sm font-medium text-component transition-colors hover:border-panda hover:text-panda"
        >
          Buscar
        </button>
      </form>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6 text-sm">{error}</div>
      ) : !data || data.rows.length === 0 ? (
        <div className="mt-8 border border-hairline p-8 text-center text-component">
          {q ? "Ninguna cuenta coincide con la búsqueda." : "Todavía no hay cuentas registradas."}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-hairline">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-hairline text-component">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Registro</th>
                <th className="px-4 py-3 text-right font-medium">Cotizaciones</th>
                <th className="px-4 py-3 font-medium">Reseña</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.name}</p>
                    <p className="font-mono text-xs text-component">
                      {r.email}
                      {!r.verified && " · sin verificar"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{r.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-component">{fmtFecha(r.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{r.publishedQuotes}</td>
                  <td className="px-4 py-3 text-component">
                    {r.review ? REVIEW_LABEL[r.review] : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <LinkPagination page={data.page} totalPages={data.totalPages} hrefFor={hrefFor} />
      )}
    </>
  );
}
