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
import { ShareReview } from "@/components/account/share-review";
import { hasPaidPurchase } from "@/lib/account/quotes";
import { getMyReview } from "@/lib/reviews/reviews";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Mi reseña" };

export default async function ResenaPage() {
  const session = await getUserSession();
  if (!session) redirect("/cuenta/ingresar?next=/cuenta/resena");

  const [eligible, mine] = await Promise.all([
    hasPaidPurchase(session.user.id),
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
        {eligible ? (
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
        ) : mine ? (
          <div className="space-y-3 text-sm">
            <p className="text-component">
              Tu reseña sigue como estaba. Para editarla necesitas una compra confirmada con B &amp; W.
            </p>
            <p className="whitespace-pre-line border-l-2 border-hairline pl-3">{mine.review.comentario}</p>
          </div>
        ) : (
          <p className="text-sm text-component">
            Las reseñas son de quienes ya compraron: podrás dejar la tuya cuando tu compra esté confirmada.{" "}
            <Link href="/cotizador" className="text-accent hover:underline">
              Cotiza tu PC
            </Link>
            .
          </p>
        )}
      </div>

      {mine?.review.estado === "aprobada" && (
        <ShareReview version={mine.review.actualizado.toISOString()} />
      )}
    </section>
  );
}
