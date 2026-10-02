/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-01
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

// Matemática pura (sin React ni DOM) del escenario "Componentes en escena" de /servicios. La prueba `pnpm check:logic` la importa.

/** Alto del header fijo del sitio (px): el escenario se pega justo debajo. */
export const HEADER_PX = 64;
/** Cuánto scroll (en svh) dura un tramo de peso 1 (el primero de cada pieza) dentro del recorrido. */
export const SVH_PER_PIECE = 120;
/** Peso de cada variante extra de una pieza respecto del primer tramo (0,75 = 90 svh). */
export const VARIANT_WEIGHT = 0.75;
/** Grados que gira un ventilador por cada píxel de scroll dentro del recorrido. */
export const ROTOR_DEG_PER_PX = 0.9;

/** Fracción local (0 a 1) de cada pieza en la que entra, se anima y sale. */
export const ENTER_END = 0.15;
export const EXIT_START = 0.85;
export const ANIM_START = 0.1;
export const ANIM_END = 0.85;
/** Desplazamiento vertical (px) de la entrada y de la salida. */
export const SHIFT_PX = 24;

export interface StageFrame {
  /** Pieza activa (0 a n-1). */
  index: number;
  /** Progreso local dentro de esa pieza (0 a 1). */
  t: number;
  opacity: number;
  /** translateY en px (positivo = más abajo). */
  shift: number;
}

export function clamp01(x: number): number {
  if (!(x > 0)) return 0; // también cubre NaN
  return x > 1 ? 1 : x;
}

export const easeOutCubic = (u: number): number => 1 - (1 - u) ** 3;
export const easeInCubic = (u: number): number => u ** 3;

/** Tramo [a, b] de t llevado a 0..1 (con tope en los extremos). */
export function span(t: number, a: number, b: number): number {
  return clamp01((t - a) / (b - a));
}

/** Altura (CSS) del recorrido: `n` unidades de scroll (una por pieza, más 0,75 por variante extra) y la altura del escenario pegado. */
export function trackHeight(n: number): string {
  return `calc(${Math.round(n * SVH_PER_PIECE)}svh + 100dvh - ${HEADER_PX / 16}rem)`;
}

/** Progreso global 0..1 a partir de la posición del recorrido en la ventana (`top` de su rect). */
export function scrollProgress(top: number, trackLen: number): number {
  if (!(trackLen > 0)) return 0;
  return clamp01((HEADER_PX - top) / trackLen);
}

/** Qué pieza se ve y con qué opacidad/desplazamiento para un progreso global p entre n piezas. Solo una a la vez. */
export function frameFor(p: number, n: number): StageFrame {
  const x = clamp01(p) * n;
  const index = Math.min(Math.floor(x), n - 1);
  const t = clamp01(x - index);
  if (t < ENTER_END) {
    const u = t / ENTER_END;
    return { index, t, opacity: u, shift: SHIFT_PX * (1 - easeOutCubic(u)) };
  }
  if (t > EXIT_START) {
    const u = (t - EXIT_START) / (1 - EXIT_START);
    return { index, t, opacity: 1 - u, shift: -SHIFT_PX * easeInCubic(u) };
  }
  return { index, t, opacity: 1, shift: 0 };
}

export interface StageSlot {
  /** Pieza a la que pertenece el tramo (0 a n-1). */
  piece: number;
  /** Variante dentro de la pieza (0 a count-1). */
  variant: number;
  /** Inicio y fin normalizados del tramo (0..1) en el recorrido. */
  a: number;
  b: number;
  /** Inicio y fin en unidades de peso (se usan para que con pesos 1 el cálculo sea idéntico a `frameFor`). */
  start: number;
  end: number;
}

export interface StageLayout {
  slots: StageSlot[];
  /** Total de unidades: tramos de peso 1 por pieza más `VARIANT_WEIGHT` por cada variante extra. */
  units: number;
}

/** Reparte el recorrido entre las piezas y sus variantes: `counts[i]` = variantes de la pieza i (mínimo 1). */
export function stageLayout(counts: readonly number[]): StageLayout {
  const raw: Omit<StageSlot, "a" | "b">[] = [];
  let units = 0;
  counts.forEach((count, piece) => {
    for (let variant = 0; variant < Math.max(1, count); variant++) {
      const start = units;
      units += variant === 0 ? 1 : VARIANT_WEIGHT;
      raw.push({ piece, variant, start, end: units });
    }
  });
  return { slots: raw.map((s) => ({ ...s, a: s.start / units, b: s.end / units })), units };
}

export interface StageSlotFrame extends StageFrame {
  /** Tramo activo dentro de `layout.slots`. */
  slot: number;
  piece: number;
  variant: number;
  /** Opacidad del contador y el título de la pieza: solo baja al entrar a su primer tramo y al salir del último. */
  pieceOpacity: number;
}

/** Como `frameFor` pero con tramos de distinto peso (variantes dentro de una pieza). Solo un tramo visible a la vez. */
export function frameAt(p: number, layout: StageLayout): StageSlotFrame {
  const { slots, units } = layout;
  const x = clamp01(p) * units;
  let slot = 0;
  while (slot < slots.length - 1 && x >= slots[slot].end) slot++;
  const s = slots[slot];
  const t = clamp01((x - s.start) / (s.end - s.start));
  const isFirst = slot === 0 || slots[slot - 1].piece !== s.piece;
  const isLast = slot === slots.length - 1 || slots[slot + 1].piece !== s.piece;
  let opacity = 1;
  let shift = 0;
  if (t < ENTER_END) {
    const u = t / ENTER_END;
    opacity = u;
    shift = SHIFT_PX * (1 - easeOutCubic(u));
  } else if (t > EXIT_START) {
    const u = (t - EXIT_START) / (1 - EXIT_START);
    opacity = 1 - u;
    shift = -SHIFT_PX * easeInCubic(u);
  }
  const edgeOnly = (t < ENTER_END && isFirst) || (t > EXIT_START && isLast);
  return { index: s.piece, t, opacity, shift, slot, piece: s.piece, variant: s.variant, pieceOpacity: edgeOnly ? opacity : 1 };
}
