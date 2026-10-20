/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Generado por BWReel (scripts/build-piece-assets.py). No editar a mano.
import type { PiezaGeo, AlmacenamientoParteId, AlmacenamientoVistaId } from "./types.ts";

export const ALMACENAMIENTO_GEO = {
  generadoEn: "2026-10-15T00:54:34.642Z",
  modelo: "b474cfeb1f",
  vistas: {
    "m2-nvme": {
      w: 930,
      h: 560,
      imagen: { href: "/piezas/almacenamiento-m2-nvme.webp", hrefSm: "/piezas/almacenamiento-m2-nvme-sm.webp", ancho: 1860, alto: 1120, anchoSm: 1209, altoSm: 728 },
      partes: {
        "llave-m2": { ancla: [602, 146], contornos: [[[570.4, 146.4], [602.3, 127.9], [633.6, 146], [633.6, 151.4], [601.7, 169.8], [570.4, 151.7]]], foco: { x: 546.4, y: 103.9, w: 111.2, h: 89.9 }, visible: 1 },
        controlador: { ancla: [510.7, 212.8], contornos: [[[441.1, 216.3], [516.5, 172.8], [580.3, 209.6], [580.3, 219], [504.9, 262.5], [441.1, 225.7]]], foco: { x: 413.3, y: 145, w: 194.9, h: 145.4 }, visible: 1 },
        "memoria-nand": { ancla: [351.9, 314.7], contornos: [[[330.9, 273.2], [412.1, 226.4], [487.5, 269.9], [487.5, 279.3], [406.3, 326.1], [330.9, 282.6]], [[226.6, 333.5], [307.7, 286.6], [383.1, 330.1], [383.1, 339.5], [302, 386.4], [226.6, 342.9]]], foco: { x: 174.4, y: 174.2, w: 365.3, h: 264.4 }, visible: 1 },
        "tornillo-m2": { ancla: [171.5, 299.5], contornos: [[[128.6, 299.7], [171.5, 274.9], [214.4, 299.7], [214.4, 371], [171.5, 395.8], [128.6, 371]]], foco: { x: 104.4, y: 250.7, w: 134.2, h: 169.3 }, visible: 1 },
        "ranura-m2": { ancla: [742.9, 78.7], contornos: [[[648.1, 50.6], [693.9, 24.2], [837.7, 107.2], [837.7, 139.3], [791.9, 165.8], [648.1, 82.7]]], foco: { x: 610.2, y: 0, w: 265.4, h: 203.7 }, visible: 1 },
      },
    },
    "m2-sata": {
      w: 930,
      h: 560,
      imagen: { href: "/piezas/almacenamiento-m2-sata.webp", hrefSm: "/piezas/almacenamiento-m2-sata-sm.webp", ancho: 1860, alto: 1120, anchoSm: 1209, altoSm: 728 },
      partes: {
        "llave-m2": { ancla: [618.6, 153.4], contornos: [[[570.4, 146.4], [602.3, 127.9], [633.6, 146], [633.6, 151.4], [601.7, 169.8], [570.4, 151.7]], [[611, 169.8], [642.9, 151.4], [674.2, 169.5], [674.2, 174.8], [642.3, 193.2], [611, 175.1]]], foco: { x: 546.4, y: 103.9, w: 151.8, h: 113.3 }, visible: 1 },
        controlador: { ancla: [510.7, 212.8], contornos: [[[441.1, 216.3], [516.5, 172.8], [580.3, 209.6], [580.3, 219], [504.9, 262.5], [441.1, 225.7]]], foco: { x: 413.3, y: 145, w: 194.9, h: 145.4 }, visible: 1 },
        "memoria-nand": { ancla: [351.9, 314.7], contornos: [[[330.9, 273.2], [412.1, 226.4], [487.5, 269.9], [487.5, 279.3], [406.3, 326.1], [330.9, 282.6]], [[226.6, 333.5], [307.7, 286.6], [383.1, 330.1], [383.1, 339.5], [302, 386.4], [226.6, 342.9]]], foco: { x: 174.4, y: 174.2, w: 365.3, h: 264.4 }, visible: 1 },
        "tornillo-m2": { ancla: [171.5, 299.5], contornos: [[[128.6, 299.7], [171.5, 274.9], [214.4, 299.7], [214.4, 371], [171.5, 395.8], [128.6, 371]]], foco: { x: 104.4, y: 250.7, w: 134.2, h: 169.3 }, visible: 1 },
        "ranura-m2": { ancla: [742.9, 78.7], contornos: [[[648.1, 50.6], [693.9, 24.2], [837.7, 107.2], [837.7, 139.3], [791.9, 165.8], [648.1, 82.7]]], foco: { x: 610.2, y: 0, w: 265.4, h: 203.7 }, visible: 1 },
      },
    },
    "ssd-sata": {
      w: 900,
      h: 550,
      imagen: { href: "/piezas/almacenamiento-ssd-sata.webp", hrefSm: "/piezas/almacenamiento-ssd-sata-sm.webp", ancho: 1800, alto: 1100, anchoSm: 1170, altoSm: 715 },
      partes: {
        "conector-sata-datos": { ancla: [138.3, 375.3], contornos: [[[48.9, 394.2], [170.7, 323.9], [227.7, 356.8], [227.7, 389.7], [105.9, 460], [48.9, 427.1]]], foco: { x: 13.1, y: 288.1, w: 250.3, h: 207.6 }, visible: 1 },
        "conector-sata-poder": { ancla: [230.2, 428.4], contornos: [[[113.2, 431.3], [235, 361], [347.2, 425.8], [347.2, 458.7], [225.4, 529], [113.2, 464.2]]], foco: { x: 66.4, y: 314.2, w: 327.6, h: 235.8 }, visible: 1 },
        carcasa: { ancla: [488.7, 239.3], contornos: [[[98.4, 279.5], [558, 14.1], [879.1, 199.5], [879.1, 237.2], [419.4, 502.5], [98.4, 317.2]]], foco: { x: 0, y: 0, w: 900, h: 550 }, visible: 1 },
      },
    },
    hdd: {
      w: 850,
      h: 600,
      imagen: { href: "/piezas/almacenamiento-hdd.webp", hrefSm: "/piezas/almacenamiento-hdd-sm.webp", ancho: 1700, alto: 1200, anchoSm: 1105, altoSm: 780 },
      partes: {
        "conector-sata-datos": { ancla: [102.1, 443.3], contornos: [[[38.8, 456.7], [125, 406.9], [165.4, 430.2], [165.4, 453.5], [79.2, 503.2], [38.8, 480]]], foco: { x: 13.5, y: 381.6, w: 177.2, h: 146.9 }, visible: 1 },
        "conector-sata-poder": { ancla: [167.1, 480.9], contornos: [[[84.4, 483], [170.6, 433.2], [249.9, 479], [249.9, 502.3], [163.7, 552.1], [84.4, 506.2]]], foco: { x: 51.3, y: 400.1, w: 231.7, h: 185.1 }, visible: 1 },
        carcasa: { ancla: [426.5, 247.7], contornos: [[[22.2, 290.5], [500.4, 14.4], [830.9, 205.2], [830.9, 303.6], [352.7, 579.7], [22.2, 388.9]]], foco: { x: 0, y: 0, w: 850, h: 600 }, visible: 1 },
      },
    },
  },
} satisfies PiezaGeo<AlmacenamientoParteId, AlmacenamientoVistaId>;
