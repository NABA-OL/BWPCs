/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { Avatar, Style } from "@dicebear/core";
import adventurerNeutral from "@dicebear/styles/adventurer-neutral.json";
import gaze from "@dicebear/styles/gaze.json";
import loreleiNeutral from "@dicebear/styles/lorelei-neutral.json";
import pixelbot from "@dicebear/styles/pixelbot.json";
import type { AvatarStyleId } from "@/lib/avatar-styles";

const STYLES: Record<AvatarStyleId, Style> = {
  "lorelei-neutral": new Style(loreleiNeutral),
  gaze: new Style(gaze),
  "adventurer-neutral": new Style(adventurerNeutral),
  pixelbot: new Style(pixelbot),
};

export function renderAvatarSvg(style: AvatarStyleId, seed: string): string {
  return new Avatar(STYLES[style], { seed }).toString();
}
