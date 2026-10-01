/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-30
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/**
 * Datos de la torre del hero (generados desde el proyecto de video BWReel con scripts/build-tower-assets.py; no editar a mano):
 * `public/hero/tower-base*.webp` es la torre sin aspas y con fondo transparente, y cada ventilador
 * es un sprite de aspas de frente que se coloca con una matriz afín (en px de la imagen grande).
 * `dir` = sentido de giro (el ventilador central de la GPU gira al revés).
 */
export type FanSprite = "front120" | "gpuA" | "gpuB";

export interface TowerFan {
  sprite: FanSprite;
  dir: 1 | -1;
  /** matrix(a b c d e f) del sprite (px de 320) a la imagen de la torre. */
  m: [number, number, number, number, number, number];
}

export const TOWER_W = 995;
export const TOWER_H = 1300;
export const TOWER_SPRITE_PX = 320;
/** Posición (px de la imagen) de la luz del frente. */
export const TOWER_LED = { x: 881.87, y: 1146.37 };

export const TOWER_FANS: TowerFan[] = [
  { sprite: "front120", dir: 1, m: [0.58888, -0.33999, 0.0, 0.67998, 716.13457, 972.35022] },
  { sprite: "front120", dir: 1, m: [0.58888, -0.33999, 0.0, 0.67998, 716.13457, 776.51657] },
  { sprite: "front120", dir: 1, m: [0.58888, -0.33999, 0.0, 0.67998, 716.13457, 580.68293] },
  { sprite: "gpuA", dir: 1, m: [-0.58888, -0.33999, 0.58888, -0.33999, 322.62262, 541.5978] },
  { sprite: "gpuB", dir: -1, m: [-0.58888, -0.33999, 0.58888, -0.33999, 463.95338, 623.19515] },
  { sprite: "gpuA", dir: 1, m: [-0.58888, -0.33999, 0.58888, -0.33999, 605.28414, 704.7925] },
];
