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
import { conRevision, hecho, hechoVerificado, hechoVerificadoB, verificadoPorDueno } from "./constructores.ts";
import {
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
export const socketDisipadoresAm4Am5: Hecho = verificadoPorDueno(
  hecho(
    "socket-disipadores-am4-am5",
    "AMD indicó que los disipadores de AM4 siguen siendo compatibles con AM5. Aun así, algunos modelos pueden necesitar piezas de montaje nuevas: si vas a pasar de AM4 a AM5, o armas hoy una AM4 pensando en actualizar después, confirma con el fabricante de tu disipador que sirva en ambas plataformas.",
    [
      { titulo: "Meet The AMD Socket AM5 Platform (artículo para socios de AMD)", editor: "AMD", url: "https://www.amd.com/en/partner/articles/socket-am5-change-game.html", consultadoEn: "2026-10-13" },
    ],
    "Decisión de NB (2026-10-19, hoja comun): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19). NB propuso «90 % de los casos»; no se usó la cifra por falta de fuente. El caso de armar en AM4 con vistas a actualizar es agregado de NB.",
  ),
  "2026-10-19",
  "NB",
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
  verificadoPorDueno(
    hecho(
      "am5-lga",
      "AM5 es un socket de tipo LGA: los contactos están en la placa y el procesador no lleva pines. Tiene 1718 contactos.",
      [
        { titulo: "AMD Expands Ryzen Embedded Processor Family… (nota de prensa de AMD, 2023-11-14)", editor: "AMD", url: "https://www.amd.com/en/newsroom/press-releases/2023-11-14-amd-expands-ryzen-embedded-processor-family-for-h.html", consultadoEn: "2026-10-13" },
        V_ASROCK_CATALOGO_AMD,
        V_ASUS_B850F,
      ],
      "Decisión de NB (2026-10-19, hoja comun): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
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
  verificadoPorDueno(
    hecho(
      "lga1851-procesadores-memoria",
      "LGA 1851 (FCLGA1851 en ARK) es el socket de los procesadores Intel Core Ultra para escritorio (serie 2), incluidos los modelos «Plus» más recientes (Core Ultra 5 250K Plus y Core Ultra 7 270K Plus), y esos procesadores usan memoria DDR5.",
      [
        { titulo: "Intel® Core™ Ultra 7 Processor 265K (ARK)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html", consultadoEn: "2026-10-13" },
        V_INTEL_BOXED_ULTRA_S2,
        { titulo: "Intel® Core™ Ultra 7 processor 270K Plus (ARK)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/245692/intel-core-ultra-7-processor-270k-plus-36m-cache-up-to-5-50-ghz/specifications.html", consultadoEn: "2026-10-19" },
        { titulo: "Intel Announces New Intel Core Ultra 200S Plus Series Desktop Processors", editor: "Intel (newsroom)", url: "https://www.intel.com/content/www/us/en/newsroom/news/client-computing/intel-announces-new-intel-core-ultra-200s-plus-series-desktop-processors.html", consultadoEn: "2026-10-19" },
        { titulo: "Intel® Core™ Ultra Processors (Series 2) Product Specifications (listado ARK)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/ark/products/series/241071/intel-core-ultra-processors-series-2.html", consultadoEn: "2026-10-19" },
      ],
      "Decisión de NB (2026-10-19, hoja comun): ajustar. ajustado por NB (2026-10-19) con la propuesta. Verificado (2026-10-19, fuentes primarias de Intel): LGA 1851 también lo usan los «Core Ultra 200S Plus», que Intel clasifica dentro de la serie 2 (no es una serie 3): Core Ultra 5 250K Plus, 250KF Plus y Core Ultra 7 270K Plus; todos DDR5 (hasta 7200 MT/s en los Plus). Corrección al dictado: el ejemplo «245 → 245 Plus» no existe; el 245K sigue siendo el modelo normal y el Plus es el 250K. Recortado: no se menciona «serie 3» porque no hay procesador de escritorio con ese nombre para este socket en las páginas abiertas (no se revisó el listado ARK de la serie 3, que es de portátiles). Pendiente menor: el ARK del 250K Plus no se abrió; el socket de ese modelo sale del artículo de soporte de Intel (placas serie 800), no de su ficha. Sigue valiendo revisar periódicamente.",
    ),
    "2026-10-19",
    "NB",
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

export const pcieTamanosFisicos: Hecho = verificadoPorDueno(
  hecho(
    "pcie-tamanos-fisicos",
    "Las ranuras PCIe existen en tamaños físicos x1, x4, x8 y x16. La ranura x16 es la más larga y es la que usan las tarjetas gráficas. Una ranura x16 puede trabajar con menos líneas que su tamaño físico, y una tarjeta de menos líneas encaja en una ranura más larga: en ambos casos funciona con el rendimiento que permitan esas líneas.",
    [
      { titulo: "PCI Express Card Edge Connectors (hoja de datos de conectores)", editor: "FCI (Amphenol)", url: "https://static.chipdip.ru/lib/073/DOC025073648.pdf", consultadoEn: "2026-10-19" },
      { titulo: "PRIME B650M-A WIFI - Tech Specs", editor: "ASUS", url: "https://www.asus.com/motherboards-components/motherboards/prime/prime-b650m-a-wifi/techspec/", consultadoEn: "2026-10-19" },
      { titulo: "PCI Express FAQ for Graphics", editor: "Microsoft", url: "https://learn.microsoft.com/en-us/windows-hardware/drivers/pci/pci-express-faq-for-graphics", consultadoEn: "2026-10-19" },
      { titulo: "What Are PCI and PCI Express and What Is a PCIe Slot (Dell)", editor: "Dell", url: "https://www.dell.com/support/kbdoc/en-us/000123517/what-is-pci-and-pci-express-kb-article-161614", consultadoEn: "2026-10-13" },
      { titulo: "Introduction to PCI Express (Lenovo Press)", editor: "Lenovo", url: "https://lenovopress.lenovo.com/tips0456", consultadoEn: "2026-10-13" },
    ],
    "Decisión de NB (2026-10-19, hoja comun): ajustar. ajustado por NB (2026-10-19): gráfica en la primera ranura x16 y tarjetas con menos líneas activas. Recortado el 2026-10-19: ninguna fuente abierta respalda «normalmente la primera, la más cercana al procesador» ni el ejemplo de gráficas de gama baja con conector x16 que aprovechan menos (experiencia de NB, sin fuente), así que se quitaron del texto; los adaptadores M.2 a x16 tampoco se incluyen. Fuentes abiertas: FCI (tamaños x1/x4/x8/x16 y x16 para gráficas), ASUS (ranuras x16 en modo x16/x8/x4/x1) y Microsoft (tarjeta menor en ranura mayor).",
  ),
  "2026-10-19",
  "NB",
);

export const pcieAnchoBandaGeneraciones: Hecho = verificadoPorDueno(
  hecho(
    "pcie-ancho-banda-generaciones",
    "Cada generación de PCIe duplica el ancho de banda de la anterior: 8 GT/s por línea en PCIe 3.0, 16 GT/s en PCIe 4.0 y 32 GT/s en PCIe 5.0. El ancho de banda total depende además de cuántas líneas use el dispositivo.",
    [
      { titulo: "PCI-SIG Announces PCI Express 4.0 Evolution to 16GT/s (comunicado de PCI-SIG, copia en Design-Reuse)", editor: "Design & Reuse", url: "https://www.design-reuse.com/news/27909/pci-express-4-0.html", consultadoEn: "2026-10-13" },
      { titulo: "PCI-SIG Achieves 32GT/s with New PCI Express 5.0 Specification (comunicado de PCI-SIG, copia en Design-Reuse)", editor: "Design & Reuse", url: "https://us.design-reuse.com/news/46222/32gt-s-pci-express-5-0-specification.html", consultadoEn: "2026-10-13" },
    ],
    "Decisión de NB (2026-10-19, hoja comun): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19) con el agregado de NB de que depende también de las líneas.",
  ),
  "2026-10-19",
  "NB",
);

export const pcieCompatibilidadAtras: Hecho = verificadoPorDueno(
  hecho(
    "pcie-compatibilidad-atras",
    "Las tarjetas y ranuras PCIe de generaciones distintas son compatibles hacia atrás: el conjunto funciona a la velocidad de la generación menor de las dos.",
    [
      { titulo: "PCI-SIG Achieves 32GT/s with New PCI Express 5.0 Specification (comunicado de PCI-SIG, copia en Design-Reuse)", editor: "Design & Reuse", url: "https://us.design-reuse.com/news/46222/32gt-s-pci-express-5-0-specification.html", consultadoEn: "2026-10-13" },
      { titulo: "PCI-SIG Announces PCI Express 4.0 Evolution to 16GT/s (copia en Design-Reuse)", editor: "Design & Reuse", url: "https://www.design-reuse.com/news/27909/pci-express-4-0.html", consultadoEn: "2026-10-13" },
    ],
    "Decisión de NB (2026-10-19, hoja comun): aprobar. aprobado por NB (2026-10-19), texto sin cambios. Las fuentes no dicen literalmente que el conjunto trabaje a la velocidad de la generación menor; NB lo confirma por experiencia.",
  ),
  "2026-10-19",
  "NB",
);

export const pcieX16DesdeProcesador: Hecho = hechoVerificado(
  "pcie-x16-desde-procesador",
  "La ranura x16 principal suele salir directamente del procesador, mientras que las demás ranuras suelen depender del chipset; la asignación exacta cambia según el modelo.",
  [V_MANUAL_GIGABYTE_B650, V_MANUAL_GIGABYTE_Z790, V_ASUS_B850F, V_AMD_AM5],
  "En tres placas concretas (B650, Z790 y B850) la x16 principal va al procesador y las demás al chipset; el texto ya está redactado con «suele».",
);

export const m2Llaves: Hecho = verificadoPorDueno(
  hecho(
    "m2-llaves",
    "En las placas actuales, las ranuras M.2 para SSD usan la llave M y las tarjetas inalámbricas suelen usar la llave E; algunos SSD SATA traen las llaves B y M. La llave indica qué tipo de dispositivo admite la ranura, pero no garantiza el protocolo: una ranura con llave M puede aceptar SATA o solo PCIe según la placa, así que confirma en el manual.",
    [
      V_MANUAL_ASROCK_B760M,
      V_MANUAL_ASUS_B850_PLUS,
      { titulo: "Wikipedia, M.2", editor: "Wikipedia", url: "https://en.wikipedia.org/wiki/M.2", consultadoEn: "2026-10-13" },
      { titulo: "ASUS ROG, guía «Buying an M.2 SSD»", editor: "ASUS", url: "https://rog.asus.com/articles/guides/buying-an-m-2-ssd-how-to-tell-which-is-which/", consultadoEn: "2026-10-13" },
    ],
    "Decisión de NB (2026-10-19, hoja comun): ajustar. ajustado por NB (2026-10-19): se conserva B y M (respaldado en la hoja de almacenamiento: WD y Seagate) y se agrega que la ranura puede no admitir SATA. «Según la placa» es experiencia de NB, sin fuente.",
  ),
  "2026-10-19",
  "NB",
);

export const m2Largos: Hecho = verificadoPorDueno(
  hecho(
    "m2-largos",
    "Los SSD M.2 se nombran por su tamaño: 2230, 2242, 2260, 2280 y 22110 (22 mm de ancho y 30, 42, 60, 80 o 110 mm de largo). El 2280 es el más habitual en escritorio, y el 2230, más corto, se usa en consolas portátiles y mini PC. Cada ranura admite solo algunos largos; el manual de la placa indica cuáles.",
    [
      V_MANUAL_ASUS_B850_PLUS,
      V_SAMSUNG_990_PRO,
      { titulo: "Wikipedia, M.2", editor: "Wikipedia", url: "https://en.wikipedia.org/wiki/M.2", consultadoEn: "2026-10-13" },
      { titulo: "ASUS ROG, guía de SSD M.2", editor: "ASUS", url: "https://rog.asus.com/articles/guides/buying-an-m-2-ssd-how-to-tell-which-is-which/", consultadoEn: "2026-10-13" },
    ],
    "Decisión de NB (2026-10-19, hoja comun): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19). «2280 más habitual» y el uso del 2230 son afirmaciones de mercado de NB, sin fuente.",
  ),
  "2026-10-19",
  "NB",
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
  verificadoPorDueno(
    hecho(
      "sata-iii-velocidad",
      "Los puertos SATA de las placas actuales son de 6 Gb/s (unos 600 MB/s como tope del enlace); la velocidad real que logra una unidad es menor.",
      [
        { titulo: "SATA-IO, FAQ de SATA Revision 3.0", editor: "SATA-IO", url: "https://sata-io.org/sites/default/files/documents/SATA-Revision-3.0-FAQ-FINAL.pdf", consultadoEn: "2026-10-13" },
        { titulo: "SATA-IO, guía de nombres", editor: "SATA-IO", url: "https://sata-io.org/developers/sata-naming-guidelines", consultadoEn: "2026-10-13" },
      ],
      "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15)",
    ),
    "2026-10-15",
    "NB",
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
  verificadoPorDueno(
    hecho(
      "atx-24-pines",
      "El conector principal de energía de la placa es de 24 pines en el estándar ATX. Algunos equipos de marca usan conectores y fuentes propios, así que no siempre sirve una fuente ATX estándar.",
      [
        { titulo: "ATX Specification 2.2", editor: "Intel (formfactors.org)", url: "https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf", consultadoEn: "2026-10-13" },
        V_MANUAL_ASUS_B850_PLUS,
        { titulo: "OptiPlex proprietary 8 pin and 6 pin pinout (hilo de la comunidad)", editor: "Dell Community (foro de usuarios)", url: "https://www.dell.com/community/en/conversations/optiplex-desktops/optiplex-proprietary-8-pin-and-6-pin-pinout/647f8f68f4ccf8a8de077d92", consultadoEn: "2026-10-19" },
        { titulo: "HP dc5100 / DC7600 / DX6100 power supply pinout", editor: "pinouts.ru", url: "https://pinouts.ru/Power/hp_dc5100.shtml", consultadoEn: "2026-10-19" },
      ],
      "Decisión de NB (2026-10-19, hoja comun): ajustar. ajustado por NB (2026-10-19): propuesta más la mención de equipos de marca. Verificado solo en fuentes secundarias abiertas (2026-10-19): existen equipos de marca (Dell OptiPlex con conectores de 6/8 pines, HP con 24 pines de asignación propia) con conectores de energía que no siguen el estándar ATX. Recortado: se quitaron los nombres «Dell» y «Lenovo» y cualquier mención a «20 pines»: no hay documentación de Dell/Lenovo/HP abierta que lo respalde (solo foros de usuarios y sitios de terceros; los hilos de Lenovo no cargaron) y el caso de 20 pines es experiencia de NB sin fuente. La frase queda en 🟡 con respaldo secundario; si NB la quiere más específica, necesita un manual de servicio de ese equipo (p. ej. el número de modelo de la placa que vio).",
    ),
    "2026-10-19",
    "NB",
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
export const pastaTermicaEntreIhsYBase: Hecho = verificadoPorDueno(
  hecho(
    "pasta-termica-entre-ihs-y-base",
    "La pasta térmica va entre la tapa metálica del procesador (IHS) y la base del disipador.",
    [
      { titulo: "How to Install or Remove an AMD CPU Cooler (CPU-7)", editor: "AMD", url: "https://www.amd.com/en/resources/support-articles/faqs/CPU-7.html", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja comun): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
export const pcie62Graficas: Hecho = verificadoPorDueno(
  hecho(
    "pcie-6-2-graficas",
    "Las tarjetas gráficas que piden conectores de ocho pines usan el cable PCIe 6+2 de la fuente: seis pines más dos que se acoplan.",
    [
      { titulo: "Which PSU cables go where?", editor: "Corsair", url: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/which-psu-cables-go-where/", consultadoEn: "2026-10-15" },
      { titulo: "ATX Version 3 Multi Rail Desktop Platform Power Supply Design Guide, Rev. 2.1a (noviembre de 2023) · secciones 1.3, 3.2, 3.3 y 5.2.2.4", editor: "Intel", url: "https://cdrdv2-public.intel.com/336521/336521_Rev2p1a.pdf", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja comun): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
export const conector12v2x6: Hecho = conRevision(
  verificadoPorDueno(
    hecho(
      "conector-12v-2x6",
      "El conector 12V-2x6 (definido en PCIe CEM 5.1) es una versión mejorada del 12VHPWR, creada para corregir sus problemas de fiabilidad, y reemplazó a este en las tarjetas gráficas nuevas. El cambio está en el conector de la tarjeta, con contactos de potencia más largos y de señal más cortos, y el cable es el mismo. Debe quedar insertado por completo: si queda a medias, la tarjeta no toma energía por el cable.",
      [
        { titulo: "ATX Version 3 Multi Rail Desktop Platform Power Supply Design Guide, Rev. 2.1a (noviembre de 2023) · secciones 1.3, 3.2, 3.3 y 5.2.2.4", editor: "Intel", url: "https://cdrdv2-public.intel.com/336521/336521_Rev2p1a.pdf", consultadoEn: "2026-10-15" },
        { titulo: "Does the 50 series need a 12V-2x6 cable?", editor: "Corsair", url: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/does-the-50-series-need-a-12v-2x6-cable/", consultadoEn: "2026-10-15" },
        { titulo: "Differences Between ATX 3.0 and ATX 3.1 Standards", editor: "Seasonic", url: "https://knowledge.seasonic.com/article/79-comparison-atx-3-0-vs-atx-3-1-standards", consultadoEn: "2026-10-19" },
        { titulo: "Evolving standards: 12VHPWR and 12V-2x6", editor: "Corsair", url: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/evolving-standards-12vhpwr-and-12v-2x6/", consultadoEn: "2026-10-19" },
        { titulo: "ATX 3.1 power supply safeguards and you", editor: "ASUS", url: "https://www.asus.com/blog/atx-3-1-power-supply-safeguards-and-you-how-a-modern-psu-protects-your-pc/", consultadoEn: "2026-10-19" },
      ],
      "Decisión de NB (2026-10-19, hoja comun): ajustar. ajustado por NB (2026-10-19): mejora del conector, no solo reemplazo. Verificado con Intel (fuente primaria, 2026-10-19): el 12V-2x6 de CEM 5.1 reemplaza al 12VHPWR de CEM 5.0 «para corregir problemas de fiabilidad»; potencia más larga y señal más corta en el conector de la tarjeta; el enchufe del cable no cambió; sin asentar del todo = 0 W. Recortado: (1) no se dice «conectores quemados» ni «serie 4000 de NVIDIA»: ninguna fuente abierta de Intel/NVIDIA/PCI-SIG lo dice; solo Seasonic (fabricante, secundaria) habla de conectores derretidos en el lado de la GPU, y la declaración de NVIDIA sobre las RTX 4090 solo salió en resultados de prensa que no se pudieron abrir (HotHardware dio 403) ni está en nvidia.com. (2) No se afirma «ATX 3.0/3.1» como especificación: la guía de Intel se titula «ATX Version 3» (Rev. 2.0 = 12VHPWR, Rev. 2.1 = 12V-2x6); «3.0» y «3.1» son nombres de uso común que solo respaldan fabricantes. (3) No se citan las medidas 1,5 mm y 0,25 mm: solo las da Corsair, no Intel. La especificación PCIe CEM 5.1 del PCI-SIG no se pudo abrir (acceso bloqueado).",
    ),
    "2026-10-19",
    "NB",
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
