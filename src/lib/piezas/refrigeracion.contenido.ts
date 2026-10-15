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
import { hecho } from "./constructores.ts";
import { AMD_INSTALAR_DISIPADOR, PWM_FAN_SPEC } from "./fuentes.ts";
import type { Caso, Criterio, Fuente, Hecho, ParteContenido, PiezaContenido, RefrigeracionParteId, RefrigeracionVistaId, SeccionTexto } from "./types.ts";

/* ---------- Fuentes candidatas (sin abrir) ---------- */
const NOCTUA_NH_U12S: Fuente = { titulo: "Noctua NH-U12S: producto, especificaciones y manual", editor: "Noctua", url: "https://noctua.at/en/nh-u12s", consultadoEn: "" };
const NOCTUA_NF_A12X25: Fuente = { titulo: "Noctua NF-A12x25 PWM: producto y especificaciones", editor: "Noctua", url: "https://noctua.at/en/nf-a12x25-pwm", consultadoEn: "" };
const COOLER_MASTER_HYPER_212: Fuente = {
  titulo: "Cooler Master Hyper 212: producto y especificaciones",
  editor: "Cooler Master",
  url: "https://www.coolermaster.com/en-global/products/hyper-212-black/",
  consultadoEn: "",
};
const ARCTIC_LIQUID_FREEZER_III: Fuente = {
  titulo: "ARCTIC Liquid Freezer III 360: producto y especificaciones",
  editor: "ARCTIC",
  url: "https://www.arctic.ac/en/Liquid-Freezer-III-360/ACFRE00136A",
  consultadoEn: "",
};
const CORSAIR_LIQUIDOS: Fuente = {
  titulo: "Refrigeración líquida para CPU (AIO)",
  editor: "Corsair",
  url: "https://www.corsair.com/us/en/c/cpu-coolers/liquid-coolers",
  consultadoEn: "",
};
const NZXT_H5_FLOW: Fuente = { titulo: "NZXT H5 Flow: producto y especificaciones", editor: "NZXT", url: "https://nzxt.com/product/h5-flow", consultadoEn: "" };
const FRACTAL_MESHIFY_2_COMPACT: Fuente = {
  titulo: "Fractal Design Meshify 2 Compact: producto y especificaciones",
  editor: "Fractal Design",
  url: "https://www.fractal-design.com/products/cases/meshify/meshify-2-compact/",
  consultadoEn: "",
};

/* ---------- Hechos nuevos de la pieza (todos sin verificar; prefijo «ref-») ---------- */
const aireComponentes: Hecho = hecho(
  "ref-aire-componentes",
  "Un disipador por aire se compone de una base que toca el procesador, tubos de calor que llevan el calor hacia arriba, un bloque de aletas metálicas y uno o más ventiladores.",
  [NOCTUA_NH_U12S, COOLER_MASTER_HYPER_212],
  "Descripción habitual en las páginas de producto de ambos fabricantes. Falta abrirlas y confirmar que nombran las cuatro partes.",
);
const liquidaComponentes: Hecho = hecho(
  "ref-liquida-componentes",
  "Una refrigeración líquida todo en uno (AIO) se compone de un bloque con bomba que se apoya en el procesador, dos mangueras, un radiador y ventiladores que atraviesan el radiador.",
  [CORSAIR_LIQUIDOS, ARCTIC_LIQUID_FREEZER_III],
  "Descripción habitual en las páginas de producto de AIO. Falta abrirlas y confirmar el conteo de mangueras.",
);
const heatpipesTransportan: Hecho = hecho(
  "ref-heatpipes-transportan-calor",
  "Los tubos de calor (heatpipes) conducen el calor desde la base del disipador hasta las aletas.",
  [NOCTUA_NH_U12S],
  "Falta confirmar la redacción exacta en la página de Noctua o en una nota técnica del fabricante.",
);
const plasticoBase: Hecho = hecho(
  "ref-plastico-base",
  "Muchos disipadores traen la base cubierta con una película o plástico protector que se retira antes de instalarlos.",
  [NOCTUA_NH_U12S, AMD_INSTALAR_DISIPADOR],
  "RF1 del plan 2. Afirmación de memoria del dueño para el caso del taller. Falta ubicar la instrucción en un manual concreto (Noctua o Cooler Master) o en la guía de AMD.",
);
const alturaMaximaChasis: Hecho = hecho(
  "ref-altura-maxima-disipador-chasis",
  "Los fabricantes de chasis indican la altura máxima de disipador por aire que admite cada modelo.",
  [NZXT_H5_FLOW, FRACTAL_MESHIFY_2_COMPACT],
  "RF2. Falta abrir las fichas y confirmar el nombre del dato (por ejemplo «CPU cooler height»).",
);
const radiadorUbicacion: Hecho = hecho(
  "ref-radiador-ubicacion-chasis",
  "Los fabricantes de chasis indican en qué posiciones (frente, techo o parte trasera) admiten un radiador y de qué tamaño.",
  [NZXT_H5_FLOW, FRACTAL_MESHIFY_2_COMPACT],
  "Falta abrir las fichas y confirmar la lista de posiciones por modelo.",
);
const radiadorTamanoPorVentiladores: Hecho = hecho(
  "ref-radiador-tamano-por-ventiladores",
  "Los radiadores de refrigeración líquida se nombran por su largo en milímetros, que corresponde a los ventiladores que admiten: 120 para uno, 240 para dos de 120, 280 para dos de 140 y 360 para tres de 120.",
  [ARCTIC_LIQUID_FREEZER_III, CORSAIR_LIQUIDOS],
  "RF3. Falta confirmar el 280 (dos de 140) en una ficha de fabricante.",
);
const ventiladorPwm: Hecho = hecho(
  "ref-ventilador-pwm-cuatro-pines",
  "Los ventiladores de cuatro pines (PWM) permiten que la placa regule su velocidad con una señal; los de tres pines se regulan por voltaje.",
  [PWM_FAN_SPEC, NOCTUA_NF_A12X25],
  "El white paper de Noctua cita la especificación de Intel para ventiladores PWM de cuatro hilos; falta confirmar la frase sobre los de tres pines.",
);
const ventiladorFlechas: Hecho = hecho(
  "ref-ventilador-flechas-sentido",
  "El marco de muchos ventiladores de caja trae flechas moldeadas: una indica el sentido del giro y otra el sentido en que sopla el aire.",
  [NOCTUA_NF_A12X25],
  "Falta confirmarlo en el manual de un ventilador concreto. Si no se encuentra, quitar el hecho y dejar la idea solo como criterio.",
);
const flujoChasis: Hecho = hecho(
  "ref-flujo-chasis-entrada-salida",
  "En la mayoría de chasis de torre el aire fresco entra por el frente y el aire caliente sale por la parte trasera y por arriba; los fabricantes de chasis lo indican en sus fichas.",
  [NZXT_H5_FLOW, FRACTAL_MESHIFY_2_COMPACT],
  "Caso del taller de flujo de aire (todos los ventiladores entrando). Falta abrir las fichas y citar la frase del fabricante sobre el flujo recomendado.",
);
const mantenimientoAire: Hecho = hecho(
  "ref-mantenimiento-aire",
  "Los fabricantes de disipadores por aire recomiendan limpiar el polvo de las aletas y del ventilador de forma periódica.",
  [NOCTUA_NH_U12S],
  "Afirmación de memoria. Falta ubicar la recomendación en el manual o en las preguntas frecuentes de un fabricante.",
);
const mantenimientoLiquida: Hecho = hecho(
  "ref-mantenimiento-liquida",
  "Los fabricantes de refrigeración líquida todo en uno describen el circuito como sellado, sin recarga de líquido por parte del usuario.",
  [CORSAIR_LIQUIDOS, ARCTIC_LIQUID_FREEZER_III],
  "Afirmación de memoria. Falta abrir las fichas y citar la frase; si algún fabricante dice otra cosa, ajustar el texto.",
);

/* ---------- Criterios de B & W (opinión de taller; los aprueba el dueño) ---------- */
const criteriosAire = {
  aFavor: [
    {
      id: "aire-menos-piezas",
      texto: "Tiene menos piezas que pueden fallar: no hay bomba ni líquido, y el mantenimiento se reduce a limpiar el polvo.",
      aprobadoEn: null,
      aprobadoPor: null,
    },
    {
      id: "aire-torre-como-minimo",
      texto:
        "Con un procesador de gama alta preferimos como mínimo un disipador de torre, aunque sea de un solo ventilador. Si el chasis no lo permite, por ejemplo uno compacto, usamos uno de bajo perfil de buena calidad.",
      aprobadoEn: null,
      aprobadoPor: null,
    },
  ],
  aConsiderar: [
    {
      id: "aire-caja-gama-alta",
      texto:
        "El disipador básico que trae el procesador en la caja está pensado para uno de gama baja. Con un procesador de gama alta suele quedarse corto, así que no lo damos por suficiente.",
      aprobadoEn: null,
      aprobadoPor: null,
    },
    {
      id: "aire-altura-peso",
      texto: "Revisa que la altura quepa en el chasis y que el peso no sea un problema. Un disipador grande también puede tapar las memorias altas.",
      aprobadoEn: null,
      aprobadoPor: null,
    },
  ],
} as const satisfies { aFavor: readonly Criterio[]; aConsiderar: readonly Criterio[] };

const criteriosLiquida = {
  aFavor: [
    {
      id: "liquida-calor-al-radiador",
      texto: "Lleva el calor hasta un radiador montado en el chasis y deja libre el espacio alrededor del socket, algo útil cuando hay memorias altas.",
      aprobadoEn: null,
      aprobadoPor: null,
    },
  ],
  aConsiderar: [
    {
      id: "liquida-bomba-es-otra-pieza",
      texto: "La bomba es una pieza más que puede fallar, y un fallo se nota rápido en la temperatura del procesador.",
      aprobadoEn: null,
      aprobadoPor: null,
    },
    {
      id: "liquida-ubicacion-instalacion",
      texto: "Hay que decidir dónde va el radiador y comprobar que el chasis lo admita. La instalación suele tardar más que la de un disipador por aire.",
      aprobadoEn: null,
      aprobadoPor: null,
    },
  ],
} as const satisfies { aFavor: readonly Criterio[]; aConsiderar: readonly Criterio[] };

/* ---------- Partes (orden de REFRIGERACION_PARTES) ---------- */
const base: ParteContenido = {
  orden: 1,
  nombre: "Base de contacto",
  nombreCorto: "Base",
  alias: ["placa de contacto"],
  resumen: "La cara metálica que se apoya sobre el procesador. En un disipador por aire sostiene los tubos de calor; en uno líquido es la placa del bloque.",
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
  resumen: "Tubos metálicos que salen de la base y suben por el bloque de aletas. Llevan el calor desde el procesador hasta las aletas.",
  queHace:
    "Son el camino del calor dentro de un disipador por aire: lo toman en la base y lo reparten por las aletas, donde el aire lo retira. Se doblan con facilidad, así que se tratan con cuidado.",
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
    "Aumentan la superficie por donde el aire puede retirar el calor. El polvo se acumula entre ellas con el tiempo y estorba el paso del aire, por eso conviene limpiarlas de vez en cuando.",
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
    "Recoge el calor del procesador y, con la bomba, empuja el líquido por una manguera hacia el radiador y lo trae de vuelta por la otra. Su cable de alimentación va a un cabezal de la placa pensado para bombas.",
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
  resumen: "Dos tubos flexibles que unen el bloque con el radiador. Por ellos circula el líquido en un circuito sellado.",
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
    "Es el equivalente a las aletas del disipador por aire, pero separado del procesador y montado en el chasis. Su tamaño se nombra según los ventiladores que admite, y el chasis debe tener un lugar para él.",
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
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "ventiladores-todos-entrando",
    tipo: "vivido",
    texto:
      "equipos que llegan con casi todos los ventiladores empujando aire hacia adentro y apenas uno sacándolo. El aire no circula bien por el chasis. Revisa el sentido de cada ventilador: unos deben meter el aire y otros sacarlo.",
    confirmadoPorDueno: true,
    hechos: [flujoChasis, ventiladorFlechas],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "plastico-base-disipador",
    tipo: "puede-pasar",
    texto:
      "olvidar quitar el plástico protector de la base del disipador, sea de aire o líquido: el procesador se calienta porque la base no hace contacto con su tapa metálica.",
    hechos: [plasticoBase],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "pasta-termica-mal-aplicada",
    tipo: "puede-pasar",
    texto: "aplicar la pasta térmica de forma irregular, en exceso o en muy poca cantidad, y que el disipador no transmita bien el calor del procesador.",
    hechos: [pastaTermicaEntreIhsYBase],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "disipador-no-cabe-en-el-chasis",
    tipo: "puede-pasar",
    texto: "comprar un disipador por aire más alto de lo que admite el chasis y descubrirlo cuando el panel lateral no cierra.",
    hechos: [alturaMaximaChasis],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "bomba-en-cabezal-de-ventilador",
    tipo: "puede-pasar",
    texto:
      "conectar la bomba de la refrigeración líquida a un cabezal de ventilador cualquiera, de modo que la placa la regule como si fuera un ventilador. Usa el cabezal de bomba que indica el manual de la placa.",
    hechos: [ventiladorNombresCabezales],
    aprobadoEn: null,
    aprobadoPor: null,
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
        "Un disipador por aire de torre: la base se apoya en el procesador, los tubos de calor suben hasta un bloque de aletas y un ventilador mueve el aire entre ellas.",
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
        "Una refrigeración líquida todo en uno: un bloque con bomba sobre el procesador, dos mangueras y un radiador con ventiladores montado en el chasis.",
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
