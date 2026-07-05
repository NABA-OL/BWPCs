// Desarrollado por NABA-OL
"use client";

import { useState, useEffect } from "react";
import { InstagramEmbed } from "@/components/instagram-embed";
import { isInstagramUrl } from "@/lib/instagram";

const ITEMS_PER_PAGE = 6;
const CAROUSEL_INTERVAL = 10_000; // 10 segundos

interface Build {
  id: string;
  titulo: string;
  specs: string;
  imagenUrl: string;
}

// Definido fuera del componente para que React no lo desmonte en cada render.
function BuildCard({ b }: { b: Build }) {
  if (isInstagramUrl(b.imagenUrl)) {
    return (
      <div className="flex flex-col">
        <p className="mb-3 text-xl font-bold leading-tight">{b.titulo}</p>
        <InstagramEmbed url={b.imagenUrl} />
        {b.specs && (
          <p className="mt-3 font-mono text-xs leading-relaxed text-component">
            {b.specs}
          </p>
        )}
      </div>
    );
  }

  return (
    <article className="group flex flex-col">
      <div className="aspect-square overflow-hidden border border-hairline/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.imagenUrl}
          alt={b.titulo}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3">
        <p className="text-lg font-bold leading-tight">{b.titulo}</p>
        {b.specs && (
          <p className="mt-1 font-mono text-xs leading-relaxed text-component">
            {b.specs}
          </p>
        )}
      </div>
    </article>
  );
}

export function BuildsGrid({ builds }: { builds: Build[] }) {
  const [page, setPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  // timerKey: incrementarlo fuerza el reinicio del intervalo sin cambiar carouselIndex.
  const [timerKey, setTimerKey] = useState(0);

  const totalPages = Math.ceil(builds.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = builds.slice(start, start + ITEMS_PER_PAGE);

  // Reiniciar carrusel al cambiar de página.
  useEffect(() => {
    setCarouselIndex(0);
    setTimerKey((k) => k + 1);
  }, [page]);

  // Auto-avance del carrusel (solo en móvil visualmente; el timer corre siempre).
  useEffect(() => {
    if (paginated.length <= 1) return;
    const id = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % paginated.length);
    }, CAROUSEL_INTERVAL);
    return () => clearInterval(id);
  }, [paginated.length, timerKey]);

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToSlide(i: number) {
    setCarouselIndex(i);
    setTimerKey((k) => k + 1); // resetea el timer para que el usuario tenga 10 s completos
  }

  return (
    <>
      {/* ── MÓVIL: carrusel auto-rotante (oculto en md+) ── */}
      <div className="block md:hidden">
        {paginated.map((b, i) => (
          // Todos los items permanecen en el DOM para que los embeds de Instagram
          // carguen en segundo plano; solo cambia la clase de visibilidad.
          <div key={b.id} className={i === carouselIndex ? undefined : "hidden"}>
            <BuildCard b={b} />
          </div>
        ))}

        {paginated.length > 1 && (
          <div className="mt-5 flex justify-center gap-1">
            {paginated.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Ensamble ${i + 1}`}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === carouselIndex ? "bg-panda" : "bg-hairline"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TABLET / ESCRITORIO: grilla (oculto en < md) ── */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {paginated.map((b) => (
          <BuildCard key={b.id} b={b} />
        ))}
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between border-t border-hairline pt-6">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="text-sm text-component transition-colors hover:text-panda disabled:pointer-events-none disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="font-mono text-sm text-component">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => goToPage(page + 1)}
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
