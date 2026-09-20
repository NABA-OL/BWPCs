/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { getMyReviewForStory } from "@/lib/reviews/reviews";
import { storyImageResponse, storyThemeFrom } from "@/lib/reviews/story-image";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Imagen de historia (PNG 9:16) de la reseña APROBADA de quien tiene la sesión: para que la
 * comparta ella misma. Solo su reseña, con lo que ya se ve públicamente; dibujarla cuesta CPU,
 * así que hay un límite por cuenta.
 */
export async function GET(request: Request) {
  if (!ACCOUNTS_ENABLED) return new Response("No disponible", { status: 404 });
  const session = await getUserSession();
  if (!session) return new Response("Inicia sesión", { status: 401 });

  const { allowed } = await rateLimitStorage.consume(`historia:${session.user.id}`, {
    window: 3600,
    max: 30,
  });
  if (!allowed) return new Response("Demasiadas imágenes seguidas. Prueba más tarde.", { status: 429 });

  const review = await getMyReviewForStory(session.user.id);
  if (!review) return new Response("Tu reseña aún no está publicada", { status: 404 });

  return storyImageResponse(
    review,
    storyThemeFrom(new URL(request.url).searchParams.get("tema")),
    "private, max-age=300",
  );
}
