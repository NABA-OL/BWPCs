/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LinkPagination } from "@/components/admin/link-pagination";
import { PhotoGallery } from "@/components/reviews/photo-gallery";
import { Stars } from "@/components/reviews/stars";
import { listReviewsForAdmin, type AdminReviewPage } from "@/lib/reviews/reviews";
import type { Review } from "@/lib/db/types";
import {
  approveReviewAction,
  deleteReviewAction,
  rejectReviewAction,
  saveReviewDetailsAction,
} from "./actions";
import { ASSEMBLY_LINE_MAX, ASSEMBLY_MAX_LINES } from "@/lib/reviews/rules";
import { TrashLabel } from "@/components/ui/trash-label";

export const metadata: Metadata = {
  title: "Reseñas",
  robots: { index: false, follow: false },
};

const fmtFecha = (d: Date) =>
  new Date(d).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const BADGE: Record<Review["estado"], string> = {
  pendiente: "border-accent/40 text-accent",
  aprobada: "border-hairline text-component",
  rechazada: "border-hairline text-component",
};

const TABS: readonly { estado: Review["estado"]; label: string }[] = [
  { estado: "pendiente", label: "Por aprobar" },
  { estado: "aprobada", label: "Aprobadas" },
  { estado: "rechazada", label: "Rechazadas" },
];

const EMPTY: Record<Review["estado"], string> = {
  pendiente: "No hay reseñas por aprobar.",
  aprobada: "Todavía no hay reseñas aprobadas.",
  rechazada: "No hay reseñas rechazadas.",
};

const tabHref = (estado: Review["estado"], page = 1) =>
  `/admin/resenas?tab=${estado}${page > 1 ? `&page=${page}` : ""}`;

const BTN =
  "border border-hairline px-3 py-1.5 text-xs font-medium text-component transition-colors hover:border-panda hover:text-panda";

export default async function ResenasPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const params = await searchParams;
  const estado = TABS.find((t) => t.estado === params.tab)?.estado ?? "pendiente";
  const requestedPage = Number.parseInt(params.page ?? "1", 10) || 1;

  let data: AdminReviewPage | null = null;
  let error: string | null = null;
  try {
    data = await listReviewsForAdmin(estado, requestedPage);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar las reseñas.";
  }
  const reviews = data?.reviews ?? [];

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Reseñas</h1>
        <p className="mt-1 text-component">
          Solo se muestran en la página principal las aprobadas.
        </p>
      </header>

      <nav aria-label="Estado de las reseñas" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = t.estado === estado;
          const n = data?.counts[t.estado];
          return (
            <Link
              key={t.estado}
              href={tabHref(t.estado)}
              aria-current={active ? "page" : undefined}
              className={`border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-panda bg-panda text-vanilla"
                  : "border-hairline text-component hover:border-panda hover:text-panda"
              }`}
            >
              {t.label}
              {n !== undefined && (
                <span
                  className={`ml-2 font-mono text-xs ${
                    active ? "" : t.estado === "pendiente" && n > 0 ? "text-accent" : ""
                  }`}
                >
                  {n}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6 text-sm">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-8 border border-hairline p-8 text-center text-component">
          {EMPTY[estado]}
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-hairline border border-hairline">
          {reviews.map((r) => (
            <li
              key={r.id}
              className={`p-5 ${r.estado === "pendiente" ? "bg-accent/5" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-semibold">{r.autorNombre}</p>
                    <span
                      className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${BADGE[r.estado]}`}
                    >
                      {r.estado}
                    </span>
                    {r.cuentaEliminada && (
                      <span className="border border-hairline px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-component">
                        Cuenta eliminada
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-component">
                    {r.autorCorreo} · {fmtFecha(r.actualizado)}
                  </p>
                </div>
                <Stars value={r.estrellas} size={18} />
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">
                {r.comentario}
              </p>

              <PhotoGallery
                photos={r.fotos}
                label={`Fotos de la reseña de ${r.autorNombre}`}
              />

              {r.estado === "rechazada" && r.motivo && (
                <p className="mt-3 text-xs text-component">Motivo: {r.motivo}</p>
              )}

              <form action={approveReviewAction} className="mt-4">
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="version" value={r.version} />
                <label
                  htmlFor={`componentes-${r.id}`}
                  className="text-xs font-medium text-component"
                >
                  Detalles del ensamble{" "}
                  <span className="font-normal">
                    (uno por línea, sin precios; se muestran con la reseña
                    {r.componentes.length === 0 && r.sugeridos.length > 0
                      ? "; sugeridos de su cuenta de cobro pagada, revísalos"
                      : ""}
                    )
                  </span>
                </label>
                <textarea
                  id={`componentes-${r.id}`}
                  name="componentes"
                  rows={5}
                  maxLength={ASSEMBLY_MAX_LINES * (ASSEMBLY_LINE_MAX + 1)}
                  defaultValue={(r.componentes.length > 0 ? r.componentes : r.sugeridos).join("\n")}
                  placeholder={"Procesador: Ryzen 5 7600\nGráfica: RTX 4060"}
                  className="mt-1.5 block w-full max-w-xl border border-hairline bg-vanilla px-2 py-1.5 text-sm outline-none focus:border-panda"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {r.estado !== "aprobada" && (
                    <button
                      type="submit"
                      className="bg-panda px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-vanilla transition-colors hover:bg-accent"
                    >
                      Aprobar
                    </button>
                  )}
                  <button type="submit" formAction={saveReviewDetailsAction} className={BTN}>
                    Guardar detalles
                  </button>
                </div>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {r.estado !== "rechazada" && (
                  <form action={rejectReviewAction} className="flex gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      name="motivo"
                      maxLength={200}
                      placeholder="Motivo (lo ve la autora)"
                      className="w-56 border border-hairline bg-vanilla px-2 py-1.5 text-xs outline-none focus:border-panda"
                    />
                    <button type="submit" className={BTN}>
                      Rechazar
                    </button>
                  </form>
                )}
                <form action={deleteReviewAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className={`${BTN} text-accent`}>
                    <TrashLabel />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && (
        <LinkPagination
          page={data.page}
          totalPages={data.totalPages}
          hrefFor={(p) => tabHref(estado, p)}
        />
      )}
    </>
  );
}
