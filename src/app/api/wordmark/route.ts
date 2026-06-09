import { collections } from "@/lib/db/collections";

export const runtime = "nodejs";

/** Frases del wordmark "B & W" (público, solo lectura). */
export async function GET() {
  let phrases: { left: string; right: string }[] = [];
  try {
    const col = await collections.settings();
    const s = await col.findOne({}, { projection: { wordmarkPhrases: 1 } });
    if (Array.isArray(s?.wordmarkPhrases)) {
      phrases = s.wordmarkPhrases.filter(
        (p) => p && typeof p.left === "string" && typeof p.right === "string",
      );
    }
  } catch {
    phrases = [];
  }

  return Response.json(
    { phrases },
    {
      headers: {
        // 1-hour browser cache, 1-hour CDN cache, serve stale for up to 24h
        // while revalidating in background. Phrases change rarely (admin-only).
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
