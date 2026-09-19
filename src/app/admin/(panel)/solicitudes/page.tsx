/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LinkPagination } from "@/components/admin/link-pagination";
import { collections } from "@/lib/db/collections";
import { setLeadRevisadoAction } from "./actions";

export const metadata: Metadata = {
  title: "Solicitudes",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

const TABS = [
  { id: "pendientes", label: "Por revisar", revisado: false },
  { id: "revisadas", label: "Revisadas", revisado: true },
] as const;

type TabId = (typeof TABS)[number]["id"];

const tabHref = (tab: TabId, page = 1) => `/admin/solicitudes?tab=${tab}${page > 1 ? `&page=${page}` : ""}`;

function fmtFecha(d: Date): string {
  return new Date(d).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = TABS.find((t) => t.id === params.tab) ?? TABS[0];
  const requestedPage = Number.parseInt(params.page ?? "1", 10) || 1;

  let leads: {
    id: string;
    nombre: string;
    telefono: string;
    correo: string;
    resumen: string;
    revisado: boolean;
    creado: Date;
  }[] = [];
  let counts = { pendientes: 0, revisadas: 0 };
  let page = 1;
  let totalPages = 1;
  let error: string | null = null;

  try {
    const col = await collections.leads();
    // Las selecciones guardadas en una cuenta no son solicitudes: no van aquí.
    const filter = { tipo: { $ne: "guardada" as const } };
    const [pendientes, revisadas] = await Promise.all([
      col.countDocuments({ ...filter, revisado: false }),
      col.countDocuments({ ...filter, revisado: true }),
    ]);
    counts = { pendientes, revisadas };
    totalPages = Math.max(1, Math.ceil(counts[tab.id] / PAGE_SIZE));
    page = Math.min(Math.max(1, requestedPage), totalPages);
    const docs = await col
      .find({ ...filter, revisado: tab.revisado })
      .sort({ creado: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray();
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

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Solicitudes</h1>
        <p className="mt-1 text-component">
          Cotizaciones enviadas desde el cotizador público, antes de abrir WhatsApp.
        </p>
      </header>

      <nav aria-label="Estado de las solicitudes" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = t.id === tab.id;
          return (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              aria-current={active ? "page" : undefined}
              className={`border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-panda bg-panda text-vanilla"
                  : "border-hairline text-component hover:border-panda hover:text-panda"
              }`}
            >
              {t.label}
              <span className={`ml-2 font-mono text-xs ${!active && t.id === "pendientes" && counts.pendientes > 0 ? "text-accent" : ""}`}>
                {counts[t.id]}
              </span>
            </Link>
          );
        })}
      </nav>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="mt-8 border border-hairline p-8 text-center text-component">
          {tab.id === "pendientes" ? "No hay solicitudes por revisar." : "Todavía no hay solicitudes revisadas."}
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

      <LinkPagination page={page} totalPages={totalPages} hrefFor={(p) => tabHref(tab.id, p)} />
    </>
  );
}
