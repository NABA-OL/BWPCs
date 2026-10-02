/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-01
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Generado por BWReel (scripts/build-component-assets.py). No editar a mano.

export type PieceId =
  | "procesador" | "graficas" | "ram" | "boards"
  | "fuentes" | "chasis" | "refrigeracion" | "almacenamiento";

/** Variante dentro de un paso: refrigeración (aire | líquida), almacenamiento (M.2 | SATA | HDD); el resto tiene solo "unica". */
export type VariantId = "unica" | "aire" | "liquida" | "m2" | "sata" | "hdd";

/** Imagen dibujada en el viewBox de la variante (x=0,y=0,width=w,height=h salvo que se diga otra cosa). */
export interface StageImagePart {
  type: "image";
  href: string;        // ruta pública, p. ej. "/servicios/graficas-base.webp" o "/servicios/almacenamiento-sata-slide.webp"
  hrefSm: string;      // versión para pantallas < 768 px (igual a href si no hay variante)
  role: "base" | "slide" | "glow";
  /** Solo "slide": desplazamiento inicial en px de diseño [dx, dy]; la parte llega a [0,0] a mitad de su tramo. */
  from?: [number, number];
}
/** Ventilador/rotor: sprite cuadrado `size`×`size` px de diseño, colocado con la matriz afín m = [a,b,c,d,e,f] (SVG matrix) y girado con rotate(ángulo, size/2, size/2). dir = ±1. */
export interface StageRotorPart {
  type: "rotor";
  href: string;
  size: number;
  m: [number, number, number, number, number, number];
  dir: 1 | -1;
}
/** Trazo proyectado (pistas de la placa, corrientes de aire o flujo dentro de los tubos), coordenadas del viewBox. */
export interface StagePathPart {
  type: "path";
  d: string;
  kind: "trace" | "air" | "flow";
}
export type StagePart = StageImagePart | StageRotorPart | StagePathPart;

export interface StageView {
  w: number;           // ancho del viewBox
  h: number;           // alto del viewBox
  parts: StagePart[];  // orden de dibujo, de atrás hacia adelante
}
export interface StageVariant extends StageView {
  id: VariantId;
}
export interface StagePiece {
  variants: readonly [StageVariant, ...StageVariant[]];
}

export const STAGE_ORDER: readonly PieceId[] = ["procesador", "graficas", "ram", "boards", "fuentes", "chasis", "refrigeracion", "almacenamiento"];

export const STAGE_PIECES: Record<PieceId, StagePiece> = {
  procesador: {
    variants: [
      {
        id: "unica",
        w: 500,
        h: 301,
        parts: [
          { type: "image", href: "/servicios/procesador-base.webp", hrefSm: "/servicios/procesador-base-sm.webp", role: "base" },
          { type: "image", href: "/servicios/procesador-slide.webp", hrefSm: "/servicios/procesador-slide.webp", role: "slide", from: [0, -42.3] },
        ],
      },
    ],
  },
  graficas: {
    variants: [
      {
        id: "unica",
        w: 501,
        h: 357,
        parts: [
          { type: "image", href: "/servicios/graficas-base.webp", hrefSm: "/servicios/graficas-base-sm.webp", role: "base" },
          { type: "rotor", href: "/servicios/graficas-gpuA.webp", size: 164, m: [-0.7071, -0.4082, 0.7071, -0.4082, 140.4487, 142.7484], dir: 1 },
          { type: "rotor", href: "/servicios/graficas-gpuB.webp", size: 164, m: [-0.7071, -0.4082, 0.7071, -0.4082, 255, 208.8846], dir: -1 },
          { type: "rotor", href: "/servicios/graficas-gpuA.webp", size: 164, m: [-0.7071, -0.4082, 0.7071, -0.4082, 369.5513, 275.0208], dir: 1 },
        ],
      },
    ],
  },
  ram: {
    variants: [
      {
        id: "unica",
        w: 500,
        h: 409,
        parts: [
          { type: "image", href: "/servicios/ram-base.webp", hrefSm: "/servicios/ram-base-sm.webp", role: "base" },
          { type: "image", href: "/servicios/ram-slide.webp", hrefSm: "/servicios/ram-slide-sm.webp", role: "slide", from: [0, -33.1] },
          { type: "image", href: "/servicios/ram-glow.webp", hrefSm: "/servicios/ram-glow.webp", role: "glow" },
        ],
      },
    ],
  },
  boards: {
    variants: [
      {
        id: "unica",
        w: 498,
        h: 294,
        parts: [
          { type: "image", href: "/servicios/boards-base.webp", hrefSm: "/servicios/boards-base-sm.webp", role: "base" },
          { type: "path", kind: "trace", d: "M142.7 187L213.4 146.2L275.3 151.3L346 110.4" },
          { type: "path", kind: "trace", d: "M160.4 197.2L248.8 146.2L293 151.3L329.6 130.1" },
          { type: "path", kind: "trace", d: "M284.1 227.8L346 192.1L346 187.1" },
          { type: "path", kind: "trace", d: "M350 169.4L381.4 151.3" },
          { type: "path", kind: "trace", d: "M318.2 114.8L335.8 125" },
          { type: "path", kind: "trace", d: "M354.8 135.9L363.7 141.1L407.9 115.5" },
          { type: "path", kind: "trace", d: "M151.5 232.9L186.9 212.5L209 215L235.5 199.7" },
        ],
      },
    ],
  },
  fuentes: {
    variants: [
      {
        id: "unica",
        w: 502,
        h: 462,
        parts: [
          { type: "image", href: "/servicios/fuentes-base.webp", hrefSm: "/servicios/fuentes-base-sm.webp", role: "base" },
          { type: "rotor", href: "/servicios/fuentes-psu.webp", size: 336, m: [0.7071, -0.4082, 0.7071, 0.4082, 13.4121, 161.0426], dir: 1 },
          { type: "image", href: "/servicios/fuentes-grille.webp", hrefSm: "/servicios/fuentes-grille-sm.webp", role: "base" },
        ],
      },
    ],
  },
  chasis: {
    variants: [
      {
        id: "unica",
        w: 374,
        h: 499,
        parts: [
          { type: "image", href: "/servicios/chasis-base.webp", hrefSm: "/servicios/chasis-base-sm.webp", role: "base" },
          { type: "rotor", href: "/servicios/chasis-front120.webp", size: 98, m: [0.7071, -0.4082, 0, 0.8165, 267.7941, 374.2772], dir: 1 },
          { type: "rotor", href: "/servicios/chasis-front120.webp", size: 98, m: [0.7071, -0.4082, 0, 0.8165, 267.7941, 301.7723], dir: 1 },
          { type: "rotor", href: "/servicios/chasis-front120.webp", size: 98, m: [0.7071, -0.4082, 0, 0.8165, 267.7941, 229.2674], dir: 1 },
          { type: "path", kind: "air", d: "M338.5 485.2C332.6 481.8 314.7 471.5 302.8 464.6C290.9 457.7 279 450.8 267 443.9C255.1 437 243.2 430.2 231.3 423.3C219.4 416.4 207.4 409.5 195.5 402.6C183.6 395.8 171.7 388.9 159.8 382C147.8 375.1 130.4 365.3 124 361.4C117.7 357.4 122.5 359.9 121.7 358.2C120.9 356.6 120 354.2 119 351.4C118.1 348.5 117.1 345 116.1 341C115.1 337 114 332.5 112.9 327.4C111.8 322.4 110.7 316.8 109.6 310.8C108.5 304.8 107.3 298.3 106.2 291.3C105.1 284.4 104 277 102.9 269.3C101.8 261.5 100.7 253.4 99.6 244.9C98.6 236.4 97.6 227.5 96.6 218.3C95.6 209.1 94.7 199.5 93.8 189.8C92.9 180 92.1 169.9 91.3 159.5C90.6 149.2 89.9 138.6 89.2 127.8C88.6 117 88.1 106 87.7 94.9C87.3 83.7 86.9 72.3 86.7 60.8C86.5 49.4 86.4 31.8 86.3 26" },
          { type: "path", kind: "air", d: "M356.3 443.5C350.4 440.1 332.5 429.8 320.6 422.9C308.7 416 296.7 409.1 284.8 402.2C272.9 395.4 261 388.5 249.1 381.6C237.2 374.7 225.2 367.8 213.3 360.9C201.4 354.1 189.5 347.2 177.6 340.3C165.6 333.4 148.7 323.9 141.8 319.7C134.9 315.4 138.2 316.9 136.3 314.8C134.5 312.6 132.6 309.8 130.8 306.5C129 303.2 127.1 299.4 125.3 295.1C123.5 290.8 121.7 286 119.9 280.9C118.2 275.7 116.4 270 114.7 264C113 258 111.3 251.6 109.6 244.8C108 238.1 106.4 230.9 104.9 223.5C103.3 216.1 101.9 208.4 100.4 200.4C99 192.4 97.7 184.1 96.4 175.6C95.1 167.2 93.9 158.5 92.8 149.6C91.7 140.7 90.7 131.6 89.7 122.4C88.8 113.3 88 103.9 87.2 94.5C86.5 85.1 85.9 75.5 85.4 65.9C84.9 56.4 84.5 46.7 84.2 37.1C84 27.4 83.9 13 83.8 8.1" },
          { type: "path", kind: "air", d: "M356.3 402.4C350.4 399 332.5 388.7 320.6 381.8C308.7 374.9 296.7 368 284.8 361.2C272.9 354.3 261 347.4 249.1 340.5C237.2 333.6 225.2 326.7 213.3 319.9C201.4 313 189.5 306.1 177.6 299.2C165.6 292.3 148.7 282.8 141.8 278.6C134.9 274.3 138.2 275.9 136.3 273.7C134.5 271.5 132.6 268.7 130.8 265.5C129 262.3 127.1 258.5 125.3 254.3C123.5 250.2 121.7 245.5 119.9 240.5C118.2 235.6 116.4 230.1 114.7 224.4C113 218.7 111.3 212.7 109.6 206.3C108 200 106.4 193.4 104.9 186.6C103.3 179.8 101.9 172.7 100.4 165.5C99 158.3 97.7 150.9 96.4 143.4C95.1 136 93.9 128.3 92.8 120.7C91.7 113 90.7 105.3 89.7 97.6C88.8 89.9 88 82.1 87.2 74.4C86.5 66.8 85.9 59.1 85.4 51.6C84.9 44.1 84.5 36.6 84.2 29.4C84 22.1 83.9 11.7 83.8 8.1" },
          { type: "path", kind: "air", d: "M338.5 381.3C332.6 377.9 314.7 367.5 302.8 360.6C290.9 353.8 279 346.9 267 340C255.1 333.1 243.2 326.2 231.3 319.4C219.4 312.5 207.4 305.6 195.5 298.7C183.6 291.8 171.7 285 159.8 278.1C147.8 271.2 131.4 262 124 257.4C116.6 252.9 118.2 253.5 115.4 250.7C112.7 248 110 244.6 107.3 240.9C104.7 237.2 102.2 233 99.7 228.5C97.3 224 94.9 219 92.6 213.8C90.3 208.5 88.1 202.9 86 197.1C83.9 191.3 81.9 185.2 80 178.9C78 172.6 76.2 166.1 74.5 159.5C72.7 152.9 71.1 146.1 69.6 139.3C68 132.5 66.6 125.6 65.2 118.7C63.9 111.8 62.7 104.9 61.5 98C60.4 91.2 59.4 84.3 58.5 77.6C57.5 70.9 56.7 64.3 56 57.9C55.3 51.5 54.7 45.3 54.3 39.3C53.8 33.3 53.4 27.5 53.2 22.1C53 16.7 52.9 9.2 52.8 6.7" },
          { type: "path", kind: "air", d: "M338.5 340.2C332.6 336.8 314.7 326.4 302.8 319.6C290.9 312.7 279 305.8 267 298.9C255.1 292 243.2 285.2 231.3 278.3C219.4 271.4 207.4 264.5 195.5 257.6C183.6 250.7 171.7 243.9 159.8 237C147.8 230.1 131.4 220.9 124 216.3C116.6 211.8 118.2 212.4 115.4 209.6C112.7 206.9 110 203.6 107.3 200C104.7 196.3 102.2 192.2 99.7 187.8C97.3 183.3 94.9 178.5 92.6 173.5C90.3 168.4 88.1 163.1 86 157.6C83.9 152.1 81.9 146.3 80 140.5C78 134.6 76.2 128.6 74.5 122.6C72.7 116.6 71.1 110.5 69.6 104.5C68 98.5 66.6 92.4 65.2 86.5C63.9 80.6 62.7 74.7 61.5 69.1C60.4 63.5 59.4 57.9 58.5 52.7C57.5 47.5 56.7 42.5 56 37.9C55.3 33.3 54.7 28.9 54.3 25C53.8 21 53.4 17.5 53.2 14.4C53 11.4 52.9 8 52.8 6.7" },
          { type: "path", kind: "air", d: "M356.3 298.5C350.4 295.1 332.5 284.8 320.6 277.9C308.7 271 296.7 264.1 284.8 257.2C272.9 250.3 261 243.5 249.1 236.6C237.2 229.7 225.2 222.8 213.3 215.9C201.4 209.1 189.5 202.2 177.6 195.3C165.6 188.4 148.2 178.6 141.8 174.7C135.5 170.7 140.3 173.2 139.5 171.6C138.6 170 137.6 167.8 136.7 165.2C135.7 162.6 134.6 159.4 133.5 156C132.4 152.5 131.2 148.6 130.1 144.4C128.9 140.3 127.7 135.8 126.5 131.2C125.2 126.5 124 121.6 122.8 116.7C121.5 111.7 120.3 106.5 119.1 101.4C117.9 96.3 116.6 91.1 115.5 86C114.3 81 113.2 75.9 112.1 71C111 66.1 109.9 61.3 108.9 56.9C107.9 52.4 107 48 106.2 44.1C105.3 40.2 104.5 36.5 103.9 33.3C103.2 30.1 102.6 27.2 102.1 25C101.6 22.7 101.2 20.8 101 19.6C100.7 18.4 100.6 18.1 100.6 17.8" },
        ],
      },
    ],
  },
  refrigeracion: {
    variants: [
      {
        id: "aire",
        w: 397,
        h: 511,
        parts: [
          { type: "image", href: "/servicios/refrigeracion-aire-base.webp", hrefSm: "/servicios/refrigeracion-aire-base-sm.webp", role: "base" },
          { type: "rotor", href: "/servicios/refrigeracion-aire-front120.webp", size: 328, m: [0.7071, -0.4082, 0, 0.8165, 156.0563, 216.5784], dir: 1 },
        ],
      },
      {
        id: "liquida",
        w: 492,
        h: 502,
        parts: [
          { type: "image", href: "/servicios/refrigeracion-liquida-base.webp", hrefSm: "/servicios/refrigeracion-liquida-base-sm.webp", role: "base" },
          { type: "rotor", href: "/servicios/refrigeracion-liquida-front120.webp", size: 206, m: [0.7071, -0.4082, 0, 0.8165, 206.7885, 197.2833], dir: 1 },
          { type: "rotor", href: "/servicios/refrigeracion-liquida-front120.webp", size: 206, m: [0.7071, -0.4082, 0, 0.8165, 338.3104, 121.3491], dir: 1 },
          { type: "path", kind: "flow", d: "M107.9 395.7L109.2 393.3L110.4 390.9L111.4 388.5L112.4 386.1L113.3 383.6L114.2 381.2L115 378.7L115.8 376.3L116.5 373.8L117.1 371.4L117.7 369L118.2 366.6L119.1 361.8L119.9 357.1L121 350L122.4 340.6L123.1 335.9L124.3 328.8L125.4 321.7L127.4 307.6L128.5 300.5L129.3 295.8L130.2 291L131.1 286.2L131.9 281.5L132.3 279.1L132.8 276.7L133.4 274.3L134.1 271.9L135.1 269.4L136.6 267.2L138.4 265.4L140.2 264L142.1 262.4" },
          { type: "path", kind: "flow", d: "M168.4 277.6L166.5 279.2L164.7 280.6L162.9 282.4L161.4 284.6L160.4 287L159.7 289.5L159.1 291.9L158.6 294.3L157.8 299.1L157 303.8L155.6 310.9L154.8 315.7L153.7 322.8L151.3 339.2L150.2 346.3L149.4 351.1L148.3 358.1L147 367.5L146.2 372.2L145.4 377L144.5 381.8L144 384.2L143.4 386.6L142.8 389L142.1 391.5L141.3 393.9L140.5 396.3L139.6 398.8L138.7 401.2L137.7 403.7L136.7 406.1L135.5 408.5L134.2 410.8L132.7 413L131.8 414" },
        ],
      },
    ],
  },
  almacenamiento: {
    variants: [
      {
        id: "m2",
        w: 500,
        h: 300,
        parts: [
          { type: "image", href: "/servicios/almacenamiento-m2-base.webp", hrefSm: "/servicios/almacenamiento-m2-base-sm.webp", role: "base" },
          { type: "image", href: "/servicios/almacenamiento-m2-slide.webp", hrefSm: "/servicios/almacenamiento-m2-slide-sm.webp", role: "slide", from: [45.8, -43] },
          { type: "image", href: "/servicios/almacenamiento-m2-front.webp", hrefSm: "/servicios/almacenamiento-m2-front.webp", role: "base" },
        ],
      },
      {
        id: "sata",
        w: 501,
        h: 306,
        parts: [
          { type: "image", href: "/servicios/almacenamiento-sata-base.webp", hrefSm: "/servicios/almacenamiento-sata-base-sm.webp", role: "base" },
          { type: "image", href: "/servicios/almacenamiento-sata-slide.webp", hrefSm: "/servicios/almacenamiento-sata-slide.webp", role: "slide", from: [-34.2, 19.7] },
        ],
      },
      {
        id: "hdd",
        w: 500,
        h: 358,
        parts: [
          { type: "image", href: "/servicios/almacenamiento-hdd-base.webp", hrefSm: "/servicios/almacenamiento-hdd-base.webp", role: "base" },
          { type: "image", href: "/servicios/almacenamiento-hdd-slide.webp", hrefSm: "/servicios/almacenamiento-hdd-slide-sm.webp", role: "slide", from: [-65.9, 38] },
          { type: "image", href: "/servicios/almacenamiento-hdd-front.webp", hrefSm: "/servicios/almacenamiento-hdd-front.webp", role: "base" },
        ],
      },
    ],
  },
};
