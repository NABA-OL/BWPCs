/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contenido de /piezas/tarjeta-madre (docs/piezas-plan.md §6, migrado al contrato multivista: docs/piezas-plan-2.md §2.1). ESTADO: BORRADOR.
// Los hechos verificados por el dueño (hojas A y B, 2026-10-13) conservan su verificadoEn/verificadoPor; los demás siguen en null.
// Los hechos que comparte con otras piezas viven en comun.hechos.ts (mismos ids) y se importan aquí; las fuentes, en fuentes.ts.
// Reglas: prosa sin cifras (salvo nombres de estándar en `terminos`); toda cifra vive en un `Hecho` con fuente.
import {
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
} from "./comun.hechos.ts";
import { hecho, hechoVerificado, hechoVerificadoB, verificadoPorDueno } from "./constructores.ts";
import {
  V_AMD_AM5,
  V_AMD_AM4,
  V_AMD_7700X,
  V_INTEL_Z690_BIOS,
  V_MANUAL_GIGABYTE_B650,
  V_MANUAL_GIGABYTE_Z790,
  V_ASUS_B850F,
  V_MS_UEFI,
  V_ATX_22,
  V_MANUAL_ASROCK_B760M,
  V_MANUAL_MSI_B760,
  V_MANUAL_ASUS_B850_PLUS,
  V_MANUAL_ASUS_Z890M,
  V_MANUAL_ASUS_B850I,
  V_ASUS_B650M_A,
  V_ASUS_FAQ_BIOS_FLASHBACK,
  V_ASROCK_FLASHBACK,
  V_ASUS_FAQ_CLEAR_CMOS,
  V_ASUS_FAQ_BATERIA,
  V_INTEL_FRONT_PANEL_GUIA,
  V_VIA_MINI_ITX_WHITE_PAPER,
} from "./fuentes.ts";
import type { Caso, FactorForma, ParteContenido, PiezaContenido, SeccionTexto, TarjetaMadreParteId, TarjetaMadreVistaId } from "./types.ts";

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
    socketDisipadoresAm4Am5,
    socketDisipadoresLga1700Lga1851,
    hechoVerificado(
      "socket-mismo-no-garantiza",
      "Compartir socket no garantiza compatibilidad: AMD indica que una placa de la serie 600 puede necesitar una actualización de BIOS para procesadores Ryzen 8000 y 9000, y en AM4 la compatibilidad depende del chipset y de la versión de BIOS.",
      [V_AMD_AM5, V_AMD_AM4, V_INTEL_Z690_BIOS],
      "AM5 (BIOS puede ser necesaria para Ryzen 8000 y 9000 en placas serie 600) y AM4 (tabla chipset por procesador con BIOS beta) confirmados. Intel también pide BIOS nueva para 13.ª generación en Z690; el texto publicado no menciona el caso de Intel (opcional).",
    ),
    socketMarcaPinUno,
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
          am4PgaRyzen,
        ],
      },
      {
        id: "am5",
        etiqueta: "AM5",
        marca: "AMD",
        resumen: "Plataforma actual de AMD con memoria DDR5. Los contactos están en la placa y el procesador queda apoyado sobre ellos.",
        vigente: true,
        hechos: [
          am5Lga,
          am5MemoriaDdr5,
        ],
      },
      {
        id: "lga-1700",
        etiqueta: "LGA 1700",
        marca: "Intel",
        resumen: "Plataforma anterior de Intel. Según el procesador y la placa, se usa memoria DDR4 o DDR5, y cada placa admite solo una de las dos.",
        vigente: false,
        hechos: [
          lga1700GeneracionesMemoria,
        ],
      },
      {
        id: "lga-1851",
        etiqueta: "LGA 1851",
        marca: "Intel",
        resumen: "Plataforma más reciente de Intel para sus procesadores Core Ultra. Las placas usan memoria DDR5.",
        vigente: true,
        hechos: [
          lga1851ProcesadoresMemoria,
        ],
      },
    ],
  },
  relacionadas: ["chipset", "ranuras-ram", "vrm"],
  enlaces: [{ etiqueta: "Cotiza un equipo con un procesador compatible", href: "/cotizador" }, { etiqueta: "El procesador a fondo", pieza: "procesador" }, { etiqueta: "La base del disipador sobre el procesador", pieza: "refrigeracion", parte: "base" }],
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
    verificadoPorDueno(
      hecho(
        "chipsets-overclock",
        "No todos los chipsets están pensados para ajustar la frecuencia del procesador. Lo recomendable es usar los que lo habilitan de forma oficial: en AM5, X870E, X870, B850, X670E y X670; en Intel, la serie Z con un procesador desbloqueado (sufijo K). Algunas placas con otros chipsets, como ciertas de la serie B, también permiten ajustes según el fabricante y el modelo; no es lo recomendable y exige que la placa tenga un buen VRM (fases de alimentación).",
        [
          V_AMD_AM5,
          { titulo: "Desktop Chipsets Product Specifications (Intel ARK)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/ark/products/series/46645/desktop-chipsets.html", consultadoEn: "2026-10-13" },
          { titulo: "What Are the Hardware Requirements for Overclocking an Intel® Processor?", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000097808/processors/intel-core-processors.html", consultadoEn: "2026-10-13" },
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. ajustado por NB 2026-10-15 (dictado). La parte de placas B con buen VRM es experiencia del taller, sin fuente: confirmar la redacción final.",
      ),
      "2026-10-15",
      "NB",
    ),
    verificadoPorDueno(
      hecho(
        "chipsets-intel",
        "Entre los chipsets de LGA 1700 están H610, B660, H670, Z690, H770, B760 y Z790; entre los de LGA 1851, Z890, B860 y H810.",
        [
          { titulo: "Desktop Chipsets Product Specifications (Intel ARK)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/ark/products/series/46645/desktop-chipsets.html", consultadoEn: "2026-10-13" },
          { titulo: "Intel® Z890 Chipset (ARK)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/237777/intel-z890-chipset/specifications.html", consultadoEn: "2026-10-13" },
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15)",
      ),
      "2026-10-15",
      "NB",
    ),
    verificadoPorDueno(
      hecho(
        "chipset-enlace-procesador",
        "El chipset se conecta al procesador mediante un enlace dedicado; en Intel se llama DMI. En AMD el enlace no tiene un nombre propio, pero cumple la misma función. Los dispositivos que cuelgan del chipset comparten el ancho de banda de ese enlace.",
        [
          { titulo: "Intel® Z890 Chipset (ARK)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/237777/intel-z890-chipset/specifications.html", consultadoEn: "2026-10-13" },
          V_AMD_AM5,
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. propuesta aprobada con el agregado de AMD pedido por NB (2026-10-15). La frase de AMD no tiene fuente abierta.",
      ),
      "2026-10-15",
      "NB",
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
    verificadoPorDueno(
      hecho(
        "vrm-funcion",
        "El VRM toma la energía de 12 V que llega por el conector del procesador y la convierte al voltaje con el que trabaja el procesador. Junto con los condensadores que lo rodean, filtra el ruido y los picos para mantener el voltaje estable, porque un voltaje alto puede dañar el procesador. Un procesador más potente consume más y suele pedir más fases de alimentación: con menos fases puede funcionar, pero la placa se vuelve inestable bajo carga.",
        [
          { titulo: "EPS12V Power Supply Design Guide, v2.91 (SSI; copia alojada en xDevs.com)", editor: "SSI", url: "https://xDevs.com/doc/xDevs.com/Neutron/pdf/eps_designguide_2.91.pdf", consultadoEn: "2026-10-13" },
          V_MANUAL_GIGABYTE_B650,
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. propuesta aprobada con el agregado de condensadores y fases pedido por NB (2026-10-15). Ese agregado es experiencia del taller, sin fuente: confirmar la redacción final.",
      ),
      "2026-10-15",
      "NB",
    ),
  ],
  relacionadas: ["conector-cpu", "socket"],
  enlaces: [{ etiqueta: "El procesador a fondo", pieza: "procesador" }],
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
    epsOchoPines,
    epsVsPcieGrafica,
  ],
  relacionadas: ["vrm", "conector-24-pines"],
  enlaces: [{ etiqueta: "Guías sobre fuentes de poder", href: "/guias" }, { etiqueta: "Conector EPS en la fuente de poder", pieza: "fuente-de-poder", parte: "eps-cpu" }],
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
    ramDdr4Ddr5Muesca,
    ramUnaGeneracionPorPlaca,
    ramDobleCanal,
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
  enlaces: [{ etiqueta: "Guía: cuánta RAM necesito", href: "/guias" }, { etiqueta: "La memoria RAM a fondo", pieza: "memoria-ram", parte: "ranura" }],
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
    pcieTamanosFisicos,
    pcieAnchoBandaGeneraciones,
    pcieCompatibilidadAtras,
    pcieX16DesdeProcesador,
  ],
  relacionadas: ["pcie-secundarias", "puertos-traseros", "m2"],
  enlaces: [{ etiqueta: "Ver las piezas del recorrido", href: "/servicios#componentes" }, { etiqueta: "La tarjeta gráfica a fondo", pieza: "tarjeta-grafica", parte: "conector-pcie" }],
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
    m2Llaves,
    m2Largos,
    m2Protocolos,
    m2ComparteLineasSata,
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
          nvmeLineasPcie,
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
  enlaces: [{ etiqueta: "El almacenamiento M.2 a fondo", pieza: "almacenamiento", parte: "llave-m2" }],
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
    sataIiiVelocidad,
    sataDatosYEnergia,
  ],
  relacionadas: ["m2", "conector-24-pines"],
  enlaces: [{ etiqueta: "Almacenamiento SATA a fondo", pieza: "almacenamiento", parte: "conector-sata-datos" }, { etiqueta: "El conector de energía SATA en la fuente de poder", pieza: "fuente-de-poder", parte: "sata-poder" }],
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
    atx24Pines,
  ],
  relacionadas: ["conector-cpu", "sata"],
  enlaces: [{ etiqueta: "Guías sobre fuentes de poder", href: "/guias" }, { etiqueta: "Conector de 24 pines en la fuente de poder", pieza: "fuente-de-poder", parte: "atx-24" }],
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
    videoRequiereGraficosIntegrados,
    hechoVerificadoB(
      "escudo-es-integrado-o-suelto",
      "Algunas placas traen el escudo de E/S ya integrado y otras lo entregan suelto para instalarlo en el chasis.",
      [V_MANUAL_ASUS_B850_PLUS, V_MANUAL_MSI_B760, V_MANUAL_ASROCK_B760M],
      "La ASUS B850-PLUS declara escudo premontado; la MSI B760 y la ASRock B760M-H/M.2 lo incluyen suelto en la caja.",
    ),
    hechoVerificadoB(
      "botones-bios-flashback-clear-cmos",
      "Algunas placas tienen botones de actualización de BIOS sin procesador (llamados Flashback o equivalentes) y de restablecimiento de la configuración (Clear CMOS); el nombre cambia por fabricante.",
      [V_ASUS_FAQ_BIOS_FLASHBACK, V_ASROCK_FLASHBACK, V_ASUS_FAQ_CLEAR_CMOS, V_MANUAL_ASUS_Z890M],
      "ASUS (USB BIOS FlashBack; Clear CMOS por botón o puente) y ASRock (BIOS Flashback) confirmados. MSI (Flash BIOS Button) y Gigabyte (Q-Flash Plus) no se pudieron abrir (403): no se citan como confirmados.",
    ),
  ],
  relacionadas: ["pcie-principal", "bateria-cmos"],
  enlaces: [{ etiqueta: "Las salidas de video en el bracket de la tarjeta gráfica", pieza: "tarjeta-grafica", parte: "bracket" }],
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
    verificadoPorDueno(
      hecho(
        "ventilador-cuatro-pines-pwm-y-tres-pines",
        "Los cabezales de ventilador de 4 pines (PWM) suelen aceptar también ventiladores de 3 pines, que se controlan por voltaje; en algunas placas hay que elegir el modo DC en la BIOS y el comportamiento depende del modelo.",
        [
          V_MANUAL_MSI_B760,
          { titulo: "ASUS, TUF GAMING B550-PLUS", editor: "ASUS", url: "https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b550-plus/", consultadoEn: "2026-10-13" },
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15)",
      ),
      "2026-10-15",
      "NB",
    ),
    ventiladorNombresCabezales,
  ],
  relacionadas: ["vrm", "conector-cpu"],
  enlaces: [{ etiqueta: "El ventilador del disipador a fondo", pieza: "refrigeracion", parte: "ventilador" }, { etiqueta: "La bomba de la refrigeración líquida", pieza: "refrigeracion", parte: "bloque-bomba" }],
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
    hechoVerificadoB(
      "panel-frontal-conexiones",
      "El panel frontal reúne cuatro conexiones: encendido, reinicio, luz de encendido y luz de actividad del disco.",
      [V_INTEL_FRONT_PANEL_GUIA, V_MANUAL_MSI_B760, V_MANUAL_ASUS_B850_PLUS],
      "La guía de Intel es copia de terceros (hackaday.io) del documento de Intel. Los manuales de ASUS y MSI listan las mismas cuatro conexiones.",
    ),
    verificadoPorDueno(
      hecho(
        "usb-frontal-tipos",
        "Los conectores USB frontales de la placa son de tres tipos: USB 2.0, USB 3.x y USB-C frontal. Cada uno usa su propio cable y no son intercambiables.",
        [
          { titulo: "Intel, USB 3.0 Internal Connector and Cable Specification, Rev. 1.0", editor: "Intel", url: "https://www.intel.com.au/content/dam/www/public/us/en/documents/technical-specifications/usb3-internal-connector-cable-specification.pdf", consultadoEn: "2026-10-13" },
          V_INTEL_FRONT_PANEL_GUIA,
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15): se nombra por tipo, no por la marca de cada fabricante",
      ),
      "2026-10-15",
      "NB",
    ),
    verificadoPorDueno(
      hecho(
        "audio-frontal-hd",
        "Las placas actuales traen un conector de audio frontal para chasis con audio HD; su nombre cambia según el fabricante (por ejemplo, F_AUDIO o JAUD1), pero es el mismo tipo de conector, para que funcione con el cable de audio de los chasis.",
        [V_MANUAL_ASUS_B850_PLUS, V_MANUAL_MSI_B760, V_INTEL_FRONT_PANEL_GUIA],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular con el agregado de NB (2026-10-15): mismo conector con distinto nombre según la marca. Lo de la compatibilidad con los chasis es criterio de NB, sin fuente.",
      ),
      "2026-10-15",
      "NB",
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
    hechoVerificadoB(
      "bateria-cr2032",
      "La batería de la placa es una pila de botón CR2032.",
      [V_ASUS_FAQ_BATERIA, V_MANUAL_ASUS_B850_PLUS, V_MANUAL_MSI_B760],
      "Manuales de ASUS y MSI y FAQ de ASUS indican CR2032 de 3 V. Propuesta opcional pendiente del dueño: «La batería de la placa suele ser una pila de botón CR2032.»",
    ),
    hechoVerificadoB(
      "bateria-que-conserva",
      "La batería conserva el reloj y la configuración de la BIOS mientras la placa está sin energía; lo que se guarda depende de la plataforma.",
      [V_ASUS_FAQ_CLEAR_CMOS, V_MANUAL_ASUS_B850_PLUS],
      "Borrar el CMOS reinicia la memoria del reloj de tiempo real (fecha, hora, contraseña de la BIOS y parámetros).",
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
    verificadoPorDueno(
      hecho(
        "windows-tpm-arranque-seguro",
        "Windows 11 requiere firmware UEFI con capacidad de arranque seguro (Secure Boot) y TPM versión 2.0; muchas placas ofrecen el TPM dentro de la BIOS, y cada fabricante de procesador lo llama distinto: fTPM en AMD y PTT en Intel, pero cumplen la misma función.",
        [
          { titulo: "Windows 11 requirements (Microsoft Learn)", editor: "Microsoft", url: "https://learn.microsoft.com/en-us/windows/whats-new/windows-11-requirements", consultadoEn: "2026-10-13" },
          { titulo: "Enable TPM 2.0 on your PC (Soporte de Microsoft)", editor: "Microsoft", url: "https://support.microsoft.com/en-us/windows/enable-tpm-2-0-on-your-pc-1fd5a332-360d-4f46-a1e7-ae6b0c90645c", consultadoEn: "2026-10-13" },
          { titulo: "What Is Trusted Platform Model (TPM) and Its Relation to Intel® Platform Trust Technology (Intel® PTT)?", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000094205/processors/intel-core-processors.html", consultadoEn: "2026-10-13" },
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15); se agrega que fTPM y PTT son lo mismo con otro nombre (pedido de NB).",
      ),
      "2026-10-15",
      "NB",
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
  hechos: [
    verificadoPorDueno(
      hecho(
        "errores-rgb-vs-argb",
        "Los conectores RGB de cuatro pines trabajan a 12 V y los ARGB direccionables de tres pines a 5 V; no son intercambiables, y conectar una tira ARGB de 5 V en un conector RGB de 12 V puede dañar la tira. Fíjate bien en la orientación: el conector del cable y el de la placa traen una marca de pin 1 (una flecha o un triángulo) que debe quedar alineada; conectarlo al revés puede dañar las luces o la placa. Confirma en el manual de tu placa cuáles conectores trae.",
        [
          V_MANUAL_MSI_B760,
          V_MANUAL_ASUS_Z890M,
          { titulo: "ASUS, FAQ de tiras +5 V ARGB y +12 V RGB", editor: "ASUS", url: "https://rog.asus.com/jp/support/faq/1056087/", consultadoEn: "2026-10-13" },
          { titulo: "ASUS ROG Crosshair X870E Extreme, especificaciones", editor: "ASUS", url: "https://rog.asus.com/motherboards/rog-crosshair/rog-crosshair-x870e-extreme/spec/", consultadoEn: "2026-10-13" },
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15) con el agregado de la orientación (NB). La advertencia de conectar al revés es experiencia del taller, sin fuente: confirmar la redacción final.",
      ),
      "2026-10-15",
      "NB",
    ),
    hechoVerificadoB(
      "errores-bios-flash-usb",
      "Algunas placas permiten actualizar la BIOS desde una memoria USB con un botón o una función dedicada, incluso sin procesador instalado o compatible; el nombre cambia según el fabricante.",
      [V_ASUS_FAQ_BIOS_FLASHBACK, V_ASROCK_FLASHBACK, V_MANUAL_ASUS_B850_PLUS],
      "ASUS y ASRock confirman la actualización sin procesador y con el sistema apagado (solo en modelos que la traen). La viñeta «Nos ha pasado» de la BIOS por USB nombra Q-Flash; en Gigabyte la función que actualiza sin procesador se llama Q-Flash Plus: el dueño debe confirmar cuál usó.",
    ),
  ],
};

const seccionTamanos: SeccionTexto = {
  id: "tamanos",
  titulo: "Tamaños de tarjeta madre: ATX, Micro-ATX y Mini-ITX",
  parrafos: [
    "El tamaño de la placa no define su calidad. Cambia cuántas ranuras de expansión y de memoria suele traer y en qué chasis cabe. Hay placas pequeñas de gama alta y placas grandes de gama baja.",
    // TODO(dueño): aprobar esta frase (es experiencia de taller, no verificable con fuente primaria).
    "A veces una placa pequeña cuesta más porque lleva lo mismo en menos espacio.",
    "Muchos chasis pensados para ATX aceptan también placas más pequeñas. Confirma siempre en la ficha del chasis qué formatos admite.",
    "Existe además un formato mayor, Extended ATX (E-ATX), poco común en equipos de uso general. Lo usan sobre todo entusiastas que arman servidores o estaciones de trabajo propias, y exige un chasis pensado para él.",
  ],
  vinetas: [
    "Ranuras de expansión: cambia cuántas tarjetas puedes instalar además de la gráfica.",
    "Ranuras de memoria: el formato suele marcar cuántos módulos admite la placa, con excepciones según el modelo.",
    "M.2 y SATA: la cantidad depende más del modelo y del chipset que del formato; revísala en la ficha de la placa.",
  ],
  hechos: [
    verificadoPorDueno(
      hecho(
        "tamanos-ranuras-expansion",
        "Según su especificación, el formato ATX admite hasta siete ranuras de expansión, Micro-ATX hasta cuatro y Mini-ITX una; cuántas trae cada placa depende del modelo.",
        [
          V_ATX_22,
          V_VIA_MINI_ITX_WHITE_PAPER,
          { titulo: "Wikipedia, Motherboard form factor", editor: "Wikipedia", url: "https://en.wikipedia.org/wiki/Motherboard_form_factor", consultadoEn: "2026-10-13" },
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15). NB dictó «ATX hasta 6»; la propuesta y la fuente dicen siete, se dejó siete. Pendiente opcional: aclarar que algunas Mini-ITX traen la ranura PCIe en otra orientación y que en ATX no todas las ranuras son PCIe.",
      ),
      "2026-10-15",
      "NB",
    ),
    verificadoPorDueno(
      hecho(
        "tamanos-chasis-compatibles",
        "Muchos chasis ATX aceptan también placas Micro-ATX y, con frecuencia, Mini-ITX. Confirma siempre en la ficha del chasis qué formatos admite.",
        [
          V_ATX_22,
          V_VIA_MINI_ITX_WHITE_PAPER,
          { titulo: "Wikipedia, Motherboard form factor y ATX", editor: "Wikipedia", url: "https://en.wikipedia.org/wiki/Motherboard_form_factor", consultadoEn: "2026-10-13" },
        ],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15)",
      ),
      "2026-10-15",
      "NB",
    ),
    verificadoPorDueno(
      hecho(
        "tamanos-ranuras-memoria",
        "Las placas Mini-ITX suelen traer dos ranuras de memoria y la mayoría de las Micro-ATX y ATX traen cuatro; hay excepciones, como algunas Micro-ATX económicas con dos.",
        [V_MANUAL_ASUS_B850I, V_MANUAL_ASROCK_B760M],
        "Decisión de NB (2026-10-19, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19)",
      ),
      "2026-10-19",
      "NB",
    ),
    verificadoPorDueno(
      hecho(
        "tamanos-m2-sata-cantidad",
        "La cantidad de ranuras M.2 y de puertos SATA depende del modelo de placa y de su chipset, más que del formato.",
        [V_MANUAL_ASUS_B850_PLUS, V_MANUAL_ASUS_Z890M, V_MANUAL_ASUS_B850I],
        "Decisión de NB (2026-10-15, hoja tarjeta-madre): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15)",
      ),
      "2026-10-15",
      "NB",
    ),
  ],
};

/* ---------- Casos del taller (antes eran las viñetas de la sección de errores; el texto es el mismo) ----------
 * `texto` continúa el rótulo que pone la interfaz («Nos ha pasado: armar el equipo…»), por eso empieza en minúscula.
 * Los cuatro vividos los contó el dueño (docs/piezas-errores-taller.md); aprobadoEn/aprobadoPor quedan en null hasta que apruebe su redacción. */
const casos: readonly Caso[] = [
  {
    id: "bios-sin-reconocer-procesador",
    tipo: "vivido",
    texto: "armar el equipo con un procesador compatible con la placa, pero con una BIOS que aún no lo reconocía. Al encender, los ventiladores giraban y el equipo se apagaba. Se resolvió actualizando la BIOS por USB con la función que traen algunas placas (según el fabricante se llama Flashback, Q-Flash u otro nombre). Antes de comprar, confirma en la lista de compatibilidad qué versión de BIOS necesita tu procesador.",
    confirmadoPorDueno: true,
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "ddr5-en-placa-ddr4",
    tipo: "vivido",
    texto: "un cliente que trajo sus componentes con memoria DDR5 y la placa era DDR4. Los módulos tienen la muesca en otro lugar y una generación no entra en la otra.",
    confirmadoPorDueno: true,
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "rgb-argb-no-compatibles",
    tipo: "vivido",
    texto: "ventiladores o luces RGB que no eran compatibles con la placa. Hay conectores de cuatro pines (RGB) y de tres pines (ARGB direccionable) que se ven parecidos, pero no son intercambiables. Revisa en el manual cuáles trae tu placa antes de comprar las luces.",
    confirmadoPorDueno: true,
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "monitor-en-la-placa",
    tipo: "vivido",
    texto: "clientes que conectan el cable del monitor a la salida de video de la placa teniendo gráfica dedicada, y entonces no ven el rendimiento que esperan porque la gráfica no se está usando. Y al revés, si el procesador no tiene gráficos integrados, la salida de la placa no da imagen. Conecta el monitor a la gráfica.",
    confirmadoPorDueno: true,
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "pines-del-socket-doblados",
    tipo: "puede-pasar",
    texto: "instalar el procesador mal y doblar los pines del socket, una reparación difícil. Alinea el procesador con la marca del pin uno y nunca lo fuerces.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "cabezal-equivocado",
    tipo: "puede-pasar",
    texto: "conectar el cable de un ventilador o de una luz en un cabezal que no corresponde, con riesgo de dañar la pieza o la placa. Cada cabezal tiene un uso y una forma: confirma en el manual cuál es cuál.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "m2-ranura-incompatible",
    tipo: "puede-pasar",
    texto: "instalar una unidad M.2 en una ranura que no admite ese tipo (algunas son solo NVMe, otras aceptan SATA), o llenar todas las ranuras M.2 y quedarte sin puertos SATA porque el manual indica que se comparten.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "placa-no-cabe-en-el-chasis",
    tipo: "puede-pasar",
    texto: "elegir un formato de placa que no cabe en el chasis, o un chasis que no admite ese tamaño.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "ram-a-medio-insertar",
    tipo: "puede-pasar",
    texto: "que un módulo de memoria quede a medio insertar. Debe asentar por completo hasta que las trabas laterales cierren.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "olvido-del-cable-eps",
    tipo: "puede-pasar",
    texto: "olvidar el cable EPS del procesador. El equipo no enciende o se apaga al poco tiempo.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
];

/* ---------- Tamaños a escala (medidas provisionales: hechos por verificar) ---------- */
const factoresForma: readonly FactorForma[] = [
  {
    id: "atx",
    nombre: "ATX",
    anchoMm: 305,
    altoMm: 244,
    resumen: "El formato más habitual en torres de tamaño medio y grande. Deja espacio para más ranuras, puertos y conectores.",
    paraQuien: "A quien quiere margen para ampliar el equipo con el tiempo y tiene un chasis que admite este formato.",
    hecho: hechoVerificadoB(
      "forma-atx-medidas",
      "Una placa ATX completa mide 305 mm de ancho por 244 mm de alto (12 por 9,6 pulgadas).",
      [V_ATX_22, V_MANUAL_ASUS_B850_PLUS],
      "La ATX 2.2 es copia de terceros (xDevs.com) del documento de Intel: 12\" por 9,6\" (305 mm por 244 mm). La especificación dice «profundidad»; el texto, «alto»: misma dimensión vista en planta.",
    ),
  },
  {
    id: "micro-atx",
    nombre: "Micro-ATX",
    anchoMm: 244,
    altoMm: 244,
    resumen: "Una placa cuadrada, más corta que la ATX y con menos ranuras de expansión. Entra en muchos chasis ATX y en chasis compactos pensados para ella.",
    paraQuien: "A quien arma un equipo de tamaño contenido y no necesita muchas tarjetas de expansión.",
    hecho: hechoVerificadoB(
      "forma-micro-atx-medidas",
      "Una placa Micro-ATX mide hasta 244 mm por 244 mm (9,6 por 9,6 pulgadas).",
      [V_VIA_MINI_ITX_WHITE_PAPER, V_ATX_22, V_MANUAL_ASUS_Z890M, V_ASUS_B650M_A],
      "Copias de terceros de los documentos de VIA e Intel. La especificación microATX propia no se pudo abrir, pero cuatro documentos primarios dan 244 mm; «hasta» es correcto porque es un máximo.",
    ),
  },
  {
    id: "mini-itx",
    nombre: "Mini-ITX",
    anchoMm: 170,
    altoMm: 170,
    resumen: "La placa más pequeña de las tres, pensada para chasis compactos. Reúne lo esencial en poco espacio.",
    paraQuien: "A quien busca un equipo pequeño y acepta menos ranuras de expansión. Pide más cuidado con el espacio y con la ventilación.",
    hecho: hechoVerificadoB(
      "forma-mini-itx-medidas",
      "Una placa Mini-ITX mide 170 mm por 170 mm (6,7 por 6,7 pulgadas).",
      [V_VIA_MINI_ITX_WHITE_PAPER, V_MANUAL_ASUS_B850I],
      "El white paper de VIA (copia de terceros) da 170 mm por 170 mm como máximo; el manual de la ASUS B850-I dice 6,7 x 6,7 pulgadas. Propuesta opcional pendiente del dueño: «mide hasta 170 mm por 170 mm» por simetría con Micro-ATX.",
    ),
  },
];

/* ---------- Contenido ---------- */
export const TARJETA_MADRE_CONTENIDO: PiezaContenido<TarjetaMadreParteId, TarjetaMadreVistaId> = {
  slug: "tarjeta-madre",
  estado: "publicado",
  piezaServicios: "boards",
  nombreCorto: "Tarjeta madre",
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
  sinonimos: ["placa base", "motherboard", "board"],
  publicadoEn: null,
  actualizadoEn: "2026-10-11",
  bloques: ["partes", "lista", "tamanos", "elegir", "errores", "preguntas"],
  vistas: [
    {
      id: "unica",
      etiqueta: "ATX",
      resumen: "Una tarjeta madre ATX típica vista en perspectiva, con sus partes numeradas.",
      etiquetaFigura: "Dibujo de una tarjeta madre ATX típica. La ubicación de cada parte cambia según el modelo.",
    },
  ],
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
  casos,
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
      a: "No necesariamente. El tamaño cambia cuántas ranuras de expansión y de memoria suele traer la placa y en qué chasis cabe, pero no su calidad. Compara las funciones del modelo que necesitas, no solo el formato.",
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
