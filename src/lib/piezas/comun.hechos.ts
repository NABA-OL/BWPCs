/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Hechos comunes a varias piezas (docs/piezas-plan-2.md §2.1): se redactan y se verifican UNA sola vez. Una pieza que necesite uno lo importa
// y lo pone en su contenido tal cual: el id es único en todo el sitio y dos piezas con el mismo id deben compartir el mismo objeto.
// Los hechos que ya estaban en la tarjeta madre se movieron aquí sin tocar su texto, sus fuentes ni su verificación (verificadoEn/verificadoPor).
// Solo los redacta el orquestador de esta fase: si una pieza necesita un hecho común nuevo, lo pide.
import { conRevision, hecho, hechoVerificado, hechoVerificadoB } from "./constructores.ts";
import {
  AMD_CHIPSETS_AM5,
  AMD_INSTALAR_DISIPADOR,
  AMD_DISIPADORES,
  INTEL_ARK,
  INTEL_CORE_ULTRA,
  PCI_SIG,
  SATA_IO,
  ATX_22,
  V_AMD_AM5,
  V_AMD_AM4,
  V_AMD_7700X,
  V_AMD_5600X,
  V_INTEL_ARK_12700,
  V_INTEL_ARK_14700KF,
  V_INTEL_BOXED_ULTRA_S2,
  V_INTEL_LGA1700,
  V_AMD_CPU_100,
  V_MANUAL_GIGABYTE_B650,
  V_MANUAL_GIGABYTE_Z790,
  V_ASUS_B850F,
  V_ASROCK_CATALOGO_AMD,
  V_SSI_EPS12V,
  V_CORSAIR_CABLES,
  V_CORSAIR_EPS_VS_PCIE,
  V_KINGSTON_DDR5,
  V_KINGSTON_DDR4,
  V_CORSAIR_DDR5_COMPAT,
  V_NVME,
  V_MANUAL_ASROCK_B760M,
  V_MANUAL_ASROCK_B650_LIVEMIXER,
  V_MANUAL_MSI_B760,
  V_MANUAL_ASUS_B850_PLUS,
  V_MANUAL_ASUS_Z890M,
  V_SAMSUNG_990_PRO,
  V_SEAGATE_SATA_BASICS,
  V_INTEL_SUFIJO_F,
  V_ASUS_FAQ_CPU_FAN,
} from "./fuentes.ts";
import type { Hecho } from "./types.ts";

/* ---------- Hechos que vienen de la tarjeta madre (mismos ids) ---------- */
export const socketDisipadoresAm4Am5: Hecho = hecho(
  "socket-disipadores-am4-am5",
  "Muchos disipadores diseñados para AM4 se pueden montar en AM5 sin cambiar el soporte, porque se mantuvo la distancia entre los orificios de montaje. Confirma el soporte con el fabricante de tu disipador.",
  [AMD_DISIPADORES],
  "NO confirmado en las páginas de AMD consultadas (partner/socket-am5-change-game no lo dice). Una búsqueda sugiere que AMD indicó que los disipadores de AM4 siguen soportados en AM5: ubicar el comunicado primario o la lista de compatibilidad de un fabricante de disipadores.",
);

export const socketDisipadoresLga1700Lga1851: Hecho = hechoVerificado(
  "socket-disipadores-lga1700-lga1851",
  "Los disipadores diseñados para LGA 1700 suelen servir también en LGA 1851, según lo que indique el fabricante de cada disipador.",
  [V_INTEL_BOXED_ULTRA_S2],
  "Intel indica que los disipadores con ventilador pueden usarse entre LGA 1700 y LGA 1851 por ser mecánicamente parecidos para la solución térmica, y recuerda que el disipador debe cubrir la potencia del procesador.",
);

export const socketMarcaPinUno: Hecho = hechoVerificado(
  "socket-marca-pin-uno",
  "El procesador y el socket traen una marca de alineación, normalmente un triángulo en una esquina, que indica dónde está el pin 1 y evita instalar el procesador girado.",
  [V_MANUAL_GIGABYTE_B650, V_AMD_CPU_100],
  "El manual de la placa AM5 pide alinear la marca de pin uno (un triángulo) con la esquina del socket; las guías de AMD hablan del patrón de pines y de no forzar el procesador, sin nombrar el triángulo.",
);

export const am4PgaRyzen: Hecho = conRevision(
  hechoVerificado(
    "am4-pga-ryzen",
    "AM4 es un socket de tipo PGA: los pines están en el procesador y la placa tiene orificios. AMD lo usa con procesadores Ryzen de la serie 5000 y anteriores, con memoria DDR4.",
    [V_AMD_AM4, V_AMD_5600X, V_ASROCK_CATALOGO_AMD],
    "AMD confirma AM4 con DDR4 (ficha del 5600X incluida). El tipo PGA sale del catálogo de ASRock (\"Socket AM4 (PGA1331)\" para Ryzen 5000, 4000G, 3000G y 3000), no de las páginas de AMD.",
  ),
  6,
);

export const am5Lga: Hecho = conRevision(
  hecho(
    "am5-lga",
    "AM5 es un socket de tipo LGA: los contactos están en la placa y el procesador no lleva pines. Tiene 1718 contactos.",
    [AMD_CHIPSETS_AM5],
    "NO confirmado en las páginas de AMD consultadas: ni el tipo LGA ni la cifra de contactos (1718 es la cifra comúnmente citada). Si no aparece en una fuente primaria, publicar el hecho sin la cifra.",
  ),
  6,
);

export const am5MemoriaDdr5: Hecho = conRevision(
  hechoVerificado(
    "am5-memoria-ddr5",
    "Los procesadores Ryzen para AM5 usan memoria DDR5; AMD no lista DDR4 para esta plataforma.",
    [V_AMD_7700X, V_AMD_AM5],
    "La ficha del Ryzen 7 7700X indica socket AM5, memoria DDR5 y dos canales; la página de chipsets AM5 habla solo de DDR5.",
  ),
  6,
);

export const lga1700GeneracionesMemoria: Hecho = conRevision(
  hechoVerificado(
    "lga1700-generaciones-memoria",
    "Intel usa el socket LGA 1700 (FCLGA1700 en ARK) en procesadores Core de las generaciones 12, 13 y 14. El procesador admite DDR4 o DDR5, pero cada placa soporta solo una de las dos.",
    [V_INTEL_LGA1700, V_INTEL_ARK_12700, V_INTEL_ARK_14700KF, V_MANUAL_GIGABYTE_Z790],
    "Intel confirma LGA1700 para 12.ª, 13.ª y 14.ª generación; ARK da FCLGA1700 y DDR5/DDR4 para el 12700 y el 14700KF; el manual de Gigabyte describe dos versiones de la misma placa (4 ranuras DDR5 o 4 DDR4).",
  ),
  6,
);

export const lga1851ProcesadoresMemoria: Hecho = conRevision(
  hecho(
    "lga1851-procesadores-memoria",
    "LGA 1851 (FCLGA1851 en ARK) es el socket de los procesadores Intel Core Ultra de la serie 200S, y esos procesadores usan memoria DDR5.",
    [INTEL_CORE_ULTRA, INTEL_ARK],
    "NO se pudo abrir ARK. Fichas de tiendas (no primarias) indican FCLGA1851 y solo DDR5 para el Core Ultra 7 265K; hay que confirmarlo en ARK y revisar si existen otras series en este socket.",
  ),
  6,
);

export const ramDdr4Ddr5Muesca: Hecho = hechoVerificado(
  "ram-ddr4-ddr5-muesca",
  "Los módulos DIMM de DDR4 y de DDR5 tienen 288 contactos, pero la muesca está en otra posición, por lo que no son intercambiables.",
  [V_KINGSTON_DDR5, V_KINGSTON_DDR4, V_CORSAIR_DDR5_COMPAT],
  "Las fichas de Kingston rotulan ambos kits como DIMM de 288 pines; Corsair explica la distinta posición de la muesca. No se abrió el estándar de JEDEC (el PDF exige cuenta). Los SO-DIMM de portátiles tienen otra cantidad de contactos; el texto habla de DIMM.",
);

export const ramUnaGeneracionPorPlaca: Hecho = conRevision(
  hechoVerificado(
    "ram-una-generacion-por-placa",
    "Cada placa admite una sola generación de memoria. En AM5 es DDR5; en LGA 1700 depende del modelo de placa, que puede ser DDR4 o DDR5.",
    [V_AMD_7700X, V_INTEL_ARK_12700, V_MANUAL_GIGABYTE_Z790],
    "AMD da DDR5 para AM5; Intel da DDR5 y DDR4 para el 12700; el manual de Gigabyte cubre dos versiones de una misma placa LGA1700 (4 ranuras DDR5 o 4 DDR4).",
  ),
  6,
);

export const ramDobleCanal: Hecho = hechoVerificado(
  "ram-doble-canal",
  "En escritorio los procesadores usan dos canales de memoria. Con cuatro ranuras, hay dos por canal; con dos módulos, el manual indica en qué ranuras ponerlos para usar el doble canal (a menudo A2 y B2).",
  [V_AMD_7700X, V_INTEL_ARK_12700, V_MANUAL_GIGABYTE_B650],
  "El 7700X y el i7-12700 indican dos canales; el manual de Gigabyte recomienda A2 y B2 para dos módulos (indicación de ese fabricante, por eso el texto dice «a menudo»).",
);

export const pcieTamanosFisicos: Hecho = hecho(
  "pcie-tamanos-fisicos",
  "Las ranuras PCIe existen en tamaños físicos x1, x4, x8 y x16. La ranura x16 es la más larga y es la que usan las tarjetas gráficas.",
  [PCI_SIG],
  "NO confirmado: PCI-SIG bloquea la consulta automática (403); verificar en la especificación o en un resumen público de PCI-SIG.",
);

export const pcieAnchoBandaGeneraciones: Hecho = hecho(
  "pcie-ancho-banda-generaciones",
  "Cada generación de PCIe duplica el ancho de banda de la anterior: 8 GT/s por línea en PCIe 3.0, 16 GT/s en PCIe 4.0 y 32 GT/s en PCIe 5.0 (unos 1, 2 y 4 GB/s por línea y por sentido, de forma aproximada).",
  [PCI_SIG],
  "NO confirmado en fuente consultada. Verificar GT/s y la conversión aproximada a GB/s.",
);

export const pcieCompatibilidadAtras: Hecho = hecho(
  "pcie-compatibilidad-atras",
  "Las tarjetas y ranuras PCIe de generaciones distintas son compatibles hacia atrás: el conjunto funciona a la velocidad de la generación menor de las dos.",
  [PCI_SIG],
  "NO confirmado en fuente consultada.",
);

export const pcieX16DesdeProcesador: Hecho = hechoVerificado(
  "pcie-x16-desde-procesador",
  "La ranura x16 principal suele salir directamente del procesador, mientras que las demás ranuras suelen depender del chipset; la asignación exacta cambia según el modelo.",
  [V_MANUAL_GIGABYTE_B650, V_MANUAL_GIGABYTE_Z790, V_ASUS_B850F, V_AMD_AM5],
  "En tres placas concretas (B650, Z790 y B850) la x16 principal va al procesador y las demás al chipset; el texto ya está redactado con «suele».",
);

export const m2Llaves: Hecho = hecho(
  "m2-llaves",
  "M.2 define varias llaves; los SSD usan la llave M (o B y M) y las tarjetas inalámbricas suelen usar la llave E. Cada llave indica qué tipo de dispositivo admite la ranura.",
  [PCI_SIG],
  "NO confirmado en fuente consultada. La especificación M.2 es de PCI-SIG y su acceso puede requerir membresía.",
);

export const m2Largos: Hecho = hecho(
  "m2-largos",
  "Los SSD M.2 se nombran por su tamaño: 2230, 2242, 2260, 2280 y 22110 (22 mm de ancho y 30, 42, 60, 80 o 110 mm de largo). El 2280 es el más habitual.",
  [PCI_SIG],
  "NO confirmado en fuente consultada. Verificar la afirmación 'el más habitual' o quitarla.",
);

export const m2Protocolos: Hecho = hechoVerificadoB(
  "m2-protocolos",
  "Una ranura M.2 puede admitir solo SSD NVMe, solo SSD SATA o ambos, según el modelo de placa.",
  [V_MANUAL_ASROCK_B760M, V_MANUAL_MSI_B760, V_MANUAL_ASUS_B850_PLUS],
  "Cambia por placa y por ranura: en la ASRock B760M-H/M.2, M2_1 solo PCIe y M2_2 SATA y PCIe; en la MSI, M2_2 admite PCIe y SATA; en la ASUS B850-PLUS las tres ranuras listan solo PCIe.",
);

export const m2ComparteLineasSata: Hecho = hechoVerificadoB(
  "m2-comparte-lineas-sata",
  "En algunas placas, ocupar ciertas ranuras M.2 reduce las líneas de una ranura PCIe o desactiva puertos SATA; el manual de cada modelo indica cuáles.",
  [V_MANUAL_ASROCK_B760M, V_MANUAL_MSI_B760, V_MANUAL_ASROCK_B650_LIVEMIXER],
  "Los manuales hablan de «deshabilitar» (SATA3_3 en la ASRock B760M, SATA8 en la MSI, PCIE3 en la B650 LiveMixer); el caso de «reducir líneas» solo se vio en foros. Propuesta opcional pendiente del dueño: «En algunas placas, ocupar ciertas ranuras M.2 desactiva puertos SATA o una ranura PCIe; el manual de cada modelo indica cuáles.»",
);

export const nvmeLineasPcie: Hecho = hechoVerificadoB(
  "nvme-lineas-pcie",
  "Los SSD NVMe usan líneas PCIe, normalmente cuatro (x4).",
  [V_NVME, V_SAMSUNG_990_PRO, V_MANUAL_ASUS_B850_PLUS],
  "NVM Express define NVMe sobre PCI Express; el 990 PRO es PCIe Gen 4.0 x4; el manual de ASUS muestra ranuras en x4 y una en x2, por eso «normalmente».",
);

export const sataIiiVelocidad: Hecho = conRevision(
  hecho(
    "sata-iii-velocidad",
    "SATA III funciona a 6 Gb/s, lo que equivale a unos 600 MB/s de velocidad útil.",
    [SATA_IO],
    "NO confirmado: la portada de sata-io.org consultada no muestra la cifra. Buscar la página de revisión 3.x en SATA-IO.",
  ),
  24,
);

export const sataDatosYEnergia: Hecho = hechoVerificadoB(
  "sata-datos-y-energia",
  "Cada unidad SATA necesita un cable de datos hacia la placa y un cable de energía SATA desde la fuente.",
  [V_SEAGATE_SATA_BASICS, V_MANUAL_ASUS_B850_PLUS],
  "Seagate describe conector de datos por cable a la placa y conector de energía aparte desde la fuente.",
);

export const atx24Pines: Hecho = conRevision(
  hecho(
    "atx-24-pines",
    "El conector principal de energía de la placa es de 24 pines (20+4) en el estándar ATX.",
    [ATX_22],
    "Confirmado en la especificación ATX 2.2 consultada: 'Main Power Connector changed from 20 pin to 24 pin to support PCI-Express requirements'.",
  ),
  24,
);

export const epsOchoPines: Hecho = hechoVerificado(
  "eps-ocho-pines",
  "El conector de energía del procesador sigue el estándar EPS12V de 8 pines (4+4). Algunas placas traen dos conectores (8+4 u 8+8).",
  [V_SSI_EPS12V, V_CORSAIR_CABLES, V_MANUAL_GIGABYTE_B650, V_MANUAL_GIGABYTE_Z790],
  "La guía EPS12V define el conector de procesador de 8 pines; Corsair explica entradas de 4, 4+4, 8 u 8+8; la B650 AORUS trae 8+4 y la Z790 AORUS trae 8+8. El (4+4) es la forma del cable, no del conector de la placa.",
);

export const epsVsPcieGrafica: Hecho = hechoVerificado(
  "eps-vs-pcie-grafica",
  "El cable EPS 4+4 del procesador y el cable PCIe 6+2 de la tarjeta gráfica no son intercambiables: sus conectores tienen codificación distinta.",
  [V_CORSAIR_EPS_VS_PCIE, V_CORSAIR_CABLES],
  "Corsair dice que no son intercambiables, que se parecen pero son físicamente distintos y están cableados distinto. PENDIENTE (decisión del dueño): la hoja propone reformular el texto de «codificación» a «cableado»; aquí NO se reformuló.",
);

export const videoRequiereGraficosIntegrados: Hecho = hechoVerificadoB(
  "video-requiere-graficos-integrados",
  "Las salidas de video de la placa solo funcionan con procesadores que incluyen gráficos integrados; los modelos de Intel con sufijo F no los traen.",
  [V_INTEL_SUFIJO_F, V_MANUAL_ASUS_Z890M],
  "Intel confirma que los Core con sufijo F necesitan tarjeta gráfica aparte. La parte de AMD (Ryzen sin gráficos) no se reabrió; el texto publicado no la nombra.",
);

export const ventiladorNombresCabezales: Hecho = hechoVerificadoB(
  "ventilador-nombres-cabezales",
  "Los cabezales suelen llamarse CPU_FAN, CPU_OPT, SYS_FAN o CHA_FAN y AIO_PUMP, según el fabricante. Muchas placas avisan al arrancar si no detectan un ventilador en CPU_FAN.",
  [V_MANUAL_ASUS_B850_PLUS, V_MANUAL_MSI_B760, V_ASUS_FAQ_CPU_FAN],
  "ASUS usa CPU_FAN, CPU_OPT, CHA_FAN y AIO_PUMP; MSI usa CPU_FAN, SYS_FAN y PUMP_FAN; ASUS documenta el aviso al arrancar si no detecta el ventilador del procesador.",
);

/* ---------- Hechos comunes que aún no están en el piloto (los redacta T0.1; todos pendientes de verificación) ---------- */
export const pastaTermicaEntreIhsYBase: Hecho = hecho(
  "pasta-termica-entre-ihs-y-base",
  "La pasta térmica va entre la tapa metálica del procesador (IHS) y la base del disipador.",
  [AMD_INSTALAR_DISIPADOR],
  "Común a procesador y refrigeración (N21 del plan 2). La guía de AMD citada se abrió el 2026-10-11 en el piloto; falta contrastar este texto con ella.",
);
export const pcie62Graficas: Hecho = hecho(
  "pcie-6-2-graficas",
  "Las tarjetas gráficas que piden conectores de ocho pines usan el cable PCIe 6+2 de la fuente: seis pines más dos que se acoplan.",
  [V_CORSAIR_CABLES, PCI_SIG],
  "Común a fuente de poder y tarjeta gráfica (FP1 del plan 2). Corsair describe el cable PCIe 6+2 (hoja A, 2026-10-13); falta la especificación primaria (PCI-SIG CEM o Intel ATX).",
);
export const conector12v2x6: Hecho = conRevision(
  hecho(
    "conector-12v-2x6",
    "El conector 12V-2x6 (ATX 3.1 y PCIe CEM 5.1) reemplazó al 12VHPWR en las tarjetas gráficas nuevas y debe quedar insertado por completo.",
    [PCI_SIG],
    "Común a fuente de poder y tarjeta gráfica (FP2 del plan 2). Redactar sin culpar a una marca. Sin URL primaria candidata conocida: buscar la Intel ATX 3.1 Design Guide o PCI-SIG CEM 5.1.",
  ),
  6,
);

/** Todos los hechos comunes, para recorrerlos (hoja de verificación, ids únicos). */
export const HECHOS_COMUNES: readonly Hecho[] = [
  socketDisipadoresAm4Am5,
  socketDisipadoresLga1700Lga1851,
  socketMarcaPinUno,
  am4PgaRyzen,
  am5Lga,
  am5MemoriaDdr5,
  lga1700GeneracionesMemoria,
  lga1851ProcesadoresMemoria,
  ramDdr4Ddr5Muesca,
  ramUnaGeneracionPorPlaca,
  ramDobleCanal,
  pcieTamanosFisicos,
  pcieAnchoBandaGeneraciones,
  pcieCompatibilidadAtras,
  pcieX16DesdeProcesador,
  m2Llaves,
  m2Largos,
  m2Protocolos,
  m2ComparteLineasSata,
  nvmeLineasPcie,
  sataIiiVelocidad,
  sataDatosYEnergia,
  atx24Pines,
  epsOchoPines,
  epsVsPcieGrafica,
  videoRequiereGraficosIntegrados,
  ventiladorNombresCabezales,
  pastaTermicaEntreIhsYBase,
  pcie62Graficas,
  conector12v2x6,
];
