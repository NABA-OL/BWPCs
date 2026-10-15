/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contenido de /piezas/procesador (docs/piezas-plan-2.md §3.1). ESTADO: BORRADOR; ningún hecho está verificado.
// Reglas: prosa sin cifras (salvo nombres de estándar y de producto en `terminos`); toda cifra vive en un `Hecho` con fuente.
// Lo que el dueño dijo de memoria (cambio de nombres de Intel, sufijos de AMD) va marcado en la `nota` del hecho. El dibujo (`geo`) llega después:
// el decodificador de nombres se puede publicar sin dibujo si la pieza declara `sinDibujo: true`.
import {
  am4PgaRyzen,
  am5Lga,
  am5MemoriaDdr5,
  lga1700GeneracionesMemoria,
  lga1851ProcesadoresMemoria,
  pastaTermicaEntreIhsYBase,
  socketDisipadoresAm4Am5,
  socketDisipadoresLga1700Lga1851,
  socketMarcaPinUno,
  videoRequiereGraficosIntegrados,
} from "./comun.hechos.ts";
import { conRevision, hecho } from "./constructores.ts";
import { INTEL_ARK, INTEL_CORE_ULTRA, V_AMD_5600X, V_AMD_7700X, V_AMD_CPU_100, V_INTEL_BOXED_ULTRA_S2, V_INTEL_LGA1700, AMD_INSTALAR_DISIPADOR, AMD_DISIPADORES } from "./fuentes.ts";
import { PROCESADOR_DECODIFICADOR } from "./procesador.datos.ts";
import type { Caso, Criterio, Fuente, Hecho, ParteContenido, PiezaContenido, ProcesadorParteId, ProcesadorVistaId, SeccionTexto } from "./types.ts";

/* ---------- Fuentes candidatas ----------
 * Solo la página de nombres de Intel se abrió (2026-10-14). Las de AMD agotaron el tiempo de espera ese día: quien verifica debe abrirlas. */
const INTEL_NOMBRES: Fuente = {
  titulo: "Intel Processor Names and Numbers",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/processors/processor-numbers.html",
  consultadoEn: "2026-10-14",
};
const INTEL_CORE: Fuente = {
  titulo: "Procesadores Intel Core",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/products/details/processors/core.html",
  consultadoEn: "",
};
const AMD_RYZEN_ESCRITORIO: Fuente = {
  titulo: "Procesadores AMD Ryzen para escritorio",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/desktops/ryzen.html",
  consultadoEn: "",
};
const AMD_7800X3D: Fuente = {
  titulo: "AMD Ryzen 7 7800X3D: especificaciones",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html",
  consultadoEn: "",
};
const AMD_5600G: Fuente = {
  titulo: "AMD Ryzen 5 5600G: especificaciones",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600g.html",
  consultadoEn: "",
};
const AMD_7600X: Fuente = {
  titulo: "AMD Ryzen 5 7600X: especificaciones",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600x.html",
  consultadoEn: "",
};
const AMD_8700G: Fuente = {
  titulo: "AMD Ryzen 7 8700G: especificaciones",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-7-8700g.html",
  consultadoEn: "",
};
const AMD_3D_VCACHE: Fuente = {
  titulo: "AMD 3D V-Cache",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/technologies/3d-v-cache.html",
  consultadoEn: "",
};
const AMD_PORTATIL: Fuente = {
  titulo: "Procesadores AMD Ryzen para portátiles",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/laptop/ryzen.html",
  consultadoEn: "",
};
const AMD_AI_9_HX_370: Fuente = {
  titulo: "AMD Ryzen AI 9 HX 370: especificaciones",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-9-hx-370.html",
  consultadoEn: "",
};

/* ---------- Hechos de nomenclatura (los usa el decodificador; viven en la sección «nombres») ----------
 * Los de series y generaciones son volátiles: revisión cada seis meses. */
const marcaCoreIACore = conRevision(
  hecho(
    "cpu-intel-marca-core-i-a-core",
    "Intel dejó de usar la letra i en sus nombres nuevos: ahora hay Core 3, Core 5 y Core 7, y Core Ultra 5, 7 y 9. Los nombres anteriores, como Core i5, siguen existiendo en procesadores de generaciones anteriores.",
    [INTEL_NOMBRES, INTEL_CORE_ULTRA],
    "N1. Lo dijo el dueño de memoria (cambio de «Core i5» a «Core 5» y a «Core Ultra 5» desde 2023). La página de nombres de Intel abierta el 2026-10-14 describe Core y Core Ultra, pero no explica el cambio de nombre: buscar el anuncio en Intel Newsroom.",
  ),
  6,
);
const coreVsCoreUltra = conRevision(
  hecho(
    "cpu-core-vs-core-ultra",
    "Core Ultra es la familia de mayor nivel de Intel, con gamas 5, 7 y 9. Core, sin Ultra, es la familia de uso general, con gamas 3, 5 y 7.",
    [INTEL_NOMBRES],
    "N1. La página de nombres abierta el 2026-10-14 dice que Core Ultra es la familia «premium» (9, 7 y 5) y que Core (7, 5 y 3) apunta a portátiles accesibles; confirmar que también aplica a escritorio.",
  ),
  6,
);
const coreIGeneracion = conRevision(
  hecho(
    "cpu-core-i-generacion",
    "En los Core i de escritorio, los dos primeros dígitos del número de modelo indican la generación: 12400 es de la 12.ª generación y 14700 de la 14.ª.",
    [INTEL_NOMBRES, INTEL_ARK],
    "N3. La página de nombres abierta el 2026-10-14 solo describe el indicador de generación de Core Ultra; para Core i falta una fuente primaria (ARK de cada modelo muestra la generación).",
  ),
  6,
);
const coreILga1700Vigentes = conRevision(
  hecho(
    "cpu-core-i-lga1700-vigentes",
    "Los Core i3, i5, i7 e i9 de LGA 1700 se siguen vendiendo mientras existe la línea nueva de Intel.",
    [INTEL_ARK],
    "N2. Sin consultar. Confirmar en ARK qué modelos Core i de LGA 1700 siguen disponibles y si Intel los marca como descontinuados.",
  ),
  6,
);
const coreUltraSerie = conRevision(
  hecho(
    "cpu-core-ultra-serie",
    "En Core Ultra el primer dígito del número de modelo indica la serie: 165H es de la serie 1 y 265K de la serie 2. La serie 2 de escritorio usa el socket LGA 1851.",
    [INTEL_NOMBRES, V_INTEL_BOXED_ULTRA_S2],
    "N4. La página de nombres (2026-10-14) menciona 165H como serie 1 y 288V como serie 2; el artículo de Intel de Core Ultra de escritorio serie 2 confirma LGA 1851. Falta confirmar si ya hay una serie 3 de escritorio.",
  ),
  6,
);
const coreSinUltraNumero = conRevision(
  hecho(
    "cpu-core-sin-ultra-numero",
    "Los procesadores Core sin Ultra usan un número de modelo más corto, de tres dígitos, que el de los Core i, de cinco.",
    [INTEL_NOMBRES],
    "N1/N3. La página de nombres (2026-10-14) dice que Core usa un número de tres dígitos; los cinco dígitos de Core i salen de las fichas de ARK.",
  ),
  6,
);
const intelGamasRelativas = hecho(
  "cpu-intel-gamas-relativas",
  "Intel presenta 3, 5, 7 y 9 (con o sin la letra i) como niveles de rendimiento dentro de cada familia, de menor a mayor. El número no sirve para comparar entre familias distintas.",
  [INTEL_NOMBRES],
  "N10. La página abierta el 2026-10-14 habla de niveles de rendimiento para Core Ultra y de Core accesible. La parte «no sirve para comparar entre familias» es redacción de B & W, por verificar.",
);
const amdGamasRelativas = hecho(
  "cpu-amd-gamas-relativas",
  "AMD usa Ryzen 3, Ryzen 5, Ryzen 7 y Ryzen 9 como niveles dentro de su línea Ryzen, de menor a mayor.",
  [AMD_RYZEN_ESCRITORIO],
  "N10. Sin consultar (la página de AMD agotó el tiempo). Probable 🟡: AMD puede no tener una página de nomenclatura de escritorio; apoyarse en las fichas de producto.",
);
const coreUltraEscritorioGamas = conRevision(
  hecho(
    "cpu-core-ultra-escritorio-gamas",
    "En la serie 2 de escritorio, Intel ofrece Core Ultra 5, 7 y 9.",
    [INTEL_CORE_ULTRA, V_INTEL_BOXED_ULTRA_S2],
    "N11. Decide los «—» de la tabla de equivalencias: confirmar en ARK si existe un Core Ultra 3 de escritorio. Hoy la tabla no lo lista.",
  ),
  6,
);
const intelSufijosK = hecho(
  "cpu-intel-sufijos-k",
  "En Intel de escritorio, K indica multiplicador desbloqueado. KF es K sin gráficos integrados. KS es una edición especial de la línea K.",
  [INTEL_NOMBRES],
  "N5. La página abierta el 2026-10-14 define K («desbloqueado») y F (necesita gráfica aparte), pero no define KF ni KS; KS figura como «special edition» de la letra S. Confirmar KF y KS en Intel.",
);
const intelSufijoT = hecho(
  "cpu-intel-sufijo-t",
  "En Intel de escritorio, T indica un procesador optimizado para consumir menos energía.",
  [INTEL_NOMBRES],
  "N5. La página abierta el 2026-10-14 lo describe así.",
);
const intelSufijosHHx = hecho(
  "cpu-intel-sufijos-h-hx",
  "En portátiles de Intel, H indica alto rendimiento y HX máximo rendimiento, con todos los modelos desbloqueados.",
  [INTEL_NOMBRES],
  "N5. La página abierta el 2026-10-14 lo describe así.",
);
const intelSufijosUV = hecho(
  "cpu-intel-sufijos-u-v",
  "En portátiles de Intel, U indica bajo consumo. V aparece como sufijo de portátil de Core Ultra.",
  [INTEL_NOMBRES],
  "N5. La página abierta el 2026-10-14 define U («eficiencia de energía») pero lista V sin definirlo: buscar la definición de V o quitar ese sufijo.",
);
const amdSufijosXXt = hecho(
  "cpu-amd-sufijos-x-xt",
  "En Ryzen de escritorio, X indica un modelo con frecuencias más altas dentro de su gama, y XT una variante de esa misma serie con frecuencias ajustadas.",
  [AMD_RYZEN_ESCRITORIO],
  "N6. Lo dijo el dueño de memoria. Sin consultar. Probable 🟡: AMD no publica una tabla de sufijos de escritorio; usar fichas de producto (por ejemplo un Ryzen 5 3600XT) o quitar XT.",
);
const amdX3d = conRevision(
  hecho(
    "cpu-amd-x3d",
    "X3D indica un Ryzen con AMD 3D V-Cache, una memoria caché adicional apilada sobre el chip. Existen modelos X3D en AM4 y en AM5.",
    [AMD_3D_VCACHE, AMD_7800X3D],
    "N6/N12. Sin consultar. Confirmar que hay X3D en AM4 (por ejemplo Ryzen 7 5800X3D) y en AM5.",
  ),
  6,
);
const amdSufijoG = hecho(
  "cpu-amd-sufijo-g",
  "En Ryzen de escritorio, G identifica modelos con gráficos integrados Radeon, como el Ryzen 5 5600G en AM4 y los Ryzen serie 8000G en AM5.",
  [AMD_5600G, AMD_8700G],
  "N6. Sin consultar. Trampa a vigilar: en AM5 los modelos sin G también pueden traer gráficos básicos (hecho cpu-amd-am5-graficos-integrados), así que la G no es la única señal.",
);
const amdSufijoF = hecho(
  "cpu-amd-sufijo-f",
  "Los Ryzen de escritorio con sufijo F no traen gráficos integrados y necesitan una tarjeta gráfica aparte.",
  [AMD_RYZEN_ESCRITORIO],
  "N6. Sin consultar. Confirmar con una ficha de producto con F (por ejemplo Ryzen 5 7500F) que el campo de gráficos diga que no trae.",
);
const amdPortatilSufijos = conRevision(
  hecho(
    "cpu-amd-portatil-sufijos",
    "En portátiles Ryzen, U indica bajo consumo, H y HS alto rendimiento (HS en equipos más delgados) y HX máximo rendimiento.",
    [AMD_PORTATIL],
    "N9. Sin consultar. Confirmar en AMD (portátiles) el significado de cada sufijo; probable 🟡.",
  ),
  6,
);
const amdRyzenAiEsquema = conRevision(
  hecho(
    "cpu-amd-ryzen-ai-esquema",
    "Varios procesadores de portátil de AMD usan el esquema Ryzen AI, gama, número y sufijo. En Ryzen AI 9 HX 370, 9 es la gama, HX el sufijo y 370 el modelo de la serie AI 300.",
    [AMD_AI_9_HX_370, AMD_PORTATIL],
    "N9. Sin consultar. Confirmar el nombre de la serie («AI 300») en la ficha.",
  ),
  6,
);
const amd8000gAm5 = conRevision(
  hecho(
    "cpu-amd-8000g-am5",
    "Los Ryzen serie 8000G de escritorio, como el Ryzen 7 8700G, usan el socket AM5 y traen gráficos integrados.",
    [AMD_8700G],
    "N8. Sin consultar. Sirve para explicar que el número de serie no es la generación del socket.",
  ),
  6,
);
const amdSerieNoEsGeneracion = conRevision(
  hecho(
    "cpu-amd-serie-no-es-generacion",
    "En AMD, el primer dígito del número de modelo es la serie: la serie 5000 de escritorio usa AM4 y las series 7000, 8000G y 9000 usan AM5. Por eso el número solo no basta para saber el socket.",
    [V_AMD_5600X, V_AMD_7700X, AMD_8700G],
    "N8. Las fichas del 5600X y del 7700X se abrieron el 2026-10-13 y confirman AM4 y AM5; falta la ficha de la serie 9000 para confirmar que usa AM5.",
  ),
  6,
);
const amdAm5GraficosIntegrados = conRevision(
  hecho(
    "cpu-amd-am5-graficos-integrados",
    "Los Ryzen serie 7000 y 9000 para AM5 sin sufijo F incluyen gráficos integrados básicos.",
    [AMD_7600X, V_AMD_7700X],
    "N7. Verificar con el campo «Graphics Model» de las fichas de AMD. Es la trampa de la «G» en AM5: no debe afirmarse en la prosa hasta confirmarla.",
  ),
  6,
);
const ejemplosAmd = conRevision(
  hecho(
    "cpu-ejemplos-amd",
    "Los Ryzen 5 5600G, Ryzen 7 7800X3D y Ryzen 5 7600X existen como productos de AMD.",
    [AMD_5600G, AMD_7800X3D, AMD_7600X],
    "E1 a E3. Sin consultar (las páginas de AMD agotaron el tiempo el 2026-10-14).",
  ),
  6,
);
const ejemplosIntel = conRevision(
  hecho(
    "cpu-ejemplos-intel",
    "Los Core i5-12400F, Core i7-14700K y Core Ultra 7 265K existen como productos de Intel.",
    [INTEL_ARK, INTEL_CORE_ULTRA],
    "E4 a E6. Sin consultar. Quien verifica debe enlazar la ficha de ARK de cada modelo (hoy se cita la portada de ARK).",
  ),
  6,
);

/* ---------- Hechos de las partes físicas ---------- */
const lgaContactosEnPlaca = hecho(
  "cpu-lga-contactos-en-placa",
  "En los sockets LGA, como AM5 y los de Intel, los contactos están en el socket de la placa; el procesador trae contactos planos en su cara inferior.",
  [V_INTEL_LGA1700],
  "Sin ficha que lo diga con esas palabras: el artículo de Intel de LGA 1700 se abrió el 2026-10-13 y habla del socket; falta una frase primaria.",
);
const lga1851NoCompatible = conRevision(
  hecho(
    "cpu-lga1700-lga1851-muescas",
    "LGA 1851 no es compatible con las placas de LGA 1700: los dos sockets se parecen, pero un procesador de uno no entra en el otro.",
    [V_INTEL_BOXED_ULTRA_S2, V_INTEL_LGA1700],
    "N20. Intel dice que los Core Ultra serie 2 usan un socket nuevo y no son compatibles hacia atrás. Pendiente: confirmar con las guías mecánicas de Intel si miden lo mismo y llevan las muescas en posiciones distintas.",
  ),
  6,
);
const ihsTapaMetalica = hecho(
  "cpu-ihs-tapa-metalica",
  "La tapa metálica del procesador (IHS, por integrated heat spreader) cubre el chip y es la superficie que toca la base del disipador.",
  [AMD_INSTALAR_DISIPADOR],
  "La guía de AMD se abrió el 2026-10-11 en el piloto; falta contrastar esta redacción con ella.",
);
const palancaSujecion = hecho(
  "cpu-socket-palanca-sujecion",
  "En AM4 la palanca del socket libera o sujeta los pines del procesador. En los sockets LGA, la palanca cierra la tapa de sujeción que presiona el procesador contra los contactos.",
  [V_INTEL_LGA1700, V_AMD_CPU_100],
  "Sin consultar con esta redacción. Las guías de AMD (CPU-100) hablan de manipular el procesador sin forzarlo; buscar el manual de una placa AM4 y una LGA para el mecanismo de la palanca.",
);
const potenciaDisipador = hecho(
  "cpu-potencia-disipador",
  "Cada procesador declara una potencia (TDP en AMD, potencia base en ARK de Intel) y el disipador debe estar diseñado para cubrirla.",
  [V_INTEL_BOXED_ULTRA_S2, AMD_DISIPADORES],
  "Intel dice que el disipador debe cubrir la potencia del procesador (artículo abierto el 2026-10-13). Falta la página de AMD con el TDP de ejemplo.",
);

/* ---------- Partes ---------- */
const ihs: ParteContenido = {
  orden: 1,
  nombre: "Tapa metálica del procesador (IHS)",
  nombreCorto: "IHS",
  alias: ["tapa del procesador", "disipador de calor integrado"],
  resumen: "La tapa metálica que ves encima del procesador. Recibe la pasta térmica y pasa el calor del chip a la base del disipador.",
  queHace:
    "Es la placa metálica que cubre el chip del procesador. Reparte el calor hacia la base del disipador, con una capa fina de pasta térmica entre las dos superficies para que el contacto sea parejo.",
  alElegir: [
    "No la rayes ni la golpees: su superficie plana es la que da contacto al disipador.",
    "Revisa que el disipador esté diseñado para la potencia de tu procesador, no solo para su socket.",
  ],
  hechos: [ihsTapaMetalica, pastaTermicaEntreIhsYBase, potenciaDisipador],
  relacionadas: ["zocalo"],
  enlaces: [{ etiqueta: "Base del disipador", pieza: "refrigeracion", parte: "base" }],
};

const marcaPinUno: ParteContenido = {
  orden: 2,
  nombre: "Marca del pin uno",
  nombreCorto: "Pin uno",
  alias: ["triángulo de alineación"],
  resumen: "Un triángulo en una esquina del procesador que debe coincidir con otro en el socket. Evita instalarlo girado.",
  queHace:
    "Indica de qué lado está el primer pin. El socket trae una marca equivalente en la misma esquina: al hacerlas coincidir, el procesador queda en la única posición en la que encaja.",
  alElegir: ["Alinea las dos marcas antes de soltar el procesador sobre el socket.", "Si no coinciden, no sigas: girar el procesador es la causa más común de pines doblados."],
  hechos: [socketMarcaPinUno],
  relacionadas: ["muescas", "zocalo"],
};

const muescas: ParteContenido = {
  orden: 3,
  nombre: "Muescas de alineación",
  nombreCorto: "Muescas",
  resumen: "Cortes en el borde del procesador que solo coinciden con salientes del socket en una posición. Impiden instalarlo girado.",
  queHace: "Son cortes en el borde del procesador. Encajan con salientes del socket y, junto a la marca del pin uno, aseguran la posición correcta.",
  alElegir: [
    "Dos sockets de Intel pueden verse casi iguales y ser incompatibles: confirma el socket en la ficha en vez de guiarte por la apariencia.",
    "Nunca fuerces un procesador que no baja sin esfuerzo.",
  ],
  hechos: [lga1851NoCompatible],
  relacionadas: ["marca-pin-1", "contactos-socket"],
  vistas: ["am5", "intel-lga"],
};

const pinesProcesador: ParteContenido = {
  orden: 4,
  nombre: "Pines del procesador",
  nombreCorto: "Pines",
  resumen: "En AM4 los pines están en el procesador y se doblan con facilidad. Entran en orificios del socket.",
  queHace:
    "En el socket AM4, de tipo PGA, cada pin del procesador entra en un orificio del socket. El procesador se instala con la palanca levantada y se asegura al bajarla.",
  alElegir: ["Instala el procesador sin presionarlo ni deslizarlo: debe bajar solo, con la palanca levantada.", "Si un pin se dobla, no lo enderezcas sin experiencia: llévalo a revisar antes de forzarlo."],
  hechos: [am4PgaRyzen],
  relacionadas: ["marca-pin-1", "palanca"],
  vistas: ["am4"],
};

const contactosSocket: ParteContenido = {
  orden: 5,
  nombre: "Contactos del socket",
  nombreCorto: "Contactos",
  resumen: "En AM5 y en los sockets de Intel los contactos están en la placa, no en el procesador. Un contacto doblado daña la placa.",
  queHace:
    "Son pequeñas puntas o láminas en el socket de la placa. El procesador, con contactos planos en su cara inferior, queda presionado contra ellas por la tapa de sujeción.",
  alElegir: ["No toques los contactos ni pases nada por encima de ellos.", "Guarda la tapa plástica del socket de una placa usada: protege los contactos al transportarla."],
  hechos: [am5Lga, lgaContactosEnPlaca],
  relacionadas: ["tapa-sujecion", "zocalo"],
  vistas: ["am5", "intel-lga"],
};

const tapaSujecion: ParteContenido = {
  orden: 6,
  nombre: "Tapa de sujeción del socket",
  nombreCorto: "Tapa",
  resumen: "Marco metálico que baja sobre el procesador en un socket LGA y lo mantiene presionado contra los contactos.",
  queHace: "Cubre el borde del procesador una vez colocado. La palanca la cierra y la mantiene firme para que todos los contactos hagan presión pareja.",
  alElegir: ["Cierra la tapa con la palanca sin golpearla; si ofrece mucha resistencia, revisa que el procesador esté alineado.", "No la cierres sin procesador instalado."],
  hechos: [palancaSujecion],
  relacionadas: ["palanca", "contactos-socket"],
  vistas: ["am5", "intel-lga"],
};

const palanca: ParteContenido = {
  orden: 7,
  nombre: "Palanca de sujeción",
  nombreCorto: "Palanca",
  resumen: "Se levanta para abrir el socket y se baja para asegurar el procesador. En AM4 libera los pines; en LGA cierra la tapa.",
  queHace:
    "Es el brazo metálico junto al socket. Levantada, deja libre el procesador; bajada, lo asegura. Hay que moverla con calma y sin torcerla.",
  alElegir: ["Levántala por completo antes de colocar o retirar el procesador.", "Si se siente trabada, no la fuerces: revisa que el procesador esté asentado."],
  hechos: [palancaSujecion],
  relacionadas: ["pines-procesador", "tapa-sujecion"],
};

const zocalo: ParteContenido = {
  orden: 8,
  nombre: "Socket (zócalo)",
  nombreCorto: "Socket",
  alias: ["zócalo", "base del procesador"],
  resumen: "El zócalo de la placa donde encaja el procesador. Su tipo define qué procesadores y qué memoria acepta la placa.",
  queHace:
    "Es la base donde se instala el procesador. Cada familia de procesadores usa un tipo de socket y la placa solo acepta procesadores de ese tipo.",
  alElegir: [
    "El socket del procesador y el de la placa deben ser el mismo, y además la BIOS de la placa debe reconocer el procesador.",
    "Un mismo socket puede aceptar procesadores de varias generaciones: confirma en la lista de compatibilidad de la placa.",
  ],
  hechos: [am4PgaRyzen, am5Lga, am5MemoriaDdr5, lga1700GeneracionesMemoria, lga1851ProcesadoresMemoria],
  opciones: {
    titulo: "Plataformas más vistas",
    items: [
      { id: "am4", etiqueta: "AM4", marca: "AMD", resumen: "Socket de AMD con pines en el procesador. Usa memoria DDR4.", vigente: false, hechos: [am4PgaRyzen] },
      { id: "am5", etiqueta: "AM5", marca: "AMD", resumen: "Socket de AMD con contactos en la placa. Usa memoria DDR5.", vigente: true, hechos: [am5Lga, am5MemoriaDdr5] },
      { id: "lga-1700", etiqueta: "LGA 1700", marca: "Intel", resumen: "Socket de Intel de varias generaciones Core. Según la placa usa memoria DDR4 o DDR5.", vigente: false, hechos: [lga1700GeneracionesMemoria] },
      { id: "lga-1851", etiqueta: "LGA 1851", marca: "Intel", resumen: "Socket de Intel para los Core Ultra de escritorio más recientes. Usa memoria DDR5.", vigente: true, hechos: [lga1851ProcesadoresMemoria] },
    ],
  },
  relacionadas: ["ihs", "pines-procesador", "contactos-socket"],
  enlaces: [{ etiqueta: "Socket en la tarjeta madre", pieza: "tarjeta-madre", parte: "socket" }],
};

/* ---------- Secciones ---------- */
const hechosNombres: readonly Hecho[] = [
  marcaCoreIACore,
  coreVsCoreUltra,
  coreIGeneracion,
  coreILga1700Vigentes,
  coreUltraSerie,
  coreSinUltraNumero,
  intelGamasRelativas,
  amdGamasRelativas,
  coreUltraEscritorioGamas,
  intelSufijosK,
  intelSufijoT,
  intelSufijosHHx,
  intelSufijosUV,
  amdSufijosXXt,
  amdX3d,
  amdSufijoG,
  amdSufijoF,
  amdPortatilSufijos,
  amdRyzenAiEsquema,
  amd8000gAm5,
  amdSerieNoEsGeneracion,
  amdAm5GraficosIntegrados,
  ejemplosAmd,
  ejemplosIntel,
  videoRequiereGraficosIntegrados,
];

const seccionNombres: SeccionTexto = {
  id: "nombres",
  titulo: "Cómo leer el nombre de un procesador",
  parrafos: [
    "Cada letra y número del nombre dice algo. Primero van la marca y la familia, luego un número de gama dentro de esa familia, después un número de modelo que suele indicar la generación o la serie y, al final, unas letras que cuentan una característica: si trae gráficos integrados, si su multiplicador está desbloqueado o si es de portátil.",
    "Intel y AMD usan un número de gama parecido para ordenar su propia línea. Que dos procesadores lleven el mismo número no significa que rindan igual: compáralos por sus fichas, no por el número.",
    "Los nombres cambian con el tiempo. Intel ha ido cambiando la forma de nombrar sus familias, y hoy conviven nombres anteriores como Core i5 con los nuevos como Core 5 y Core Ultra 5. En AMD no des por hecho que un número mayor sea una plataforma más reciente: confirma el socket en la ficha. Usa el desglose para orientarte y confirma siempre en la página del fabricante que el modelo exista.",
  ],
  hechos: hechosNombres,
};

const seccionElegir: SeccionTexto = {
  id: "elegir",
  titulo: "Qué mirar al elegir un procesador",
  parrafos: ["Antes de mirar el nombre comercial, revisa estas cuatro cosas. Cada una evita un problema distinto al armar el equipo."],
  vinetas: [
    "Socket y placa: el socket del procesador debe ser el de la placa, y la BIOS de la placa debe reconocerlo.",
    "Gráficos integrados: si el procesador no los trae, necesitas una tarjeta gráfica para ver imagen en el monitor.",
    "Memoria: la plataforma del procesador y la placa deciden si usas DDR4 o DDR5; no se pueden mezclar.",
    "Disipador: el soporte debe servir para tu socket y el disipador debe estar diseñado para la potencia del procesador.",
  ],
  hechos: [socketDisipadoresAm4Am5, socketDisipadoresLga1700Lga1851, potenciaDisipador, videoRequiereGraficosIntegrados],
};

const seccionErrores: SeccionTexto = {
  id: "errores",
  titulo: "Errores comunes con el procesador",
  parrafos: ["Estos son los tropiezos más frecuentes al elegir e instalar un procesador. Los marcados como vividos nos pasaron en el taller; los demás son riesgos conocidos."],
};

/* ---------- Casos del taller (docs/piezas-errores-taller.md) y criterios ----------
 * `texto` continúa el rótulo que pone la interfaz. Los dos vividos los contó el dueño; aprobadoEn/aprobadoPor los fija él. */
const casos: readonly Caso[] = [
  {
    id: "bios-sin-reconocer-procesador",
    tipo: "vivido",
    texto:
      "armar un equipo con un procesador compatible con el socket de la placa, pero con una BIOS que aún no lo reconocía: los ventiladores giraban y el equipo se apagaba. Antes de comprar, confirma en la lista de compatibilidad de la placa qué versión de BIOS necesita tu procesador.",
    confirmadoPorDueno: true,
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "monitor-sin-graficos-integrados",
    tipo: "vivido",
    texto:
      "conectar el monitor a la salida de video de la placa con un procesador que no trae gráficos integrados: no hay imagen. En ese caso el monitor va a la tarjeta gráfica.",
    confirmadoPorDueno: true,
    hechos: [videoRequiereGraficosIntegrados],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "plastico-base-disipador",
    tipo: "puede-pasar",
    texto:
      "olvidar quitar el plástico protector de la base del disipador, sea de aire o líquido: el procesador se calienta porque la base no hace contacto con su tapa metálica.",
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
    id: "pines-doblados-al-instalar",
    tipo: "puede-pasar",
    texto:
      "doblar pines al instalar el procesador: en AM4 los del procesador y en los sockets LGA los contactos de la placa. Pasa al no alinear la marca del pin uno o al forzar el procesador o la tapa.",
    hechos: [socketMarcaPinUno],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "comparar-solo-por-numero",
    tipo: "puede-pasar",
    texto:
      "comparar dos procesadores solo por el número del modelo, sin revisar la generación, el socket ni las letras del final, y terminar con uno que no entra en la placa o que no trae gráficos integrados.",
    aprobadoEn: null,
    aprobadoPor: null,
  },
];

// Criterio de taller (opinión de B & W, no dato): lo aprueba el dueño. No lleva fuente ni compara «mejor/peor».
const criterios: readonly Criterio[] = [
  {
    id: "disipador-de-caja-con-procesador-exigente",
    texto:
      "Con un procesador de gama alta, el disipador básico que viene de fábrica suele quedarse corto, porque está pensado para uno de gama baja. Preferimos como mínimo un disipador de torre, aunque sea de un solo ventilador. Si el chasis es pequeño y no cabe, usamos uno de bajo perfil de buena calidad.",
    aprobadoEn: null,
    aprobadoPor: null,
  },
];

export const PROCESADOR_CONTENIDO: PiezaContenido<ProcesadorParteId, ProcesadorVistaId> = {
  slug: "procesador",
  estado: "borrador",
  piezaServicios: "procesador",
  nombreCorto: "Procesador",
  titulo: "Procesador: partes y qué significan K, F, X y X3D",
  descripcion: "Mira las partes del procesador por fuera, cómo encaja en su socket y aprende a leer su nombre: qué significan K, F, X, X3D y las gamas.",
  h1: "El procesador por fuera y cómo leer su nombre",
  eyebrow: "piezas del PC",
  intro: [
    "El procesador (también llamado CPU) es el chip que ejecuta las instrucciones de todos los programas. Por fuera ves una tapa metálica, una marca que indica su orientación y, según la marca, pines o contactos planos que encajan en el socket de la placa.",
    "Aquí puedes desglosar el nombre de cualquier procesador para saber qué significan sus letras y números, y tocar cada parte del dibujo para ver qué hace y qué mirar al elegirlo.",
  ],
  palabrasClave: [
    "partes del procesador",
    "qué significa K F X3D",
    "cómo leer el nombre de un procesador",
    "diferencia entre Core i5 y Core 5",
    "qué significa la F en un procesador",
    "AM4 AM5 LGA",
    "socket del procesador",
    "Ryzen y Core Ultra",
  ],
  terminos: [
    "AM4",
    "AM5",
    "LGA",
    "LGA 1700",
    "LGA 1851",
    "PGA",
    "IHS",
    "TDP",
    "Ryzen",
    "Ryzen 3",
    "Ryzen 5",
    "Ryzen 7",
    "Ryzen 9",
    "Ryzen AI",
    "Core",
    "Core i3",
    "Core i5",
    "Core i7",
    "Core i9",
    "Core 3",
    "Core 5",
    "Core 7",
    "Core Ultra",
    "Core Ultra 5",
    "Core Ultra 7",
    "Core Ultra 9",
    "X3D",
    "3D V-Cache",
    "DDR4",
    "DDR5",
    "BIOS",
  ],
  sinonimos: ["CPU"],
  publicadoEn: null,
  actualizadoEn: "2026-10-14",
  bloques: ["nombres", "partes", "lista", "vistas", "comparar", "elegir", "errores"],
  vistas: [
    {
      id: "am4",
      etiqueta: "AMD AM4",
      resumen: "Un procesador AMD con pines flotando sobre su socket abierto, con la palanca levantada.",
      etiquetaFigura: "Dibujo esquemático de un procesador AMD AM4. Se muestra el mismo procesador por las dos caras: arriba, sobre su socket, y a su lado, volteado, con los pines a la vista. Las proporciones y la cantidad de pines son ilustrativas.",
      notasPorParte: {
        muescas: "En esta vista no se marcan muescas: la alineación la dan el patrón de pines y la marca del triángulo.",
        "contactos-socket": "En AM4 los contactos son los pines del procesador; el socket solo trae orificios.",
        "tapa-sujecion": "AM4 no usa tapa de sujeción: la palanca asegura los pines directamente.",
      },
    },
    {
      id: "am5",
      etiqueta: "AMD AM5",
      resumen: "Un procesador AMD sin pines sobre su socket abierto: los contactos están en la placa.",
      etiquetaFigura: "Dibujo esquemático de un procesador AMD AM5 flotando sobre su socket, para que se vean los contactos del socket. Las proporciones y la cantidad de contactos son ilustrativas.",
      notasPorParte: {
        "pines-procesador": "El procesador AM5 no lleva pines: sus contactos planos, en la cara inferior, no se ven desde esta cámara.",
      },
    },
    {
      id: "intel-lga",
      etiqueta: "Intel LGA",
      resumen: "Un procesador Intel sin pines sobre su socket LGA abierto, con la tapa de sujeción levantada.",
      etiquetaFigura: "Dibujo esquemático de un procesador Intel flotando sobre un socket LGA, para que se vean los contactos del socket. Es un contorno genérico, sin marcas ni números de socket.",
      notasPorParte: {
        "pines-procesador": "Los procesadores Intel de escritorio no llevan pines: sus contactos planos, en la cara inferior, no se ven desde esta cámara.",
      },
    },
  ],
  selectorVistas: "Elige la plataforma",
  partes: {
    ihs,
    "marca-pin-1": marcaPinUno,
    muescas,
    "pines-procesador": pinesProcesador,
    "contactos-socket": contactosSocket,
    "tapa-sujecion": tapaSujecion,
    palanca,
    zocalo,
  },
  secciones: [seccionNombres, seccionElegir, seccionErrores],
  casos,
  criterios,
  comparaciones: [
    {
      id: "plataformas",
      titulo: "Las tres plataformas, lado a lado",
      columnas: ["am4", "am5", "intel-lga"],
      filas: [
        {
          etiqueta: "Dónde están los contactos",
          valores: {
            am4: { tipo: "hecho", hecho: am4PgaRyzen },
            am5: { tipo: "hecho", hecho: am5Lga },
            "intel-lga": { tipo: "hecho", hecho: lgaContactosEnPlaca },
          },
        },
        {
          etiqueta: "Memoria que usa",
          valores: {
            am4: { tipo: "hecho", hecho: am4PgaRyzen },
            am5: { tipo: "hecho", hecho: am5MemoriaDdr5 },
            "intel-lga": { tipo: "hecho", hecho: lga1700GeneracionesMemoria },
          },
        },
        {
          etiqueta: "Disipadores de la plataforma anterior",
          valores: {
            am4: { tipo: "texto", texto: "Es la plataforma de partida de esta fila." },
            am5: { tipo: "hecho", hecho: socketDisipadoresAm4Am5 },
            "intel-lga": { tipo: "hecho", hecho: socketDisipadoresLga1700Lga1851 },
          },
        },
      ],
    },
  ],
  decodificador: PROCESADOR_DECODIFICADOR,
  // TODO(dueño): aprobar la frase del CTA; mientras tanto va la versión prudente.
  cta: {
    titulo: "Cotiza tu PC",
    texto: "Si prefieres no revisar compatibilidades por tu cuenta, en el cotizador eliges la gama de cada pieza y te ayudamos a elegir una combinación compatible.",
    etiqueta: "Cotiza tu PC",
    href: "/cotizador",
  },
};
