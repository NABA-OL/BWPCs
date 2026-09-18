/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/**
 * Estilos de avatar (DiceBear 10) disponibles para las cuentas. Se guarda
 * `{avatarStyle, avatarSeed}` en el usuario; el SVG se genera en el servidor
 * (`/api/avatar`), determinista y cacheable. Para agregar un estilo: añadirlo
 * aquí y en `lib/avatar.ts`.
 */
export const AVATAR_STYLES = [
  { id: "lorelei-neutral", label: "Lorelei" },
  { id: "gaze", label: "Gaze" },
  { id: "adventurer-neutral", label: "Adventurer" },
  { id: "pixelbot", label: "Pixelbot" },
] as const;

export type AvatarStyleId = (typeof AVATAR_STYLES)[number]["id"];

export const AVATAR_SEED_RE = /^[A-Za-z0-9_-]{1,64}$/;

export function isAvatarStyle(value: unknown): value is AvatarStyleId {
  return AVATAR_STYLES.some((s) => s.id === value);
}

export function avatarUrl(style: string, seed: string): string {
  return `/api/avatar?style=${encodeURIComponent(style)}&seed=${encodeURIComponent(seed)}`;
}

/** Semilla aleatoria corta (solo letras y números: cumple AVATAR_SEED_RE). */
export function randomAvatarSeed(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 12);
}

// Adventurer Neutral es CC BY 4.0: exige atribución donde se use.
export const AVATAR_CREDITS = {
  text: "Avatares de DiceBear. «Adventurer Neutral» es una adaptación de la obra de",
  author: { name: "Lisa Wischofsky", url: "https://www.instagram.com/lischi_art/" },
  license: { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" },
} as const;
