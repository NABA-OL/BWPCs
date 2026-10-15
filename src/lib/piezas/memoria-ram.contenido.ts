/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contenido de /piezas/memoria-ram (docs/piezas-plan-2.md §3.2). ESTADO: BORRADOR. Todos los hechos nuevos nacen SIN verificar (verificadoEn: null).
// Reglas: prosa sin cifras (salvo nombres de estándar en `terminos`); toda cifra vive en un `Hecho` con fuente; el texto de un caso continúa su rótulo.
// Los hechos que comparte con otras piezas viven en comun.hechos.ts (mismos objetos, misma verificación).
import {
  am4PgaRyzen,
  am5MemoriaDdr5,
  lga1700GeneracionesMemoria,
  lga1851ProcesadoresMemoria,
  ramDdr4Ddr5Muesca,
  ramDobleCanal,
  ramUnaGeneracionPorPlaca,
} from "./comun.hechos.ts";
import { conRevision, hecho } from "./constructores.ts";
import { JEDEC_DDR4, JEDEC_DDR5 } from "./fuentes.ts";
import type { Caso, Fuente, Hecho, MemoriaRamParteId, MemoriaRamVistaId, ParteContenido, PiezaContenido, SeccionTexto } from "./types.ts";

/* ---------- Fuentes de esta pieza (consultadoEn solo si se abrió la página; "" = candidata sin abrir) ---------- */
const JEDEC_PRENSA_DDR5: Fuente = {
  titulo: "JEDEC publica el estándar DDR5 SDRAM (comunicado)",
  editor: "JEDEC",
  url: "https://www.jedec.org/news/pressreleases/jedec-publishes-new-ddr5-standard-advancing-next-generation-high-performance",
  consultadoEn: "2026-10-14",
};
const KINGSTON_DDR4_VS_DDR5: Fuente = {
  titulo: "DDR4 vs DDR5 DRAM: diferencias de rendimiento, compatibilidad y plataformas",
  editor: "Kingston",
  url: "https://www.kingston.com/en/blog/pc-performance/ddr-memory-generation-differences",
  consultadoEn: "",
};
const KINGSTON_DDR5_RESUMEN: Fuente = {
  titulo: "Estándar de memoria DDR5: introducción a la siguiente generación de módulos DRAM",
  editor: "Kingston",
  url: "https://www.kingston.com/en/blog/pc-performance/ddr5-overview",
  consultadoEn: "",
};
const MICRON_DDR5_MODULO: Fuente = {
  titulo: "Micron DDR5: características de los módulos para cliente (documento técnico)",
  editor: "Micron",
  url: "https://assets.micron.com/adobe/assets/urn:aaid:aem:5902f17e-8bde-4246-971c-8d7f274c6b1a/renditions/original/as/ddr5-key-module-features-wp-client.pdf",
  consultadoEn: "",
};
const INTEL_XMP: Fuente = {
  titulo: "Intel Extreme Memory Profile (XMP)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/gaming/extreme-memory-profile-xmp.html",
  consultadoEn: "2026-10-14",
};
const AMD_EXPO: Fuente = {
  titulo: "AMD EXPO: perfiles de memoria",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/technologies/expo.html",
  consultadoEn: "",
};
const CRUCIAL_SPD: Fuente = {
  titulo: "Qué es el SPD de un módulo de memoria",
  editor: "Crucial",
  url: "https://www.crucial.com/articles/about-memory/what-is-spd",
  consultadoEn: "",
};
const CRUCIAL_DDR4_VS_DDR5: Fuente = {
  titulo: "Diferencia entre DDR4 y DDR5",
  editor: "Crucial",
  url: "https://www.crucial.com/articles/about-memory/difference-between-ddr4-and-ddr5",
  consultadoEn: "",
};
const CRUCIAL_SODIMM: Fuente = {
  titulo: "Memoria para portátil (SO-DIMM) frente a memoria de escritorio (DIMM)",
  editor: "Crucial",
  url: "https://www.crucial.com/articles/about-memory/laptop-vs-desktop-memory",
  consultadoEn: "",
};

/* ---------- Hechos nuevos de la pieza (7) ---------- */
const ramPmicEnDdr5: Hecho = hecho(
  "ram-pmic-en-ddr5",
  "En DDR5 el regulador de voltaje (PMIC) va en cada módulo; en DDR4 la regulación se hace en la placa.",
  [KINGSTON_DDR4_VS_DDR5, JEDEC_PRENSA_DDR5, MICRON_DDR5_MODULO],
  "RM2 del plan 2. El comunicado de JEDEC (abierto) habla de un «voltage regulator on DIMM design» sin usar la sigla PMIC; Kingston y Micron (vistos solo en resultados de búsqueda) hablan de PMIC en el módulo y de gestión de energía «en la placa» en DDR4. Abrir esas páginas y, si se puede, el estándar JESD79-5.",
);
const ramVoltajeNominal: Hecho = hecho(
  "ram-voltaje-nominal",
  "El voltaje nominal de los módulos es de 1,2 V en DDR4 y de 1,1 V en DDR5.",
  [JEDEC_PRENSA_DDR5, JEDEC_DDR5, JEDEC_DDR4],
  "RM4. El comunicado de JEDEC (abierto el 2026-10-14) confirma la baja de 1,2 V a 1,1 V. Los perfiles XMP/EXPO pueden usar voltajes mayores: el texto dice «nominal». Quitar si no aporta a la decisión.",
);
const ramVelocidadMts: Hecho = hecho(
  "ram-velocidad-mt-s",
  "La velocidad de la memoria se anuncia en MT/s (megatransferencias por segundo): DDR5-6000, por ejemplo, equivale a 6000 MT/s. No es lo mismo que los MHz del reloj.",
  [KINGSTON_DDR4_VS_DDR5, CRUCIAL_DDR4_VS_DDR5, JEDEC_DDR5],
  "RM5. Fuentes sin abrir. Verificar la relación entre MT/s y la frecuencia del reloj (en DDR son dos transferencias por ciclo) o dejar solo «se mide en MT/s».",
);
const ramVelocidadJedec: Hecho = conRevision(
  hecho(
    "ram-velocidad-jedec-referencia",
    "Al publicar DDR5, JEDEC lo presentó con una velocidad inicial de 4800 MT/s, frente a 3200 MT/s al final de DDR4.",
    [JEDEC_PRENSA_DDR5],
    "El comunicado (abierto el 2026-10-14) dice 4,8 Gbps para el lanzamiento de DDR5 y 3,2 Gbps como velocidad de fin de vida de DDR4 (por pin; equivale a MT/s). Es un dato de la fecha del comunicado: hoy el estándar y los kits tienen velocidades mayores.",
  ),
  6,
);
const ramPerfilesXmpExpo: Hecho = hecho(
  "ram-perfiles-xmp-expo",
  "XMP (Intel) y EXPO (AMD) son perfiles de velocidad guardados en el módulo que se activan desde la BIOS; sin activarlos, el módulo arranca con la configuración estándar de JEDEC.",
  [INTEL_XMP, AMD_EXPO],
  "RM6. Intel (abierto el 2026-10-14): los módulos XMP «arrancan primero con los valores JEDEC por defecto» y se habilita XMP en la BIOS; la página no da la velocidad. AMD EXPO no se pudo abrir (tiempo agotado).",
);
const ramChipSpd: Hecho = hecho(
  "ram-chip-spd",
  "Cada módulo lleva un chip SPD que guarda los datos del módulo (velocidad, tiempos y perfiles) y que la placa lee al arrancar.",
  [CRUCIAL_SPD, JEDEC_DDR5],
  "Sin abrir (Crucial devolvió «Request Rejected» al consultarla). Contrastar con el estándar de SPD de JEDEC o con una ficha de módulo.",
);
const ramSoDimm: Hecho = hecho(
  "ram-so-dimm-distinto",
  "Los módulos SO-DIMM de portátil son más pequeños que los DIMM de escritorio y tienen otra cantidad de contactos, por lo que no son intercambiables.",
  [CRUCIAL_SODIMM, JEDEC_DDR4],
  "RM7. Sin abrir. Verificar que son más cortos y que la cantidad de contactos es distinta (la cifra exacta no se publica).",
);

/* ---------- Partes (en el orden de MEMORIA_RAM_PARTES) ---------- */
const contactos: ParteContenido = {
  orden: 1,
  nombre: "Contactos del módulo",
  nombreCorto: "Contactos",
  alias: ["pines dorados", "borde de contactos"],
  resumen: "Son las líneas doradas del borde inferior del módulo. Por ahí viaja la información y llega la energía desde la ranura de la placa.",
  queHace:
    "Los contactos hacen la conexión eléctrica entre el módulo y la ranura. Su cantidad es la misma en DDR4 y en DDR5, pero la ranura los distribuye distinto, y por eso una generación no sirve en la ranura de la otra. Tomar el módulo por los bordes y no tocar los contactos ayuda a conservar una buena conexión.",
  alElegir: [
    "Confirma en la ficha de la placa si usa DDR4 o DDR5 antes de comprar la memoria.",
    "Al manipular un módulo, tómalo por los bordes y evita tocar los contactos.",
    "Si el equipo no da imagen después de instalar la memoria, apaga, retira el módulo y vuelve a asentarlo.",
  ],
  hechos: [ramDdr4Ddr5Muesca],
  relacionadas: ["muesca", "ranura"],
};

const muesca: ParteContenido = {
  orden: 2,
  nombre: "Muesca",
  nombreCorto: "Muesca",
  alias: ["llave", "corte del módulo"],
  resumen: "Es el corte del borde de contactos. Su posición cambia entre DDR4 y DDR5, así que el módulo solo entra en la ranura de su generación.",
  queHace:
    "La muesca funciona como un seguro mecánico: coincide con una llave de la ranura y evita instalar un módulo de otra generación o puesto al revés. Que la muesca coincida no garantiza que la placa soporte esa memoria, pero si no coincide, el módulo no debe forzarse.",
  alElegir: [
    "Antes de instalar, compara la muesca del módulo con la llave de la ranura.",
    "Nunca fuerces un módulo que no entra: casi siempre es de otra generación o está al revés.",
  ],
  hechos: [ramDdr4Ddr5Muesca],
  relacionadas: ["contactos", "ranura"],
};

const chipsMemoria: ParteContenido = {
  orden: 3,
  nombre: "Chips de memoria",
  nombreCorto: "Chips",
  alias: ["chips DRAM", "circuitos de memoria"],
  resumen: "Son los chips negros donde se guardan los datos temporales. Muchos módulos los cubren con un disipador o una lámina metálica.",
  queHace:
    "Los chips guardan lo que el procesador está usando en ese momento. Cuántos lleva un módulo y en qué caras van cambia con la capacidad y el diseño. La velocidad y los tiempos que anuncia un módulo dependen de estos chips y de los datos que trae grabados el chip SPD.",
  alElegir: [
    "La capacidad y la velocidad se eligen según el uso y según lo que admitan la placa y el procesador; si dudas sobre cuánta memoria necesitas, revisa nuestras guías.",
    "La velocidad se anuncia en MT/s, no en MHz: compara kits usando la misma unidad.",
    "Un disipador alto puede chocar con el ventilador del disipador del procesador; revisa el espacio antes de comprar.",
  ],
  hechos: [ramVelocidadMts, ramVelocidadJedec],
  enlaces: [{ etiqueta: "Guías de B & W sobre cuánta memoria necesitas", href: "/guias" }],
  relacionadas: ["chip-spd"],
};

const pmic: ParteContenido = {
  orden: 4,
  nombre: "PMIC (regulador de voltaje del módulo)",
  nombreCorto: "PMIC",
  alias: ["regulador de voltaje", "gestión de energía"],
  resumen: "Es un chip pequeño que regula la energía del módulo. En DDR5 viene en cada módulo; en DDR4 esa tarea la hace la placa.",
  queHace:
    "El PMIC recibe energía de la placa y la ajusta al voltaje que necesitan los chips del módulo. En DDR5 esa regulación pasó de la placa al módulo, lo que simplifica la placa y deja que cada módulo regule su propia energía. Por eso no vas a encontrar esta pieza en un módulo DDR4.",
  alElegir: [
    "No hay nada que configurar: el PMIC es parte interna del módulo y no se elige por separado.",
    "Explica en parte por qué un módulo DDR4 y uno DDR5 no son intercambiables, aunque se parezcan.",
  ],
  hechos: [ramPmicEnDdr5, ramVoltajeNominal],
  relacionadas: ["chips-memoria", "chip-spd"],
  vistas: ["ddr5"],
};

const chipSpd: ParteContenido = {
  orden: 5,
  nombre: "Chip SPD (datos del módulo)",
  nombreCorto: "SPD",
  alias: ["Serial Presence Detect", "ficha del módulo"],
  resumen: "Es una memoria diminuta que guarda los datos del módulo: velocidad, tiempos y perfiles. La placa los lee al arrancar para configurarlo.",
  queHace:
    "El SPD es la ficha de identidad del módulo. Al encender el equipo, la placa lo consulta para saber qué velocidad y qué tiempos admite. Los perfiles XMP (Intel) y EXPO (AMD) se guardan allí; si no los activas en la BIOS, el módulo arranca con la configuración estándar de JEDEC, que puede ser distinta a la velocidad anunciada en la caja.",
  alElegir: [
    "Tras instalar la memoria, entra a la BIOS y activa el perfil XMP o EXPO del kit para usar la velocidad anunciada.",
    "Si el equipo no arranca tras activar un perfil, vuelve a la configuración por defecto desde la BIOS.",
    "Elige el kit con el perfil de tu plataforma: XMP para Intel y EXPO para AMD, aunque muchas placas aceptan ambos con ajustes propios.",
  ],
  hechos: [ramChipSpd, ramPerfilesXmpExpo],
  relacionadas: ["chips-memoria"],
};

const opcionesPlataforma: NonNullable<ParteContenido["opciones"]> = {
  titulo: "Plataforma y generación de memoria",
  items: [
    { id: "am4", etiqueta: "AM4", marca: "AMD", resumen: "Plataforma anterior de AMD. Usa memoria DDR4.", vigente: false, hechos: [am4PgaRyzen] },
    { id: "am5", etiqueta: "AM5", marca: "AMD", resumen: "Plataforma actual de AMD. Usa memoria DDR5.", vigente: true, hechos: [am5MemoriaDdr5] },
    {
      id: "lga-1700",
      etiqueta: "LGA 1700",
      marca: "Intel",
      resumen: "Plataforma anterior de Intel. Cada placa admite DDR4 o DDR5, pero no las dos.",
      vigente: false,
      hechos: [lga1700GeneracionesMemoria],
    },
    {
      id: "lga-1851",
      etiqueta: "LGA 1851",
      marca: "Intel",
      resumen: "Plataforma actual de Intel. Sus procesadores usan memoria DDR5.",
      vigente: true,
      hechos: [lga1851ProcesadoresMemoria],
    },
  ],
};

const ranura: ParteContenido = {
  orden: 6,
  nombre: "Ranura de la tarjeta madre",
  nombreCorto: "Ranura",
  alias: ["slot de memoria", "zócalo de memoria"],
  resumen: "Es donde se inserta el módulo. Cada placa admite una sola generación de memoria y, con varios módulos, importa en cuáles ranuras los pones.",
  queHace:
    "La ranura sostiene el módulo y lo conecta con el procesador. Su llave coincide con una sola generación. En las placas con cuatro ranuras, estas se reparten por canal; el manual indica qué ranuras usar para que dos módulos trabajen en doble canal.",
  alElegir: [
    "Elige la memoria según la placa, no al revés.",
    "Con dos módulos, instálalos en las ranuras que indica el manual para usar el doble canal.",
    "No uses memoria de portátil (SO-DIMM) en un equipo de escritorio: es de otro tamaño.",
  ],
  hechos: [ramUnaGeneracionPorPlaca, ramDobleCanal, ramSoDimm],
  opciones: opcionesPlataforma,
  enlaces: [{ etiqueta: "Las ranuras de memoria en la tarjeta madre", pieza: "tarjeta-madre", parte: "ranuras-ram" }],
  relacionadas: ["muesca", "trabas"],
};

const trabas: ParteContenido = {
  orden: 7,
  nombre: "Trabas laterales",
  nombreCorto: "Trabas",
  alias: ["clips de la ranura", "palancas laterales"],
  resumen: "Son las palancas de los extremos de la ranura. Sujetan el módulo y, al cerrarse, confirman que quedó bien asentado.",
  queHace:
    "Las trabas fijan el módulo en su lugar. Al presionarlo hacia abajo, se cierran con un clic; si una queda abierta, el módulo suele estar a medio insertar. Algunas placas traen traba en un solo extremo de la ranura.",
  alElegir: [
    "Presiona con firmeza y de forma pareja hasta que las trabas cierren.",
    "Si una traba no cierra, retira el módulo, revisa la muesca y vuelve a intentar sin forzar.",
    "Con un disipador de procesador grande, confirma que las trabas sigan siendo accesibles.",
  ],
  hechos: [],
  relacionadas: ["ranura", "muesca"],
};

/* ---------- Secciones ---------- */
const seccionElegir: SeccionTexto = {
  id: "elegir",
  titulo: "Qué mirar al elegir memoria RAM",
  parrafos: [
    "Elegir la memoria es más sencillo si lo haces en orden: primero la generación que admite la placa, luego la capacidad y por último la velocidad y los perfiles.",
    "Lo que no se ve en el dibujo: la ficha del módulo y el manual de la placa son los dos documentos que debes comparar antes de comprar. Ahí aparecen la generación, la velocidad que admite la combinación y, a veces, una lista de kits probados por el fabricante.",
  ],
  vinetas: [
    "Generación: DDR4 o DDR5, según lo que admita tu placa; nunca las dos.",
    "Formato: DIMM para escritorio. Los SO-DIMM son de portátil.",
    "Capacidad: depende del uso del equipo; en nuestras guías explicamos cómo calcularla.",
    "Velocidad: compárala siempre en MT/s y confirma qué velocidad admite la combinación de procesador y placa.",
    "Perfil XMP o EXPO: revisa que el kit lo traiga y que tu plataforma lo use.",
    "Cantidad de módulos: un par de módulos iguales permite aprovechar el doble canal si los instalas donde indica el manual.",
    "Espacio: un disipador alto puede chocar con el ventilador del procesador.",
  ],
};

const seccionErrores: SeccionTexto = {
  id: "errores",
  titulo: "Errores comunes con la memoria RAM",
  parrafos: [
    "Casi todos estos tropiezos se evitan mirando la ficha de la placa y la del módulo antes de comprar, y asegurándote de que cada módulo quede asentado.",
    "Los que empiezan con «Nos ha pasado» los hemos visto en el taller; los que empiezan con «Puede pasar» son riesgos conocidos que prevenimos al armar.",
  ],
};

/* ---------- Casos del taller ----------
 * `texto` continúa el rótulo que pone la interfaz, por eso empieza en minúscula. Solo «ddr5-para-placa-ddr4» lo contó el dueño (docs/piezas-errores-taller.md).
 * «memoria-sin-activar-perfil» lo propuso el agente: requiere aprobación del dueño. aprobadoEn/aprobadoPor los fija el dueño. */
const casos: readonly Caso[] = [
  {
    id: "ddr5-para-placa-ddr4",
    tipo: "vivido",
    texto:
      "un cliente que llegó con memoria DDR5 comprada para una placa que solo admitía DDR4. La muesca está en otra posición y el módulo no asienta en la ranura, así que no había forma de usarla. Antes de comprar, mira en la ficha de la placa qué generación de memoria admite.",
    confirmadoPorDueno: true,
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "ram-a-medio-insertar",
    tipo: "puede-pasar",
    texto: "que un módulo quede a medio insertar y el equipo no dé imagen o no arranque. Debe asentar por completo, hasta que las trabas laterales cierren.",
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "memoria-sin-activar-perfil",
    tipo: "puede-pasar",
    texto: "que la memoria trabaje a una velocidad menor que la anunciada porque nadie activó el perfil XMP o EXPO en la BIOS. Se resuelve entrando a la BIOS y seleccionando el perfil del kit.",
    hechos: [ramPerfilesXmpExpo],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "ranuras-equivocadas-doble-canal",
    tipo: "puede-pasar",
    texto: "instalar dos módulos en ranuras distintas a las que indica el manual y quedarte sin el doble canal. Revisa en el manual de la placa cuáles son las ranuras recomendadas.",
    hechos: [ramDobleCanal],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "so-dimm-en-escritorio",
    tipo: "puede-pasar",
    texto: "comprar memoria de portátil (SO-DIMM) para un equipo de escritorio. Es de otro tamaño y no encaja en las ranuras DIMM.",
    hechos: [ramSoDimm],
    aprobadoEn: null,
    aprobadoPor: null,
  },
];

export const MEMORIA_RAM_CONTENIDO: PiezaContenido<MemoriaRamParteId, MemoriaRamVistaId> = {
  slug: "memoria-ram",
  estado: "borrador",
  piezaServicios: "ram",
  nombreCorto: "Memoria RAM",
  titulo: "Memoria RAM DDR4 vs DDR5: partes y diferencias",
  descripcion: "Toca cada parte de un módulo de memoria RAM y mira qué hace. Compara DDR4 y DDR5: muesca, contactos, chips y qué revisar antes de comprar.",
  h1: "La memoria RAM, parte por parte",
  eyebrow: "piezas del PC",
  intro: [
    "La memoria RAM (también llamada memoria de acceso aleatorio) es donde el procesador guarda lo que está usando en este momento: los programas abiertos, los archivos en edición y el propio sistema. No conserva nada al apagar el equipo; para eso está el almacenamiento.",
    "Los módulos de escritorio se parecen mucho, pero DDR4 y DDR5 son generaciones distintas que no se pueden mezclar. Toca cada parte del dibujo, cambia entre generaciones y mira qué hace cada pieza y qué conviene confirmar antes de comprar.",
  ],
  palabrasClave: ["partes de la memoria RAM", "DDR4 vs DDR5", "muesca de la memoria RAM", "cómo elegir memoria RAM", "módulo de memoria"],
  terminos: ["DDR4", "DDR5", "DIMM", "SO-DIMM", "PMIC", "SPD", "XMP", "EXPO", "JEDEC", "AM4", "AM5", "LGA 1700", "LGA 1851"],
  sinonimos: ["memoria de acceso aleatorio"],
  publicadoEn: null,
  actualizadoEn: "2026-10-14",
  bloques: ["partes", "lista", "vistas", "comparar", "elegir", "errores", "preguntas"],
  vistas: [
    {
      id: "ddr4",
      etiqueta: "DDR4",
      resumen: "Un módulo DIMM de DDR4 sin disipador, levantado sobre un tramo de ranura con su muesca alineada con la llave.",
      etiquetaFigura: "Dibujo esquemático de un módulo DIMM de DDR4 sin disipador. La muesca se dibuja más grande para que se note, y su posición es ilustrativa. Los módulos reales cambian en color, disipador y cantidad de chips.",
      notasPorParte: {
        muesca: "En DDR4 la muesca está en una posición distinta a la de DDR5; ese corte es el seguro que evita instalar la generación equivocada.",
        pmic: "En DDR4 el módulo no lleva PMIC: la regulación de voltaje se hace en la placa.",
      },
    },
    {
      id: "ddr5",
      etiqueta: "DDR5",
      resumen: "Un módulo DIMM de DDR5 sin disipador, con su PMIC visible y la muesca alineada con la llave de la ranura.",
      etiquetaFigura: "Dibujo esquemático de un módulo DIMM de DDR5 sin disipador. La muesca se dibuja más grande para que se note, y su posición es ilustrativa. Los módulos reales cambian en color, disipador y cantidad de chips.",
      notasPorParte: {
        muesca: "En DDR5 la muesca queda en otra posición que en DDR4: al cambiar de generación en el dibujo puedes ver cómo se mueve.",
        pmic: "En DDR5 el PMIC está en el módulo y se ve como un chip pequeño aparte de los chips de memoria.",
      },
    },
  ],
  selectorVistas: "Elige la generación",
  partes: {
    contactos,
    muesca,
    "chips-memoria": chipsMemoria,
    pmic,
    "chip-spd": chipSpd,
    ranura,
    trabas,
  },
  secciones: [seccionElegir, seccionErrores],
  casos,
  comparaciones: [
    {
      id: "ddr4-vs-ddr5",
      titulo: "DDR4 y DDR5 según los estándares y las fichas",
      columnas: ["ddr4", "ddr5"],
      filas: [
        { etiqueta: "Contactos y muesca", valores: { ddr4: { tipo: "hecho", hecho: ramDdr4Ddr5Muesca }, ddr5: { tipo: "hecho", hecho: ramDdr4Ddr5Muesca } } },
        { etiqueta: "Dónde se regula el voltaje", valores: { ddr4: { tipo: "hecho", hecho: ramPmicEnDdr5 }, ddr5: { tipo: "hecho", hecho: ramPmicEnDdr5 } } },
        { etiqueta: "Voltaje nominal", valores: { ddr4: { tipo: "hecho", hecho: ramVoltajeNominal }, ddr5: { tipo: "hecho", hecho: ramVoltajeNominal } } },
        { etiqueta: "Velocidad de referencia del estándar", valores: { ddr4: { tipo: "hecho", hecho: ramVelocidadJedec }, ddr5: { tipo: "hecho", hecho: ramVelocidadJedec } } },
        { etiqueta: "Cómo se nombra la velocidad", valores: { ddr4: { tipo: "hecho", hecho: ramVelocidadMts }, ddr5: { tipo: "hecho", hecho: ramVelocidadMts } } },
        { etiqueta: "Plataformas de AMD", valores: { ddr4: { tipo: "hecho", hecho: am4PgaRyzen }, ddr5: { tipo: "hecho", hecho: am5MemoriaDdr5 } } },
        { etiqueta: "Placas LGA 1700 de Intel", valores: { ddr4: { tipo: "hecho", hecho: lga1700GeneracionesMemoria }, ddr5: { tipo: "hecho", hecho: lga1700GeneracionesMemoria } } },
        { etiqueta: "Perfiles XMP y EXPO", valores: { ddr4: { tipo: "hecho", hecho: ramPerfilesXmpExpo }, ddr5: { tipo: "hecho", hecho: ramPerfilesXmpExpo } } },
      ],
    },
  ],
  faq: [
    {
      q: "¿Puedo poner memoria DDR4 en una placa DDR5?",
      a: "No. Cada placa admite una sola generación de memoria y los módulos tienen la muesca en un lugar distinto, así que no encajan. Revisa en la ficha de la placa si usa DDR4 o DDR5.",
    },
    {
      q: "¿Mi memoria trabaja a la velocidad que dice la caja?",
      a: "Solo si activaste el perfil XMP o EXPO del kit en la BIOS. Sin él, el módulo arranca con la configuración estándar de JEDEC. También depende de lo que admitan tu procesador y tu placa.",
    },
    {
      q: "¿Sirve la memoria de un portátil en un PC de escritorio?",
      a: "No. Los módulos de portátil (SO-DIMM) son de otro tamaño que los DIMM de escritorio y no encajan en la misma ranura.",
    },
    {
      q: "¿Cuántos módulos conviene instalar?",
      a: "Depende de la placa y del uso. Para aprovechar el doble canal, instala los módulos por pares en las ranuras que indica el manual. Para saber cuánta capacidad necesitas, revisa nuestras guías.",
    },
    {
      q: "¿Qué hago si el equipo no da imagen después de instalar la memoria?",
      a: "Apaga el equipo, retira los módulos y vuelve a insertarlos hasta que las trabas laterales cierren. Si sigue igual, prueba con un solo módulo en la ranura que indica el manual y confirma que la generación coincida con la placa.",
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
