/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { PcBackdrop } from "@/components/assembly-hero";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { collections } from "@/lib/db/collections";
import { SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Noticias de hardware y PC",
  description:
    "Lo último en hardware y PC gaming: video semanal de Rincón de Varo y artículos curados de medios de tecnología reconocidos.",
  alternates: { canonical: "/noticias" },
  openGraph: {
    title: "Noticias de hardware y PC · B & W",
    description:
      "Lo último en hardware y PC gaming, curado semanalmente.",
    url: `${SITE_URL}/noticias`,
  },
};

export const revalidate = 3600;

const PAGE_SIZE = 15;

function fmtFecha(d: Date): string {
  return new Date(d).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let posts: {
    id: string;
    tipo: "articulo" | "video";
    titulo: string;
    resumen: string;
    fuenteUrl: string;
    fuenteNombre: string;
    youtubeId: string | null;
    publicado: Date;
  }[] = [];
  let total = 0;

  try {
    const col = await collections.newsPosts();
    const filter = { estado: "publicado" as const };
    total = await col.countDocuments(filter);
    const docs = await col
      .find(filter)
      .sort({ publicado: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray();
    posts = docs.map((p) => ({
      id: p._id!.toString(),
      tipo: p.tipo,
      titulo: p.titulo,
      resumen: p.resumen,
      fuenteUrl: p.fuenteUrl,
      fuenteNombre: p.fuenteNombre,
      youtubeId: p.youtubeId,
      publicado: p.publicado ?? new Date(),
    }));
  } catch {
    posts = [];
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE_URL}/` },
          { name: "Noticias", url: `${SITE_URL}/noticias` },
        ]}
      />
      <PcBackdrop />

      <PageHero
        eyebrow="Actualidad"
        title="Noticias de hardware y PC"
        summary={[
          "Video semanal de Rincón de Varo, canal de noticias de hardware.",
          "Artículos curados de Xataka, Ars Technica, Tom's Hardware y The Verge.",
          "Cada nota enlaza a su fuente original — no reescribimos el contenido de nadie.",
        ]}
      >
        <p>
          Lo que va pasando en el mundo del hardware y los PC, en un solo
          lugar. Todo revisado a mano antes de publicarse.
        </p>
      </PageHero>

      <section className="border-b border-hairline/50 bg-vanilla/40">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          {posts.length === 0 ? (
            <div className="border border-hairline/50 p-8 text-center text-component">
              Todavía no hay noticias publicadas.
            </div>
          ) : (
            <div className="space-y-10">
              {posts.map((p) => (
                <article
                  key={p.id}
                  className="border-b border-hairline pb-10 last:border-0"
                >
                  <p className="font-mono text-xs text-component">
                    {fmtFecha(p.publicado)} · {p.fuenteNombre}
                  </p>
                  <h2 className="mt-2 text-balance text-xl font-bold tracking-[-0.01em]">
                    {p.titulo}
                  </h2>

                  {p.tipo === "video" && p.youtubeId ? (
                    <div className="mt-4 aspect-video max-w-2xl overflow-hidden border border-hairline">
                      <iframe
                        src={`https://www.youtube.com/embed/${p.youtubeId}`}
                        title={p.titulo}
                        className="h-full w-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 max-w-2xl text-pretty leading-relaxed text-panda">
                        {p.resumen}
                      </p>
                      <a
                        href={p.fuenteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm text-accent hover:underline"
                      >
                        Leer en {p.fuenteNombre} →
                      </a>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="Paginación"
              className="mt-12 flex items-center justify-center gap-4 font-mono text-sm"
            >
              {page > 1 && (
                <Link
                  href={page - 1 === 1 ? "/noticias" : `/noticias?page=${page - 1}`}
                  className="text-accent hover:underline"
                >
                  ← Anteriores
                </Link>
              )}
              <span className="text-component">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/noticias?page=${page + 1}`}
                  className="text-accent hover:underline"
                >
                  Siguientes →
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
