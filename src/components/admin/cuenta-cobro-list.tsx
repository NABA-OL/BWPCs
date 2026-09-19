"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { formatCOP } from "@/lib/format";
import { deleteCuentaCobroAction } from "@/app/admin/(panel)/cuentas-cobro/actions";
import { Pagination, PAGE_SIZE } from "@/components/admin/pagination";
import { ESTADO_LABEL } from "@/lib/cuenta-cobro-estado";
import type { CuentaCobroEstado } from "@/lib/db/types";
import { TrashLabel } from "@/components/ui/trash-label";
import { EditLabel, RowActions } from "@/components/admin/row-actions";

export interface CuentaCobroRow {
  id: string;
  numero: string;
  clienteNombre: string;
  fecha: string;
  total: number;
  estado: CuentaCobroEstado;
  /** Cuenta anterior a los estados: no sabemos si ya se pagó. */
  sinEstado: boolean;
  /** Solo los borradores (y las cuentas antiguas sin estado) se pueden borrar. */
  deletable: boolean;
}

type Filter = "todas" | CuentaCobroEstado | "sin_estado";

/** Filtros por estado, en el orden en que se muestran. Las cuentas antiguas sin estado tienen el suyo. */
const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "enviada", label: "Por pagar" },
  { id: "pago_reportado", label: "Pago por confirmar" },
  { id: "correccion_solicitada", label: "Corrección pedida" },
  { id: "pagada", label: "Pagadas" },
  { id: "anulada", label: "Anuladas" },
  { id: "borrador", label: "Borradores" },
  { id: "sin_estado", label: "Sin estado" },
];

const keyOf = (r: CuentaCobroRow): Filter => (r.sinEstado ? "sin_estado" : r.estado);

export function CuentaCobroList({ rows }: { rows: CuentaCobroRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([["todas", rows.length]]);
    for (const r of rows) map.set(keyOf(r), (map.get(keyOf(r)) ?? 0) + 1);
    return map;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter(
      (r) =>
        (filter === "todas" || keyOf(r) === filter) &&
        (!q || r.numero.toLowerCase().includes(q) || r.clienteNombre.toLowerCase().includes(q)),
    );
  }, [rows, query, filter]);

  const handleQuery = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const paginated = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goPage = useCallback((p: number) => setPage(p), []);

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {FILTERS.filter((f) => f.id === "todas" || (counts.get(f.id) ?? 0) > 0).map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => {
              setFilter(f.id);
              setPage(1);
            }}
            className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.id
                ? "border-panda bg-panda text-vanilla"
                : "border-hairline text-component hover:border-panda hover:text-panda"
            }`}
          >
            {f.label} <span className="ml-1 font-mono">{counts.get(f.id) ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="relative max-w-xs">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-component"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="6.5" cy="6.5" r="5" />
          <path d="M10.5 10.5l3.5 3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder="Buscar por número o cliente…"
          className="w-full border border-hairline bg-vanilla py-2 pl-8 pr-3 text-sm outline-none focus:border-panda"
        />
      </div>

      {visible.length === 0 ? (
        <p className="text-component">
          Sin resultados para &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-hairline/30 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-4 py-3 font-mono font-medium">
                    {r.numero}
                    <span
                      className={`ml-2 border px-1.5 py-0.5 font-sans text-[10px] font-normal uppercase tracking-wide ${
                        r.estado === "pago_reportado" || r.estado === "correccion_solicitada"
                          ? "border-accent/40 text-accent"
                          : "border-hairline text-component"
                      }`}
                    >
                      {r.sinEstado ? "Sin estado" : ESTADO_LABEL[r.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-component">
                    {r.clienteNombre || "—"}
                  </td>
                  <td className="px-4 py-3 text-component">{r.fecha}</td>
                  <td className="px-4 py-3 font-mono">{formatCOP(r.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <a
                        href={`/admin/cuentas-cobro/${r.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-component hover:text-panda"
                      >
                        PDF
                      </a>
                      <RowActions>
                        <Link
                          href={`/admin/cuentas-cobro/${r.id}`}
                          className="text-component hover:text-panda"
                        >
                          <EditLabel label="Abrir" />
                        </Link>
                        {r.deletable && (
                        <form
                          action={deleteCuentaCobroAction}
                          onSubmit={(e) => {
                            if (
                              !confirm(
                                `¿Eliminar la cuenta de cobro ${r.numero}?`,
                              )
                            )
                              e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            className="text-accent hover:underline"
                          >
                            <TrashLabel />
                          </button>
                        </form>
                        )}
                                          </RowActions>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={visible.length}
            shown={paginated.length}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
            onPage={goPage}
          />
        </div>
      )}
    </div>
  );
}
