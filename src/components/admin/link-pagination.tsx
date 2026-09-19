/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import Link from "next/link";
import { pageWindow } from "@/components/admin/pagination";

const BTN =
  "min-w-[2rem] border px-2.5 py-1 text-center transition-colors";
const IDLE = "border-hairline text-component hover:border-panda hover:text-panda";

/** Paginación por enlaces (la página vive en la URL, sin estado de cliente). */
export function LinkPagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Paginación"
      className="mt-4 flex flex-wrap items-center justify-center gap-1 text-sm"
    >
      {page > 1 && (
        <Link href={hrefFor(page - 1)} aria-label="Página anterior" className={`${BTN} ${IDLE}`}>
          ←
        </Link>
      )}
      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-component">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${BTN} ${p === page ? "border-panda bg-panda text-vanilla" : IDLE}`}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} aria-label="Página siguiente" className={`${BTN} ${IDLE}`}>
          →
        </Link>
      )}
    </nav>
  );
}
