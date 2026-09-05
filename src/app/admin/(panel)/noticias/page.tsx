/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import type { Metadata } from "next";
import Link from "next/link";
import { collections } from "@/lib/db/collections";
import { NewsScanButton } from "@/components/admin/news-scan-button";
import { publishPostAction, unpublishPostAction, deletePostAction } from "./actions";

export const metadata: Metadata = {
  title: "Noticias",
  robots: { index: false, follow: false },
};

function fmtFecha(d: Date): string {
  return new Date(d).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NoticiasAdminPage() {
  let posts: {
    id: string;
    tipo: "articulo" | "video";
    titulo: string;
    resumen: string;
    fuenteNombre: string;
    fuenteUrl: string;
    estado: "borrador" | "publicado";
    creado: Date;
  }[] = [];
  let error: string | null = null;

  try {
    const col = await collections.newsPosts();
    const docs = await col.find({}).sort({ creado: -1 }).limit(200).toArray();
    posts = docs.map((p) => ({
      id: p._id!.toString(),
      tipo: p.tipo,
      titulo: p.titulo,
      resumen: p.resumen,
      fuenteNombre: p.fuenteNombre,
      fuenteUrl: p.fuenteUrl,
      estado: p.estado,
      creado: p.creado,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar noticias.";
  }

  const borradores = posts.filter((p) => p.estado === "borrador");
  const publicados = posts.filter((p) => p.estado === "publicado");

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Noticias</h1>
        <p className="mt-1 text-component">
          Borradores generados desde YouTube y RSS. Nunca se publican solos —
          revisa, edita si quieres y publica desde acá.
        </p>
      </header>

      <div className="mt-6">
        <NewsScanButton />
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
                {borradores.map((p) => (
                  <li key={p.id} className="bg-accent/5 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-wide text-component">
                            {p.tipo === "video" ? "🎥 video" : "📰 artículo"} ·{" "}
                            {p.fuenteNombre}
                          </span>
                        </div>
                        <Link
                          href={`/admin/noticias/${p.id}`}
                          className="mt-1 block font-semibold hover:underline"
                        >
                          {p.titulo}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-sm text-component">
                          {p.resumen}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-component">
                          {fmtFecha(p.creado)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <form action={publishPostAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="w-full border border-panda bg-panda px-3 py-1.5 text-xs font-medium text-vanilla transition-colors hover:bg-accent"
                          >
                            Publicar
                          </button>
                        </form>
                        <Link
                          href={`/admin/noticias/${p.id}`}
                          className="text-center text-xs font-medium text-component hover:text-panda"
                        >
                          Editar
                        </Link>
                        <form action={deletePostAction}>
                          <input type="hidden" name="id" value={p.id} />
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
            <h2 className="text-lg font-semibold">Publicados</h2>
            {publicados.length === 0 ? (
              <p className="mt-3 text-sm text-component">
                Todavía no has publicado nada.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-hairline border border-hairline">
                {publicados.map((p) => (
                  <li key={p.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] uppercase tracking-wide text-component">
                          {p.tipo === "video" ? "🎥 video" : "📰 artículo"} ·{" "}
                          {p.fuenteNombre}
                        </span>
                        <Link
                          href={`/admin/noticias/${p.id}`}
                          className="mt-1 block font-semibold hover:underline"
                        >
                          {p.titulo}
                        </Link>
                      </div>
                      <form action={unpublishPostAction}>
                        <input type="hidden" name="id" value={p.id} />
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
