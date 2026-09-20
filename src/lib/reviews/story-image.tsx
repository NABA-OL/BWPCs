/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { AVATAR_CREDITS, isAvatarStyle } from "@/lib/avatar-styles";
import { renderAvatarSvg } from "@/lib/avatar";
import { siteUrl } from "@/lib/user-auth/site-url";
import type { StoryReview } from "@/lib/reviews/reviews";

/** Historia vertical 9:16 (1080×1920). Los ~260 px de arriba y abajo quedan libres: ahí la app pone sus botones. */
const WIDTH = 1080;
const HEIGHT = 1920;
const SAFE = 260;
const SIDE = 72;
const CONTENT_H = HEIGHT - SAFE * 2;

const THEMES = {
  claro: { bg: "#FAF8F3", ink: "#0A0A0A", muted: "#6B6B6B", line: "#D9D6CF" },
  oscuro: { bg: "#0A0A0A", ink: "#FAF8F3", muted: "#9A9A9A", line: "#2B2B2B" },
} as const;
type ThemeId = keyof typeof THEMES;
const ACCENT = "#C83C2A";

const STAR_PATH = "M12 2.5l2.94 6.1 6.56.9-4.8 4.6 1.2 6.6L12 17.6l-5.9 3.1 1.2-6.6-4.8-4.6 6.56-.9L12 2.5z";

const font = (name: string) => readFile(join(process.cwd(), "src/assets/fonts", name));

const TEXT_W = WIDTH - SIDE * 2;
/** Ancho medio de un carácter de Geist, en múltiplos del tamaño de letra (con margen de seguridad). */
const CHAR_W = 0.52;

function linesFor(text: string, size: number, width: number): number {
  const perLine = Math.max(1, Math.floor(width / (size * CHAR_W)));
  return Math.ceil(text.length / perLine) + 1; // +1: cortes de palabra
}

/**
 * Mayor tamaño de letra (px) con el que el comentario cabe en el alto disponible. Si ni con el
 * tamaño mínimo cabe, se recorta en un límite de palabra y termina en "…" (nunca se corta a media línea).
 */
function fitComment(text: string, budgetPx: number, maxSize: number): { size: number; text: string } {
  const MIN = 28;
  for (let size = maxSize; size >= MIN; size -= 2) {
    if (linesFor(text, size, TEXT_W) * size * 1.32 <= budgetPx) return { size, text };
  }
  const maxChars = Math.floor(TEXT_W / (MIN * CHAR_W)) * Math.max(1, Math.floor(budgetPx / (MIN * 1.32)) - 1);
  const cut = text.slice(0, maxChars);
  return { size: MIN, text: `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 0)).trimEnd()}…` };
}

/** Detalles del ensamble: una columna hasta 5 renglones y dos columnas desde 6; devuelve el alto que ocupan. */
function layoutComponents(lines: string[], roomy: boolean, compact: boolean) {
  // Con fotos falta alto: la lista pasa a dos columnas desde el cuarto renglón.
  const cols = lines.length > (compact ? 3 : 5) ? 2 : 1;
  // Sin fotos hay espacio de sobra: la lista se ve más grande.
  const size = compact ? 28 : lines.length > 8 ? 28 : lines.length > 5 ? (roomy ? 34 : 32) : roomy ? 40 : 32;
  const colWidth = cols === 2 ? (TEXT_W - 40) / 2 - 28 : TEXT_W - 28;
  const perCol = Math.ceil(lines.length / cols);
  const groups = Array.from({ length: cols }, (_, c) => lines.slice(c * perCol, (c + 1) * perCol));
  const heightOf = (g: string[]) =>
    g.reduce((sum, line) => sum + Math.ceil((line.length * size * CHAR_W) / colWidth) * size * 1.4 + 6, 0);
  return { size, groups, height: Math.max(0, ...groups.map(heightOf)) };
}

function Stars({ value, color, empty }: { value: number; color: string; empty: string }) {
  return (
    <div style={{ display: "flex" }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = Math.round(value * 2) / 2 >= n;
        return (
          <svg key={n} width="64" height="64" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
            <path
              d={STAR_PATH}
              fill={filled ? color : "none"}
              stroke={filled ? "none" : empty}
              strokeWidth={filled ? 0 : 1.5}
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

const FAN_H = 400;
const FRAME = { claro: "#FFFFFF", oscuro: "#1C1C1C" } as const;

interface FanCard {
  w: number;
  h: number;
  left: number;
  top: number;
  rotate: number;
}

/** Posiciones del abanico según cuántas fotos hay: 1 sola, 2 encimadas o 3 abiertas (la del centro al frente). */
function fanCards(n: number): FanCard[] {
  if (n === 1) return [{ w: 600, h: 360, left: (TEXT_W - 600) / 2, top: 20, rotate: -2 }];
  if (n === 2) {
    return [
      { w: 470, h: 360, left: 40, top: 34, rotate: -6 },
      { w: 470, h: 360, left: TEXT_W - 470 - 40, top: 10, rotate: 5 },
    ];
  }
  return [
    { w: 380, h: 340, left: 8, top: 46, rotate: -9 },
    { w: 380, h: 340, left: TEXT_W - 380 - 8, top: 46, rotate: 9 },
    { w: 410, h: 380, left: (TEXT_W - 410) / 2, top: 8, rotate: 0 },
  ];
}

/** Las fotos de la reseña como un abanico de fotos impresas, unas detrás de otras (ya vienen en orden de dibujo). */
function Fan({ photos, theme }: { photos: string[]; theme: ThemeId }) {
  const c = THEMES[theme];
  const cards = fanCards(photos.length);
  return (
    <div style={{ display: "flex", position: "relative", width: TEXT_W, height: FAN_H }}>
      {photos.map((src, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            display: "flex",
            left: cards[i].left,
            top: cards[i].top,
            width: cards[i].w,
            height: cards[i].h,
            padding: 12,
            backgroundColor: FRAME[theme],
            border: `2px solid ${c.line}`,
            transform: `rotate(${cards[i].rotate}deg)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={cards[i].w - 28} height={cards[i].h - 28} alt="" />
        </div>
      ))}
    </div>
  );
}

/**
 * Descarga las fotos y las deja recortadas EXACTAMENTE al tamaño de su marco (JPEG en data URI, al
 * doble de resolución), en orden de dibujo: con 3 fotos las laterales van detrás y la central al
 * frente. Una foto que falle simplemente no sale.
 */
async function loadPhotos(urls: string[]): Promise<string[]> {
  const fetched = await Promise.all(
    urls.slice(0, 3).map(async (url) => {
      try {
        const res = await fetch(url.startsWith("http") ? url : `${siteUrl}${url}`, {
          signal: AbortSignal.timeout(8000),
        });
        return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
      } catch {
        return null;
      }
    }),
  );
  const buffers = fetched.flatMap((b) => (b ? [b] : []));

  const ordered = buffers.length === 3 ? [buffers[0], buffers[2], buffers[1]] : buffers;
  const cards = fanCards(ordered.length);
  const rendered = await Promise.all(
    ordered.map(async (buffer, i) => {
      try {
        const jpeg = await sharp(buffer)
          .rotate()
          .resize((cards[i].w - 28) * 2, (cards[i].h - 28) * 2, { fit: "cover" })
          .jpeg({ quality: 82 })
          .toBuffer();
        return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
      } catch {
        return null;
      }
    }),
  );
  return rendered.flatMap((p) => (p ? [p] : []));
}

function Story({
  review,
  theme,
  network,
  photos,
}: {
  review: StoryReview;
  theme: ThemeId;
  network: string | null;
  photos: string[];
}) {
  const c = THEMES[theme];
  const lines = review.componentes;
  const hasPhotos = photos.length > 0;
  const comp = layoutComponents(lines, !hasPhotos, hasPhotos);
  const compBlock = lines.length > 0 ? 32 + 42 + comp.height + 40 : 0; // filete + título + lista + separación
  const avatarSize = hasPhotos ? 124 : 160;
  const headerH = 60 + 56 + (hasPhotos ? 156 : 190); // marca + separación + autor (con estrellas y sello)
  const footerH = 120; // llamado + crédito
  const fanBlock = hasPhotos ? FAN_H + 30 : 0;
  const commentBudget = CONTENT_H - headerH - footerH - compBlock - fanBlock - 52 - 30;
  // Sin fotos el texto puede crecer más para aprovechar el espacio.
  const fitted = fitComment(`“${review.comentario}”`, commentBudget, hasPhotos ? 60 : 84);
  const adventurer = review.avatarStyle === "adventurer-neutral";

  let avatar: string | null = null;
  if (isAvatarStyle(review.avatarStyle)) {
    avatar = `data:image/svg+xml;base64,${Buffer.from(renderAvatarSvg(review.avatarStyle, review.avatarSeed)).toString("base64")}`;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: `${SAFE}px ${SIDE}px`,
        backgroundColor: c.bg,
        ...(network ? { backgroundImage: `url(${network})`, backgroundSize: "900px 900px" } : {}),
        color: c.ink,
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* marca */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 18, height: 18, backgroundColor: ACCENT, marginRight: 16 }} />
            <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1 }}>B &amp; W</div>
          </div>
          <div style={{ fontSize: 28, color: c.muted }}>Lo que dicen nuestros clientes</div>
        </div>

        {/* autora */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 56 }}>
          {avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              width={avatarSize}
              height={avatarSize}
              alt=""
              style={{ border: `2px solid ${c.line}`, marginRight: 34 }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 60, fontWeight: 700, letterSpacing: -1 }}>{review.nombre}</div>
            <div style={{ display: "flex", marginTop: 14 }}>
              <Stars value={review.estrellas} color={ACCENT} empty={c.muted} />
            </div>
            {review.compraVerificada && (
              <div style={{ fontSize: 26, color: c.muted, marginTop: 4 }}>Compra verificada</div>
            )}
          </div>
        </div>

        {/* comentario */}
        <div
          style={{
            display: "flex",
            marginTop: 52,
            fontSize: fitted.size,
            lineHeight: 1.32,
            fontWeight: 500,
          }}
        >
          {fitted.text}
        </div>
      </div>

      {hasPhotos && <Fan photos={photos} theme={theme} />}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {lines.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderTop: `2px solid ${c.line}`,
              paddingTop: 30,
              marginBottom: 40,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: c.muted, marginBottom: 14 }}>
              Detalles del ensamble
            </div>
            <div style={{ display: "flex" }}>
              {comp.groups.map((group, g) => (
                <div
                  key={g}
                  style={{ display: "flex", flexDirection: "column", flex: 1, marginLeft: g === 0 ? 0 : 40 }}
                >
                  {group.map((line, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "flex-start", fontSize: comp.size, lineHeight: 1.4, marginBottom: 6 }}
                    >
                      <div
                        style={{ width: 10, height: 10, backgroundColor: ACCENT, marginRight: 18, marginTop: comp.size * 0.5 - 5 }}
                      />
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 38, fontWeight: 500 }}>
            <div style={{ width: 16, height: 16, backgroundColor: ACCENT, marginRight: 16 }} />
            Cotiza en bw-pcs.com
          </div>
        </div>
        {adventurer && (
          <div style={{ fontSize: 18, color: c.muted, marginTop: 16 }}>
            {`Avatar «Adventurer Neutral» de ${AVATAR_CREDITS.author.name}, ${AVATAR_CREDITS.license.name}.`}
          </div>
        )}
      </div>
    </div>
  );
}

export type StoryTheme = ThemeId;

/** Lee `?tema=` (por defecto, claro). */
export function storyThemeFrom(value: string | null): StoryTheme {
  return value === "oscuro" ? "oscuro" : "claro";
}

/** Imagen PNG (1080×1920) de una reseña aprobada, lista para subir como historia. */
export async function storyImageResponse(
  review: StoryReview,
  theme: StoryTheme,
  cacheControl = "private, no-store",
): Promise<Response> {
  const [regular, medium, bold, networkFile] = await Promise.all([
    font("Geist-Regular.ttf"),
    font("Geist-Medium.ttf"),
    font("Geist-Bold.ttf"),
    theme === "claro" ? readFile(join(process.cwd(), "public/brand/email-fondo.png")).catch(() => null) : null,
  ]);
  const network = networkFile ? `data:image/png;base64,${networkFile.toString("base64")}` : null;
  const photos = await loadPhotos(review.fotos);

  return new ImageResponse(<Story review={review} theme={theme} network={network} photos={photos} />, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: "Geist", data: regular, weight: 400, style: "normal" },
      { name: "Geist", data: medium, weight: 500, style: "normal" },
      { name: "Geist", data: bold, weight: 700, style: "normal" },
    ],
    headers: { "Cache-Control": cacheControl },
  });
}
