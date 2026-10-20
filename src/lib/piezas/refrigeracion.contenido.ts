/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contenido de /piezas/refrigeracion (docs/piezas-plan-2.md §3.4). ESTADO: BORRADOR; ningún hecho está verificado.
// Reglas: prosa sin cifras (salvo nombres de estándar en `terminos`); toda cifra vive en un `Hecho` con fuente.
// «A favor» y «A considerar» son `Criterio` (opinión de B & W, sin fuente, aprobación pendiente del dueño), nunca `Hecho` ni «mejor/peor».
// Fuentes: durante la redacción la búsqueda web estaba bloqueada por el límite de uso, así que NINGUNA se abrió (`consultadoEn: ""`);
// son páginas candidatas de fabricantes y quien verifica debe abrirlas y, si hace falta, cambiar la URL por la del manual exacto.
import { pastaTermicaEntreIhsYBase, socketDisipadoresAm4Am5, socketDisipadoresLga1700Lga1851, ventiladorNombresCabezales } from "./comun.hechos.ts";
import { hecho, verificadoPorDueno } from "./constructores.ts";
import type { Caso, Criterio, Hecho, ParteContenido, PiezaContenido, RefrigeracionParteId, RefrigeracionVistaId, SeccionTexto } from "./types.ts";

const aireComponentes: Hecho = verificadoPorDueno(
  hecho(
    "ref-aire-componentes",
    "Un disipador por aire se compone de una superficie de contacto con el procesador (una base metálica o los propios tubos de calor), tubos de calor que llevan el calor hacia arriba, un bloque de aletas metálicas y uno o más ventiladores.",
    [
      { titulo: "Cooler Master Hyper 212 Black: ficha de producto", editor: "Cooler Master", url: "https://www.coolermaster.com/en-global/products/hyper-212-black/", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19)",
  ),
  "2026-10-19",
  "NB",
);
const liquidaComponentes: Hecho = verificadoPorDueno(
  hecho(
    "ref-liquida-componentes",
    "Una refrigeración líquida todo en uno (AIO) se compone de un bloque con bomba que se apoya en el procesador, mangueras que lo conectan con un radiador y ventiladores montados en el radiador.",
    [
      { titulo: "CORSAIR AIOs: Everything you need to know", editor: "Corsair", url: "https://www.corsair.com/us/en/explorer/diy-builder/cpu-coolers/corsair-aios-everything-you-need-to-know/", consultadoEn: "2026-10-15" },
      { titulo: "How to Clean an AIO Liquid CPU Cooler", editor: "Corsair", url: "https://www.corsair.com/kr/zh/explorer/diy-builder/cpu-coolers/how-to-clean-an-aio-liquid-cpu-cooler/", consultadoEn: "2026-10-14" },
      { titulo: "iCUE LINK H150i RGB AIO Liquid CPU Cooler", editor: "Corsair", url: "https://www.corsair.com/us/en/p/cpu-coolers/cw-9061003-ww/icue-link-h150i-rgb-aio-liquid-cpu-cooler-cw-9061003-ww", consultadoEn: "2026-10-14" },
      { titulo: "ARCTIC Liquid Freezer III 360: producto", editor: "ARCTIC", url: "https://www.arctic.de/en/Liquid-Freezer-III-360/ACFRE00136A", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19)",
  ),
  "2026-10-19",
  "NB",
);
const heatpipesTransportan: Hecho = verificadoPorDueno(
  hecho(
    "ref-heatpipes-transportan-calor",
    "Los tubos de calor (heatpipes) conducen el calor desde la base del disipador hasta las aletas.",
    [
      { titulo: "Cooler Master Hyper 212 Black: ficha de producto", editor: "Cooler Master", url: "https://www.coolermaster.com/en-global/products/hyper-212-black/", consultadoEn: "2026-10-14" },
      { titulo: "DeepCool AG400 G2: cuatro tubos de calor, torre sencilla", editor: "DeepCool", url: "https://www.deepcool.com/products/Cooling/cpuaircoolers/AG400-G2-Superior-Performance-4-Heatpipe-Single-Tower-CPU-Cooler/2025/22515.shtml", consultadoEn: "2026-10-19" },
      { titulo: "DeepCool AK620 G2 DIGITAL NYX", editor: "DeepCool", url: "https://www.deepcool.com/products/Cooling/cpuaircoolers/AK620-G2-DIGITAL-NYX-AI-Dynamic-Adjustment-CPU-Cooler-with-Digital-Display/2025/21894.shtml", consultadoEn: "2026-10-19" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): aprobar. aprobado por NB (2026-10-19) con la condición de agregar fuente de fabricante. Fuente de fabricante agregada (2026-10-19): DeepCool AG400 G2 (principal) y AK620 G2: respaldan que los tubos de calor van de la base/contacto con el procesador al conjunto de aletas y transfieren el calor, pero ninguna explica el mecanismo. Siguen sin abrir: Noctua (HTTP 429 repetido, también tras esperar), be quiet! (403 con dos user-agents). Thermalright, Arctic y Cooler Master abrieron pero solo listan los tubos como especificación. Estado se mantiene en parcial (fuente primaria del hecho general, sin mecanismo).",
  ),
  "2026-10-19",
  "NB",
);
const plasticoBase: Hecho = verificadoPorDueno(
  hecho(
    "ref-plastico-base",
    "Muchos disipadores traen la base cubierta con una película o plástico protector que se retira antes de instalarlos.",
    [
      { titulo: "Alphacool ES 1 1U: manual de instalación (paso «retirar el film de protección del refrigerador»)", editor: "Alphacool", url: "https://download.alphacool.com/manual/13528_Alphacool_ES_1_1U_Manual.pdf", consultadoEn: "2026-10-15" },
      { titulo: "How to Install or Remove an AMD CPU Cooler", editor: "AMD", url: "https://www.amd.com/en/resources/support-articles/faqs/CPU-7.html", consultadoEn: "2026-10-14" },
      { titulo: "Esse é o erro mais básico que você pode cometer ao instalar cooler/watercooler; veja qual é", editor: "Hardware.com.br", url: "https://www.hardware.com.br/?p=338614", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const alturaMaximaChasis: Hecho = verificadoPorDueno(
  hecho(
    "ref-altura-maxima-disipador-chasis",
    "Los fabricantes de chasis indican la altura máxima de disipador por aire que admite cada modelo.",
    [
      { titulo: "NZXT H5 Flow: producto y especificaciones", editor: "NZXT", url: "https://nzxt.com/product/h5-flow", consultadoEn: "2026-10-14" },
      { titulo: "Fractal Design Meshify 2 Compact: producto y especificaciones", editor: "Fractal Design", url: "https://www.fractal-design.com/products/cases/meshify/meshify-2-compact/", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const radiadorUbicacion: Hecho = verificadoPorDueno(
  hecho(
    "ref-radiador-ubicacion-chasis",
    "Los fabricantes de chasis indican en qué posiciones (frente, techo o parte trasera) admiten un radiador y de qué tamaño.",
    [
      { titulo: "NZXT H5 Flow: producto y especificaciones", editor: "NZXT", url: "https://nzxt.com/product/h5-flow", consultadoEn: "2026-10-14" },
      { titulo: "Fractal Design Meshify 2 Compact: producto y especificaciones", editor: "Fractal Design", url: "https://www.fractal-design.com/products/cases/meshify/meshify-2-compact/", consultadoEn: "2026-10-14" },
      { titulo: "How to mount your AIO: AIO Cooler Orientation explained", editor: "Corsair", url: "https://www.corsair.com/us/en/explorer/diy-builder/cpu-coolers/how-should-you-mount-your-aio/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const radiadorTamanoPorVentiladores: Hecho = verificadoPorDueno(
  hecho(
    "ref-radiador-tamano-por-ventiladores",
    "Los radiadores de refrigeración líquida se nombran por su largo en milímetros, que depende del tamaño de los ventiladores que admiten: 240 para dos de 120, 280 para dos de 140, 360 para tres de 120 y 420 para tres de 140. El tamaño estándar lo marca el ventilador, no el radiador. Antes de elegir, confirma que el chasis admita ese radiador y ese tamaño de ventilador: un chasis que solo admite ventiladores de 120 no sirve para un radiador de 280.",
    [
      { titulo: "CORSAIR AIOs: Everything you need to know", editor: "Corsair", url: "https://www.corsair.com/us/en/explorer/diy-builder/cpu-coolers/corsair-aios-everything-you-need-to-know/", consultadoEn: "2026-10-15" },
      { titulo: "360mm AIO Liquid CPU Coolers (categoría)", editor: "Corsair", url: "https://www.corsair.com/us/en/c/cpu-coolers/360mm-aio-radiator", consultadoEn: "2026-10-15" },
      { titulo: "240mm AIO Liquid CPU Coolers (categoría)", editor: "Corsair", url: "https://www.corsair.com/uk/en/c/cpu-coolers/240mm-aio-radiator", consultadoEn: "2026-10-15" },
      { titulo: "280mm AIO Liquid CPU Coolers (categoría)", editor: "Corsair", url: "https://www.corsair.com/us/en/c/cpu-coolers/280mm-aio-radiator", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): ajustar. ajustado por NB (2026-10-19): se quitó «120 para uno» (sin fuente) y se agregó que el estándar lo marca el ventilador y que hay que revisar el chasis. El 420 es deducción aritmética (tres de 140); Corsair solo confirma que sus AIO llegan a 420.",
  ),
  "2026-10-19",
  "NB",
);
const ventiladorPwm: Hecho = verificadoPorDueno(
  hecho(
    "ref-ventilador-pwm-cuatro-pines",
    "Los ventiladores de cuatro pines (PWM) permiten que la placa regule su velocidad con una señal; los de tres pines se regulan por voltaje.",
    [
      { titulo: "PWM Control Case Fans", editor: "Corsair", url: "https://www.corsair.com/us/en/c/case-fans/pwm-fans", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const ventiladorFlechas: Hecho = verificadoPorDueno(
  hecho(
    "ref-ventilador-flechas-sentido",
    "El marco de muchos ventiladores de caja trae flechas moldeadas: una indica el sentido del giro y otra el sentido en que sopla el aire.",
    [
      { titulo: "Which direction are case fans blowing?", editor: "Corsair", url: "https://www.corsair.com/de/tw/explorer/diy-builder/fans/which-direction-are-case-fans-blowing/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const flujoChasis: Hecho = verificadoPorDueno(
  hecho(
    "ref-flujo-chasis-entrada-salida",
    "En la configuración habitual de un chasis de torre, el aire fresco entra por el frente (y en algunos modelos por abajo) y el aire caliente sale por la parte trasera y por arriba. El flujo lo define el chasis y cómo se montan los ventiladores: si el chasis no tiene frente cerrado o tiene ventilación por la base o por un lateral, el aire puede entrar por ahí.",
    [
      { titulo: "NZXT H5 Flow: producto y especificaciones", editor: "NZXT", url: "https://nzxt.com/product/h5-flow", consultadoEn: "2026-10-14" },
      { titulo: "Fractal Design Meshify 2 Compact: producto y especificaciones", editor: "Fractal Design", url: "https://www.fractal-design.com/products/cases/meshify/meshify-2-compact/", consultadoEn: "2026-10-14" },
      { titulo: "Which direction are case fans blowing?", editor: "Corsair", url: "https://www.corsair.com/de/tw/explorer/diy-builder/fans/which-direction-are-case-fans-blowing/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19) con el agregado de NB: el flujo depende del chasis (entradas por la base o el lateral). Ese agregado es criterio del taller, sin fuente.",
  ),
  "2026-10-19",
  "NB",
);
const mantenimientoAire: Hecho = verificadoPorDueno(
  hecho(
    "ref-mantenimiento-aire",
    "Los fabricantes de refrigeración recomiendan limpiar el polvo de los ventiladores y de los disipadores o radiadores de forma periódica. Cada cuánto depende del polvo del lugar: si el equipo está cerca de una ventana o el cuarto casi no se ventila, conviene limpiarlo más seguido. Como referencia del taller, en un disipador por aire, cada seis meses.",
    [
      { titulo: "How to clean PC fans", editor: "Corsair", url: "https://www.corsair.com/us/en/explorer/diy-builder/fans/how-to-clean-pc-fans/", consultadoEn: "2026-10-15" },
      { titulo: "Why is my CPU running hot and what can I do about it?", editor: "Corsair", url: "https://www.corsair.com/ca/en/explorer/diy-builder/cpu-coolers/why-is-my-cpu-running-hot-and-what-can-i-do-about-it/", consultadoEn: "2026-10-15" },
      { titulo: "How to Clean an AIO Liquid CPU Cooler", editor: "Corsair", url: "https://www.corsair.com/kr/zh/explorer/diy-builder/cpu-coolers/how-to-clean-an-aio-liquid-cpu-cooler/", consultadoEn: "2026-10-14" },
      { titulo: "DeepCool AK700 DIGITAL NYX", editor: "DeepCool", url: "https://www.deepcool.com/products/Cooling/cpuaircoolers/AK700-DIGITAL-NYX-AI-Dynamic-Adjustment-CPU-Cooler-with-Digital-Display/2025/21815.shtml", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19). «Cada seis meses» y la influencia del lugar son criterio del taller (NB), sin fuente.",
  ),
  "2026-10-19",
  "NB",
);
const mantenimientoLiquida: Hecho = verificadoPorDueno(
  hecho(
    "ref-mantenimiento-liquida",
    "Los fabricantes de refrigeración líquida todo en uno describen el circuito como sellado, sin recarga de líquido por parte del usuario.",
    [
      { titulo: "Do I need to maintain an AIO?", editor: "Corsair", url: "https://www.corsair.com/us/sl/explorer/diy-builder/cpu-coolers/do-i-need-to-maintain-an-aio/", consultadoEn: "2026-10-14" },
      { titulo: "How to Clean an AIO Liquid CPU Cooler", editor: "Corsair", url: "https://www.corsair.com/kr/zh/explorer/diy-builder/cpu-coolers/how-to-clean-an-aio-liquid-cpu-cooler/", consultadoEn: "2026-10-14" },
      { titulo: "CORSAIR AIOs: Everything you need to know", editor: "Corsair", url: "https://www.corsair.com/us/en/explorer/diy-builder/cpu-coolers/corsair-aios-everything-you-need-to-know/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja refrigeracion): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);

/* ---------- Criterios de B & W (opinión de taller; los aprueba el dueño) ---------- */
const criteriosAire = {
  aFavor: [
    {
      id: "aire-menos-piezas",
      texto: "Tiene menos piezas que pueden fallar: no hay bomba ni líquido, y el mantenimiento se reduce a limpiar el polvo.",
      aprobadoEn: "2026-10-19",
      aprobadoPor: "NB",
    },
    {
      id: "aire-torre-como-minimo",
      texto:
        "Con un procesador de gama alta preferimos como mínimo un disipador de torre, aunque sea de un solo ventilador. Si el chasis no lo permite, por ejemplo uno compacto, usamos uno de bajo perfil de buena calidad.",
      aprobadoEn: "2026-10-19",
      aprobadoPor: "NB",
    },
  ],
  aConsiderar: [
    {
      id: "aire-caja-gama-alta",
      texto:
        "El disipador básico que trae el procesador en la caja está pensado para uno de gama baja. Con un procesador de gama alta suele quedarse corto, así que no lo damos por suficiente.",
      aprobadoEn: "2026-10-19",
      aprobadoPor: "NB",
    },
    {
      id: "aire-altura-peso",
      texto: "Revisa que la altura quepa en el chasis y que el peso no sea un problema. Un disipador grande también puede tapar las memorias altas.",
      aprobadoEn: "2026-10-19",
      aprobadoPor: "NB",
    },
  ],
} as const satisfies { aFavor: readonly Criterio[]; aConsiderar: readonly Criterio[] };

const criteriosLiquida = {
  aFavor: [
    {
      id: "liquida-calor-al-radiador",
      texto: "Lleva el calor hasta un radiador montado en el chasis y deja libre el espacio alrededor del socket, algo útil cuando hay memorias altas.",
      aprobadoEn: "2026-10-19",
      aprobadoPor: "NB",
    },
  ],
  aConsiderar: [
    {
      id: "liquida-bomba-es-otra-pieza",
      texto: "La bomba es una pieza más que puede fallar, y un fallo se nota rápido en la temperatura del procesador.",
      aprobadoEn: "2026-10-19",
      aprobadoPor: "NB",
    },
    {
      id: "liquida-ubicacion-instalacion",
      texto: "Hay que decidir dónde va el radiador y comprobar que el chasis lo admita. La instalación suele tardar más que la de un disipador por aire.",
      aprobadoEn: "2026-10-19",
      aprobadoPor: "NB",
    },
  ],
} as const satisfies { aFavor: readonly Criterio[]; aConsiderar: readonly Criterio[] };

/* ---------- Partes (orden de REFRIGERACION_PARTES) ---------- */
const base: ParteContenido = {
  orden: 1,
  nombre: "Base de contacto",
  nombreCorto: "Base",
  alias: ["placa de contacto"],
  resumen: "La superficie que se apoya sobre el procesador: en un disipador por aire, una base metálica o los propios tubos de calor; en uno líquido, la placa del bloque.",
  queHace:
    "Recibe el calor de la tapa metálica del procesador y lo pasa al resto del sistema. Para que lo haga bien necesita hacer contacto parejo con el procesador, con una capa fina de pasta térmica en medio.",
  alElegir: [
    "Antes de instalarlo, quita el plástico o la película protectora de la base, si la trae.",
    "No toques la base con los dedos ni la apoyes sobre una superficie sucia.",
    "Confirma que el soporte incluido sirve para el socket de tu procesador.",
  ],
  hechos: [plasticoBase, pastaTermicaEntreIhsYBase, socketDisipadoresAm4Am5, socketDisipadoresLga1700Lga1851],
  relacionadas: ["heatpipes", "bloque-bomba"],
  enlaces: [
    { etiqueta: "Tapa metálica del procesador", pieza: "procesador", parte: "ihs" },
    { etiqueta: "Socket en la tarjeta madre", pieza: "tarjeta-madre", parte: "socket" },
  ],
  vistas: ["aire", "liquida"],
};

const heatpipes: ParteContenido = {
  orden: 2,
  nombre: "Tubos de calor (heatpipes)",
  nombreCorto: "Heatpipes",
  alias: ["tubos de cobre", "heat pipes"],
  resumen: "Tubos metálicos que parten del contacto con el procesador y suben por el bloque de aletas. Llevan el calor hasta las aletas.",
  queHace:
    "Son el camino del calor dentro de un disipador por aire: lo toman en el contacto con el procesador y lo reparten por las aletas, donde el aire lo retira. Se doblan con facilidad, así que se tratan con cuidado.",
  alElegir: ["No los dobles ni apoyes el disipador sobre ellos.", "Si el disipador es muy alto, revisa que el chasis y las memorias dejen espacio."],
  hechos: [heatpipesTransportan, aireComponentes],
  relacionadas: ["base", "aletas"],
  vistas: ["aire"],
};

const aletas: ParteContenido = {
  orden: 3,
  nombre: "Aletas del disipador",
  nombreCorto: "Aletas",
  resumen: "Láminas metálicas delgadas que reciben el calor de los tubos. Entre ellas pasa el aire del ventilador y se lleva el calor.",
  queHace:
    "Aumentan la superficie por donde el aire puede retirar el calor. El polvo se acumula entre ellas con el tiempo y estorba el paso del aire, por eso conviene limpiarlas de vez en cuando, y más seguido si el lugar tiene mucho polvo.",
  alElegir: [
    "Revisa que el bloque de aletas no choque con las memorias ni con los disipadores de la placa.",
    "Limpia el polvo con aire o con una brocha suave, sin doblar las aletas.",
  ],
  hechos: [mantenimientoAire],
  relacionadas: ["heatpipes", "ventilador"],
  vistas: ["aire"],
};

const ventilador: ParteContenido = {
  orden: 4,
  nombre: "Ventilador",
  nombreCorto: "Ventilador",
  resumen: "Mueve el aire a través de las aletas del disipador o del radiador. Su cable va a un cabezal de la placa, que regula su velocidad.",
  queHace:
    "Empuja o jala aire a través de las aletas para retirar el calor. Se conecta a un cabezal de ventilador de la placa y, si es de cuatro pines, la placa puede ajustar su velocidad. Fíjate en las flechas del marco: indican hacia dónde sopla.",
  alElegir: [
    "Conecta el ventilador del disipador al cabezal de ventilador del procesador (CPU_FAN).",
    "Verifica el sentido del aire con las flechas del marco antes de montarlo.",
    "En un radiador, el sentido del aire depende de dónde lo ubiques en el chasis.",
  ],
  hechos: [ventiladorPwm, ventiladorFlechas, ventiladorNombresCabezales, flujoChasis],
  relacionadas: ["aletas", "radiador"],
  enlaces: [{ etiqueta: "Cabezales de ventilador en la tarjeta madre", pieza: "tarjeta-madre", parte: "cabezales-ventilador" }],
  vistas: ["aire", "liquida"],
};

const bloqueBomba: ParteContenido = {
  orden: 5,
  nombre: "Bloque con bomba",
  nombreCorto: "Bomba",
  alias: ["cabezal de la bomba", "water block"],
  resumen: "La pieza que se apoya sobre el procesador. Incluye la placa de contacto y la bomba que hace circular el líquido.",
  queHace:
    "Recoge el calor del procesador y, con la bomba, empuja el líquido por las mangueras hacia el radiador y lo trae de vuelta. Su cable de alimentación va a un cabezal de la placa pensado para bombas.",
  alElegir: [
    "Conecta la bomba al cabezal de bomba de la placa (AIO_PUMP o similar) y no a uno cualquiera de ventilador.",
    "Revisa que el soporte incluido sirva para tu socket.",
    "Instálala con el radiador más alto que la bomba, según indique el manual.",
  ],
  hechos: [liquidaComponentes, ventiladorNombresCabezales],
  relacionadas: ["base", "mangueras"],
  enlaces: [{ etiqueta: "Cabezales de la tarjeta madre", pieza: "tarjeta-madre", parte: "cabezales-ventilador" }],
  vistas: ["liquida"],
};

const mangueras: ParteContenido = {
  orden: 6,
  nombre: "Mangueras",
  nombreCorto: "Mangueras",
  resumen: "Los tubos flexibles que unen el bloque con el radiador. Por ellos circula el líquido en un circuito sellado.",
  queHace:
    "Llevan el líquido caliente desde el bloque hasta el radiador y lo devuelven frío. Vienen selladas de fábrica: no se abren ni se desconectan. Su largo condiciona dónde puede quedar el radiador.",
  alElegir: [
    "Revisa que el largo de las mangueras alcance hasta la posición del radiador en tu chasis.",
    "Evita dobleces fuertes; no las tuerzas al montar el radiador.",
  ],
  hechos: [mantenimientoLiquida],
  relacionadas: ["bloque-bomba", "radiador"],
  vistas: ["liquida"],
};

const radiador: ParteContenido = {
  orden: 7,
  nombre: "Radiador",
  nombreCorto: "Radiador",
  resumen: "Un panel de aletas por donde pasa el líquido caliente. Los ventiladores que lo atraviesan retiran el calor hacia el aire.",
  queHace:
    "Es el equivalente a las aletas del disipador por aire, pero separado del procesador y montado en el chasis. Su tamaño se nombra según los ventiladores que admite, y el chasis debe tener un lugar para él y admitir ese tamaño de ventilador.",
  alElegir: [
    "Confirma en la ficha del chasis en qué posiciones admite un radiador y de qué tamaño.",
    "Decide el sentido del aire de sus ventiladores junto con el flujo de aire del chasis.",
  ],
  hechos: [radiadorTamanoPorVentiladores, radiadorUbicacion],
  relacionadas: ["mangueras", "ventilador"],
  vistas: ["liquida"],
};

/* ---------- Secciones ---------- */
const seccionElegir: SeccionTexto = {
  id: "elegir",
  titulo: "Qué mirar al elegir la refrigeración",
  parrafos: [
    "Antes de decidir entre aire y líquida, revisa tres cosas del equipo: qué procesador tiene, qué admite el chasis y qué soporte necesita el socket. Con eso la lista de opciones se reduce mucho.",
    "Después compara lo que cada fabricante declara en la ficha: la altura del disipador frente al espacio del chasis, o el tamaño del radiador frente a las posiciones que admite. Evita decidir solo por la fama de un tipo de refrigeración.",
  ],
  vinetas: [
    "Chasis: el espacio para el disipador o las posiciones para el radiador.",
    "Socket: el soporte incluido debe servir para el socket de tu procesador.",
    "Procesador: el disipador debe estar diseñado para la potencia del procesador, no solo ser compatible con el socket.",
    "Memorias y ventiladores del chasis: un disipador grande puede estorbar a las memorias altas.",
  ],
  hechos: [alturaMaximaChasis, radiadorUbicacion, socketDisipadoresAm4Am5, socketDisipadoresLga1700Lga1851],
};

const seccionErrores: SeccionTexto = {
  id: "errores",
  titulo: "Errores comunes con la refrigeración",
  parrafos: ["Estos son los tropiezos más frecuentes al instalar la refrigeración. Los marcados como vividos nos pasaron en el taller; los demás son riesgos conocidos."],
};

/* ---------- Casos del taller (docs/piezas-errores-taller.md) ---------- */
const casos: readonly Caso[] = [
  {
    id: "disipador-de-caja-con-procesador-exigente",
    tipo: "vivido",
    texto:
      "equipos con un procesador de gama alta armados con el disipador básico que viene en la caja, que solo alcanza para uno de gama baja. La temperatura sube y el equipo se calienta más de lo debido.",
    confirmadoPorDueno: true,
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "ventiladores-todos-entrando",
    tipo: "vivido",
    texto:
      "equipos que llegan con casi todos los ventiladores empujando aire hacia adentro y apenas uno sacándolo. El aire no circula bien por el chasis. Revisa el sentido de cada ventilador: unos deben meter el aire y otros sacarlo.",
    confirmadoPorDueno: true,
    hechos: [flujoChasis, ventiladorFlechas],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "plastico-base-disipador",
    tipo: "puede-pasar",
    texto:
      "olvidar quitar el plástico protector de la base del disipador, sea de aire o líquido: el procesador se calienta porque la base no hace contacto con su tapa metálica.",
    hechos: [plasticoBase],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "pasta-termica-mal-aplicada",
    tipo: "puede-pasar",
    texto: "aplicar la pasta térmica de forma irregular, en exceso o en muy poca cantidad, y que el disipador no transmita bien el calor del procesador.",
    hechos: [pastaTermicaEntreIhsYBase],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "disipador-no-cabe-en-el-chasis",
    tipo: "puede-pasar",
    texto: "comprar un disipador por aire más alto de lo que admite el chasis y descubrirlo cuando el panel lateral no cierra.",
    hechos: [alturaMaximaChasis],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "bomba-en-cabezal-de-ventilador",
    tipo: "puede-pasar",
    texto:
      "conectar la bomba de la refrigeración líquida a un cabezal de ventilador cualquiera, de modo que la placa la regule como si fuera un ventilador. Usa el cabezal de bomba que indica el manual de la placa.",
    hechos: [ventiladorNombresCabezales],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
];

export const REFRIGERACION_CONTENIDO: PiezaContenido<RefrigeracionParteId, RefrigeracionVistaId> = {
  slug: "refrigeracion",
  estado: "borrador",
  piezaServicios: "refrigeracion",
  nombreCorto: "Refrigeración",
  titulo: "Disipador por aire o refrigeración líquida: diferencias",
  descripcion: "Toca cada parte de un disipador por aire y de una refrigeración líquida, y mira qué hace cada una. Qué revisar en el chasis antes de elegir uno.",
  h1: "La refrigeración del procesador, parte por parte",
  eyebrow: "piezas del PC",
  intro: [
    "La refrigeración del procesador es la pieza que se lleva el calor que genera el procesador al trabajar. Hay dos familias: el disipador por aire, con aletas y ventilador, y la refrigeración líquida todo en uno (AIO), con bloque, bomba, mangueras y radiador.",
    "Toca cada parte del dibujo para ver qué hace y qué mirar al elegirla. Cambia entre las dos vistas para comparar cómo está armada cada una, y revisa siempre el chasis antes de decidir: de él depende qué cabe.",
  ],
  palabrasClave: [
    "partes de un disipador por aire",
    "partes de una refrigeración líquida",
    "diferencia entre disipador por aire y refrigeración líquida",
    "qué es una AIO",
    "cómo elegir refrigeración para el procesador",
    "heatpipes",
    "radiador de refrigeración líquida",
    "pasta térmica",
  ],
  terminos: ["AIO", "PWM", "CPU_FAN", "AIO_PUMP", "AM4", "AM5", "LGA 1700", "LGA 1851"],
  sinonimos: [],
  publicadoEn: null,
  actualizadoEn: "2026-10-14",
  bloques: ["partes", "lista", "vistas", "comparar", "elegir", "errores"],
  vistas: [
    {
      id: "aire",
      etiqueta: "Por aire",
      resumen:
        "Un disipador por aire de torre: la superficie de contacto (una base metálica o los propios tubos de calor) se apoya en el procesador, los tubos de calor suben hasta un bloque de aletas y un ventilador mueve el aire entre ellas.",
      etiquetaFigura: "Dibujo esquemático de un disipador por aire de torre. Las proporciones y la forma cambian según el modelo.",
      notasPorParte: {
        "bloque-bomba": "El disipador por aire no lleva bomba: el calor sube por los tubos de calor hasta las aletas.",
        mangueras: "El disipador por aire no lleva mangueras ni líquido.",
        radiador: "En el disipador por aire, las aletas cumplen el papel del radiador.",
      },
      aFavor: criteriosAire.aFavor,
      aConsiderar: criteriosAire.aConsiderar,
    },
    {
      id: "liquida",
      etiqueta: "Líquida",
      resumen:
        "Una refrigeración líquida todo en uno: un bloque con bomba sobre el procesador, mangueras que lo conectan con un radiador y ventiladores montados en el radiador dentro del chasis.",
      etiquetaFigura: "Dibujo esquemático de una refrigeración líquida todo en uno. El tamaño del radiador y la forma del bloque cambian según el modelo.",
      notasPorParte: {
        heatpipes: "La refrigeración líquida no usa tubos de calor: el líquido lleva el calor hasta el radiador.",
        aletas: "Las aletas de la refrigeración líquida están en el radiador, no sobre el procesador.",
      },
      aFavor: criteriosLiquida.aFavor,
      aConsiderar: criteriosLiquida.aConsiderar,
    },
  ],
  selectorVistas: "Elige el tipo de refrigeración",
  partes: {
    base,
    heatpipes,
    aletas,
    ventilador,
    "bloque-bomba": bloqueBomba,
    mangueras,
    radiador,
  },
  secciones: [seccionElegir, seccionErrores],
  casos,
  comparaciones: [
    {
      id: "aire-vs-liquida",
      titulo: "Disipador por aire y refrigeración líquida, lado a lado",
      columnas: ["aire", "liquida"],
      filas: [
        {
          etiqueta: "De qué se compone",
          valores: { aire: { tipo: "hecho", hecho: aireComponentes }, liquida: { tipo: "hecho", hecho: liquidaComponentes } },
        },
        {
          etiqueta: "Qué dice el chasis",
          valores: { aire: { tipo: "hecho", hecho: alturaMaximaChasis }, liquida: { tipo: "hecho", hecho: radiadorUbicacion } },
        },
        {
          etiqueta: "Cómo se nombra el tamaño",
          valores: {
            aire: { tipo: "texto", texto: "Por la altura del disipador, que se compara con la que admite el chasis." },
            liquida: { tipo: "hecho", hecho: radiadorTamanoPorVentiladores },
          },
        },
        {
          etiqueta: "Dónde se conecta a la placa",
          valores: { aire: { tipo: "hecho", hecho: ventiladorNombresCabezales }, liquida: { tipo: "hecho", hecho: ventiladorNombresCabezales } },
        },
        {
          etiqueta: "Pasta térmica",
          valores: { aire: { tipo: "hecho", hecho: pastaTermicaEntreIhsYBase }, liquida: { tipo: "hecho", hecho: pastaTermicaEntreIhsYBase } },
        },
        {
          etiqueta: "Mantenimiento que declaran los fabricantes",
          valores: { aire: { tipo: "hecho", hecho: mantenimientoAire }, liquida: { tipo: "hecho", hecho: mantenimientoLiquida } },
        },
      ],
    },
  ],
  // TODO(dueño): aprobar la frase del CTA; mientras tanto va la versión prudente.
  cta: {
    titulo: "Cotiza tu PC",
    texto: "Si prefieres no revisar compatibilidades por tu cuenta, en el cotizador eliges la gama de cada pieza y te ayudamos a elegir una combinación compatible.",
    etiqueta: "Cotiza tu PC",
    href: "/cotizador",
  },
};
