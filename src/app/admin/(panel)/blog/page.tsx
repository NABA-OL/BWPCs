/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import type { Metadata } from "next";
import Link from "next/link";
import { collections } from "@/lib/db/collections";
import { GenerateBlogButton } from "@/components/admin/generate-blog-button";
import { publishGuideAction, unpublishGuideAction, deleteGuideAction } from "./actions";

export const metadata: Metadata = {
  title: "Blog",
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

export default async function BlogAdminPage() {
  let guias: {
    id: string;
    titulo: string;
    descripcion: string;
    estado: "borrador" | "publicado";
    creado: Date;
  }[] = [];
  let error: string | null = null;

  try {
    const col = await collections.guides();
    const docs = await col.find({}).sort({ creado: -1 }).limit(200).toArray();
    guias = docs.map((g) => ({
      id: g._id!.toString(),
      titulo: g.titulo,
      descripcion: g.descripcion,
      estado: g.estado,
      creado: g.creado,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar el blog.";
  }

  const borradores = guias.filter((g) => g.estado === "borrador");
  const publicadas = guias.filter((g) => g.estado === "publicado");

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Blog</h1>
        <p className="mt-1 text-component">
          Guías redactadas por IA a partir de lo que ya existe en el sitio.
          Nunca se publican solas — revisa, edita si quieres y publica desde
          acá.
        </p>
      </header>

      <div className="mt-6">
        <GenerateBlogButton />
      </div>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="text-lg font-semibold">
              Borradores{" "}
              {borradores.length > 0 && (
                <span className="font-mono text-sm text-accent">
                  ({borradores.length})
                </span>
              )}
            </h2>
            {borradores.length === 0 ? (
              <p className="mt-3 text-sm text-component">
                No hay borradores pendientes.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-hairline border border-hairline">
                {borradores.map((g) => (
                  <li key={g.id} className="bg-accent/5 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/blog/${g.id}`}
                          className="block font-semibold hover:underline"
                        >
                          {g.titulo}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-sm text-component">
                          {g.descripcion}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-component">
                          {fmtFecha(g.creado)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <form action={publishGuideAction}>
                          <input type="hidden" name="id" value={g.id} />
                          <button
                            type="submit"
                            className="w-full border border-panda bg-panda px-3 py-1.5 text-xs font-medium text-vanilla transition-colors hover:bg-accent"
                          >
                            Publicar
                          </button>
                        </form>
                        <Link
                          href={`/admin/blog/${g.id}`}
                          className="text-center text-xs font-medium text-component hover:text-panda"
                        >
                          Editar
                        </Link>
                        <form action={deleteGuideAction}>
                          <input type="hidden" name="id" value={g.id} />
                          <button
                            type="submit"
                            className="text-xs text-component hover:text-accent"
                          >
                            Descartar
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold">Publicadas</h2>
            {publicadas.length === 0 ? (
              <p className="mt-3 text-sm text-component">
                Todavía no has publicado ninguna.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-hairline border border-hairline">
                {publicadas.map((g) => (
                  <li key={g.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/blog/${g.id}`}
                          className="block font-semibold hover:underline"
                        >
                          {g.titulo}
                        </Link>
                      </div>
                      <form action={unpublishGuideAction}>
                        <input type="hidden" name="id" value={g.id} />
                        <button
                          type="submit"
                          className="shrink-0 border border-hairline px-3 py-1.5 text-xs font-medium text-component transition-colors hover:border-panda hover:text-panda"
                        >
                          Despublicar
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
