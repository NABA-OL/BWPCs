/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/components/account/review-form";
import { hasPublishedQuote } from "@/lib/account/quotes";
import { getMyReview } from "@/lib/reviews/reviews";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Mi reseña" };

export default async function ResenaPage() {
  const session = await getUserSession();
  if (!session) redirect("/cuenta/ingresar?next=/cuenta/resena");

  const [eligible, mine] = await Promise.all([
    hasPublishedQuote(session.user.id),
    getMyReview(session.user.id),
  ]);

  return (
    <section className="max-w-xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Mi reseña</h1>
      <p className="mt-2 text-sm text-component">
        Tu opinión ayuda a otras personas. Se muestra con tu nombre y la
        inicial de tu apellido, tu avatar y tus fotos.
      </p>

      <div className="mt-8 border border-hairline bg-vanilla p-6">
        {eligible || mine ? (
          <ReviewForm
            initial={
              mine
                ? {
                    estrellas: mine.review.estrellas,
                    comentario: mine.review.comentario,
                    estado: mine.review.estado,
                    motivo: mine.review.motivo ?? null,
                    photos: mine.photos.map((p) => ({
                      id: p.id,
                      thumbUrl: p.thumbUrl,
                      width: p.width,
                      height: p.height,
                    })),
                  }
                : null
            }
          />
        ) : (
          <p className="text-sm text-component">
            Podrás dejar tu reseña cuando tengas una cotización con B &amp; W.{" "}
            <Link href="/cotizador" className="text-accent hover:underline">
              Cotiza tu PC
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
