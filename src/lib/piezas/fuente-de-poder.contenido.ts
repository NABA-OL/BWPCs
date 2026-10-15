/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contenido de /piezas/fuente-de-poder (docs/piezas-plan-2.md §3.5). ESTADO: BORRADOR; ningún hecho nuevo está verificado.
// Reglas: prosa sin cifras (salvo nombres de estándar en `terminos`); toda cifra vive en un `Hecho` con fuente; el texto de un caso continúa su rótulo.
// Aviso de seguridad (FP3): NO abrir la fuente. Va como `Hecho` con fuente en las partes internas y en «errores», y como prosa en la vista «Por dentro»
// y en el pie de su figura (que se ve junto al dibujo), no solo en la lista de partes.
// Fuentes: durante la redacción la búsqueda web estaba bloqueada por el límite de uso, así que NINGUNA fuente nueva se abrió (`consultadoEn: ""`);
// son páginas candidatas y quien verifica debe abrirlas y cambiar la URL por la del manual exacto cuando haga falta.
import {
  atx24Pines,
  conector12v2x6,
  epsOchoPines,
  epsVsPcieGrafica,
  pcie62Graficas,
  sataDatosYEnergia,
} from "./comun.hechos.ts";
import { hecho } from "./constructores.ts";
import { PCI_SIG, SATA_IO, V_ATX_22, V_CORSAIR_CABLES } from "./fuentes.ts";
import type { Caso, FuenteParteId, FuenteVistaId, Fuente, Hecho, ParteContenido, PiezaContenido, SeccionTexto } from "./types.ts";

const FUERA = ["por-fuera"] as const;
const DENTRO = ["por-dentro"] as const;
const CONECTORES = ["conectores"] as const;

/* ---------- Fuentes candidatas (sin abrir) ---------- */
const SEASONIC_SOPORTE: Fuente = { titulo: "Soporte y manuales de fuentes de poder", editor: "Seasonic", url: "https://seasonic.com/support", consultadoEn: "" };
const CORSAIR_SOPORTE: Fuente = { titulo: "Centro de ayuda y manuales de fuentes de poder", editor: "Corsair", url: "https://help.corsair.com/hc/en-us", consultadoEn: "" };
const EIGHTY_PLUS: Fuente = { titulo: "80 PLUS: programa de certificación de eficiencia", editor: "CLEAResult (80 PLUS)", url: "https://www.clearesult.com/80plus/", consultadoEn: "" };
const TI_PFC: Fuente = {
  titulo: "Corrección del factor de potencia (PFC)",
  editor: "Texas Instruments",
  url: "https://www.ti.com/power-management/ac-dc-power-supply/power-factor-correction-pfc/overview.html",
  consultadoEn: "",
};
const NZXT_H5_FLOW: Fuente = { titulo: "NZXT H5 Flow: producto y manual", editor: "NZXT", url: "https://nzxt.com/product/h5-flow", consultadoEn: "" };

/* ---------- Hechos nuevos de la pieza (todos sin verificar; prefijo «fp-») ---------- */
const noAbrirFuente: Hecho = hecho(
  "fp-no-abrir-fuente",
  "No abras la fuente de poder: sus condensadores internos pueden conservar carga peligrosa aunque esté desconectada, y las reparaciones corresponden a personal calificado.",
  [SEASONIC_SOPORTE, CORSAIR_SOPORTE],
  "FP3. Aviso de seguridad visible en la página. Falta ubicar la advertencia textual en el manual de un modelo concreto (suele estar en la etiqueta o en las instrucciones de seguridad) y cambiar la URL por la de ese manual.",
);
const etapasInternas: Hecho = hecho(
  "fp-etapas-internas",
  "En una fuente ATX típica la corriente alterna pasa por un filtro EMI, un rectificador, un corrector de factor de potencia (PFC), condensadores primarios, un transformador de conmutación y una etapa de salida que rectifica y regula las tensiones continuas.",
  [TI_PFC],
  "FP7. Un solo hecho de respaldo para las seis partes internas, explicadas de forma cualitativa. Falta una nota técnica que describa la cadena completa (Infineon, Texas Instruments o un fabricante de fuentes) y confirmar el orden.",
);
const interruptorGeneral: Hecho = hecho(
  "fp-interruptor-general",
  "La mayoría de las fuentes ATX traen un interruptor general en la parte trasera, junto a la entrada de corriente; con él apagado la fuente no entrega energía al equipo.",
  [SEASONIC_SOPORTE, CORSAIR_SOPORTE],
  "Pregunta real del taller (torre entregada con el interruptor apagado). Falta citar el manual de un modelo concreto.",
);
const modularConectores: Hecho = hecho(
  "fp-modular-conectores",
  "En una fuente modular los cables se enchufan en un banco de conectores de la fuente, de modo que se instalan solo los necesarios.",
  [V_CORSAIR_CABLES, SEASONIC_SOPORTE],
  "Falta confirmar la frase en la guía de Corsair ya consultada (cables de la fuente) o en un manual de Seasonic.",
);
const modularNoMezclar: Hecho = hecho(
  "fp-modular-no-mezclar-fuentes",
  "Los cables modulares de una fuente no deben usarse en otra, aunque el conector parezca igual, porque el orden de los pines puede cambiar.",
  [CORSAIR_SOPORTE, SEASONIC_SOPORTE],
  "FP5. Falta ubicar la advertencia del fabricante (Corsair o Seasonic). Si no existe una fuente primaria, pasa a criterio o se elimina.",
);
const etiquetaDatos: Hecho = hecho(
  "fp-etiqueta-datos",
  "La etiqueta de la fuente indica la potencia total y la corriente máxima de cada salida (+12 V, +5 V y +3,3 V), además del rango de tensión de entrada.",
  [SEASONIC_SOPORTE, CORSAIR_SOPORTE],
  "Falta abrir un manual y confirmar los datos que aparecen en la etiqueta. Este dato lo lee quien arma; no se calculan vatios en esta página.",
);
const ochentaPlus: Hecho = hecho(
  "fp-80-plus-certificacion",
  "80 PLUS es un programa de certificación de eficiencia de las fuentes; las fuentes certificadas llevan un sello con su nivel, como Bronze, Gold o Titanium.",
  [EIGHTY_PLUS],
  "Falta abrir la página y confirmar los nombres de los niveles. La guía de potencia y eficiencia queda en /guias.",
);
const ventiladorOrientacion: Hecho = hecho(
  "fp-ventilador-orientacion",
  "La orientación del ventilador de la fuente depende de su ubicación en el chasis: si va abajo con un filtro de aire, el ventilador mira hacia abajo, y si va arriba, hacia el interior del chasis.",
  [NZXT_H5_FLOW, SEASONIC_SOPORTE],
  "FP4. Memoria del dueño; sin fuente primaria. Falta el manual del chasis o de la fuente. Si no se encuentra, este hecho pasa a criterio de taller.",
);
const pcie8PinesIndependientes: Hecho = hecho(
  "fp-pcie-un-cable-por-conector",
  "Cuando una tarjeta gráfica tiene dos o tres conectores de ocho pines, algunos fabricantes recomiendan un cable independiente de la fuente para cada conector.",
  [CORSAIR_SOPORTE, SEASONIC_SOPORTE],
  "FP8. Memoria del dueño (recomendación de taller). Falta la guía del fabricante de la gráfica o de la fuente; si no se encuentra, pasa a criterio.",
);
const conector12v2x6Pines: Hecho = hecho(
  "fp-12v-2x6-pines",
  "El conector 12V-2x6 tiene doce contactos de potencia y cuatro contactos de señal más pequeños, y su forma impide invertirlo.",
  [PCI_SIG, CORSAIR_SOPORTE],
  "FP2. Riesgo medio del plan: conteo de pines y traba. Falta la especificación PCIe CEM 5.1 o la guía ATX 3.1 de Intel. Redactar sin culpar a una marca.",
);
const sataPoder15Pines: Hecho = hecho(
  "fp-sata-poder-15-pines",
  "El conector de energía SATA tiene 15 pines y alimenta unidades de almacenamiento SATA.",
  [SATA_IO, V_CORSAIR_CABLES],
  "FP6. Falta confirmar la cifra en la especificación de SATA-IO o en la guía de Corsair ya consultada.",
);
const molexCuatroPines: Hecho = hecho(
  "fp-molex-cuatro-pines",
  "El conector Molex tiene 4 pines; es de uso antiguo y hoy se usa sobre todo en periféricos y accesorios.",
  [V_ATX_22, V_CORSAIR_CABLES],
  "FP6. La especificación ATX 2.2 define el conector de periféricos de 4 pines; falta confirmar el texto «de uso antiguo» o suavizarlo.",
);

/* ---------- Partes (orden de FUENTE_PARTES) ---------- */
const rejillaVentilador: ParteContenido = {
  orden: 1,
  nombre: "Rejilla y ventilador",
  nombreCorto: "Ventilador",
  resumen: "La rejilla deja pasar el aire que mueve el ventilador de la fuente. Su orientación depende de dónde va la fuente en el chasis.",
  queHace:
    "El ventilador enfría los componentes internos de la fuente moviendo aire a través de la rejilla. Según el chasis, la fuente puede ir abajo o arriba y el ventilador debe mirar hacia el lado con aire disponible.",
  alElegir: [
    "Antes de montarla, mira dónde queda el ventilador y hacia dónde debe tomar el aire en tu chasis.",
    "Si la fuente va abajo y el chasis tiene filtro, deja libre esa entrada y límpiala de vez en cuando.",
  ],
  hechos: [ventiladorOrientacion],
  relacionadas: ["etiqueta"],
  vistas: FUERA,
};

const entradaAc: ParteContenido = {
  orden: 2,
  nombre: "Entrada de corriente (AC)",
  nombreCorto: "Entrada",
  resumen: "El conector donde se enchufa el cable que viene del tomacorriente. Recibe la corriente alterna de la casa.",
  queHace:
    "Es la puerta de entrada de la energía. Por aquí llega la corriente alterna, que la fuente transforma en las tensiones continuas que usan las piezas del PC. El cable de corriente se conecta aquí firmemente.",
  alElegir: ["Conecta el cable de corriente hasta el fondo antes de encender.", "Usa un tomacorriente o regleta en buen estado."],
  hechos: [interruptorGeneral],
  relacionadas: ["interruptor"],
  vistas: FUERA,
};

const interruptor: ParteContenido = {
  orden: 3,
  nombre: "Interruptor",
  nombreCorto: "Interruptor",
  resumen: "El interruptor general de la fuente, casi siempre junto a la entrada de corriente. Apagado, el PC no enciende.",
  queHace:
    "Corta o permite el paso de la energía a todo el equipo. Si el PC no enciende y no se ve ninguna luz ni se mueve ningún ventilador, lo primero que se revisa es que este interruptor esté en la posición de encendido.",
  alElegir: ["Antes de entregar o probar un equipo, comprueba que el interruptor esté encendido.", "No dependas de él para apagar el equipo: úsalo al desconectar la fuente."],
  hechos: [interruptorGeneral],
  relacionadas: ["entrada-ac"],
  vistas: FUERA,
};

const bancoModular: ParteContenido = {
  orden: 4,
  nombre: "Banco de conectores modulares",
  nombreCorto: "Modular",
  resumen: "Los conectores donde se enchufan los cables de una fuente modular. Cada cable va a una salida concreta del banco.",
  queHace:
    "En una fuente modular los cables no vienen fijos: se conectan en este banco y se instalan solo los necesarios, lo que deja menos cables sueltos dentro del chasis. Cada salida está pensada para un tipo de cable.",
  alElegir: [
    "Usa solo los cables que vienen con tu fuente y no mezcles cables de otra marca ni de otro modelo.",
    "Conecta cada cable en la salida que indica el manual de la fuente.",
  ],
  hechos: [modularConectores, modularNoMezclar],
  relacionadas: ["atx-24", "eps-cpu"],
  vistas: FUERA,
};

const etiqueta: ParteContenido = {
  orden: 5,
  nombre: "Etiqueta de especificaciones",
  nombreCorto: "Etiqueta",
  resumen: "La etiqueta pegada a la fuente resume su potencia, sus salidas y su certificación. Es el primer lugar donde mirar al revisar una fuente.",
  queHace:
    "Reúne los datos de la fuente: modelo, potencia total, corriente de cada salida, tensión de entrada y sellos de certificación. Sirve para saber qué tan exigente es la fuente y qué entrega por cada salida.",
  alElegir: [
    "Revisa la potencia total que declara la etiqueta o la ficha del fabricante.",
    "Busca el sello de eficiencia 80 Plus, que indica el nivel de certificación.",
    "Para calcular qué potencia necesitas, consulta la guía de fuentes de poder del sitio.",
  ],
  hechos: [etiquetaDatos, ochentaPlus],
  relacionadas: ["rejilla-ventilador"],
  enlaces: [{ etiqueta: "Guías del sitio", href: "/guias" }],
  vistas: FUERA,
};

const filtroEmi: ParteContenido = {
  orden: 6,
  nombre: "Filtro EMI",
  nombreCorto: "Filtro EMI",
  resumen: "Primera etapa por dentro. Filtra el ruido eléctrico de la corriente que entra y evita que la fuente lo devuelva a la red.",
  queHace:
    "Limpia la corriente alterna antes de que siga su camino y reduce las interferencias electromagnéticas (EMI). Solo se ve en el dibujo: nunca abras la fuente para verla.",
  alElegir: ["Es una pieza interna: no se puede revisar ni cambiar sin abrir la fuente."],
  hechos: [etapasInternas],
  relacionadas: ["rectificador"],
  vistas: DENTRO,
};

const rectificador: ParteContenido = {
  orden: 7,
  nombre: "Rectificador",
  nombreCorto: "Rectificador",
  resumen: "Convierte la corriente alterna de entrada en corriente continua. Sigue al filtro EMI en la cadena de la fuente.",
  queHace:
    "Toma la corriente alterna ya filtrada y la convierte en corriente continua que las siguientes etapas pueden manejar. Es el primer paso de la transformación de la energía.",
  alElegir: ["Pieza interna: no se revisa sin abrir la fuente, algo que no se debe hacer."],
  hechos: [etapasInternas],
  relacionadas: ["filtro-emi", "pfc"],
  vistas: DENTRO,
};

const pfc: ParteContenido = {
  orden: 8,
  nombre: "Corrector de factor de potencia (PFC)",
  nombreCorto: "PFC",
  resumen: "Ajusta cómo la fuente toma la corriente de la red para aprovechar mejor la energía. Muchas fuentes lo traen en forma activa.",
  queHace:
    "Es una etapa que ordena el consumo de corriente de la fuente para que sea más parejo. En las fuentes modernas se llama PFC activo y suele preceder a los condensadores primarios.",
  alElegir: ["Es una característica interna: el fabricante la menciona en la ficha como PFC activo."],
  hechos: [etapasInternas],
  relacionadas: ["rectificador", "condensadores-primarios"],
  vistas: DENTRO,
};

const condensadoresPrimarios: ParteContenido = {
  orden: 9,
  nombre: "Condensadores primarios",
  nombreCorto: "Condensadores",
  resumen: "Los condensadores grandes que almacenan energía. Pueden conservar carga peligrosa aunque la fuente esté desconectada: no abras la fuente.",
  queHace:
    "Almacenan energía y suavizan la corriente continua que llega al transformador. Son los componentes más grandes que se ven en la zona de entrada. Pueden seguir cargados con la fuente desconectada, por eso NO se debe abrir una fuente de poder.",
  alElegir: ["No abras la fuente por ningún motivo: el riesgo es real incluso desconectada.", "Si una fuente falla, llévala a servicio técnico o cámbiala."],
  hechos: [noAbrirFuente, etapasInternas],
  relacionadas: ["pfc", "transformador"],
  vistas: DENTRO,
};

const transformador: ParteContenido = {
  orden: 10,
  nombre: "Transformador",
  nombreCorto: "Transformador",
  resumen: "Reduce la tensión de la etapa primaria a las tensiones bajas que usa el PC y aísla eléctricamente las dos zonas.",
  queHace:
    "Es la pieza que baja la tensión desde la zona de entrada hasta las tensiones que necesitan las piezas del equipo, y mantiene aisladas ambas zonas. Trabaja junto con la conmutación rápida de la fuente.",
  alElegir: ["Pieza interna: no hay nada que revisar sin abrir la fuente."],
  hechos: [etapasInternas],
  relacionadas: ["condensadores-primarios", "salida-secundaria"],
  vistas: DENTRO,
};

const salidaSecundaria: ParteContenido = {
  orden: 11,
  nombre: "Salida secundaria",
  nombreCorto: "Salida",
  resumen: "La etapa final de la fuente: rectifica, filtra y regula las tensiones continuas que salen por los cables hacia las piezas.",
  queHace:
    "Toma la salida del transformador y la deja lista para las piezas del PC. De ahí parten los cables hacia la placa, la gráfica y las unidades de almacenamiento.",
  alElegir: ["Pieza interna: la etiqueta muestra la corriente que puede dar cada salida."],
  hechos: [etapasInternas],
  relacionadas: ["transformador", "atx-24"],
  vistas: DENTRO,
};

const atx24: ParteContenido = {
  orden: 12,
  nombre: "Conector ATX de 24 pines",
  nombreCorto: "ATX de 24 pines",
  alias: ["conector principal", "alimentación de la placa"],
  resumen: "El conector más ancho de la fuente. Alimenta la tarjeta madre y se conecta en el borde de la placa.",
  queHace:
    "Lleva la energía principal a la tarjeta madre y, a través de ella, a muchas de las piezas. Es el conector principal que define la fuente ATX y tiene una traba para que no se suelte.",
  alElegir: ["Conéctalo hasta que la traba haga clic.", "Hay un solo conector de este tipo en la placa."],
  hechos: [atx24Pines],
  relacionadas: ["eps-cpu"],
  enlaces: [{ etiqueta: "Conector de 24 pines en la tarjeta madre", pieza: "tarjeta-madre", parte: "conector-24-pines" }],
  vistas: CONECTORES,
};

const epsCpu: ParteContenido = {
  orden: 13,
  nombre: "Conector EPS del procesador",
  nombreCorto: "EPS",
  alias: ["EPS12V", "alimentación del procesador"],
  resumen: "Lleva energía al procesador a través de la placa. No es intercambiable con el cable PCIe de la gráfica.",
  queHace:
    "Alimenta la sección de energía del procesador. Algunas placas piden un conector y otras dos, y a veces el cable se divide en dos mitades que se separan o se unen. Se parece al de la gráfica, pero no se pueden intercambiar.",
  alElegir: [
    "Conecta el cable EPS marcado en la fuente, no el de la gráfica.",
    "Revisa en el manual de la placa cuántos conectores de este tipo trae.",
  ],
  hechos: [epsOchoPines, epsVsPcieGrafica],
  relacionadas: ["pcie-6-2", "atx-24"],
  enlaces: [{ etiqueta: "Conector del procesador en la tarjeta madre", pieza: "tarjeta-madre", parte: "conector-cpu" }],
  vistas: CONECTORES,
};

const pcie62: ParteContenido = {
  orden: 14,
  nombre: "Conector PCIe 6+2 de la gráfica",
  nombreCorto: "PCIe 6+2",
  resumen: "El cable de energía de la tarjeta gráfica: seis pines más dos que se acoplan. No es intercambiable con el EPS del procesador.",
  queHace:
    "Lleva energía a la tarjeta gráfica. Los dos pines extra se acoplan o se separan según lo que pida la gráfica. Algunas gráficas piden uno y otras varios conectores de este tipo.",
  alElegir: [
    "Revisa en la gráfica cuántos conectores pide y conecta todos.",
    "Si la gráfica tiene varios conectores, usa un cable independiente para cada uno cuando el fabricante lo recomiende.",
  ],
  hechos: [pcie62Graficas, pcie8PinesIndependientes, epsVsPcieGrafica],
  relacionadas: ["eps-cpu", "12v-2x6"],
  vistas: CONECTORES,
};

const doceV2x6: ParteContenido = {
  orden: 15,
  nombre: "Conector 12V-2x6 de la gráfica",
  nombreCorto: "12V-2x6",
  alias: ["12VHPWR"],
  resumen: "El conector pequeño y compacto de las gráficas nuevas. Debe quedar insertado por completo hasta el fondo.",
  queHace:
    "Lleva toda la energía de la gráfica por un solo conector pequeño en lugar de varios de ocho pines. Reemplazó al anterior 12VHPWR. Al conectarlo, debe entrar hasta el fondo y quedar firme, sin dobleces cerca del conector.",
  alElegir: [
    "Inserta el conector hasta el fondo y revisa que no queden contactos visibles.",
    "No dobles el cable justo al lado del conector; deja un tramo recto.",
    "Usa el cable que trae tu fuente o el de la gráfica, según indique el manual.",
  ],
  hechos: [conector12v2x6, conector12v2x6Pines],
  relacionadas: ["pcie-6-2"],
  vistas: CONECTORES,
};

const sataPoder: ParteContenido = {
  orden: 16,
  nombre: "Conector SATA de energía",
  nombreCorto: "SATA de energía",
  resumen: "Un conector plano y ancho que alimenta discos y unidades SATA. Va junto al cable de datos de la unidad.",
  queHace:
    "Entrega energía a las unidades de almacenamiento SATA. Cada unidad necesita su cable de energía de la fuente y, aparte, su cable de datos hacia la placa. Es plano y solo entra en un sentido.",
  alElegir: ["No lo confundas con el cable de datos: son cables distintos.", "Si el cable tiene varios conectores, usa los que necesites."],
  hechos: [sataPoder15Pines, sataDatosYEnergia],
  relacionadas: ["molex"],
  enlaces: [{ etiqueta: "Almacenamiento en la tarjeta madre", pieza: "tarjeta-madre", parte: "sata" }],
  vistas: CONECTORES,
};

const molex: ParteContenido = {
  orden: 17,
  nombre: "Conector Molex",
  nombreCorto: "Molex",
  alias: ["conector de periféricos"],
  resumen: "Un conector de cuatro pines de uso antiguo que hoy se ve en algunos periféricos y accesorios.",
  queHace:
    "Es un conector de energía de formato clásico, con esquinas biseladas. En equipos nuevos casi no se usa, pero algunos ventiladores, controladoras de luces y accesorios todavía lo piden.",
  alElegir: ["Conéctalo en el sentido correcto: tiene las esquinas biseladas y no debe forzarse."],
  hechos: [molexCuatroPines],
  relacionadas: ["sata-poder"],
  vistas: CONECTORES,
};

/* ---------- Secciones ---------- */
const seccionElegir: SeccionTexto = {
  id: "elegir",
  titulo: "Qué mirar al elegir una fuente de poder",
  parrafos: [
    "Antes de comprar una fuente, comprueba que tenga los conectores que piden las piezas del equipo: el principal de la placa, el del procesador, los de la tarjeta gráfica y los de las unidades de almacenamiento. La potencia necesaria se calcula con las piezas elegidas, y para eso tienes la guía de fuentes de poder del sitio.",
    "Fíjate también en el tamaño de la fuente frente a tu chasis, en si es modular o no según cuánto orden quieras dentro del equipo y en el sello de eficiencia 80 Plus, que se ve en la etiqueta.",
  ],
  vinetas: [
    "Conectores: confirma que trae los que piden la placa, el procesador y la gráfica.",
    "Gráfica: revisa si pide cables de ocho pines o el conector 12V-2x6 y que la fuente los tenga.",
    "Potencia y eficiencia: usa la guía de fuentes de poder y la etiqueta, sin calcular a ojo.",
    "Modularidad: una fuente modular deja menos cables sueltos dentro del chasis.",
  ],
  hechos: [etiquetaDatos, ochentaPlus, modularConectores, pcie62Graficas, conector12v2x6],
};

const seccionErrores: SeccionTexto = {
  id: "errores",
  titulo: "Errores comunes con la fuente de poder",
  parrafos: [
    "Estos son los tropiezos más frecuentes con la fuente de poder. Los marcados como vividos nos pasaron en el taller; los demás son riesgos conocidos.",
    "Una advertencia de seguridad antes de empezar: nunca abras una fuente de poder, aunque esté desconectada.",
  ],
  hechos: [noAbrirFuente],
};

/* ---------- Casos del taller (docs/piezas-errores-taller.md) ---------- */
const casos: readonly Caso[] = [
  {
    id: "interruptor-apagado-al-entregar",
    tipo: "vivido",
    texto:
      "entregar una torre con el interruptor de la fuente en la posición de apagado, y que el cliente escriba diciendo que no enciende. Antes de entregar y ante cualquier consulta de este tipo, revisa que el interruptor esté encendido.",
    confirmadoPorDueno: true,
    hechos: [interruptorGeneral],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "ventilador-de-la-fuente-al-reves",
    tipo: "vivido",
    texto:
      "una fuente instalada con el ventilador mirando hacia el lado equivocado, de modo que no tomaba aire y no respiraba bien. Mira dónde queda la fuente en el chasis antes de montarla.",
    confirmadoPorDueno: true,
    hechos: [ventiladorOrientacion],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "grafica-sin-cable-de-energia",
    tipo: "vivido",
    texto:
      "una tarjeta gráfica puesta en la ranura de la placa pero sin el cable de energía conectado. La gráfica no da imagen o funciona mal. Conecta todos los cables de energía que pida la gráfica.",
    confirmadoPorDueno: true,
    hechos: [pcie62Graficas],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "un-cable-por-conector-de-la-grafica",
    tipo: "vivido",
    texto:
      "una gráfica con varios conectores de ocho pines alimentada con un solo cable que se ramifica. En el taller preferimos un cable independiente de la fuente para cada conector, siempre que el manual de la gráfica o de la fuente lo recomiende.",
    confirmadoPorDueno: true,
    hechos: [pcie8PinesIndependientes],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "conector-12v-2x6-a-medias",
    tipo: "puede-pasar",
    texto:
      "que el conector 12V-2x6 de la gráfica no quede insertado por completo. Debe entrar hasta el fondo y quedar firme, sin dobleces fuertes junto al conector.",
    hechos: [conector12v2x6, conector12v2x6Pines],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "eps-y-pcie-confundidos",
    tipo: "puede-pasar",
    texto:
      "enchufar el cable EPS del procesador en la gráfica, o el cable PCIe de la gráfica en el conector del procesador, porque se parecen. No son intercambiables: usa el cable marcado para cada pieza.",
    hechos: [epsVsPcieGrafica],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "sata-mal-conectado",
    tipo: "puede-pasar",
    texto:
      "conectar mal el cable de datos o el de energía SATA de una unidad: la unidad no aparece o no enciende. Cada unidad necesita los dos, y no son el mismo cable.",
    hechos: [sataDatosYEnergia],
    aprobadoEn: null,
    aprobadoPor: null,
  },
  {
    id: "cables-modulares-de-otra-fuente",
    tipo: "puede-pasar",
    texto:
      "usar cables modulares de otra fuente porque el conector parece igual. El orden de los pines puede cambiar y se pueden dañar las piezas. Usa solo los cables del modelo de tu fuente.",
    hechos: [modularNoMezclar],
    aprobadoEn: null,
    aprobadoPor: null,
  },
];

export const FUENTE_DE_PODER_CONTENIDO: PiezaContenido<FuenteParteId, FuenteVistaId> = {
  slug: "fuente-de-poder",
  estado: "borrador",
  piezaServicios: "fuentes",
  nombreCorto: "Fuente de poder",
  titulo: "Fuente de poder: partes por dentro y conectores",
  descripcion: "Conoce la fuente de poder por fuera, por dentro y sus conectores: ATX, EPS, PCIe y SATA. Qué revisar antes de elegir y de armar tu PC.",
  h1: "La fuente de poder por fuera, por dentro y sus conectores",
  eyebrow: "piezas del PC",
  intro: [
    "La fuente de poder (también llamada PSU o fuente de alimentación) convierte la corriente alterna del tomacorriente en las tensiones continuas que usan las piezas del PC. Es la que alimenta la placa, el procesador, la tarjeta gráfica y las unidades de almacenamiento.",
    "Cambia entre las vistas para verla por fuera, por dentro y con sus conectores, y toca cada parte para ver qué hace. La vista por dentro es solo para entender: nunca abras una fuente.",
  ],
  palabrasClave: [
    "partes de la fuente de poder",
    "conectores de la fuente de poder",
    "fuente de poder por dentro",
    "cable EPS y PCIe",
    "conector 12V-2x6",
    "fuente modular",
    "qué es 80 Plus",
    "mi PC no enciende",
    "cómo elegir una fuente de poder",
  ],
  terminos: ["ATX", "EPS", "PCIe", "PCIe 6+2", "SATA", "Molex", "PFC", "EMI", "AC", "12V-2x6", "12VHPWR", "80 Plus", "24 pines"],
  sinonimos: ["PSU", "fuente de alimentación"],
  publicadoEn: null,
  actualizadoEn: "2026-10-14",
  bloques: ["partes", "lista", "vistas", "elegir", "errores", "preguntas"],
  vistas: [
    {
      id: "por-fuera",
      etiqueta: "Por fuera",
      resumen: "La fuente vista desde afuera: la rejilla con su ventilador, la entrada de corriente, el interruptor, el banco de conectores modulares y la etiqueta.",
      etiquetaFigura: "Dibujo esquemático de una fuente de poder por fuera. La etiqueta va en otra cara y se muestra desplegada junto a la entrada de corriente. La forma y la ubicación de cada parte cambian según el modelo.",
    },
    {
      id: "por-dentro",
      etiqueta: "Por dentro",
      resumen:
        "Las etapas internas de la fuente, dibujadas solo para entender cómo funciona. Importante: no abras tu fuente. Sus condensadores pueden conservar carga peligrosa aunque esté desconectada.",
      etiquetaFigura:
        "Dibujo esquemático del interior de una fuente de poder, solo para explicar. No abras tu fuente: sus condensadores pueden conservar carga peligrosa aunque esté desconectada.",
    },
    {
      id: "conectores",
      etiqueta: "Conectores",
      resumen: "Los cables de la fuente que se conectan a las piezas: el principal de la placa, el del procesador, los de la gráfica y los de las unidades.",
      etiquetaFigura: "Dibujo esquemático de los conectores de una fuente de poder. El número de pines y la forma de la traba son ilustrativos.",
    },
  ],
  selectorVistas: "Elige la vista de la fuente",
  partes: {
    "rejilla-ventilador": rejillaVentilador,
    "entrada-ac": entradaAc,
    interruptor,
    "banco-modular": bancoModular,
    etiqueta,
    "filtro-emi": filtroEmi,
    rectificador,
    pfc,
    "condensadores-primarios": condensadoresPrimarios,
    transformador,
    "salida-secundaria": salidaSecundaria,
    "atx-24": atx24,
    "eps-cpu": epsCpu,
    "pcie-6-2": pcie62,
    "12v-2x6": doceV2x6,
    "sata-poder": sataPoder,
    molex,
  },
  secciones: [seccionElegir, seccionErrores],
  casos,
  faq: [
    {
      q: "¿Por qué mi PC no enciende?",
      a: "Antes de pensar en una pieza dañada, revisa tres cosas simples: que el cable de corriente esté bien conectado, que el tomacorriente tenga energía y que el interruptor de la fuente, junto a la entrada de corriente, esté en la posición de encendido. En el taller hemos recibido consultas que se resolvieron solo con ese interruptor.",
    },
    {
      q: "¿Puedo abrir la fuente para limpiarla o repararla?",
      a: "No. Los condensadores del interior pueden conservar carga peligrosa aunque la fuente esté desconectada. Limpia solo por fuera, con la fuente desconectada, y si falla llévala a servicio técnico o cámbiala.",
    },
    {
      q: "¿Puedo usar los cables modulares de otra fuente?",
      a: "No lo hagas. Aunque el conector parezca igual, el orden de los pines puede cambiar de un modelo a otro y se pueden dañar las piezas. Usa solo los cables que vienen con tu fuente.",
    },
    {
      q: "¿El cable del procesador y el de la gráfica son el mismo?",
      a: "No. Se parecen, pero no son intercambiables. El cable EPS va al procesador y el cable PCIe va a la tarjeta gráfica. Cada uno viene marcado en la fuente.",
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
