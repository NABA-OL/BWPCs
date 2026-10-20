/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contenido de /piezas/tarjeta-grafica (docs/piezas-plan-2.md §3.6). ESTADO: BORRADOR; ningún hecho propio está verificado.
// Reglas: prosa sin cifras (salvo nombres de estándar en `terminos`); toda cifra vive en un `Hecho` con fuente; el texto de un caso continúa su rótulo.
// NVIDIA, AMD e Intel aparecen solo como chips de texto (sin logos ni dibujos por marca). Lo que el dueño dijo de memoria va en la `nota` del hecho.
// El dibujo (`geo`) llega después: mientras tanto la pieza se revisa sin figura.
import { conector12v2x6, epsVsPcieGrafica, pcie62Graficas, pcieAnchoBandaGeneraciones, pcieCompatibilidadAtras, pcieTamanosFisicos, pcieX16DesdeProcesador, videoRequiereGraficosIntegrados } from "./comun.hechos.ts";
import { conRevision, hecho, verificadoPorDueno } from "./constructores.ts";
import type { Caso, Criterio, ParteContenido, PiezaContenido, SeccionTexto, TarjetaGraficaParteId, TarjetaGraficaVistaId } from "./types.ts";

const ARMADA = ["armada"] as const;
const PLACA = ["placa"] as const;
const AMBAS = ["armada", "placa"] as const;

/* ---------- Hechos propios de la tarjeta gráfica (todos pendientes de verificación) ---------- */
const vramNombres = conRevision(
  verificadoPorDueno(
    hecho(
      "gr-vram-nombres",
      "La memoria de video de las tarjetas gráficas se nombra por su tipo: GDDR6, GDDR6X y GDDR7 son los tipos que aparecen en las tarjetas actuales.",
      [
        { titulo: "Memoria gráfica de Micron (GDDR6, GDDR6X y GDDR7)", editor: "Micron", url: "https://www.micron.com/products/memory/graphics-memory", consultadoEn: "2026-10-15" },
        { titulo: "NVIDIA GeForce RTX 5090: ficha del modelo", editor: "NVIDIA", url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/", consultadoEn: "2026-10-15" },
      ],
      "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const fabricantesDelChip = conRevision(
  verificadoPorDueno(
    hecho(
      "gr-fabricantes-chip",
      "NVIDIA, AMD e Intel diseñan los chips gráficos y venden tarjetas propias (en NVIDIA, las Founders Edition). Además, varias ensambladoras ofrecen tarjetas con esos chips en diseños propios, con distinto disipador, cantidad de ventiladores, refrigeración líquida o formato de bajo perfil.",
      [
        { titulo: "NVIDIA GeForce: tarjetas gráficas", editor: "NVIDIA", url: "https://www.nvidia.com/en-us/geforce/graphics-cards/", consultadoEn: "2026-10-15" },
        { titulo: "Nuevas tarjetas gráficas y portátiles GeForce RTX 50 (anuncio)", editor: "NVIDIA", url: "https://www.nvidia.com/en-us/geforce/news/rtx-50-series-graphics-cards-gpu-laptop-announcements/", consultadoEn: "2026-10-15" },
        { titulo: "AMD Radeon RX Graphics Cards", editor: "AMD", url: "https://www.amd.com/en/products/graphics/desktops/radeon.html", consultadoEn: "2026-10-15" },
        { titulo: "Gráficos dedicados Intel Arc", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/details/discrete-gpus/arc.html", consultadoEn: "2026-10-15" },
      ],
      "Decisión de NB (2026-10-19, hoja tarjeta-grafica): ajustar. ajustado por NB (2026-10-19): se evita decir «su propio disipador y ventiladores». Las Founders Edition, y que cada ensambladora varíe el diseño, son conocimiento de NB; NVIDIA y AMD solo respaldan la existencia de socios.",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const marcaNvidia = conRevision(
  verificadoPorDueno(
    hecho(
      "gr-marca-nvidia-geforce",
      "NVIDIA vende sus tarjetas gráficas para escritorio bajo la marca GeForce.",
      [
        { titulo: "NVIDIA GeForce: tarjetas gráficas", editor: "NVIDIA", url: "https://www.nvidia.com/en-us/geforce/graphics-cards/", consultadoEn: "2026-10-15" },
      ],
      "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const marcaAmd = conRevision(
  verificadoPorDueno(
    hecho("gr-marca-amd-radeon", "AMD vende sus tarjetas gráficas para escritorio bajo la marca Radeon.", [
        { titulo: "AMD Radeon RX Graphics Cards", editor: "AMD", url: "https://www.amd.com/en/products/graphics/desktops/radeon.html", consultadoEn: "2026-10-15" },
      ], "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada"),
    "2026-10-19",
    "NB",
  ),
  6,
);
const marcaIntel = conRevision(
  verificadoPorDueno(
    hecho(
      "gr-marca-intel-arc",
      "Intel vende sus tarjetas gráficas dedicadas bajo la marca Arc.",
      [
        { titulo: "Gráficos dedicados Intel Arc", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/details/discrete-gpus/arc.html", consultadoEn: "2026-10-15" },
      ],
      "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const ranura75w = verificadoPorDueno(
  hecho(
    "gr-ranura-pcie-75w",
    "La ranura PCIe x16 entrega a la tarjeta hasta 75 W; si la tarjeta consume más, el resto debe llegar por sus conectores de energía.",
    [
      { titulo: "ATX Version 3 Multi Rail Desktop Platform Power Supply Design Guide (336521, Rev. 2.1a, alineada con ATX 3.1)", editor: "Intel", url: "https://cdrdv2-public.intel.com/336521/336521_Rev2p1a.pdf", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const conectoresSeisOchoPines = verificadoPorDueno(
  hecho(
    "gr-conectores-6-y-8-pines-potencia",
    "Un conector PCIe de seis pines entrega hasta 75 W y uno de ocho pines hasta 150 W, según la especificación de PCI-SIG.",
    [
      { titulo: "ATX Version 3 Multi Rail Desktop Platform Power Supply Design Guide (336521, Rev. 2.1a, alineada con ATX 3.1)", editor: "Intel", url: "https://cdrdv2-public.intel.com/336521/336521_Rev2p1a.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Which PSU cables go where?", editor: "Corsair", url: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/which-psu-cables-go-where/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const cablesIndependientes = verificadoPorDueno(
  hecho(
    "gr-cables-independientes-por-conector",
    "Lo más recomendable es conectar cada conector de alimentación de la tarjeta con un cable independiente de la fuente. Se puede usar un solo cable con varias salidas si la fuente solo trae ese, y algunos fabricantes de fuentes lo aceptan en sus propios modelos, pero es una recomendación de seguridad para evitar que el cable se caliente de más y para no dañar la tarjeta ni la fuente. Sigue la guía de tu tarjeta y de tu fuente.",
    [
      { titulo: "Guía de inicio rápido GeForce RTX 5090", editor: "NVIDIA", url: "https://www.nvidia.com/content/geforce-gtx/GeForce_RTX_5090_User_Guide_Rev1.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Guía de inicio rápido GeForce RTX 5080", editor: "NVIDIA", url: "https://www.nvidia.com/content/geforce-gtx/GeForce_RTX_5080_User_Guide_Rev1.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Individual 8-pin vs pigtail connectors for GPUs", editor: "Corsair", url: "https://www.corsair.com/ww/pl/explorer/diy-builder/power-supply-units/individual-8-pin-vs-pigtail-connectors-for-gpus/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja tarjeta-grafica): ajustar. ajustado por NB (2026-10-19): la recomendación es de seguridad. Lo del daño y el sobrecalentamiento es criterio de NB; NVIDIA solo lo indica para el adaptador de sus tarjetas.",
  ),
  "2026-10-19",
  "NB",
);
const insertarPorCompleto = conRevision(
  verificadoPorDueno(
    hecho(
      "gr-12v2x6-insertar-por-completo",
      "El conector de doce pines de la tarjeta (12V-2x6) debe quedar insertado por completo, hasta el fondo y a ras del receptáculo de la tarjeta, como indica NVIDIA: al empujarlo ya no debe avanzar más. El seguro tiene que quedar asegurado; si queda suelto o sin cerrar, falta empujar. Revisa la guía de tu tarjeta y de tu fuente.",
      [
        { titulo: "Guía de inicio rápido GeForce RTX 5090", editor: "NVIDIA", url: "https://www.nvidia.com/content/geforce-gtx/GeForce_RTX_5090_User_Guide_Rev1.pdf", consultadoEn: "2026-10-15" },
        { titulo: "Guía de inicio rápido GeForce RTX 5080", editor: "NVIDIA", url: "https://www.nvidia.com/content/geforce-gtx/GeForce_RTX_5080_User_Guide_Rev1.pdf", consultadoEn: "2026-10-15" },
      ],
      "Decisión de NB (2026-10-19, hoja tarjeta-grafica): ajustar. ajustado por NB (2026-10-19). Tensión sin resolver: NB dice que con algunos cables puede verse un espacio; NVIDIA indica «a ras del receptáculo» y se dejó eso. El caso conector-de-doce-pines-a-medias repite «sin espacio visible»: revisarlo cuando se decidan los casos.",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const potencia600w = conRevision(
  verificadoPorDueno(
    hecho(
      "gr-12v2x6-potencia",
      "Un solo cable 12V-2x6 puede alimentar tarjetas que de otro modo necesitarían varios conectores de ocho pines; el fabricante indica en la ficha de cada modelo cuál usar.",
      [
        { titulo: "NVIDIA GeForce RTX 5090: ficha del modelo", editor: "NVIDIA", url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/", consultadoEn: "2026-10-15" },
        { titulo: "Guía de inicio rápido GeForce RTX 5090", editor: "NVIDIA", url: "https://www.nvidia.com/content/geforce-gtx/GeForce_RTX_5090_User_Guide_Rev1.pdf", consultadoEn: "2026-10-15" },
        { titulo: "ATX Version 3 Multi Rail Desktop Platform Power Supply Design Guide (336521, Rev. 2.1a, alineada con ATX 3.1)", editor: "Intel", url: "https://cdrdv2-public.intel.com/336521/336521_Rev2p1a.pdf", consultadoEn: "2026-10-15" },
      ],
      "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const largoChasis = verificadoPorDueno(
  hecho(
    "gr-largo-maximo-chasis",
    "Los fabricantes de chasis indican el largo máximo de tarjeta gráfica que admite cada modelo, y los de tarjetas indican el largo de cada una; se comparan antes de comprar.",
    [
      { titulo: "Fractal Design North: especificaciones del chasis", editor: "Fractal Design", url: "https://www.fractal-design.com/products/cases/north/north/charcoal-black/", consultadoEn: "2026-10-15" },
      { titulo: "NVIDIA GeForce RTX 5090: ficha del modelo", editor: "NVIDIA", url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/", consultadoEn: "2026-10-15" },
      { titulo: "Guía de inicio rápido GeForce RTX 5090", editor: "NVIDIA", url: "https://www.nvidia.com/content/geforce-gtx/GeForce_RTX_5090_User_Guide_Rev1.pdf", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const grosorEnRanuras = verificadoPorDueno(
  hecho(
    "gr-grosor-en-ranuras",
    "Las fichas de las tarjetas gráficas indican cuántas ranuras de expansión ocupan en grosor, y algunas recomiendan dejar libre una ranura más.",
    [
      { titulo: "NVIDIA GeForce RTX 5090: ficha del modelo", editor: "NVIDIA", url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/", consultadoEn: "2026-10-15" },
      { titulo: "Guía de inicio rápido GeForce RTX 5090", editor: "NVIDIA", url: "https://www.nvidia.com/content/geforce-gtx/GeForce_RTX_5090_User_Guide_Rev1.pdf", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const potenciaFuente = verificadoPorDueno(
  hecho(
    "gr-potencia-fuente-recomendada",
    "El fabricante de cada tarjeta publica la potencia de fuente recomendada y los conectores de energía que necesita; esos datos están en la ficha del modelo.",
    [
      { titulo: "NVIDIA GeForce RTX 5090: ficha del modelo", editor: "NVIDIA", url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/", consultadoEn: "2026-10-15" },
      { titulo: "Guía de inicio rápido GeForce RTX 5090", editor: "NVIDIA", url: "https://www.nvidia.com/content/geforce-gtx/GeForce_RTX_5090_User_Guide_Rev1.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Guía de inicio rápido GeForce RTX 5080", editor: "NVIDIA", url: "https://www.nvidia.com/content/geforce-gtx/GeForce_RTX_5080_User_Guide_Rev1.pdf", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja tarjeta-grafica): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);

/* ---------- Partes ---------- */
const ventiladores: ParteContenido = {
  orden: 1,
  nombre: "Ventiladores",
  nombreCorto: "Ventiladores",
  alias: ["fans", "ventilación de la tarjeta"],
  resumen: "Mueven aire a través del disipador para sacar el calor de la tarjeta. Su cantidad y su tamaño cambian según el modelo.",
  queHace:
    "Los ventiladores empujan aire por las aletas del disipador y lo sacan de la tarjeta. La propia tarjeta los controla: no dependen de un cabezal de la placa. Una tarjeta con más ventiladores suele ser más larga o más gruesa, así que importan para saber si cabe en el chasis.",
  alElegir: [
    "Compara el largo y el grosor de la tarjeta con el espacio del chasis, no solo la cantidad de ventiladores.",
    "Deja aire libre frente a los ventiladores: un cable o un ventilador del chasis muy cerca los estorba.",
    "En chasis pequeños, busca modelos compactos pensados para ese espacio.",
  ],
  hechos: [],
  relacionadas: ["disipador", "carcasa"],
  vistas: ARMADA,
};

const carcasa: ParteContenido = {
  orden: 2,
  nombre: "Carcasa",
  nombreCorto: "Carcasa",
  alias: ["cubierta", "shroud"],
  resumen: "La cubierta exterior de la tarjeta. Da forma al conjunto y guía el aire de los ventiladores hacia el disipador.",
  queHace:
    "La carcasa cubre el disipador y sostiene los ventiladores. Su diseño es sobre todo estético y de flujo de aire, y define las medidas finales de la tarjeta: largo, alto y grosor. Es la parte que ves a través del panel de vidrio del chasis.",
  alElegir: [
    "Mira las medidas finales de la tarjeta en la ficha del fabricante, no solo el tamaño del chip.",
    "Si tu chasis tiene panel de vidrio, ten en cuenta cómo se verá la carcasa y la iluminación.",
    "Revisa que el cable de energía tenga espacio para conectarse sin doblarse contra el panel.",
  ],
  hechos: [largoChasis],
  relacionadas: ["ventiladores", "disipador", "bracket"],
  vistas: ARMADA,
};

const disipador: ParteContenido = {
  orden: 3,
  nombre: "Disipador",
  nombreCorto: "Disipador",
  alias: ["heatsink", "bloque de aletas"],
  resumen: "Un bloque de metal con aletas y tubos que se lleva el calor del chip, de la memoria y del VRM hacia el aire de los ventiladores.",
  queHace:
    "El disipador toca el chip gráfico, la memoria y el VRM, absorbe su calor y lo reparte por las aletas, donde el aire de los ventiladores lo retira. Se ve al quitar la carcasa. Su tamaño es una de las razones por las que las tarjetas ocupan varias ranuras.",
  alElegir: [
    "Un disipador más grande suele implicar una tarjeta más gruesa: confirma que no tape ranuras que necesitas.",
    "Si vas a mover el equipo con frecuencia, revisa que la tarjeta quede bien sujeta, porque el disipador añade peso.",
    "No abras ni quites el disipador por tu cuenta: es una pieza delicada y puede afectar el contacto con el chip.",
  ],
  hechos: [],
  relacionadas: ["ventiladores", "chip-grafico", "vrm"],
  vistas: ARMADA,
};

const backplate: ParteContenido = {
  orden: 4,
  nombre: "Placa trasera (backplate)",
  nombreCorto: "Backplate",
  alias: ["placa de refuerzo"],
  resumen: "Una lámina que cubre la parte trasera de la placa. Protege los componentes y refuerza la tarjeta; en muchos modelos ayuda a disipar calor.",
  queHace:
    "El backplate cubre la cara de la placa que queda hacia el panel lateral del chasis. Protege los componentes de golpes al instalar y le da rigidez a una tarjeta larga y pesada. En algunos modelos también toca la placa por detrás y ayuda a retirar calor.",
  alElegir: [
    "Una tarjeta pesada puede quedar sostenida solo por la ranura y el bracket; algunos chasis o accesorios traen un soporte adicional.",
    "Revisa que el backplate no choque con el disipador de torre ni con la tapa de la placa si el espacio es justo.",
  ],
  hechos: [],
  relacionadas: ["carcasa", "conector-pcie"],
  vistas: ARMADA,
};

const bracket: ParteContenido = {
  orden: 5,
  nombre: "Bracket de salidas de video",
  nombreCorto: "Bracket",
  alias: ["escuadra", "salidas HDMI y DisplayPort", "panel de conexión"],
  resumen: "La escuadra metálica que se atornilla al chasis y donde están las salidas de video de la tarjeta. Aquí se conecta el monitor.",
  queHace:
    "El bracket asegura la tarjeta al chasis con tornillos y concentra las salidas de video, como HDMI y DisplayPort, hacia la parte trasera. Cuando la tarjeta es gruesa, el bracket cubre más de una ranura de expansión del chasis.",
  alElegir: [
    "Conecta el monitor a las salidas de la tarjeta gráfica, no a las de la placa, cuando tienes tarjeta dedicada.",
    "Cuenta las salidas que necesitas y revisa que coincidan con las entradas de tus monitores (HDMI o DisplayPort).",
    "Verifica cuántas ranuras del chasis ocupa el bracket antes de comprar otras tarjetas de expansión.",
  ],
  hechos: [grosorEnRanuras, videoRequiereGraficosIntegrados],
  relacionadas: ["conector-pcie", "carcasa"],
  enlaces: [{ etiqueta: "Las salidas de video de la placa", pieza: "tarjeta-madre", parte: "puertos-traseros" }],
};

const conectorEnergia: ParteContenido = {
  orden: 6,
  nombre: "Conector de energía",
  nombreCorto: "Energía",
  alias: ["alimentación auxiliar", "conectores PCIe de poder", "12V-2x6", "ocho pines"],
  resumen: "Aquí llega la energía extra desde la fuente. Según el modelo, es uno o varios conectores de ocho pines, o un único conector de doce pines.",
  queHace:
    "La ranura PCIe de la placa entrega una parte limitada de la energía; el resto llega por estos conectores, desde cables de la fuente. Los conectores de ocho pines usan el cable PCIe de la fuente, y los modelos nuevos usan un conector de doce pines, el 12V-2x6. No se pueden mezclar con el cable del procesador, aunque se parezcan.",
  alElegir: [
    "Revisa qué conectores de energía trae la tarjeta y confirma que tu fuente tiene cables para todos.",
    "Lo más recomendable es un cable independiente de la fuente para cada conector; si tu fuente solo trae un cable con varias salidas, sigue la guía de la tarjeta y de la fuente.",
    "Conecta el cable de doce pines hasta el fondo, hasta que ya no avance y el seguro quede asegurado, y evita doblarlo justo al lado del conector.",
    "No uses el cable EPS del procesador en este conector, aunque se parezca.",
    "Consulta la potencia de fuente que recomienda el fabricante de la tarjeta.",
  ],
  hechos: [pcie62Graficas, conectoresSeisOchoPines, cablesIndependientes, conector12v2x6, insertarPorCompleto, potencia600w, epsVsPcieGrafica],
  relacionadas: ["conector-pcie", "vrm"],
  enlaces: [
    { etiqueta: "El cable PCIe de ocho pines en la fuente de poder", pieza: "fuente-de-poder", parte: "pcie-6-2" },
    { etiqueta: "El conector 12V-2x6 en la fuente de poder", pieza: "fuente-de-poder", parte: "12v-2x6" },
  ],
};

const conectorPcie: ParteContenido = {
  orden: 7,
  nombre: "Conector PCIe de la tarjeta",
  nombreCorto: "Borde PCIe",
  alias: ["borde dorado", "contactos de la ranura", "dedos dorados"],
  resumen: "Los contactos dorados del borde inferior de la tarjeta. Encajan en la ranura PCIe x16 de la placa y llevan los datos y parte de la energía.",
  queHace:
    "Es la franja de contactos que entra en la ranura PCIe x16 de la tarjeta madre y comunica la tarjeta con el procesador. También recibe de la ranura una parte de la energía. Una pestaña de la ranura y el bracket la sostienen en su sitio.",
  alElegir: [
    "Usa la ranura x16 principal de la placa, la más larga y cercana al procesador.",
    "Una tarjeta de una generación de PCIe más nueva funciona en una ranura más antigua, limitada por la generación menor.",
    "Inserta la tarjeta recta y hasta que la pestaña de la ranura asegure; revisa que no quede inclinada.",
  ],
  hechos: [pcieTamanosFisicos, pcieAnchoBandaGeneraciones, pcieCompatibilidadAtras, pcieX16DesdeProcesador, ranura75w],
  relacionadas: ["conector-energia", "bracket"],
  enlaces: [{ etiqueta: "La ranura PCIe principal de la tarjeta madre", pieza: "tarjeta-madre", parte: "pcie-principal" }],
};

const chipGrafico: ParteContenido = {
  orden: 8,
  nombre: "Chip gráfico (GPU)",
  nombreCorto: "Chip",
  alias: ["GPU", "procesador gráfico", "núcleo gráfico"],
  resumen: "El chip que dibuja la imagen y hace los cálculos de gráficos. Está bajo el disipador, en el centro de la placa de la tarjeta.",
  queHace:
    "El chip gráfico (GPU) procesa los gráficos de los juegos, del video y de la edición, y con frecuencia también trabajos de cálculo en paralelo. Es la pieza que más calor genera en la tarjeta, por eso lleva el disipador encima. Un mismo chip se vende en tarjetas del propio fabricante del chip y en diseños de varias ensambladoras, cada una con su disipador y su número de ventiladores.",
  alElegir: [
    "Compara tarjetas por la ficha técnica y por pruebas independientes del modelo exacto, no por el nombre de la marca.",
    "Confirma que la tarjeta que eliges es compatible con tu fuente y tu chasis, además de con tu procesador.",
    "Revisa si el chip y la tarjeta traen las salidas de video que necesitas.",
  ],
  hechos: [fabricantesDelChip],
  opciones: {
    titulo: "Fabricantes del chip gráfico",
    items: [
      {
        id: "nvidia",
        etiqueta: "NVIDIA",
        marca: "NVIDIA",
        resumen: "Diseña los chips de la línea GeForce y vende tarjetas propias; varias ensambladoras ofrecen tarjetas con esos chips.",
        vigente: true,
        hechos: [marcaNvidia],
      },
      {
        id: "amd",
        etiqueta: "AMD",
        marca: "AMD",
        resumen: "Diseña los chips de la línea Radeon y vende tarjetas propias; varias ensambladoras ofrecen tarjetas con esos chips.",
        vigente: true,
        hechos: [marcaAmd],
      },
      {
        id: "intel",
        etiqueta: "Intel",
        marca: "Intel",
        resumen: "Diseña los chips de la línea Arc y vende tarjetas propias; varias ensambladoras ofrecen tarjetas con esos chips.",
        vigente: true,
        hechos: [marcaIntel],
      },
    ],
  },
  relacionadas: ["memoria-vram", "vrm", "disipador"],
  vistas: PLACA,
};

const memoriaVram: ParteContenido = {
  orden: 9,
  nombre: "Memoria de video (VRAM)",
  nombreCorto: "VRAM",
  alias: ["memoria gráfica", "memoria de la tarjeta", "GDDR"],
  resumen: "Los chips de memoria que rodean al chip gráfico. Guardan las texturas y los datos de imagen que la tarjeta necesita a mano.",
  queHace:
    "La VRAM es la memoria propia de la tarjeta, separada de la RAM del equipo. Guarda las texturas, los modelos y las imágenes en proceso. Va soldada alrededor del chip y comparte el disipador con él. Su tipo se nombra GDDR, seguido de un número de versión.",
  alElegir: [
    "Mira la cantidad de VRAM y su tipo en la ficha, junto con el chip: ninguno de los dos datos basta por sí solo.",
    "Piensa en la resolución del monitor y en el uso: juegos, edición o trabajo con modelos pesados piden cantidades distintas.",
    "La VRAM no se puede ampliar después: se elige al comprar la tarjeta.",
  ],
  hechos: [vramNombres],
  relacionadas: ["chip-grafico", "vrm"],
  vistas: PLACA,
};

const vrmTarjeta: ParteContenido = {
  orden: 10,
  nombre: "VRM de la tarjeta",
  nombreCorto: "VRM",
  alias: ["regulador de voltaje", "fases de alimentación de la tarjeta"],
  resumen: "Convierte la energía que llega por los conectores al voltaje que usan el chip y la memoria. Suele verse como filas de componentes junto al chip.",
  queHace:
    "El VRM de la tarjeta toma la energía de los conectores de la fuente y de la ranura, y la adapta al voltaje que necesitan el chip y la memoria, de forma estable aunque el consumo suba y baje. Se calienta bajo carga, por eso el disipador también lo toca.",
  alElegir: [
    "No compares tarjetas solo por la cantidad de fases que anuncian: ese número no dice por sí solo cuánto aguanta.",
    "Si el equipo trabaja a plena carga durante horas, prioriza un buen flujo de aire dentro del chasis.",
  ],
  hechos: [],
  relacionadas: ["conector-energia", "chip-grafico", "memoria-vram"],
  enlaces: [{ etiqueta: "El VRM de la tarjeta madre", pieza: "tarjeta-madre", parte: "vrm" }],
  vistas: PLACA,
};

/* ---------- Secciones, casos y criterios ---------- */
const seccionElegir: SeccionTexto = {
  id: "elegir",
  titulo: "Qué mirar al elegir una tarjeta gráfica",
  parrafos: [
    "La tarjeta gráfica se elige junto con el resto del equipo, no sola. Antes de decidir por el chip, comprueba que la tarjeta cabe en el chasis, que tu fuente tiene los cables que pide y que la placa tiene la ranura x16 para instalarla.",
    "Después revisa qué salidas de video necesitas y qué monitor vas a usar, porque de eso depende qué tarjeta te sirve.",
  ],
  vinetas: [
    "Largo y grosor de la tarjeta frente al espacio del chasis.",
    "Conectores de energía de la tarjeta frente a los cables de tu fuente, y la potencia de fuente que recomienda el fabricante.",
    "Ranura PCIe x16 libre en la placa, junto con el espacio que dejan los demás componentes.",
    "Salidas de video de la tarjeta frente a las entradas de tus monitores.",
    "Disponibilidad de soporte y de actualización de controladores para el modelo que elijas.",
  ],
  hechos: [potenciaFuente],
};

const seccionErrores: SeccionTexto = {
  id: "errores",
  titulo: "Errores comunes con la tarjeta gráfica",
  parrafos: [
    "Estos son errores que aparecen una y otra vez al armar un equipo con tarjeta gráfica. Los marcados «Nos ha pasado» son situaciones del taller; los marcados «Puede pasar» son riesgos conocidos.",
    "Un error frecuente que ya vemos en la tarjeta madre es conectar el monitor a la salida de la placa en lugar de la de la tarjeta gráfica: revísalo en el bracket de la tarjeta y en los puertos traseros de la placa.",
  ],
};

const casos: readonly Caso[] = [
  {
    id: "grafica-sin-cable-de-energia",
    tipo: "vivido",
    texto:
      "una tarjeta gráfica instalada en la ranura PCIe de la placa, pero sin el cable de alimentación de la fuente conectado. La ranura sola no cubre lo que consume una tarjeta con conectores de energía: conecta cada uno antes de cerrar el chasis.",
    confirmadoPorDueno: true,
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
    hechos: [ranura75w],
  },
  {
    id: "grafica-demasiado-larga-para-el-chasis",
    tipo: "vivido",
    texto:
      "una tarjeta gráfica de tres ventiladores tan larga para el chasis que no entraba o había que improvisar, por ejemplo quitando un ventilador frontal. Compara el largo de la tarjeta con el largo máximo que indica el chasis antes de comprar.",
    confirmadoPorDueno: true,
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
    hechos: [largoChasis],
  },
  {
    id: "cable-ramificado-en-varios-conectores",
    tipo: "puede-pasar",
    texto:
      "alimentar una tarjeta con varios conectores de ocho pines con un solo cable que se ramifica. Si la fuente solo trae un cable así, puede usarse, pero lo más recomendable es un cable independiente de la fuente para cada conector, para que el cable no se caliente de más. Confirma en la guía de tu tarjeta o de tu fuente qué cables admite.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
    hechos: [cablesIndependientes],
  },
];

const criterios: readonly Criterio[] = [
  {
    id: "revisar-largo-antes-de-confirmar",
    texto: "Antes de confirmar una combinación, comparamos el largo y el grosor de la tarjeta con las medidas máximas que indica el chasis.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
];

/* ---------- Contenido ---------- */
export const TARJETA_GRAFICA_CONTENIDO: PiezaContenido<TarjetaGraficaParteId, TarjetaGraficaVistaId> = {
  slug: "tarjeta-grafica",
  estado: "publicado",
  piezaServicios: "graficas",
  nombreCorto: "Tarjeta gráfica",
  titulo: "Partes de la tarjeta gráfica y para qué sirven",
  descripcion: "Toca cada parte de una tarjeta gráfica, armada y sin carcasa: ventiladores, chip, memoria, VRM y conectores. Qué revisar antes de elegir una.",
  h1: "Las partes de la tarjeta gráfica",
  eyebrow: "piezas del PC",
  intro: [
    "La tarjeta gráfica (también llamada tarjeta de video) es la pieza que dibuja la imagen que ves en el monitor. Se instala en la ranura PCIe x16 de la placa, recibe energía extra directamente de la fuente y trae su propio chip, su propia memoria y su propio sistema de enfriamiento.",
    "Toca cada parte del dibujo para ver qué hace y qué mirar al elegirla, primero con la tarjeta armada y luego sin la carcasa.",
  ],
  palabrasClave: [
    "partes de la tarjeta gráfica",
    "para qué sirve cada parte de la GPU",
    "cómo elegir una tarjeta gráfica",
    "conectores de la tarjeta gráfica",
    "VRAM",
    "NVIDIA, AMD e Intel",
    "conector 12V-2x6",
  ],
  terminos: ["GPU", "VRAM", "VRM", "PCIe", "PCIe x16", "x16", "GDDR6", "GDDR6X", "GDDR7", "12V-2x6", "HDMI", "DisplayPort", "NVIDIA", "AMD", "Intel", "GeForce", "Radeon", "Arc"],
  sinonimos: ["tarjeta de video"],
  publicadoEn: null,
  actualizadoEn: "2026-10-20",
  bloques: ["partes", "lista", "vistas", "elegir", "errores", "preguntas"],
  vistas: [
    {
      id: "armada",
      etiqueta: "Armada",
      resumen: "La tarjeta gráfica completa, con carcasa, ventiladores y bracket, como se ve al sacarla de la caja.",
      etiquetaFigura: "Dibujo esquemático de una tarjeta gráfica armada. Los dos tipos de conector de energía se dibujan juntos solo para distinguirlos: una tarjeta real trae uno u otro. La placa trasera (backplate) se muestra separada, hacia abajo. Las proporciones son ilustrativas.",
      notasPorParte: {
        "chip-grafico": "El chip gráfico queda bajo el disipador: míralo en la vista sin carcasa.",
        "memoria-vram": "Los chips de memoria quedan bajo el disipador: míralos en la vista sin carcasa.",
        vrm: "El VRM queda bajo el disipador: míralo en la vista sin carcasa.",
      },
    },
    {
      id: "placa",
      etiqueta: "Sin carcasa",
      resumen: "La placa de la tarjeta sin carcasa ni disipador: el chip, la memoria y el VRM a la vista.",
      etiquetaFigura: "Dibujo esquemático de la placa de una tarjeta gráfica sin carcasa. La ubicación de cada componente cambia según el modelo.",
      notasPorParte: {
        ventiladores: "En esta vista se quitó la carcasa con los ventiladores: míralos en la vista armada.",
        carcasa: "En esta vista se quitó la carcasa: mírala en la vista armada.",
        disipador: "En esta vista se quitó el disipador: míralo en la vista armada.",
        backplate: "En esta vista no se muestra la placa trasera: mírala en la vista armada.",
      },
    },
  ],
  selectorVistas: "Elige la vista de la tarjeta",
  partes: {
    ventiladores,
    carcasa,
    disipador,
    backplate,
    bracket,
    "conector-energia": conectorEnergia,
    "conector-pcie": conectorPcie,
    "chip-grafico": chipGrafico,
    "memoria-vram": memoriaVram,
    vrm: vrmTarjeta,
  },
  secciones: [seccionElegir, seccionErrores],
  casos,
  criterios,
  faq: [
    {
      q: "¿Por qué mi equipo no da imagen con la tarjeta gráfica instalada?",
      a: "Revisa tres cosas: que el monitor esté conectado a la salida de la tarjeta y no a la de la placa, que todos los conectores de energía de la tarjeta tengan su cable conectado y que la tarjeta esté asentada por completo en la ranura x16.",
    },
    {
      q: "¿Cómo sé si una tarjeta gráfica cabe en mi chasis?",
      a: "Compara el largo y el grosor de la tarjeta, que están en la ficha del fabricante, con el largo máximo de tarjeta gráfica que indica la ficha del chasis. Deja algo de espacio libre para el cable de energía.",
    },
    {
      q: "¿Mi fuente de poder alcanza para esta tarjeta?",
      a: "El fabricante de la tarjeta indica la potencia de fuente recomendada y los conectores de energía que necesita. Confirma las dos cosas contra tu fuente: la potencia y que tenga los cables para cada conector.",
    },
    {
      q: "¿Una tarjeta gráfica nueva funciona en una placa más antigua?",
      a: "En general sí, siempre que la placa tenga la ranura PCIe x16 y haya espacio y energía suficientes. La tarjeta trabaja a la velocidad de la generación menor de PCIe entre las dos. Confirma en el manual de la placa.",
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
