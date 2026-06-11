"use client";

import { useState } from "react";
import { InstagramEmbed } from "@/components/instagram-embed";
import { isInstagramUrl } from "@/lib/instagram";

const ITEMS_PER_PAGE = 6;

interface Build {
  id: string;
  titulo: string;
  specs: string;
  imagenUrl: string;
}

export function BuildsGrid({ builds }: { builds: Build[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(builds.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = builds.slice(start, start + ITEMS_PER_PAGE);

  function goTo(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginated.map((b) =>
          isInstagramUrl(b.imagenUrl) ? (
            <div key={b.id} className="flex flex-col">
              <InstagramEmbed url={b.imagenUrl} />
              <div className="mt-3">
                <p className="font-semibold leading-tight">{b.titulo}</p>
                {b.specs && (
                  <p className="mt-1 font-mono text-xs leading-relaxed text-component">
                    {b.specs}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <article key={b.id} className="group flex flex-col">
              <div className="aspect-square overflow-hidden border border-hairline/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.imagenUrl}
                  alt={b.titulo}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-3">
                <p className="font-semibold leading-tight">{b.titulo}</p>
                {b.specs && (
                  <p className="mt-1 font-mono text-xs leading-relaxed text-component">
                    {b.specs}
                  </p>
                )}
              </div>
            </article>
          )
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between border-t border-hairline pt-6">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="text-sm text-component transition-colors hover:text-panda disabled:pointer-events-none disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="font-mono text-sm text-component">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="text-sm text-component transition-colors hover:text-panda disabled:pointer-events-none disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      )}
    </>
  );
}
