/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { ReviewsShowcase } from "@/components/reviews/reviews-showcase";
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

        <ReviewsShowcase reviews={reviews} />
      </div>
    </section>
  );
}
