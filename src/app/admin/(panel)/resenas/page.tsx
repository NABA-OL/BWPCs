/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { Stars } from "@/components/reviews/stars";
import { listReviewsForAdmin, type AdminReview } from "@/lib/reviews/reviews";
import {
  approveReviewAction,
  deleteReviewAction,
  rejectReviewAction,
} from "./actions";

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

const BADGE: Record<AdminReview["estado"], string> = {
  pendiente: "border-accent/40 text-accent",
  aprobada: "border-hairline text-component",
  rechazada: "border-hairline text-component",
};

const BTN =
  "border border-hairline px-3 py-1.5 text-xs font-medium text-component transition-colors hover:border-panda hover:text-panda";

export default async function ResenasPage() {
  let reviews: AdminReview[] = [];
  let error: string | null = null;
  try {
    reviews = await listReviewsForAdmin();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar las reseñas.";
  }
  const pendientes = reviews.filter((r) => r.estado === "pendiente").length;

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Reseñas</h1>
        <p className="mt-1 text-component">
          Solo se muestran en la página principal las aprobadas.{" "}
          {pendientes > 0 && (
            <span className="font-medium text-accent">
              {pendientes} por moderar.
            </span>
          )}
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6 text-sm">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-8 border border-hairline p-8 text-center text-component">
          Todavía no hay reseñas.
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

              {r.fotos.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {r.fotos.map((p) => (
                    <li key={p.id}>
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element -- miniatura ya procesada */}
                        <img
                          src={p.thumbUrl}
                          alt="Foto de la reseña"
                          width={80}
                          height={80}
                          className="h-20 w-20 border border-hairline object-cover"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {r.estado === "rechazada" && r.motivo && (
                <p className="mt-3 text-xs text-component">Motivo: {r.motivo}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {r.estado !== "aprobada" && (
                  <form action={approveReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="version" value={r.version} />
                    <button
                      type="submit"
                      className="bg-panda px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-vanilla transition-colors hover:bg-accent"
                    >
                      Aprobar
                    </button>
                  </form>
                )}
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
                    Eliminar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
