/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { UserAvatar } from "@/components/account/user-avatar";
import { Stars } from "@/components/reviews/stars";
import type { PublicReview } from "@/lib/reviews/reviews";

/**
 * Reseñas aprobadas de la página principal. Sin JSON-LD a propósito: las
 * reseñas propias no califican para estrellas en buscadores y marcarlas puede
 * verse como marcado engañoso.
 */
export function ReviewsSection({
  reviews,
  count,
  average,
}: {
  reviews: PublicReview[];
  count: number;
  average: number;
}) {
  return (
    <section className="border-t border-hairline/50 bg-vanilla/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em]">
            Lo que dicen nuestros clientes
          </h2>
          <p className="flex items-center gap-2 text-sm text-component">
            <Stars value={average} size={18} />
            <span className="font-mono">
              {average.toFixed(1)} · {count}{" "}
              {count === 1 ? "reseña" : "reseñas"}
            </span>
          </p>
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="flex flex-col border border-hairline bg-vanilla p-6"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  style={r.autor.avatarStyle}
                  seed={r.autor.avatarSeed}
                  size={44}
                  className="h-11 w-11 shrink-0 border border-hairline"
                />
                <div>
                  <p className="font-semibold leading-tight">{r.autor.nombre}</p>
                  <Stars value={r.estrellas} size={14} className="mt-1" />
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line text-pretty text-sm leading-relaxed text-panda">
                {r.comentario}
              </p>

              {r.fotos.length > 0 && (
                <ul className="mt-4 flex gap-2">
                  {r.fotos.map((p) => (
                    <li key={p.id}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver foto de la reseña de ${r.autor.nombre}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- miniatura ya procesada */}
                        <img
                          src={p.thumbUrl}
                          alt=""
                          width={96}
                          height={96}
                          loading="lazy"
                          className="h-24 w-24 border border-hairline object-cover"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
