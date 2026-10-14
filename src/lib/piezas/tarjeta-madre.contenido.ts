/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contenido de /piezas/tarjeta-madre (docs/piezas-plan.md §6). ESTADO: BORRADOR. Ningún hecho está verificado: la puerta de publicación debe fallar.
// Reglas: prosa sin cifras (salvo nombres de estándar en `terminos`); toda cifra vive en un `Hecho` con fuente.
// `consultadoEn: ""` = URL candidata que NO se pudo consultar desde esta sesión (la verifica una persona). Con fecha = se abrió ese día.
import type { FactorForma, Fuente, Hecho, ParteContenido, PiezaContenido, SeccionTexto, TarjetaMadreParteId } from "./types.ts";

const HOY = "2026-10-11";

/** Hecho pendiente de verificación humana (verificadoEn y verificadoPor quedan en null). */
function hecho(id: string, texto: string, fuentes: readonly Fuente[], nota?: string): Hecho {
  return { id, texto, fuentes, verificadoEn: null, verificadoPor: null, ...(nota === undefined ? {} : { nota }) };
}

/** Datos aprobados por el dueño tras la hoja de verificación A (docs/verificacion/tarjeta-madre-a.md). */
const FECHA_VERIFICACION = "2026-10-13";
const VERIFICADOR = "NB";
const NOTA_APROBADO = `Verificado por hoja A (${FECHA_VERIFICACION}) y aprobado por ${VERIFICADOR}.`;

/** Hecho verificado y aprobado por el dueño: fija verificadoEn/verificadoPor y agrega la nota de aprobación. */
function hechoVerificado(id: string, texto: string, fuentes: readonly Fuente[], nota?: string): Hecho {
  return {
    id,
    texto,
    fuentes,
    verificadoEn: FECHA_VERIFICACION,
    verificadoPor: VERIFICADOR,
    nota: nota === undefined ? NOTA_APROBADO : `${nota} ${NOTA_APROBADO}`,
  };
}

/** Misma fuente, abierta de nuevo en la verificación (fecha de consulta actualizada). */
function consultadaEnVerificacion(fuente: Fuente): Fuente {
  return { ...fuente, consultadoEn: FECHA_VERIFICACION };
}

/* ---------- Fuentes candidatas ---------- */
const AMD_CHIPSETS_AM5: Fuente = {
  titulo: "AMD Socket AM5 Chipsets",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/chipsets/am5.html",
  consultadoEn: HOY,
};
const AMD_CHIPSETS_AM4: Fuente = {
  titulo: "AMD Socket AM4 Chipsets: especificaciones y compatibilidad de procesadores",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/chipsets/am4.html",
  consultadoEn: HOY,
};
const AMD_RYZEN_7700X: Fuente = {
  titulo: "AMD Ryzen 7 7700X: especificaciones",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html",
  consultadoEn: HOY,
};
const AMD_RYZEN_5600X: Fuente = {
  titulo: "AMD Ryzen 5 5600X: especificaciones",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600x.html",
  consultadoEn: HOY,
};
const AMD_INSTALAR_DISIPADOR: Fuente = {
  titulo: "How to Install or Remove an AMD CPU Cooler",
  editor: "AMD",
  url: "https://www.amd.com/en/resources/support-articles/faqs/CPU-7.html",
  consultadoEn: HOY,
};
const AMD_DISIPADORES: Fuente = {
  titulo: "AMD Ryzen Processor Cooling Solutions",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html",
  consultadoEn: "",
};
const INTEL_ARK_12700: Fuente = {
  titulo: "Procesador Intel Core i7-12700: especificaciones (ARK)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/products/sku/134591/intel-core-i712700-processor-25m-cache-up-to-4-90-ghz/specifications.html",
  consultadoEn: HOY,
};
const INTEL_ARK: Fuente = {
  titulo: "Intel Product Specifications (ARK)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/ark.html",
  consultadoEn: "",
};
const INTEL_CORE_ULTRA: Fuente = {
  titulo: "Procesadores Intel Core Ultra",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/products/details/processors/core-ultra.html",
  consultadoEn: "",
};
const INTEL_FRONT_PANEL: Fuente = {
  titulo: "Conector USB frontal: asignación de pines (soporte de Intel)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/support/articles/000060175/server-products/server-boards.html",
  consultadoEn: "",
};
const PWM_FAN_SPEC: Fuente = {
  titulo: "Noctua PWM specifications white paper (cita la especificación de Intel de ventiladores PWM de cuatro hilos)",
  editor: "Noctua",
  url: "https://noctua.at/pub/media/wysiwyg/Noctua_PWM_specifications_white_paper.pdf",
  consultadoEn: "",
};
const PCI_SIG: Fuente = {
  titulo: "Especificaciones de PCI Express",
  editor: "PCI-SIG",
  url: "https://pcisig.com/specifications",
  consultadoEn: "",
};
const JEDEC_DDR5: Fuente = {
  titulo: "JESD79-5: DDR5 SDRAM",
  editor: "JEDEC",
  url: "https://www.jedec.org/standards-documents/docs/jesd79-5d",
  consultadoEn: "",
};
const JEDEC_DDR4: Fuente = {
  titulo: "Main Memory: DDR4 y DDR5 SDRAM (JESD79-4)",
  editor: "JEDEC",
  url: "https://www.jedec.org/category/technology-focus-area/main-memory-ddr3-ddr4-sdram",
  consultadoEn: "",
};
const NVME: Fuente = {
  titulo: "Especificaciones NVM Express",
  editor: "NVM Express",
  url: "https://nvmexpress.org/specifications/",
  consultadoEn: HOY,
};
const SATA_IO: Fuente = {
  titulo: "SATA-IO",
  editor: "SATA-IO",
  url: "https://sata-io.org/",
  consultadoEn: HOY,
};
const ATX_22: Fuente = {
  titulo: "ATX Specification, Version 2.2",
  editor: "Intel (formfactors.org)",
  url: "https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf",
  consultadoEn: HOY,
};
const VIA_MINI_ITX: Fuente = {
  titulo: "Formato Mini-ITX",
  editor: "VIA Technologies",
  url: "https://www.viatech.com/en/",
  consultadoEn: "",
};
const USB_IF: Fuente = {
  titulo: "USB-IF Document Library",
  editor: "USB-IF",
  url: "https://www.usb.org/documents",
  consultadoEn: HOY,
};
const UEFI_FORUM: Fuente = {
  titulo: "UEFI Specifications",
  editor: "UEFI Forum",
  url: "https://uefi.org/specifications",
  consultadoEn: "",
};
const MS_WINDOWS_11: Fuente = {
  titulo: "Windows 11 requirements",
  editor: "Microsoft",
  url: "https://learn.microsoft.com/windows/whats-new/windows-11-requirements",
  consultadoEn: HOY,
};
const MANUAL_ASUS: Fuente = {
  titulo: "Soporte y manuales de placas ASUS (falta fijar el manual de un modelo concreto)",
  editor: "Manual <modelo> (ASUS)",
  url: "https://www.asus.com/support/",
  consultadoEn: "",
};
const MANUAL_ASROCK: Fuente = {
  titulo: "Soporte y manuales de placas ASRock (falta fijar el manual de un modelo concreto)",
  editor: "Manual <modelo> (ASRock)",
  url: "https://www.asrock.com/support/index.asp",
  consultadoEn: "",
};
const NOTA_MANUAL = "No hay un manual público estable que citar: quien verifica debe fijar un modelo de ejemplo y enlazar su PDF (ASUS, MSI, Gigabyte o ASRock) antes de publicar.";

/* ---------- Fuentes primarias abiertas en la verificación A (2026-10-13) ---------- */
const V_AMD_AM5 = consultadaEnVerificacion(AMD_CHIPSETS_AM5);
const V_AMD_AM4 = consultadaEnVerificacion(AMD_CHIPSETS_AM4);
const V_AMD_7700X = consultadaEnVerificacion(AMD_RYZEN_7700X);
const V_AMD_5600X = consultadaEnVerificacion(AMD_RYZEN_5600X);
const V_INTEL_ARK_12700 = consultadaEnVerificacion(INTEL_ARK_12700);
const V_INTEL_ARK_14700KF: Fuente = {
  titulo: "Intel® Core™ i7-14700KF (ARK)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/products/sku/236789/intel-core-i7-processor-14700kf-33m-cache-up-to-5-60-ghz/specifications.html",
  consultadoEn: FECHA_VERIFICACION,
};
const V_INTEL_BOXED_ULTRA_S2: Fuente = {
  titulo: "Information About Intel® Core™ Ultra Boxed Desktop Processors (Series 2)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/support/articles/000099656/processors.html",
  consultadoEn: FECHA_VERIFICACION,
};
const V_INTEL_Z690_BIOS: Fuente = {
  titulo: "Intel® Core™ i5-13500 Processor Does Not Boot on a Motherboard with Intel® Z690 Chipset",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/support/articles/000095894/processors/intel-core-processors.html",
  consultadoEn: FECHA_VERIFICACION,
};
const V_INTEL_LGA1700: Fuente = {
  titulo: "Socket LGA1700 with Comparison to Socket LGA1200",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/support/articles/000088168/processors/intel-core-processors.html",
  consultadoEn: FECHA_VERIFICACION,
};
const V_AMD_CPU_100: Fuente = {
  titulo: "Processor Handling Guidance",
  editor: "AMD",
  url: "https://www.amd.com/en/resources/support-articles/faqs/CPU-100.html",
  consultadoEn: FECHA_VERIFICACION,
};
const V_MANUAL_GIGABYTE_B650: Fuente = {
  titulo: "B650 AORUS ELITE AX: manual de usuario (Rev. 1204)",
  editor: "Gigabyte",
  url: "https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
const V_MANUAL_GIGABYTE_Z790: Fuente = {
  titulo: "Z790 AORUS ELITE AX / AX DDR4: manual de usuario (Rev. 1105)",
  editor: "Gigabyte",
  url: "https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
const V_ASUS_B850F: Fuente = {
  titulo: "ROG STRIX B850-F GAMING WIFI7 NEO",
  editor: "ASUS",
  url: "https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-f-gaming-wifi7-neo/",
  consultadoEn: FECHA_VERIFICACION,
};
const V_ASROCK_CATALOGO_AMD: Fuente = {
  titulo: "AMD Platform Solutions: catálogo de placas",
  editor: "ASRock",
  url: "https://download.asrock.com/Download/e-catalog/AMDPlatformSolutionsCatalog.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
const V_SSI_EPS12V: Fuente = {
  titulo: "EPS12V Power Supply Design Guide, v2.91 (copia alojada en xDevs.com)",
  editor: "SSI",
  url: "https://xDevs.com/doc/xDevs.com/Neutron/pdf/eps_designguide_2.91.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
const V_CORSAIR_CABLES: Fuente = {
  titulo: "Which PSU cables go where?",
  editor: "Corsair",
  url: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/which-psu-cables-go-where/",
  consultadoEn: FECHA_VERIFICACION,
};
const V_CORSAIR_EPS_VS_PCIE: Fuente = {
  titulo: "Can I use a PCI-e cable in the 8-pin motherboard plug?",
  editor: "Corsair",
  url: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/can-i-use-a-pci-e-cable-in-the-8-pin-motherboard-plug/",
  consultadoEn: FECHA_VERIFICACION,
};
const V_KINGSTON_DDR5: Fuente = {
  titulo: "Ficha de Kingston FURY DDR5, KF560C30BBEK2-32",
  editor: "Kingston",
  url: "https://www.kingston.com/datasheets/KF560C30BBEK2-32.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
const V_KINGSTON_DDR4: Fuente = {
  titulo: "Ficha de Kingston FURY DDR4, KF432C16BBK2/16",
  editor: "Kingston",
  url: "https://www.kingston.com/dataSheets/KF432C16BBK2_16.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
const V_CORSAIR_DDR5_COMPAT: Fuente = {
  titulo: "Is DDR5 backwards compatible with DDR4?",
  editor: "Corsair",
  url: "https://www.corsair.com/us/en/explorer/diy-builder/memory/is-ddr5-backwards-compatible/",
  consultadoEn: FECHA_VERIFICACION,
};
const V_MS_UEFI: Fuente = {
  titulo: "UEFI firmware requirements",
  editor: "Microsoft",
  url: "https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-uefi",
  consultadoEn: FECHA_VERIFICACION,
};

/* ---------- Partes (en el orden de TARJETA_MADRE_PARTES) ---------- */
const socket: ParteContenido = {
  orden: 1,
  nombre: "Socket del procesador",
  nombreCorto: "Socket",
  alias: ["zócalo", "base del procesador"],
  resumen: "Es el alojamiento del procesador. Cada procesador encaja en un solo tipo de socket, y de él depende qué familias de procesadores acepta la placa.",
  queHace:
    "El socket sostiene el procesador y conecta sus contactos con el resto de la placa. Su forma y la disposición de sus contactos cambian con cada plataforma, así que un procesador de un socket no entra en otro. Que dos piezas compartan socket tampoco asegura que funcionen juntas: también cuentan el chipset y la versión de BIOS.",
  alElegir: [
    "Parte del procesador que quieres y elige una placa con su socket exacto.",
    "Confirma en la lista de compatibilidad del fabricante que tu procesador exacto está soportado, no solo la familia.",
    "Si el procesador es de una generación más nueva que la placa, revisa si hace falta actualizar la BIOS antes de usarlo.",
    "Mira qué sockets admite tu disipador: algunos sirven para varios y otros solo para uno.",
  ],
  hechos: [
    hecho(
      "socket-disipadores-am4-am5",
      "Muchos disipadores diseñados para AM4 se pueden montar en AM5 sin cambiar el soporte, porque se mantuvo la distancia entre los orificios de montaje. Confirma el soporte con el fabricante de tu disipador.",
      [AMD_DISIPADORES],
      "NO confirmado en las páginas de AMD consultadas (partner/socket-am5-change-game no lo dice). Una búsqueda sugiere que AMD indicó que los disipadores de AM4 siguen soportados en AM5: ubicar el comunicado primario o la lista de compatibilidad de un fabricante de disipadores.",
    ),
    hechoVerificado(
      "socket-disipadores-lga1700-lga1851",
      "Los disipadores diseñados para LGA 1700 suelen servir también en LGA 1851, según lo que indique el fabricante de cada disipador.",
      [V_INTEL_BOXED_ULTRA_S2],
      "Intel indica que los disipadores con ventilador pueden usarse entre LGA 1700 y LGA 1851 por ser mecánicamente parecidos para la solución térmica, y recuerda que el disipador debe cubrir la potencia del procesador.",
    ),
    hechoVerificado(
      "socket-mismo-no-garantiza",
      "Compartir socket no garantiza compatibilidad: AMD indica que una placa de la serie 600 puede necesitar una actualización de BIOS para procesadores Ryzen 8000 y 9000, y en AM4 la compatibilidad depende del chipset y de la versión de BIOS.",
      [V_AMD_AM5, V_AMD_AM4, V_INTEL_Z690_BIOS],
      "AM5 (BIOS puede ser necesaria para Ryzen 8000 y 9000 en placas serie 600) y AM4 (tabla chipset por procesador con BIOS beta) confirmados. Intel también pide BIOS nueva para 13.ª generación en Z690; el texto publicado no menciona el caso de Intel (opcional).",
    ),
    hechoVerificado(
      "socket-marca-pin-uno",
      "El procesador y el socket traen una marca de alineación, normalmente un triángulo en una esquina, que indica dónde está el pin 1 y evita instalar el procesador girado.",
      [V_MANUAL_GIGABYTE_B650, V_AMD_CPU_100],
      "El manual de la placa AM5 pide alinear la marca de pin uno (un triángulo) con la esquina del socket; las guías de AMD hablan del patrón de pines y de no forzar el procesador, sin nombrar el triángulo.",
    ),
  ],
  opciones: {
    titulo: "Sockets de escritorio más comunes hoy",
    items: [
      {
        id: "am4",
        etiqueta: "AM4",
        marca: "AMD",
        resumen: "Plataforma anterior de AMD con memoria DDR4. El procesador lleva los pines y la placa tiene los orificios donde entran.",
        vigente: false,
        hechos: [
          hechoVerificado(
            "am4-pga-ryzen",
            "AM4 es un socket de tipo PGA: los pines están en el procesador y la placa tiene orificios. AMD lo usa con procesadores Ryzen de la serie 5000 y anteriores, con memoria DDR4.",
            [V_AMD_AM4, V_AMD_5600X, V_ASROCK_CATALOGO_AMD],
            "AMD confirma AM4 con DDR4 (ficha del 5600X incluida). El tipo PGA sale del catálogo de ASRock (\"Socket AM4 (PGA1331)\" para Ryzen 5000, 4000G, 3000G y 3000), no de las páginas de AMD.",
          ),
        ],
      },
      {
        id: "am5",
        etiqueta: "AM5",
        marca: "AMD",
        resumen: "Plataforma actual de AMD con memoria DDR5. Los contactos están en la placa y el procesador queda apoyado sobre ellos.",
        vigente: true,
        hechos: [
          hecho(
            "am5-lga",
            "AM5 es un socket de tipo LGA: los contactos están en la placa y el procesador no lleva pines. Tiene 1718 contactos.",
            [AMD_CHIPSETS_AM5],
            "NO confirmado en las páginas de AMD consultadas: ni el tipo LGA ni la cifra de contactos (1718 es la cifra comúnmente citada). Si no aparece en una fuente primaria, publicar el hecho sin la cifra.",
          ),
          hechoVerificado(
            "am5-memoria-ddr5",
            "Los procesadores Ryzen para AM5 usan memoria DDR5; AMD no lista DDR4 para esta plataforma.",
            [V_AMD_7700X, V_AMD_AM5],
            "La ficha del Ryzen 7 7700X indica socket AM5, memoria DDR5 y dos canales; la página de chipsets AM5 habla solo de DDR5.",
          ),
        ],
      },
      {
        id: "lga-1700",
        etiqueta: "LGA 1700",
        marca: "Intel",
        resumen: "Plataforma anterior de Intel. Según el procesador y la placa, se usa memoria DDR4 o DDR5, y cada placa admite solo una de las dos.",
        vigente: false,
        hechos: [
          hechoVerificado(
            "lga1700-generaciones-memoria",
            "Intel usa el socket LGA 1700 (FCLGA1700 en ARK) en procesadores Core de las generaciones 12, 13 y 14. El procesador admite DDR4 o DDR5, pero cada placa soporta solo una de las dos.",
            [V_INTEL_LGA1700, V_INTEL_ARK_12700, V_INTEL_ARK_14700KF, V_MANUAL_GIGABYTE_Z790],
            "Intel confirma LGA1700 para 12.ª, 13.ª y 14.ª generación; ARK da FCLGA1700 y DDR5/DDR4 para el 12700 y el 14700KF; el manual de Gigabyte describe dos versiones de la misma placa (4 ranuras DDR5 o 4 DDR4).",
          ),
        ],
      },
      {
        id: "lga-1851",
        etiqueta: "LGA 1851",
        marca: "Intel",
        resumen: "Plataforma más reciente de Intel para sus procesadores Core Ultra. Las placas usan memoria DDR5.",
        vigente: true,
        hechos: [
          hecho(
            "lga1851-procesadores-memoria",
            "LGA 1851 (FCLGA1851 en ARK) es el socket de los procesadores Intel Core Ultra de la serie 200S, y esos procesadores usan memoria DDR5.",
            [INTEL_CORE_ULTRA, INTEL_ARK],
            "NO se pudo abrir ARK. Fichas de tiendas (no primarias) indican FCLGA1851 y solo DDR5 para el Core Ultra 7 265K; hay que confirmarlo en ARK y revisar si existen otras series en este socket.",
          ),
        ],
      },
    ],
  },
  relacionadas: ["chipset", "ranuras-ram", "vrm"],
  enlaces: [{ etiqueta: "Cotiza un equipo con un procesador compatible", href: "/cotizador" }],
};

const chipset: ParteContenido = {
  orden: 2,
  nombre: "Chipset",
  nombreCorto: "Chipset",
  alias: ["PCH", "conjunto de chips de la placa"],
  resumen: "Es el chip que reparte los puertos y las ranuras que no salen directo del procesador. Define qué funciones trae cada placa: USB, SATA, M.2 y más.",
  queHace:
    "El chipset coordina la comunicación entre el procesador y buena parte de las conexiones de la placa. Dentro de una misma plataforma hay varios chipsets, y cambian la cantidad de puertos, las ranuras y las funciones disponibles, como ajustar frecuencias del procesador o de la memoria. Suele ir bajo un disipador pequeño y no se cambia: viene soldado a la placa.",
  alElegir: [
    "Compara los chipsets de la plataforma que elegiste: cambian los puertos USB, SATA y las ranuras M.2.",
    "Si quieres ajustar la frecuencia del procesador o de la memoria, confirma que el procesador y el chipset lo permiten.",
    "Un chipset de gama más completa no acelera el procesador: aporta más conexiones y funciones.",
    "Verifica en el manual qué parte de las conexiones depende del procesador y cuál del chipset.",
  ],
  hechos: [
    hechoVerificado(
      "chipsets-am5",
      "Los chipsets de la plataforma AM5 incluyen A620, B650, B650E, X670, X670E, B840, B850, X870 y X870E; los de la serie 600 pueden necesitar actualización de BIOS para Ryzen 8000 y 9000.",
      [V_AMD_7700X, V_AMD_AM5],
      "La ficha del 7700X lista exactamente esos chipsets; la página de chipsets AM5 ya no muestra B650 ni B650E pero repite el aviso de BIOS. Dato que envejece: revisar al salir chipsets nuevos (cada 6 meses).",
    ),
    hecho(
      "chipsets-overclock",
      "No todos los chipsets permiten ajustar la frecuencia del procesador: en AM5, AMD presenta X870E, X870 y B850 con soporte de overclock, mientras que el A620 es una opción de entrada. En Intel depende además de la serie del procesador.",
      [AMD_CHIPSETS_AM5, INTEL_ARK],
      "Parcial: la página de chipsets AM5 menciona overclock en X870E, X870 y B850. Falta el detalle por chipset en AMD (A620, B840, B650) y toda la parte de Intel (qué chipsets y qué procesadores permiten overclock de CPU y de memoria).",
    ),
    hecho(
      "chipsets-intel",
      "Los chipsets de LGA 1700 son H610, B660, H670, Z690, B760 y Z790; los de LGA 1851 incluyen Z890, B860 y H810.",
      [INTEL_ARK],
      "NO confirmado. Falta la página de plataformas o chipsets de escritorio de Intel; verificar la lista de LGA 1851 (¿H810?).",
    ),
    hecho(
      "chipset-enlace-procesador",
      "El chipset se conecta al procesador mediante un enlace único: en Intel se llama DMI y en AMD usa líneas PCIe. Los dispositivos que cuelgan del chipset comparten ese enlace.",
      [INTEL_ARK, AMD_CHIPSETS_AM5],
      "NO confirmado en las páginas consultadas. Buscar el diagrama de bloques de una plataforma de AMD y una de Intel.",
    ),
    hechoVerificado(
      "chipset-vs-procesador-lineas",
      "Parte de las líneas PCIe, los puertos USB y las ranuras M.2 salen directamente del procesador y otra parte sale del chipset; la distribución cambia según el modelo de placa.",
      [V_AMD_AM5, V_AMD_AM4, V_MANUAL_GIGABYTE_B650, V_MANUAL_GIGABYTE_Z790],
      "La tabla de AMD distingue líneas directas del procesador de las del chipset; los manuales de Gigabyte rotulan cada ranura PCIe y M.2 como del CPU o del chipset.",
    ),
  ],
  relacionadas: ["socket", "pcie-secundarias", "m2", "sata"],
  enlaces: [{ etiqueta: "Compara gamas en el cotizador", href: "/cotizador" }],
};

const vrm: ParteContenido = {
  orden: 3,
  nombre: "VRM (alimentación del procesador)",
  nombreCorto: "VRM",
  alias: ["regulador de voltaje", "fases de alimentación"],
  resumen: "Convierte la energía de la fuente al voltaje que necesita el procesador. Suele verse como una fila de disipadores junto al socket.",
  queHace:
    "El VRM toma la energía que entrega la fuente y la baja al nivel que usa el procesador, de forma estable aunque su consumo cambie. Trabaja bajo carga y se calienta, por eso en muchas placas va cubierto por disipadores a un lado del socket y bajo el flujo de aire del chasis.",
  alElegir: [
    "Procesadores muy exigentes piden una alimentación acorde: busca reseñas de la placa que elegiste con ese procesador.",
    "No compares placas solo por la cantidad de fases que anuncian; ese número no dice por sí solo cuánto aguanta el VRM.",
    "Revisa que la placa tenga disipación en el VRM si planeas usar el procesador a plena carga durante mucho tiempo.",
    "Asegura un buen flujo de aire cerca del socket: ayuda al VRM y al procesador.",
  ],
  hechos: [
    hecho(
      "vrm-funcion",
      "El VRM reduce los 12 V que entrega la fuente al voltaje de funcionamiento del procesador.",
      [INTEL_ARK, AMD_CHIPSETS_AM5],
      "NO confirmado: falta una nota técnica de Intel, AMD o un fabricante de placas que lo describa. No se afirman cifras de fases ni 'más fases = mejor' (V2).",
    ),
  ],
  relacionadas: ["conector-cpu", "socket"],
};

const conectorCpu: ParteContenido = {
  orden: 4,
  nombre: "Conector de energía del procesador (EPS)",
  nombreCorto: "EPS",
  alias: ["CPU_PWR", "cable de ocho pines del procesador"],
  resumen: "Entrada de energía dedicada al procesador. La fuente la conecta con un cable EPS, que no es el mismo cable de la tarjeta gráfica.",
  queHace:
    "Lleva la energía de la fuente hasta el VRM, que la adapta para el procesador. Está cerca del socket, normalmente en el borde superior de la placa. Algunas placas traen más de un conector de este tipo para procesadores de alto consumo.",
  alElegir: [
    "Confirma que tu fuente trae el cable EPS para el procesador; casi todas las fuentes modernas lo incluyen.",
    "No uses un cable de la tarjeta gráfica en este conector, aunque se parezca: están codificados distinto.",
    "Revisa en el manual cuántos conectores trae tu placa y cuáles debes conectar.",
    "Deja espacio para el cable: queda cerca del disipador del procesador.",
  ],
  hechos: [
    hechoVerificado(
      "eps-ocho-pines",
      "El conector de energía del procesador sigue el estándar EPS12V de 8 pines (4+4). Algunas placas traen dos conectores (8+4 u 8+8).",
      [V_SSI_EPS12V, V_CORSAIR_CABLES, V_MANUAL_GIGABYTE_B650, V_MANUAL_GIGABYTE_Z790],
      "La guía EPS12V define el conector de procesador de 8 pines; Corsair explica entradas de 4, 4+4, 8 u 8+8; la B650 AORUS trae 8+4 y la Z790 AORUS trae 8+8. El (4+4) es la forma del cable, no del conector de la placa.",
    ),
    hechoVerificado(
      "eps-vs-pcie-grafica",
      "El cable EPS 4+4 del procesador y el cable PCIe 6+2 de la tarjeta gráfica no son intercambiables: sus conectores tienen codificación distinta.",
      [V_CORSAIR_EPS_VS_PCIE, V_CORSAIR_CABLES],
      "Corsair dice que no son intercambiables, que se parecen pero son físicamente distintos y están cableados distinto. PENDIENTE (decisión del dueño): la hoja propone reformular el texto de «codificación» a «cableado»; aquí NO se reformuló.",
    ),
  ],
  relacionadas: ["vrm", "conector-24-pines"],
  enlaces: [{ etiqueta: "Guías sobre fuentes de poder", href: "/guias" }],
};

const ranurasRam: ParteContenido = {
  orden: 5,
  nombre: "Ranuras de memoria RAM",
  nombreCorto: "RAM",
  alias: ["slots de RAM", "DIMM", "bancos de memoria"],
  resumen: "Aquí van los módulos de memoria. Cada placa admite una sola generación, DDR4 o DDR5, y los módulos de una no entran en la otra.",
  queHace:
    "Las ranuras de RAM alojan los módulos de memoria con los que el procesador guarda lo que está usando. Un seguro en cada extremo los sujeta. Los módulos tienen una muesca en un punto distinto según la generación, y por eso no se pueden forzar en una ranura de otra generación.",
  alElegir: [
    "Elige primero la generación (DDR4 o DDR5) que admite la placa y compra la memoria de esa generación.",
    "Revisa la lista de memorias compatibles del fabricante, sobre todo si quieres frecuencias altas o varios módulos.",
    "Instala los módulos en las ranuras que indica el manual para que trabajen en doble canal.",
    "Antes de decidir cuánta memoria comprar, mira la guía de cuánta RAM necesitas.",
  ],
  hechos: [
    hechoVerificado(
      "ram-ddr4-ddr5-muesca",
      "Los módulos DIMM de DDR4 y de DDR5 tienen 288 contactos, pero la muesca está en otra posición, por lo que no son intercambiables.",
      [V_KINGSTON_DDR5, V_KINGSTON_DDR4, V_CORSAIR_DDR5_COMPAT],
      "Las fichas de Kingston rotulan ambos kits como DIMM de 288 pines; Corsair explica la distinta posición de la muesca. No se abrió el estándar de JEDEC (el PDF exige cuenta). Los SO-DIMM de portátiles tienen otra cantidad de contactos; el texto habla de DIMM.",
    ),
    hechoVerificado(
      "ram-una-generacion-por-placa",
      "Cada placa admite una sola generación de memoria. En AM5 es DDR5; en LGA 1700 depende del modelo de placa, que puede ser DDR4 o DDR5.",
      [V_AMD_7700X, V_INTEL_ARK_12700, V_MANUAL_GIGABYTE_Z790],
      "AMD da DDR5 para AM5; Intel da DDR5 y DDR4 para el 12700; el manual de Gigabyte cubre dos versiones de una misma placa LGA1700 (4 ranuras DDR5 o 4 DDR4).",
    ),
    hechoVerificado(
      "ram-doble-canal",
      "En escritorio los procesadores usan dos canales de memoria. Con cuatro ranuras, hay dos por canal; con dos módulos, el manual indica en qué ranuras ponerlos para usar el doble canal (a menudo A2 y B2).",
      [V_AMD_7700X, V_INTEL_ARK_12700, V_MANUAL_GIGABYTE_B650],
      "El 7700X y el i7-12700 indican dos canales; el manual de Gigabyte recomienda A2 y B2 para dos módulos (indicación de ese fabricante, por eso el texto dice «a menudo»).",
    ),
  ],
  opciones: {
    titulo: "Generaciones de memoria",
    items: [
      {
        id: "ddr4",
        etiqueta: "DDR4",
        resumen: "Generación anterior. La usan placas de AM4 y algunas de LGA 1700.",
        vigente: false,
        hechos: [],
      },
      {
        id: "ddr5",
        etiqueta: "DDR5",
        resumen: "Generación actual. La usan las placas de AM5 y de LGA 1851, y algunas de LGA 1700.",
        vigente: true,
        hechos: [],
      },
    ],
  },
  relacionadas: ["socket", "chipset"],
  enlaces: [{ etiqueta: "Guía: cuánta RAM necesito", href: "/guias" }],
};

const pcie1: ParteContenido = {
  orden: 6,
  nombre: "Ranura PCIe principal (tarjeta gráfica)",
  nombreCorto: "PCIe principal",
  alias: ["ranura de la gráfica", "ranura PCI Express larga"],
  resumen: "Es la ranura más larga, pensada para la tarjeta gráfica. Suele conectarse directamente al procesador.",
  queHace:
    "Conecta la tarjeta gráfica con el procesador mediante un bus PCIe. Una pestaña de plástico la sujeta cuando la tarjeta está instalada. Su generación de PCIe determina el ancho de banda máximo disponible. Una tarjeta de una generación más nueva funciona en una ranura de una generación anterior, a la velocidad de la menor.",
  alElegir: [
    "Si vas a usar una tarjeta gráfica dedicada, confirma que la placa tiene esta ranura y qué generación de PCIe ofrece.",
    "Una tarjeta nueva funciona en una ranura más antigua, pero limitada por la generación menor.",
    "Revisa el espacio: la gráfica puede tapar la ranura siguiente por su grosor y debe caber en el chasis.",
    "Si tu procesador no trae gráficos integrados, necesitas una tarjeta gráfica para ver imagen.",
  ],
  hechos: [
    hecho(
      "pcie-tamanos-fisicos",
      "Las ranuras PCIe existen en tamaños físicos x1, x4, x8 y x16. La ranura x16 es la más larga y es la que usan las tarjetas gráficas.",
      [PCI_SIG],
      "NO confirmado: PCI-SIG bloquea la consulta automática (403); verificar en la especificación o en un resumen público de PCI-SIG.",
    ),
    hecho(
      "pcie-ancho-banda-generaciones",
      "Cada generación de PCIe duplica el ancho de banda de la anterior: 8 GT/s por línea en PCIe 3.0, 16 GT/s en PCIe 4.0 y 32 GT/s en PCIe 5.0 (unos 1, 2 y 4 GB/s por línea y por sentido, de forma aproximada).",
      [PCI_SIG],
      "NO confirmado en fuente consultada. Verificar GT/s y la conversión aproximada a GB/s.",
    ),
    hecho(
      "pcie-compatibilidad-atras",
      "Las tarjetas y ranuras PCIe de generaciones distintas son compatibles hacia atrás: el conjunto funciona a la velocidad de la generación menor de las dos.",
      [PCI_SIG],
      "NO confirmado en fuente consultada.",
    ),
    hechoVerificado(
      "pcie-x16-desde-procesador",
      "La ranura x16 principal suele salir directamente del procesador, mientras que las demás ranuras suelen depender del chipset; la asignación exacta cambia según el modelo.",
      [V_MANUAL_GIGABYTE_B650, V_MANUAL_GIGABYTE_Z790, V_ASUS_B850F, V_AMD_AM5],
      "En tres placas concretas (B650, Z790 y B850) la x16 principal va al procesador y las demás al chipset; el texto ya está redactado con «suele».",
    ),
  ],
  relacionadas: ["pcie-secundarias", "puertos-traseros", "m2"],
  enlaces: [{ etiqueta: "Ver las piezas del recorrido", href: "/servicios#componentes" }],
};

const pcieSec: ParteContenido = {
  orden: 7,
  nombre: "Ranuras PCIe secundarias",
  nombreCorto: "PCIe secundarias",
  alias: ["ranuras de expansión", "slots de expansión"],
  resumen: "Ranuras adicionales para tarjetas de red, captura, sonido o más almacenamiento. Suelen depender del chipset y pueden ser más lentas que la principal.",
  queHace:
    "Permiten ampliar el equipo con tarjetas distintas de la gráfica. Pueden tener forma larga o corta, pero no siempre trabajan con todas sus líneas: una ranura larga puede estar conectada con menos líneas que su tamaño sugiere. En algunas placas comparten líneas con otras conexiones, como las M.2.",
  alElegir: [
    "Cuenta cuántas tarjetas de expansión usarás además de la gráfica.",
    "Revisa en el manual a qué velocidad trabaja cada ranura y si comparte líneas con M.2 o SATA.",
    "Verifica que la gráfica, por su grosor, no tape la ranura que necesitas.",
    "Si piensas en una tarjeta de red inalámbrica, mira primero si la placa ya la trae integrada.",
  ],
  hechos: [
    hechoVerificado(
      "pcie-x16-cableada-menos-lineas",
      "Una ranura PCIe de tamaño físico x16 puede estar conectada eléctricamente a menos líneas, por ejemplo x4 u x8, según el modelo de placa.",
      [V_MANUAL_GIGABYTE_Z790, V_MANUAL_GIGABYTE_B650, V_ASUS_B850F],
      "La Z790 de Gigabyte lista dos ranuras x16 del chipset que funcionan a x4; la B650 las lista a x1; la B850 de ASUS tiene una x16 que corre a x4. Ejemplo opcional más fiel: «por ejemplo x1, x4 u x8».",
    ),
  ],
  relacionadas: ["pcie-principal", "chipset", "m2"],
};

const m2: ParteContenido = {
  orden: 8,
  nombre: "Ranuras M.2",
  nombreCorto: "M.2",
  alias: ["ranura NVMe", "slot M.2", "ranura para SSD"],
  resumen: "Ranura pequeña para SSD en forma de tarjeta. Según la placa acepta NVMe, SATA o ambos, y a veces trae su propio disipador.",
  queHace:
    "Aloja un SSD M.2 que se sujeta con un tornillo pequeño y queda paralelo a la placa. No necesita cables: la conexión de datos y de energía va por la ranura. Cada ranura tiene una llave (la forma de la muesca) y un largo máximo, y no todas admiten los mismos SSD.",
  alElegir: [
    "Cuenta cuántas M.2 trae y cuántos SSD quieres instalar ahora y más adelante.",
    "Confirma qué admite cada una: NVMe, SATA o ambos.",
    "Revisa el largo máximo que cabe y si trae disipador integrado.",
    "Lee en el manual si ocupar una M.2 apaga puertos SATA o resta líneas a una ranura PCIe.",
  ],
  hechos: [
    hecho(
      "m2-llaves",
      "M.2 define varias llaves; los SSD usan la llave M (o B y M) y las tarjetas inalámbricas suelen usar la llave E. Cada llave indica qué tipo de dispositivo admite la ranura.",
      [PCI_SIG],
      "NO confirmado en fuente consultada. La especificación M.2 es de PCI-SIG y su acceso puede requerir membresía.",
    ),
    hecho(
      "m2-largos",
      "Los SSD M.2 se nombran por su tamaño: 2230, 2242, 2260, 2280 y 22110 (22 mm de ancho y 30, 42, 60, 80 o 110 mm de largo). El 2280 es el más habitual.",
      [PCI_SIG],
      "NO confirmado en fuente consultada. Verificar la afirmación 'el más habitual' o quitarla.",
    ),
    hecho(
      "m2-protocolos",
      "Una ranura M.2 puede admitir solo SSD NVMe, solo SSD SATA o ambos, según el modelo de placa.",
      [PCI_SIG, MANUAL_ASUS],
      `NO confirmado en fuente consultada. ${NOTA_MANUAL}`,
    ),
    hecho(
      "m2-comparte-lineas-sata",
      "En algunas placas, ocupar ciertas ranuras M.2 reduce las líneas de una ranura PCIe o desactiva puertos SATA; el manual de cada modelo indica cuáles.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      `NO confirmado con un manual concreto. Una búsqueda mostró que depende del modelo (por ejemplo, en una placa ASUS B650E-MAX son los puertos SATA los que se apagan al usar ciertas ranuras PCIe). ${NOTA_MANUAL}`,
    ),
  ],
  opciones: {
    titulo: "Tipos de SSD que usan M.2",
    items: [
      {
        id: "nvme",
        etiqueta: "NVMe",
        resumen: "Usa líneas PCIe para hablar directo con el procesador o el chipset; es el tipo más habitual en los SSD M.2 actuales.",
        vigente: true,
        hechos: [
          hecho(
            "nvme-lineas-pcie",
            "Los SSD NVMe usan líneas PCIe, normalmente cuatro (x4).",
            [NVME, PCI_SIG],
            "Parcial: nvmexpress.org confirma que NVMe define la comunicación con memoria no volátil sobre PCI Express y que se usa en M.2. No confirmado: 'normalmente x4'.",
          ),
        ],
      },
      {
        id: "sata-m2",
        etiqueta: "SATA",
        resumen: "SSD M.2 que usa el protocolo SATA en vez de PCIe. Encaja en la misma ranura física, pero solo si la placa lo admite.",
        vigente: true,
        hechos: [],
      },
    ],
  },
  relacionadas: ["sata", "pcie-secundarias", "chipset"],
};

const sata: ParteContenido = {
  orden: 9,
  nombre: "Puertos SATA",
  nombreCorto: "SATA",
  alias: ["conectores SATA", "puertos para discos"],
  resumen: "Conectores de datos para discos duros y SSD SATA. Cada unidad necesita además un cable de energía que viene de la fuente.",
  queHace:
    "Los puertos SATA llevan los datos entre la placa y los discos o SSD con conexión SATA, mediante un cable delgado con conectores en forma de L. La energía llega por otro cable que sale de la fuente. Muchas placas modernas traen pocos puertos SATA porque el almacenamiento rápido pasa a M.2.",
  alElegir: [
    "Cuenta las unidades SATA que vas a instalar: discos de almacenamiento y SSD SATA.",
    "Revisa en el manual si algún puerto SATA se apaga al ocupar una ranura M.2.",
    "Usa cables con seguro y conéctalos hasta el fondo.",
    "Confirma que tu fuente trae suficientes conectores de energía SATA para tus unidades.",
  ],
  hechos: [
    hecho(
      "sata-iii-velocidad",
      "SATA III funciona a 6 Gb/s, lo que equivale a unos 600 MB/s de velocidad útil.",
      [SATA_IO],
      "NO confirmado: la portada de sata-io.org consultada no muestra la cifra. Buscar la página de revisión 3.x en SATA-IO.",
    ),
    hecho(
      "sata-datos-y-energia",
      "Cada unidad SATA necesita un cable de datos hacia la placa y un cable de energía SATA desde la fuente.",
      [SATA_IO, ATX_22],
      "NO confirmado en fuente consultada (la especificación SATA completa puede requerir registro).",
    ),
  ],
  relacionadas: ["m2", "conector-24-pines"],
};

const conector24: ParteContenido = {
  orden: 10,
  nombre: "Conector principal de la fuente (24 pines)",
  nombreCorto: "24 pines",
  alias: ["conector ATX", "alimentación principal"],
  resumen: "Es la entrada de energía principal de la placa. La fuente se conecta aquí con su cable más ancho, que alimenta varios componentes.",
  queHace:
    "Entrega a la placa la energía general que reparte a sus circuitos, a la memoria y a los puertos. Es el conector más grande de la placa y está en el borde frontal, a la derecha de las ranuras de memoria. Tiene un seguro que impide soltarlo por accidente.",
  alElegir: [
    "Comprueba que la fuente trae ese cable; casi todas las fuentes ATX lo incluyen.",
    "Presiónalo hasta que el seguro encaje: si queda flojo, el equipo puede no encender.",
    "Revisa que el cable llegue sin quedar tenso, para no forzar el conector.",
    "Mira la guía de vatios para elegir una fuente que cubra tu equipo.",
  ],
  hechos: [
    hecho(
      "atx-24-pines",
      "El conector principal de energía de la placa es de 24 pines (20+4) en el estándar ATX.",
      [ATX_22],
      "Confirmado en la especificación ATX 2.2 consultada: 'Main Power Connector changed from 20 pin to 24 pin to support PCI-Express requirements'.",
    ),
  ],
  relacionadas: ["conector-cpu", "sata"],
  enlaces: [{ etiqueta: "Guías sobre fuentes de poder", href: "/guias" }],
};

const puertos: ParteContenido = {
  orden: 11,
  nombre: "Puertos traseros (E/S)",
  nombreCorto: "Puertos traseros",
  alias: ["panel trasero", "entradas y salidas", "escudo de E/S"],
  resumen: "Aquí se conectan monitor, red, audio, teclado y demás periféricos. Las salidas de video solo sirven si el procesador tiene gráficos integrados.",
  queHace:
    "Es el bloque de puertos que queda al fondo del chasis. Reúne USB, red, audio y, según el modelo, salidas de video y botones para la BIOS. Un escudo metálico lo rodea; en algunas placas viene integrado y en otras es una pieza suelta que se coloca en el chasis.",
  alElegir: [
    "Haz una lista de tus periféricos y confirma que la placa tiene puertos suficientes y del tipo que necesitas.",
    "Si piensas usar la salida de video de la placa, comprueba que tu procesador tiene gráficos integrados.",
    "Revisa si trae red inalámbrica integrada o si necesitarás una tarjeta aparte.",
    "Busca si trae botones para actualizar la BIOS sin procesador o para restablecer la configuración.",
  ],
  hechos: [
    hecho(
      "video-requiere-graficos-integrados",
      "Las salidas de video de la placa solo funcionan con procesadores que incluyen gráficos integrados; los modelos de Intel con sufijo F no los traen.",
      [AMD_RYZEN_7700X, INTEL_ARK_12700],
      "Parcial: las fichas de AMD (7700X, 'AMD Radeon Graphics') y de Intel (i7-12700, 'Intel UHD Graphics 770') consultadas muestran procesadores con gráficos integrados. NO confirmado: el comportamiento de los modelos F de Intel y de los Ryzen sin gráficos (ficha del 5600X dice 'Discrete Graphics Card Required').",
    ),
    hecho(
      "escudo-es-integrado-o-suelto",
      "Algunas placas traen el escudo de E/S ya integrado y otras lo entregan suelto para instalarlo en el chasis.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      `Dato blando, depende del modelo. ${NOTA_MANUAL}`,
    ),
    hecho(
      "botones-bios-flashback-clear-cmos",
      "Algunas placas tienen botones de actualización de BIOS sin procesador (llamados Flashback o equivalentes) y de restablecimiento de la configuración (Clear CMOS); el nombre cambia por fabricante.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      `NO confirmado con manuales concretos. ${NOTA_MANUAL}`,
    ),
  ],
  relacionadas: ["pcie-principal", "bateria-cmos"],
};

const ventiladores: ParteContenido = {
  orden: 12,
  nombre: "Cabezales de ventilador y bomba",
  nombreCorto: "Ventiladores",
  alias: ["fan headers", "CPU_FAN", "SYS_FAN"],
  resumen: "Conectores pequeños para los ventiladores del procesador y del chasis, y para la bomba si tienes refrigeración líquida.",
  queHace:
    "Cada cabezal alimenta un ventilador o una bomba y permite a la placa leer su velocidad. Los que traen cuatro pines también permiten controlarla con una señal PWM, y los de tres pines lo hacen por voltaje. Los nombres impresos junto a cada uno indican su función, por ejemplo la del procesador o la del chasis.",
  alElegir: [
    "Cuenta cuántos ventiladores y cuántas bombas vas a conectar y revisa que la placa tenga cabezales suficientes.",
    "Conecta el ventilador del disipador del procesador al cabezal marcado para el procesador.",
    "Usa un concentrador de ventiladores si te faltan cabezales; no sobrecargues uno solo.",
    "Si la refrigeración es líquida, busca un cabezal pensado para la bomba.",
  ],
  hechos: [
    hecho(
      "ventilador-cuatro-pines-pwm-y-tres-pines",
      "Un cabezal de ventilador de 4 pines (PWM) también acepta ventiladores de 3 pines, que se controlan por voltaje.",
      [PWM_FAN_SPEC],
      "NO se encontró la especificación primaria de Intel (4-Wire PWM Controlled Fans, revisión 1.3) en una URL pública estable; el white paper de Noctua la cita. Buscar copia oficial.",
    ),
    hecho(
      "ventilador-nombres-cabezales",
      "Los cabezales suelen llamarse CPU_FAN, CPU_OPT, SYS_FAN o CHA_FAN y AIO_PUMP, según el fabricante. Muchas placas avisan al arrancar si no detectan un ventilador en CPU_FAN.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      `NO confirmado con manuales concretos. ${NOTA_MANUAL}`,
    ),
  ],
  relacionadas: ["vrm", "conector-cpu"],
};

const conectoresFrontales: ParteContenido = {
  orden: 13,
  nombre: "Conectores del frente del chasis",
  nombreCorto: "Frontales",
  alias: ["panel frontal", "USB frontal", "audio frontal"],
  resumen: "Reciben los cables del frente del chasis: botones de encendido y reinicio, luces, puertos USB y audio.",
  queHace:
    "Son filas de pines pequeños, casi siempre en el borde de la placa, donde se conectan los cables que salen del frente del chasis. Cada cable se conecta a un conector de forma distinta, y el manual indica el orden de los pines del panel de botones y luces.",
  alElegir: [
    "Compara los USB del frente de tu chasis con los conectores de la placa; si el chasis trae USB-C, confirma que la placa tiene el conector correspondiente.",
    "Ten a mano el manual para conectar el panel de botones y luces sin errores.",
    "Revisa que la placa tenga conector de audio frontal si usas los puertos del frente para auriculares.",
    "Planifica el recorrido de los cables antes de cerrar el chasis.",
  ],
  hechos: [
    hecho(
      "panel-frontal-conexiones",
      "El panel frontal reúne cuatro conexiones: encendido, reinicio, luz de encendido y luz de actividad del disco.",
      [INTEL_FRONT_PANEL],
      "NO confirmado: la Intel Front Panel I/O Connectivity Design Guide no se pudo abrir (la copia pública hallada es antigua). Verificar con el manual de un modelo.",
    ),
    hecho(
      "usb-frontal-tipos",
      "Los conectores USB frontales de la placa son de tres tipos: USB 2.0 de 9 pines, USB 3.x de 19 o 20 pines y USB-C frontal (tipo Key-A).",
      [INTEL_FRONT_PANEL, USB_IF],
      "NO confirmado. Intel publica la asignación de pines del USB 3 frontal; USB-IF no publica de forma pública el conector frontal de placa. Verificar la denominación 'Key-A'.",
    ),
    hecho(
      "audio-frontal-hd",
      "El cabezal de audio frontal sigue el estándar Intel HD Audio y suele rotularse AAFP.",
      [INTEL_FRONT_PANEL],
      "NO confirmado en fuente consultada.",
    ),
  ],
  relacionadas: ["puertos-traseros", "bateria-cmos"],
};

const bateria: ParteContenido = {
  orden: 14,
  nombre: "Batería de la placa (CMOS)",
  nombreCorto: "Batería CMOS",
  alias: ["pila de la placa", "batería del reloj"],
  resumen: "Pila circular pequeña que mantiene la hora y la configuración de la placa cuando el equipo está apagado y desconectado.",
  queHace:
    "Alimenta una memoria pequeña y el reloj de la placa, para que conserven la fecha y la configuración de la BIOS aunque se corte la corriente. Cuando se agota, el equipo pierde la hora o pide volver a configurar la BIOS al encender. Se cambia en pocos segundos.",
  alElegir: [
    "Si la hora o la configuración se pierden al desconectar el equipo, cambia la pila.",
    "Usa el tipo que indica el manual de tu placa.",
    "Para restablecer la configuración sin cambiar la pila, usa el botón o el puente de Clear CMOS que indica el manual.",
    "Apaga y desconecta el equipo antes de tocar la placa.",
  ],
  hechos: [
    hecho(
      "bateria-cr2032",
      "La batería de la placa es una pila de botón CR2032.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      `NO confirmado con un manual concreto. ${NOTA_MANUAL}`,
    ),
    hecho(
      "bateria-que-conserva",
      "La batería conserva el reloj y la configuración de la BIOS mientras la placa está sin energía; lo que se guarda depende de la plataforma.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      `NO confirmado con un manual concreto. ${NOTA_MANUAL}`,
    ),
  ],
  relacionadas: ["puertos-traseros", "conectores-frontales"],
};

/* ---------- Secciones ---------- */
const seccionElegir: SeccionTexto = {
  id: "elegir",
  titulo: "Qué mirar al elegir una tarjeta madre",
  parrafos: [
    "Elegir bien la placa evita la mayoría de los problemas de compatibilidad. Revisa estos puntos en orden, empezando por el procesador, porque de él se desprende casi todo lo demás.",
    "Lo que no se ve en el dibujo: la placa guarda su firmware, conocido como BIOS o UEFI, en un chip aparte. Algunas traen botones para actualizarlo sin procesador o para restablecer la configuración, normalmente junto a los puertos traseros o en el borde de la placa.",
  ],
  vinetas: [
    "Socket y chipset: parte del procesador que quieres y confirma en la lista del fabricante que tu modelo exacto está soportado por la placa.",
    "Generación de memoria: la placa usa DDR4 o DDR5, nunca ambas. Elige la memoria según la placa.",
    "Tamaño frente al chasis: confirma que el formato de la placa (ATX, Micro-ATX o Mini-ITX) cabe en el chasis que elegiste.",
    "Cantidad de M.2: cuenta cuántos SSD quieres instalar ahora y cuántos más adelante.",
    "Puertos traseros que de verdad usas: lista tus periféricos, la red y las salidas de video que necesitas.",
    "VRM según el procesador: los procesadores más exigentes piden una alimentación acorde; busca reseñas de la placa con ese procesador.",
    "BIOS al día: pregunta si la placa trae una versión que reconoce tu procesador o si hace falta actualizarla antes de usarla.",
  ],
  hechos: [
    hechoVerificado(
      "uefi-reemplazo-bios",
      "UEFI reemplazó a la BIOS clásica en las placas actuales, aunque en el uso diario se le siga llamando BIOS.",
      [V_MS_UEFI, V_MANUAL_GIGABYTE_B650],
      "Microsoft describe UEFI como reemplazo de la interfaz de firmware BIOS anterior; el manual de Gigabyte usa «UEFI BIOS». uefi.org no se pudo abrir (Cloudflare).",
    ),
    hechoVerificado(
      "bios-procesador-nuevo-flashback",
      "Un procesador más nuevo que la placa puede requerir actualizar la BIOS para ser reconocido. Algunas placas permiten actualizarla sin procesador con un botón (Flashback o equivalente).",
      [V_AMD_AM5, V_AMD_AM4, V_INTEL_Z690_BIOS, V_ASUS_B850F, V_MANUAL_GIGABYTE_B650],
      "AMD e Intel confirman que puede hacer falta BIOS nueva. El «sin procesador» lo respalda ASUS (BIOS FlashBack); el manual de Gigabyte describe Q-Flash Plus sin afirmarlo. El texto dice «algunas placas».",
    ),
    hecho(
      "windows-tpm-arranque-seguro",
      "Windows 11 exige firmware UEFI con arranque seguro (Secure Boot) y TPM versión 2.0; muchas placas lo ofrecen como fTPM (AMD) o PTT (Intel) dentro de la BIOS.",
      [MS_WINDOWS_11],
      "Parcial: Microsoft confirma 'System firmware: UEFI, Secure Boot capable' y 'TPM version 2.0'. NO confirmado: los nombres fTPM y PTT (documentación de AMD e Intel).",
    ),
  ],
};

const seccionErrores: SeccionTexto = {
  id: "errores",
  titulo: "Errores comunes de compatibilidad",
  parrafos: [
    "Estos son los tropiezos más frecuentes al combinar piezas. Casi todos se evitan revisando el manual y la lista de compatibilidad del fabricante antes de comprar.",
    "Los que empiezan con «Nos ha pasado» los hemos visto en el taller; los que empiezan con «Puede pasar» son riesgos conocidos que prevenimos al armar.",
  ],
  vinetas: [
    "Nos ha pasado: armar el equipo con un procesador compatible con la placa, pero con una BIOS que aún no lo reconocía. Al encender, los ventiladores giraban y el equipo se apagaba. Se resolvió actualizando la BIOS por USB con la función que traen algunas placas (según el fabricante se llama Flashback, Q-Flash u otro nombre). Antes de comprar, confirma en la lista de compatibilidad qué versión de BIOS necesita tu procesador.",
    "Nos ha pasado: un cliente que trajo sus componentes con memoria DDR5 y la placa era DDR4. Los módulos tienen la muesca en otro lugar y una generación no entra en la otra.",
    "Nos ha pasado: ventiladores o luces RGB que no eran compatibles con la placa. Hay conectores de cuatro pines (RGB) y de tres pines (ARGB direccionable) que se ven parecidos, pero no son intercambiables. Revisa en el manual cuáles trae tu placa antes de comprar las luces.",
    "Nos ha pasado: clientes que conectan el cable del monitor a la salida de video de la placa teniendo gráfica dedicada, y entonces no ven el rendimiento que esperan porque la gráfica no se está usando. Y al revés, si el procesador no tiene gráficos integrados, la salida de la placa no da imagen. Conecta el monitor a la gráfica.",
    "Puede pasar: instalar el procesador mal y doblar los pines del socket, una reparación difícil. Alinea el procesador con la marca del pin uno y nunca lo fuerces.",
    "Puede pasar: conectar el cable de un ventilador o de una luz en un cabezal que no corresponde, con riesgo de dañar la pieza o la placa. Cada cabezal tiene un uso y una forma: confirma en el manual cuál es cuál.",
    "Puede pasar: instalar una unidad M.2 en una ranura que no admite ese tipo (algunas son solo NVMe, otras aceptan SATA), o llenar todas las ranuras M.2 y quedarte sin puertos SATA porque el manual indica que se comparten.",
    "Puede pasar: elegir un formato de placa que no cabe en el chasis, o un chasis que no admite ese tamaño.",
    "Puede pasar: que un módulo de memoria quede a medio insertar. Debe asentar por completo hasta que las trabas laterales cierren.",
    "Puede pasar: olvidar el cable EPS del procesador. El equipo no enciende o se apaga al poco tiempo.",
  ],
  hechos: [
    hecho(
      "errores-rgb-vs-argb",
      "Los cabezales RGB de cuatro pines trabajan a 12 V y los ARGB direccionables de tres pines a 5 V; conectar uno en el otro puede dañar las luces o la placa.",
      [MANUAL_ASUS],
      `PENDIENTE de verificar con un manual concreto de placa. Dato dado de memoria por el dueño (no estaba seguro de cuál voltaje era cada uno); coincide con lo habitual, pero NO afirmar sin fuente. ${NOTA_MANUAL}`,
    ),
    hecho(
      "errores-bios-flash-usb",
      "Algunas placas permiten actualizar la BIOS desde una memoria USB con un botón o una función dedicada, incluso sin procesador instalado o compatible; el nombre cambia según el fabricante.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      `Caso real del taller (Gigabyte, función Q-Flash). PENDIENTE: confirmar con un manual concreto qué modelos la traen y si funciona sin procesador. ${NOTA_MANUAL}`,
    ),
  ],
};

const seccionTamanos: SeccionTexto = {
  id: "tamanos",
  titulo: "Tamaños de tarjeta madre: ATX, Micro-ATX y Mini-ITX",
  parrafos: [
    "El tamaño de la placa no define su calidad. Cambia cuántas ranuras y puertos trae y en qué chasis cabe. Hay placas pequeñas de gama alta y placas grandes de gama baja.",
    // TODO(dueño): aprobar esta frase (es experiencia de taller, no verificable con fuente primaria).
    "A veces una placa pequeña cuesta más porque lleva lo mismo en menos espacio.",
    "Los tres formatos comparten la lógica de los orificios de montaje, así que muchos chasis pensados para ATX aceptan también placas más pequeñas. Confirma siempre en la ficha del chasis qué formatos admite.",
  ],
  vinetas: [
    "Ranuras de expansión: cambia cuántas tarjetas puedes instalar además de la gráfica.",
    "Ranuras de memoria: cambia cuántos módulos admite la placa.",
    "M.2 y SATA: cambia cuántas unidades de almacenamiento puedes conectar.",
    "Espacio para disipar el VRM: una placa más pequeña tiene menos superficie para disipadores, y cada fabricante lo resuelve de forma distinta según el modelo.",
  ],
  hechos: [
    hecho(
      "tamanos-ranuras-expansion",
      "El formato ATX admite hasta siete ranuras de expansión; Micro-ATX hasta cuatro y Mini-ITX una.",
      [ATX_22, VIA_MINI_ITX],
      "Parcial: la especificación ATX 2.2 consultada confirma 'up to seven expansion slots' para ATX y el esquema muestra 4 ubicaciones máximas para microATX. NO confirmado: una ranura para Mini-ITX (especificación de VIA).",
    ),
    hecho(
      "tamanos-chasis-compatibles",
      "Un chasis ATX suele aceptar también placas Micro-ATX y Mini-ITX, porque sus orificios de montaje coinciden con algunos de los de ATX.",
      [ATX_22, VIA_MINI_ITX],
      "Parcial: la especificación ATX 2.2 consultada dice que 'many ATX form factor chassis accept microATX boards' y que los orificios de ATX y microATX coinciden. NO confirmado para Mini-ITX.",
    ),
    hecho(
      "tamanos-e-atx-sin-medida-unica",
      "Extended ATX (E-ATX) no tiene una medida única definida: cada fabricante indica la suya.",
      [INTEL_ARK],
      "NO confirmado. Si no hay fuente primaria, retirar este hecho y no dar cifra de E-ATX.",
    ),
    hecho(
      "tamanos-orificios-separadores",
      "Cada formato define la posición de los orificios de montaje y de los separadores (standoffs) en el chasis; los de Micro-ATX y Mini-ITX son un subconjunto de los de ATX.",
      [ATX_22, VIA_MINI_ITX],
      "Parcial: confirmado para ATX y microATX en la especificación ATX 2.2 (figura de orificios). NO confirmado para Mini-ITX.",
    ),
    hecho(
      "tamanos-ranuras-memoria",
      "Las placas Mini-ITX suelen traer dos ranuras de memoria, y las Micro-ATX y ATX suelen traer cuatro; hay excepciones según el modelo.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      `Dato de mercado, no de una especificación. ${NOTA_MANUAL}`,
    ),
    hecho(
      "tamanos-m2-sata-cantidad",
      "La cantidad de ranuras M.2 y de puertos SATA depende del modelo de placa y tiende a ser menor en los formatos más pequeños.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      `Dato de mercado, no de una especificación. ${NOTA_MANUAL}`,
    ),
    hecho(
      "tamanos-espacio-vrm",
      "En una placa más pequeña hay menos superficie disponible para el disipador del VRM, y los fabricantes lo resuelven de forma distinta según el modelo.",
      [MANUAL_ASUS, MANUAL_ASROCK],
      "Afirmación cualitativa; confirmar con fichas de producto de tres modelos de formatos distintos.",
    ),
  ],
};

/* ---------- Tamaños a escala (medidas provisionales: hechos por verificar) ---------- */
const factoresForma: readonly FactorForma[] = [
  {
    id: "atx",
    nombre: "ATX",
    anchoMm: 305,
    altoMm: 244,
    resumen: "El formato más habitual en torres de tamaño medio y grande. Deja espacio para más ranuras, puertos y conectores.",
    paraQuien: "A quien quiere margen para ampliar el equipo con el tiempo y tiene un chasis que admite este formato.",
    hecho: hecho(
      "forma-atx-medidas",
      "Una placa ATX completa mide 305 mm de ancho por 244 mm de alto (12 por 9,6 pulgadas).",
      [ATX_22],
      "Confirmado en la copia de la especificación ATX 2.2 consultada: 'A full size ATX board is 12\" wide by 9.6\" deep (305mm x 244mm)'. El sitio formfactors.org (fuente original) ya no responde; ubicar una copia oficial de Intel.",
    ),
  },
  {
    id: "micro-atx",
    nombre: "Micro-ATX",
    anchoMm: 244,
    altoMm: 244,
    resumen: "Una placa cuadrada, más corta que la ATX y con menos ranuras de expansión. Entra en muchos chasis ATX y en chasis compactos pensados para ella.",
    paraQuien: "A quien arma un equipo de tamaño contenido y no necesita muchas tarjetas de expansión.",
    hecho: hecho(
      "forma-micro-atx-medidas",
      "Una placa Micro-ATX mide hasta 244 mm por 244 mm (9,6 por 9,6 pulgadas).",
      [ATX_22],
      "Parcial: el esquema de la especificación ATX 2.2 consultada muestra el contorno microATX con 9.6\" en ambos lados. Verificar con la especificación microATX propia.",
    ),
  },
  {
    id: "mini-itx",
    nombre: "Mini-ITX",
    anchoMm: 170,
    altoMm: 170,
    resumen: "La placa más pequeña de las tres, pensada para chasis compactos. Reúne lo esencial en poco espacio.",
    paraQuien: "A quien busca un equipo pequeño y acepta menos ranuras de expansión. Pide más cuidado con el espacio y con la ventilación.",
    hecho: hecho(
      "forma-mini-itx-medidas",
      "Una placa Mini-ITX mide 170 mm por 170 mm (6,7 por 6,7 pulgadas).",
      [VIA_MINI_ITX],
      "Cifra ampliamente citada (Wikipedia y reseñas), pero no se encontró la especificación primaria de VIA; ubicar el documento original antes de publicar.",
    ),
  },
];

/* ---------- Contenido ---------- */
export const TARJETA_MADRE_CONTENIDO: PiezaContenido<TarjetaMadreParteId> = {
  slug: "tarjeta-madre",
  estado: "borrador",
  piezaServicios: "boards",
  titulo: "Partes de la tarjeta madre (board) y para qué sirven",
  descripcion: "Toca cada parte de una tarjeta madre y mira qué hace: socket, chipset, RAM, PCIe, M.2, SATA, VRM y conectores. Qué revisar antes de elegir la tuya.",
  h1: "Las partes de la tarjeta madre",
  eyebrow: "piezas del PC",
  intro: [
    "La tarjeta madre (también llamada placa base, motherboard o board) es la placa grande donde se conectan todas las demás piezas del PC: procesador, memoria, almacenamiento, tarjeta gráfica y fuente de poder. No procesa nada por sí sola: reparte la energía y comunica las piezas entre sí.",
    "Se elige según el procesador, porque el socket y el chipset de la placa determinan qué procesadores y qué memoria acepta. Toca cada parte del dibujo para ver qué hace, qué mirar al elegirla y qué datos conviene confirmar en el manual de tu modelo.",
  ],
  palabrasClave: [
    "partes de la tarjeta madre",
    "para qué sirve cada parte de la tarjeta madre",
    "cómo elegir una tarjeta madre",
    "socket y chipset",
    "ranuras M.2 y PCIe",
    "ranuras de RAM DDR4 y DDR5",
    "tamaños de tarjeta madre ATX Micro-ATX Mini-ITX",
    "compatibilidad entre procesador y tarjeta madre",
    "qué es el VRM",
    "board para PC",
  ],
  terminos: [
    "M.2",
    "DDR4",
    "DDR5",
    "AM4",
    "AM5",
    "LGA 1700",
    "LGA 1851",
    "PCIe",
    "SATA",
    "NVMe",
    "ATX",
    "Micro-ATX",
    "Mini-ITX",
    "EPS",
    "USB-C",
    "UEFI",
    "BIOS",
    "CMOS",
    "24 pines",
  ],
  publicadoEn: null,
  actualizadoEn: "2026-10-11",
  partes: {
    socket,
    chipset,
    vrm,
    "conector-cpu": conectorCpu,
    "ranuras-ram": ranurasRam,
    "pcie-principal": pcie1,
    "pcie-secundarias": pcieSec,
    m2,
    sata,
    "conector-24-pines": conector24,
    "puertos-traseros": puertos,
    "cabezales-ventilador": ventiladores,
    "conectores-frontales": conectoresFrontales,
    "bateria-cmos": bateria,
  },
  secciones: [seccionElegir, seccionErrores, seccionTamanos],
  factoresForma,
  faq: [
    {
      q: "¿Cómo sé si un procesador es compatible con mi tarjeta madre?",
      a: "Revisa tres cosas: que el socket coincida, que el chipset de la placa lo soporte y que la versión de BIOS lo reconozca. El fabricante de la placa publica una lista de procesadores compatibles con la versión de BIOS que necesita cada uno.",
    },
    {
      q: "¿Puedo poner memoria DDR4 en una placa DDR5?",
      a: "No. Cada placa admite una sola generación de memoria y los módulos tienen la muesca en un lugar distinto, así que no encajan. Revisa en la ficha de la placa si usa DDR4 o DDR5.",
    },
    {
      q: "¿Una tarjeta madre pequeña es de menor calidad?",
      a: "No necesariamente. El tamaño cambia cuántas ranuras y puertos trae la placa y en qué chasis cabe, pero no su calidad. Compara las funciones del modelo que necesitas, no solo el formato.",
    },
    {
      q: "¿Qué pasa si mi procesador no tiene gráficos integrados?",
      a: "Las salidas de video de la placa no funcionarán con él. Necesitas una tarjeta gráfica dedicada para ver imagen en el monitor.",
    },
    {
      q: "¿Para qué sirve la pila redonda de la placa?",
      a: "Mantiene la hora y la configuración de la BIOS cuando el equipo está apagado y desconectado. Si se agota, el equipo pierde la hora o pide configurar de nuevo la BIOS al encender.",
    },
  ],
  // TODO(dueño): decisión 4 del plan. Aprobar la frase "antes de confirmar revisamos contigo que todo encaje"; mientras tanto va la versión prudente.
  cta: {
    titulo: "Cotiza tu PC",
    texto: "Si prefieres no revisar compatibilidades por tu cuenta, en el cotizador eliges la gama de cada pieza y te ayudamos a elegir una combinación compatible.",
    etiqueta: "Cotiza tu PC",
    href: "/cotizador",
  },
};
