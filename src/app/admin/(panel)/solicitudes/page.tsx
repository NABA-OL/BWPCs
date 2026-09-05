/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
import { setLeadRevisadoAction } from "./actions";

export const metadata: Metadata = {
  title: "Solicitudes",
  robots: { index: false, follow: false },
};

function fmtFecha(d: Date): string {
  return new Date(d).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SolicitudesPage() {
  let leads: {
    id: string;
    nombre: string;
    telefono: string;
    correo: string;
    resumen: string;
    revisado: boolean;
    creado: Date;
  }[] = [];
  let error: string | null = null;

  try {
    const col = await collections.leads();
    const docs = await col.find({}).sort({ creado: -1 }).limit(200).toArray();
    leads = docs.map((l) => ({
      id: l._id!.toString(),
      nombre: l.nombre,
      telefono: l.telefono,
      correo: l.correo,
      resumen: l.resumen,
      revisado: l.revisado,
      creado: l.creado,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar solicitudes.";
  }

  const pendientes = leads.filter((l) => !l.revisado).length;

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Solicitudes
        </h1>
        <p className="mt-1 text-component">
          Cotizaciones enviadas desde el cotizador público, antes de abrir
          WhatsApp.{" "}
          {pendientes > 0 && (
            <span className="font-medium text-accent">
              {pendientes} sin revisar.
            </span>
          )}
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="mt-8 border border-hairline p-8 text-center text-component">
          Todavía no hay solicitudes.
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-hairline border border-hairline">
          {leads.map((l) => (
            <li
              key={l.id}
              className={`p-5 ${l.revisado ? "" : "bg-accent/5"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <p className="font-semibold">{l.nombre}</p>
                    {!l.revisado && (
                      <span className="border border-accent/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                        Nueva
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-component">
                    {l.telefono} · {l.correo}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-component">
                    {fmtFecha(l.creado)}
                  </p>
                </div>

                <form action={setLeadRevisadoAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <input
                    type="hidden"
                    name="revisado"
                    value={String(!l.revisado)}
                  />
                  <button
                    type="submit"
                    className="border border-hairline px-3 py-1.5 text-xs font-medium text-component transition-colors hover:border-panda hover:text-panda"
                  >
                    {l.revisado ? "Marcar sin revisar" : "Marcar revisada"}
                  </button>
                </form>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-panda">
                {l.resumen}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
