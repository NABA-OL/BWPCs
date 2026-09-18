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
import { deleteQuoteAction } from "@/app/admin/(panel)/cotizaciones/actions";
import { Pagination, PAGE_SIZE } from "@/components/admin/pagination";

export interface QuoteRow {
  id: string;
  codigo: string;
  cliente: string | null;
  fecha: string;
  total: number;
  publicada: boolean;
}

export function QuoteList({ rows }: { rows: QuoteRow[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.codigo.toLowerCase().includes(q) ||
        (r.cliente ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  // Reset page when search changes
  const handleQuery = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const paginated = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goPage = useCallback((p: number) => setPage(p), []);

  return (
    <div className="mt-8 space-y-4">
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
          placeholder="Buscar por código o cliente…"
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
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Total (op. 1)</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-4 py-3 font-mono font-medium">
                    {r.codigo}
                    {r.publicada && (
                      <span className="ml-2 border border-hairline px-1.5 py-0.5 font-sans text-[10px] font-normal uppercase tracking-wide text-component">
                        Publicada
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-component">
                    {r.cliente || "—"}
                  </td>
                  <td className="px-4 py-3 text-component">{r.fecha}</td>
                  <td className="px-4 py-3 font-mono">{formatCOP(r.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <a
                        href={`/admin/cotizaciones/${r.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-component hover:text-panda"
                      >
                        PDF
                      </a>
                      <Link
                        href={`/admin/cotizaciones/${r.id}`}
                        className="text-component hover:text-panda"
                      >
                        Editar
                      </Link>
                      <form action={deleteQuoteAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="text-accent hover:underline"
                        >
                          Eliminar
                        </button>
                      </form>
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
