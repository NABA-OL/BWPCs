/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { getSession } from "@/lib/auth/session";
import { getReviewForStory } from "@/lib/reviews/reviews";
import { storyImageResponse, storyThemeFrom } from "@/lib/reviews/story-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Imagen PNG de una reseña aprobada, lista para subir como historia. Solo el admin. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return new Response("No autorizado", { status: 401 });

  const { id } = await params;
  const review = await getReviewForStory(id);
  if (!review) return new Response("Reseña no encontrada o sin aprobar", { status: 404 });

  return storyImageResponse(review, storyThemeFrom(new URL(request.url).searchParams.get("tema")));
}
