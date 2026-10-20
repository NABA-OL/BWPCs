/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Generado por BWReel (scripts/build-piece-assets.py). No editar a mano.
import type { PiezaGeo, FuenteParteId, FuenteVistaId } from "./types.ts";

export const FUENTE_DE_PODER_GEO = {
  generadoEn: "2026-10-15T00:59:49.363Z",
  modelo: "0fe13e1919",
  vistas: {
    "por-fuera": {
      w: 1020,
      h: 640,
      imagen: { href: "/piezas/fuente-de-poder-por-fuera.webp", hrefSm: "/piezas/fuente-de-poder-por-fuera-sm.webp", ancho: 2040, alto: 1280, anchoSm: 1326, altoSm: 832 },
      partes: {
        "rejilla-ventilador": { ancla: [670.7, 200.6], contornos: [[[390.1, 200.7], [670.7, 38.7], [951.2, 200.7], [951.2, 203.8], [670.7, 365.8], [390.1, 203.8]]], foco: { x: 277.9, y: 0, w: 742.1, h: 478 }, visible: 1 },
        "entrada-ac": { ancla: [437.6, 335.7], contornos: [[[392.3, 317.4], [405.9, 309.6], [482.8, 354], [482.8, 406.3], [469.3, 414.1], [392.3, 369.7]]], foco: { x: 368.3, y: 285.6, w: 138.5, h: 152.5 }, visible: 1 },
        interruptor: { ancla: [558.6, 414.7], contornos: [[[537.2, 406.3], [543.9, 402.4], [580.1, 423.3], [580.1, 449.4], [573.4, 453.3], [537.2, 432.4]]], foco: { x: 513.2, y: 378.4, w: 90.9, h: 98.9 }, visible: 1 },
        "banco-modular": { ancla: [852.2, 373.9], contornos: [[[749.9, 429.8], [949, 314.8], [954.6, 318.1], [954.6, 412.2], [755.5, 527.1], [749.9, 523.9]]], foco: { x: 707.4, y: 272.3, w: 289.6, h: 297.2 }, visible: 1 },
        etiqueta: { ancla: [172.3, 157], contornos: [[[57.5, 92.7], [60.8, 90.8], [287.1, 221.4], [287.1, 367.7], [283.7, 369.7], [57.5, 239.1]]], foco: { x: 1.7, y: 35, w: 341.2, h: 390.5 }, visible: 1 },
      },
    },
    "por-dentro": {
      w: 980,
      h: 890,
      imagen: { href: "/piezas/fuente-de-poder-por-dentro.webp", hrefSm: "/piezas/fuente-de-poder-por-dentro-sm.webp", ancho: 1960, alto: 1780, anchoSm: 1274, altoSm: 1157 },
      partes: {
        "filtro-emi": { ancla: [516.2, 685.2], contornos: [[[420.9, 720.4], [577.1, 630.3], [616.1, 652.8], [616.1, 720.4], [460, 810.6], [420.9, 788]]], foco: { x: 381.9, y: 591.3, w: 273.3, h: 258.4 }, visible: 1 },
        rectificador: { ancla: [349.4, 588.9], contornos: [[[277.8, 577.7], [329.9, 547.7], [420.9, 600.2], [420.9, 750.5], [368.9, 780.5], [277.8, 727.9]]], foco: { x: 231.2, y: 501.1, w: 236.2, h: 325.9 }, visible: 1 },
        pfc: { ancla: [464.6, 590], contornos: [[[381.9, 592.7], [460, 547.7], [538, 592.7], [538, 690.4], [460, 735.5], [381.9, 690.4]]], foco: { x: 344.3, y: 510.1, w: 231.2, h: 262.9 }, visible: 0.94 },
        "condensadores-primarios": { ancla: [655.1, 397.3], contornos: [[[492.5, 427.5], [707.2, 303.5], [817.8, 367.4], [817.8, 562.7], [603.1, 686.6], [492.5, 622.8]]], foco: { x: 415.9, y: 226.9, w: 478.5, h: 536.3 }, visible: 1 },
        transformador: { ancla: [342.9, 457.4], contornos: [[[238.8, 457.5], [342.9, 397.4], [447, 457.5], [447, 607.8], [342.9, 667.9], [238.8, 607.8]]], foco: { x: 184.7, y: 343.3, w: 316.4, h: 378.7 }, visible: 1 },
        "salida-secundaria": { ancla: [476.2, 353], contornos: [[[321.4, 355], [479.5, 263.7], [631.1, 351.2], [631.1, 448.9], [473, 540.2], [321.4, 452.6]]], foco: { x: 259.5, y: 201.8, w: 433.6, h: 400.4 }, visible: 1 },
      },
    },
    conectores: {
      w: 850,
      h: 630,
      imagen: { href: "/piezas/fuente-de-poder-conectores.webp", hrefSm: "/piezas/fuente-de-poder-conectores-sm.webp", ancho: 1700, alto: 1260, anchoSm: 1105, altoSm: 819 },
      partes: {
        "atx-24": { ancla: [330.9, 528.4], contornos: [[[252.4, 552.9], [373.3, 483.1], [409.4, 504], [409.4, 544.4], [288.5, 614.2], [252.4, 593.4]]], foco: { x: 221, y: 451.7, w: 219.8, h: 178.3 }, visible: 1 },
        "eps-cpu": { ancla: [485, 487.4], contornos: [[[444, 490.3], [490, 463.8], [526.1, 484.6], [526.1, 525.1], [480.1, 551.6], [444, 530.8]]], foco: { x: 420, y: 439.8, w: 130.1, h: 135.8 }, visible: 1 },
        "pcie-6-2": { ancla: [518.6, 420], contornos: [[[477.5, 423], [523.6, 396.4], [559.7, 417.2], [559.7, 457.7], [513.6, 484.3], [477.5, 463.4]]], foco: { x: 453.5, y: 372.4, w: 130.2, h: 135.9 }, visible: 1 },
        "12v-2x6": { ancla: [635.6, 415.8], contornos: [[[594.3, 406.4], [641.6, 379.1], [673.2, 397.3], [673.2, 435], [625.9, 462.3], [594.3, 444.1]]], foco: { x: 570.3, y: 355.1, w: 126.9, h: 131.2 }, visible: 1 },
        "sata-poder": { ancla: [669.8, 353.9], contornos: [[[629.1, 361.7], [683.2, 330.5], [710.4, 346.1], [710.4, 360.4], [656.3, 391.6], [629.1, 375.9]]], foco: { x: 605.1, y: 306.5, w: 129.3, h: 109.1 }, visible: 1 },
        molex: { ancla: [794.5, 318], contornos: [[[753.9, 323.3], [803.5, 294.6], [835.1, 312.9], [835.1, 341.5], [785.5, 370.1], [753.9, 351.9]]], foco: { x: 729.9, y: 270.6, w: 120.1, h: 123.5 }, visible: 1 },
      },
    },
  },
} satisfies PiezaGeo<FuenteParteId, FuenteVistaId>;
