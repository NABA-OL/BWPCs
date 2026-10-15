/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Tablas del decodificador de nombres de procesador (docs/piezas-plan-2.md §2.2). BORRADOR: todo está SIN verificar.
// Los significados se redactan en prosa cualitativa (sin cifras); las cifras y las fechas viven en los `Hecho` de procesador.contenido.ts,
// y cada `hechoId` apunta a uno de ellos (o a uno de comun.hechos.ts). `check:logic` comprueba que todos existan.
// La lógica que usa estas tablas (normalizar y desglosar) es de B2 y vive en lib/piezas/procesador/decodificador.ts.
// Los nombres cambian rápido: revisar estas tablas cada seis meses (`revisadoEn`). Lo dicho de memoria por el dueño está marcado en la `nota` del hecho.
import type { DatosDecodificador, EjemploCpu, EquivalenciaGama, FamiliaCpu, SerieCpu, SufijoCpu } from "./types.ts";

const FAMILIAS: readonly FamiliaCpu[] = [
  {
    id: "ryzen",
    marca: "AMD",
    nombre: "Ryzen",
    gamas: ["3", "5", "7", "9"],
    vigente: true,
    resumen: "Línea principal de AMD para escritorio y portátiles. El número de gama ordena la línea de AMD de menor a mayor nivel.",
    hechoIds: ["cpu-amd-gamas-relativas", "cpu-amd-serie-no-es-generacion"],
  },
  {
    id: "ryzen-ai",
    marca: "AMD",
    nombre: "Ryzen AI",
    gamas: ["5", "7", "9"],
    vigente: true,
    resumen: "Nombre que AMD usa en varios procesadores de portátil recientes. Sigue el mismo orden de gamas que Ryzen y añade letras de segmento.",
    hechoIds: ["cpu-amd-ryzen-ai-esquema"],
  },
  {
    id: "core-i",
    marca: "Intel",
    nombre: "Core i",
    gamas: ["3", "5", "7", "9"],
    vigente: false,
    resumen: "Nombre anterior de Intel, con la letra i. Se sigue viendo en equipos y tiendas, sobre todo en las generaciones anteriores.",
    hechoIds: ["cpu-intel-marca-core-i-a-core", "cpu-core-i-generacion", "cpu-intel-gamas-relativas", "cpu-core-i-lga1700-vigentes"],
  },
  {
    id: "core",
    marca: "Intel",
    nombre: "Core",
    gamas: ["3", "5", "7"],
    vigente: true,
    resumen: "Familia de Intel sin la letra i ni la palabra Ultra. Su número de modelo es más corto que el de Core i.",
    hechoIds: ["cpu-core-vs-core-ultra", "cpu-core-sin-ultra-numero"],
  },
  {
    id: "core-ultra",
    marca: "Intel",
    nombre: "Core Ultra",
    gamas: ["5", "7", "9"],
    vigente: true,
    resumen: "Familia de Intel con la palabra Ultra. Intel la presenta como su línea de mayor nivel y su primer dígito indica la serie.",
    hechoIds: ["cpu-core-vs-core-ultra", "cpu-core-ultra-serie", "cpu-core-ultra-escritorio-gamas"],
  },
];

const SERIES: readonly SerieCpu[] = [
  // AMD Ryzen: el primer dígito del número de cuatro dígitos es la serie. NO equivale a la generación del socket (hecho cpu-amd-serie-no-es-generacion).
  { familia: "ryzen", prefijo: "5", digitos: 4, etiqueta: "serie 5000", hechoId: "cpu-amd-serie-no-es-generacion" },
  { familia: "ryzen", prefijo: "7", digitos: 4, etiqueta: "serie 7000", hechoId: "cpu-amd-serie-no-es-generacion" },
  { familia: "ryzen", prefijo: "8", digitos: 4, etiqueta: "serie 8000", hechoId: "cpu-amd-8000g-am5" },
  { familia: "ryzen", prefijo: "9", digitos: 4, etiqueta: "serie 9000", hechoId: "cpu-amd-serie-no-es-generacion" },
  { familia: "ryzen-ai", prefijo: "3", digitos: 3, etiqueta: "serie AI 300", segmento: "portatil", hechoId: "cpu-amd-ryzen-ai-esquema" },
  // Intel Core i: los dos primeros dígitos del número de cinco dígitos son la generación.
  { familia: "core-i", prefijo: "10", digitos: 5, etiqueta: "10.ª generación", hechoId: "cpu-core-i-generacion" },
  { familia: "core-i", prefijo: "11", digitos: 5, etiqueta: "11.ª generación", hechoId: "cpu-core-i-generacion" },
  { familia: "core-i", prefijo: "12", digitos: 5, etiqueta: "12.ª generación", hechoId: "cpu-core-i-generacion" },
  { familia: "core-i", prefijo: "13", digitos: 5, etiqueta: "13.ª generación", hechoId: "cpu-core-i-generacion" },
  { familia: "core-i", prefijo: "14", digitos: 5, etiqueta: "14.ª generación", hechoId: "cpu-core-i-generacion" },
  // Intel Core (sin Ultra): número de tres dígitos.
  { familia: "core", prefijo: "1", digitos: 3, etiqueta: "serie 1 de Core", hechoId: "cpu-core-sin-ultra-numero" },
  // Intel Core Ultra: el primer dígito del número de tres dígitos es la serie.
  { familia: "core-ultra", prefijo: "1", digitos: 3, etiqueta: "serie 1", segmento: "portatil", hechoId: "cpu-core-ultra-serie" },
  { familia: "core-ultra", prefijo: "2", digitos: 3, etiqueta: "serie 2", hechoId: "cpu-core-ultra-serie" },
];

const INTEL_TODAS = ["core-i", "core", "core-ultra"] as const;
const AMD_PORTATIL = ["ryzen", "ryzen-ai"] as const;

const SUFIJOS: readonly SufijoCpu[] = [
  // ---- Intel de escritorio
  {
    token: "K",
    familias: INTEL_TODAS,
    segmento: "escritorio",
    significado: "Multiplicador desbloqueado: pensado para quien quiere ajustar la frecuencia. No hace falta para un uso normal.",
    hechoId: "cpu-intel-sufijos-k",
  },
  {
    token: "KF",
    familias: INTEL_TODAS,
    segmento: "escritorio",
    significado: "Combina K y F: multiplicador desbloqueado y sin gráficos integrados, así que necesita tarjeta gráfica aparte.",
    compone: ["K", "F"],
    hechoId: "cpu-intel-sufijos-k",
  },
  {
    token: "KS",
    familias: INTEL_TODAS,
    segmento: "escritorio",
    significado: "Edición especial con multiplicador desbloqueado, en la línea de la K. Confirma en la ficha qué ofrece cada modelo.",
    hechoId: "cpu-intel-sufijos-k",
  },
  {
    token: "F",
    familias: INTEL_TODAS,
    segmento: "escritorio",
    significado: "Sin gráficos integrados: necesita una tarjeta gráfica aparte para ver imagen en el monitor.",
    hechoId: "video-requiere-graficos-integrados",
  },
  {
    token: "T",
    familias: INTEL_TODAS,
    segmento: "escritorio",
    significado: "Versión de escritorio pensada para consumir menos energía.",
    hechoId: "cpu-intel-sufijo-t",
  },
  // ---- Intel de portátil
  {
    token: "HX",
    familias: INTEL_TODAS,
    segmento: "portatil",
    significado: "Portátil de máximo rendimiento y con modelos desbloqueados, para equipos grandes con buena refrigeración.",
    hechoId: "cpu-intel-sufijos-h-hx",
  },
  {
    token: "H",
    familias: INTEL_TODAS,
    segmento: "portatil",
    significado: "Portátil de alto rendimiento, por encima de los de bajo consumo.",
    hechoId: "cpu-intel-sufijos-h-hx",
  },
  {
    token: "U",
    familias: INTEL_TODAS,
    segmento: "portatil",
    significado: "Portátil de bajo consumo, pensado para equipos delgados y autonomía.",
    hechoId: "cpu-intel-sufijos-u-v",
  },
  {
    token: "V",
    familias: ["core-ultra"],
    segmento: "portatil",
    significado: "Variante de portátil de la línea Core Ultra, de bajo consumo. Confirma en la ficha qué trae cada modelo.",
    hechoId: "cpu-intel-sufijos-u-v",
  },
  // ---- AMD de escritorio
  {
    token: "X3D",
    familias: ["ryzen"],
    segmento: "escritorio",
    significado: "Lleva una memoria caché adicional apilada sobre el chip (tecnología 3D V-Cache de AMD).",
    hechoId: "cpu-amd-x3d",
  },
  {
    token: "XT",
    familias: ["ryzen"],
    segmento: "escritorio",
    significado: "Versión de la serie X con frecuencias ajustadas. Confirma en la ficha en qué se diferencia.",
    hechoId: "cpu-amd-sufijos-x-xt",
  },
  {
    token: "X",
    familias: ["ryzen"],
    segmento: "escritorio",
    significado: "Versión de AMD con frecuencias más altas dentro de su gama. No dice nada sobre los gráficos integrados.",
    hechoId: "cpu-amd-sufijos-x-xt",
  },
  {
    token: "G",
    familias: ["ryzen"],
    segmento: "escritorio",
    significado: "Suele indicar gráficos integrados. En AM5 no es la única señal: revisa siempre la ficha del modelo.",
    hechoId: "cpu-amd-sufijo-g",
  },
  {
    token: "F",
    familias: ["ryzen"],
    segmento: "escritorio",
    significado: "Sin gráficos integrados: necesita tarjeta gráfica aparte. Es la señal más clara en AM5.",
    hechoId: "cpu-amd-sufijo-f",
  },
  // ---- AMD de portátil
  {
    token: "HX",
    familias: AMD_PORTATIL,
    segmento: "portatil",
    significado: "Portátil de máximo rendimiento, para equipos grandes con buena refrigeración.",
    hechoId: "cpu-amd-portatil-sufijos",
  },
  {
    token: "HS",
    familias: AMD_PORTATIL,
    segmento: "portatil",
    significado: "Portátil de alto rendimiento en un formato más delgado.",
    hechoId: "cpu-amd-portatil-sufijos",
  },
  {
    token: "H",
    familias: AMD_PORTATIL,
    segmento: "portatil",
    significado: "Portátil de alto rendimiento.",
    hechoId: "cpu-amd-portatil-sufijos",
  },
  {
    token: "U",
    familias: AMD_PORTATIL,
    segmento: "portatil",
    significado: "Portátil de bajo consumo, pensado para equipos delgados y autonomía.",
    hechoId: "cpu-amd-portatil-sufijos",
  },
];

const EJEMPLOS: readonly EjemploCpu[] = [
  { nombre: "Ryzen 5 5600G", hechoId: "cpu-ejemplos-amd" },
  { nombre: "Ryzen 7 7800X3D", hechoId: "cpu-ejemplos-amd" },
  { nombre: "Ryzen 5 7600X", hechoId: "cpu-ejemplos-amd" },
  { nombre: "Core i5-12400F", hechoId: "cpu-ejemplos-intel" },
  { nombre: "Core i7-14700K", hechoId: "cpu-ejemplos-intel" },
  { nombre: "Core Ultra 7 265K", hechoId: "cpu-ejemplos-intel" },
];

// Las dos marcas usan un número parecido para indicar la gama dentro de su propia línea; no significa que rindan igual.
// "—" (null o lista vacía) = no hay equivalente confirmado. No se lista un Core Ultra 3 hasta confirmarlo (hecho cpu-core-ultra-escritorio-gamas).
const EQUIVALENCIAS: readonly EquivalenciaGama[] = [
  { gama: "3", amd: "Ryzen 3", intelClasico: "Core i3", intelActual: ["Core 3"] },
  { gama: "5", amd: "Ryzen 5", intelClasico: "Core i5", intelActual: ["Core 5", "Core Ultra 5"] },
  { gama: "7", amd: "Ryzen 7", intelClasico: "Core i7", intelActual: ["Core 7", "Core Ultra 7"] },
  { gama: "9", amd: "Ryzen 9", intelClasico: "Core i9", intelActual: ["Core Ultra 9"] },
];

export const PROCESADOR_DECODIFICADOR: DatosDecodificador = {
  familias: FAMILIAS,
  series: SERIES,
  sufijos: SUFIJOS,
  ejemplos: EJEMPLOS,
  equivalencias: EQUIVALENCIAS,
  revisadoEn: "2026-10-14", // fecha de redacción del borrador; nada está verificado. Los nombres cambian rápido (hechos con revisión cada 6 meses)
};
