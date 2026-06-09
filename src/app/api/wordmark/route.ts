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
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
  );
}
