/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Contenido de /piezas/almacenamiento (docs/piezas-plan-2.md §3.3). ESTADO: BORRADOR. Todos los hechos nuevos nacen SIN verificar (verificadoEn: null).
// Reglas: prosa sin cifras (salvo nombres de estándar en `terminos`); toda cifra vive en un `Hecho` con fuente; el texto de un caso continúa su rótulo.
// Sin MB/s de productos ni TBW (cambian por modelo). Las ventajas y desventajas por vista son `Criterio` de B & W: opinión del taller, no datos.
// Los hechos que comparte con otras piezas viven en comun.hechos.ts (mismos objetos, misma verificación).
import { m2ComparteLineasSata, m2Largos, m2Llaves, m2Protocolos, nvmeLineasPcie, pcieCompatibilidadAtras, sataDatosYEnergia } from "./comun.hechos.ts";
import { aprobadoPorDueno, hecho, verificadoPorDueno } from "./constructores.ts";
import type { AlmacenamientoParteId, AlmacenamientoVistaId, Caso, Criterio, Hecho, ParteContenido, PiezaContenido, SeccionTexto } from "./types.ts";

const M2 = ["m2-nvme", "m2-sata"] as const;
const SATA = ["ssd-sata", "hdd"] as const;

const almM2Llaves: Hecho = verificadoPorDueno(
  hecho(
    "alm-m2-llaves-nvme-sata",
    "Un SSD M.2 NVMe suele tener una sola muesca en el conector (llave M); un SSD M.2 SATA suele tener dos (llaves B y M).",
    [
      { titulo: "Datasheet: WD Green SATA SSD", editor: "Western Digital / SanDisk", url: "https://documents.sandisk.com/content/dam/asset-library/en_us/assets/public/western-digital/product/internal-drives/wd-green-ssd/datasheet-wd-green-sata-internal-ssd-cased.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Data Sheet: WD_BLACK SN850X NVMe SSD", editor: "Western Digital / SanDisk", url: "https://documents.sandisk.com/content/dam/asset-library/en_us/assets/public/western-digital/product/internal-drives/wd-black-ssd/data-sheet-wd-black-sn850x-nvme-ssd.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Manual de la ASRock B760M-H/M.2", editor: "ASRock", url: "https://download.asrock.com/Manual/B760M-HM.2.pdf", consultadoEn: "2026-10-15" },
      { titulo: "SSD Types Explained: SATA, NVMe, M.2, U.2 and PCIe", editor: "Seagate", url: "https://www.seagate.com/blog/ssd-types/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja almacenamiento): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const almNvmeProtocolo: Hecho = verificadoPorDueno(
  hecho(
    "alm-nvme-protocolo-pcie",
    "NVMe es el protocolo con el que un SSD se comunica con el sistema a través de PCI Express.",
    [
      { titulo: "Acerca de NVM Express", editor: "NVM Express", url: "https://nvmexpress.org/about/", consultadoEn: "2026-10-15" },
      { titulo: "Datasheet: Samsung 990 PRO (rev. 2.0)", editor: "Samsung", url: "https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Data Sheet: WD_BLACK SN850X NVMe SSD", editor: "Western Digital / SanDisk", url: "https://documents.sandisk.com/content/dam/asset-library/en_us/assets/public/western-digital/product/internal-drives/wd-black-ssd/data-sheet-wd-black-sn850x-nvme-ssd.pdf", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja almacenamiento): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const almM2SataProtocolo: Hecho = verificadoPorDueno(
  hecho(
    "alm-m2-sata-usa-sata",
    "Un SSD M.2 SATA usa el protocolo SATA aunque tenga forma M.2: no se comunica por PCI Express como un NVMe.",
    [
      { titulo: "Manual de la ASRock B760M-H/M.2", editor: "ASRock", url: "https://download.asrock.com/Manual/B760M-HM.2.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Manual de la MSI B760 GAMING PLUS WIFI DDR4", editor: "MSI", url: "https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Datasheet: WD Green SATA SSD", editor: "Western Digital / SanDisk", url: "https://documents.sandisk.com/content/dam/asset-library/en_us/assets/public/western-digital/product/internal-drives/wd-green-ssd/datasheet-wd-green-sata-internal-ssd-cased.pdf", consultadoEn: "2026-10-15" },
      { titulo: "SATA-IO", editor: "SATA-IO", url: "https://sata-io.org/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja almacenamiento): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const almM2SinCables: Hecho = verificadoPorDueno(
  hecho(
    "alm-m2-sin-cables",
    "Un SSD M.2 se instala directamente en la ranura de la placa y se sujeta con un tornillo o con un seguro plástico, según la placa; no usa cable de datos ni de energía. El punto de fijación cambia según el largo del módulo (por ejemplo, 2280 es un largo muy común).",
    [
      { titulo: "Manual de la ASUS PRIME B850-PLUS", editor: "ASUS", url: "https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Manual de la MSI B760 GAMING PLUS WIFI DDR4", editor: "MSI", url: "https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Manual de la ASRock B760M-H/M.2", editor: "ASRock", url: "https://download.asrock.com/Manual/B760M-HM.2.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Datasheet: Samsung 990 PRO (rev. 2.0)", editor: "Samsung", url: "https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja almacenamiento): ajustar. ajustado por NB (2026-10-19): ranura más tornillo o seguro, según la placa. El seguro plástico y la posición según el largo son experiencia del taller, sin fuente.",
  ),
  "2026-10-19",
  "NB",
);
const almConectoresSataIguales: Hecho = verificadoPorDueno(
  hecho(
    "alm-sata-conectores-iguales",
    "El SSD SATA y el disco duro SATA usan los mismos conectores SATA de datos y de energía, sin importar el tamaño de la unidad.",
    [
      { titulo: "SATA 2.5\" Product Manual (Rev. J, septiembre de 2020)", editor: "Seagate", url: "https://www.seagate.com/content/dam/seagate/migrated-assets/www-content/product-content/seagate-laptop-fam/barracuda_25/en-us/docs/100804767j.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Video 3.5 HDD Product Manual (Rev. U, mayo de 2019)", editor: "Seagate", url: "https://www.seagate.com/content/dam/seagate/migrated-assets/staticfiles/support/docs/manual/ce/Pipeline%20HD%20Series/100633414u.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Serial ATA Basics", editor: "Seagate", url: "https://www.seagate.com/support/kb/serial-ata-basics-193811en/", consultadoEn: "2026-10-15" },
      { titulo: "Choose the right SSD form factor for your upgrade", editor: "Samsung", url: "https://insights.samsung.com/2023/07/28/choose-the-right-ssd-form-factor-for-your-upgrade-2/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja almacenamiento): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const almFormasSata: Hecho = verificadoPorDueno(
  hecho(
    "alm-sata-formas-pulgadas",
    "Los SSD SATA suelen ser de 2,5 pulgadas. Los discos duros de escritorio suelen ser de 3,5 pulgadas, y los de portátil, de 2,5.",
    [
      { titulo: "Samsung 870 EVO SATA III 2.5\" SSD (250 GB)", editor: "Samsung", url: "https://www.samsung.com/ca/memory-storage/sata-ssd/870-evo-250gb-sata-3-2-5-ssd-mz-77e250b-am", consultadoEn: "2026-10-15" },
      { titulo: "Datasheet: WD Green SATA SSD", editor: "Western Digital / SanDisk", url: "https://documents.sandisk.com/content/dam/asset-library/en_us/assets/public/western-digital/product/internal-drives/wd-green-ssd/datasheet-wd-green-sata-internal-ssd-cased.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Seagate BarraCuda hard drives", editor: "Seagate", url: "https://www.seagate.com/products/hard-drives/barracuda-hard-drive/", consultadoEn: "2026-10-15" },
      { titulo: "SATA 2.5\" Product Manual (Rev. J, septiembre de 2020)", editor: "Seagate", url: "https://www.seagate.com/content/dam/seagate/migrated-assets/www-content/product-content/seagate-laptop-fam/barracuda_25/en-us/docs/100804767j.pdf", consultadoEn: "2026-10-15" },
      { titulo: "Choose the right SSD form factor for your upgrade", editor: "Samsung", url: "https://insights.samsung.com/2023/07/28/choose-the-right-ssd-form-factor-for-your-upgrade-2/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja almacenamiento): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const almPiezasMoviles: Hecho = verificadoPorDueno(
  hecho(
    "alm-hdd-piezas-moviles",
    "El disco duro guarda los datos en platos que giran y los lee con cabezales móviles; el SSD guarda los datos en memoria flash y no tiene piezas móviles.",
    [
      { titulo: "HDD vs. SSD: Which Is Right for You?", editor: "Western Digital", url: "https://www.westerndigital.com/solutions/hdd-vs-ssd", consultadoEn: "2026-10-15" },
      { titulo: "Why can't I reach the advertised performance of my external drive?", editor: "Seagate", url: "https://www.seagate.com/support/kb/lacie/Why-cant-I-reach-the-advertised-performance-of-my-external-drive/", consultadoEn: "2026-10-15" },
      { titulo: "Datasheet: WD Green SATA SSD", editor: "Western Digital / SanDisk", url: "https://documents.sandisk.com/content/dam/asset-library/en_us/assets/public/western-digital/product/internal-drives/wd-green-ssd/datasheet-wd-green-sata-internal-ssd-cased.pdf", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja almacenamiento): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const almNandDesgaste: Hecho = verificadoPorDueno(
  hecho(
    "alm-nand-desgaste",
    "Las celdas de la memoria flash NAND se desgastan con las escrituras; el controlador reparte las escrituras entre ellas.",
    [
      { titulo: "White Paper: SSD Endurance and HDD Workloads", editor: "Western Digital", url: "https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/collateral/white-paper/white-paper-ssd-endurance-and-hdd-workloads.pdf", consultadoEn: "2026-10-15" },
      { titulo: "What Is SSD Over-Provisioning?", editor: "Seagate", url: "https://www.seagate.com/blog/ssd-over-provisioning-and-benefits/", consultadoEn: "2026-10-15" },
    ],
    "Decisión de NB (2026-10-19, hoja almacenamiento): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);

/* ---------- Criterios de B & W (opinión del taller; aprobación pendiente del dueño) ---------- */
function criterio(id: string, texto: string): Criterio {
  return { id, texto, aprobadoEn: null, aprobadoPor: null };
}

/* ---------- Partes (en el orden de ALMACENAMIENTO_PARTES) ---------- */
const llaveM2: ParteContenido = {
  orden: 1,
  nombre: "Llave (muesca) del conector M.2",
  nombreCorto: "Llave",
  alias: ["muesca del M.2", "key"],
  resumen: "Es la muesca del borde dorado del SSD M.2. Indica en qué ranuras puede entrar y suele ser distinta entre un NVMe y un M.2 SATA.",
  queHace:
    "La llave es un corte en el conector que debe coincidir con la ranura. Un SSD NVMe y un M.2 SATA se parecen por fuera, pero suelen diferir en la cantidad de muescas. La llave dice si el módulo cabe físicamente, no si la placa lo soporta: eso lo define el protocolo de la ranura, que el manual detalla.",
  alElegir: [
    "Confirma en la ficha del SSD si es NVMe o SATA antes de comprarlo: la forma M.2 es la misma.",
    "Revisa en el manual qué protocolo admite cada ranura M.2 de tu placa.",
    "Nunca fuerces un SSD que no entra en la ranura.",
  ],
  hechos: [almM2Llaves, m2Llaves, m2Protocolos],
  relacionadas: ["ranura-m2", "controlador"],
  vistas: M2,
};

const controlador: ParteContenido = {
  orden: 2,
  nombre: "Controlador",
  nombreCorto: "Controlador",
  alias: ["chip controlador", "procesador del SSD"],
  resumen: "Es el chip que administra el SSD: recibe las órdenes de la placa y decide cómo se guardan y se leen los datos en la memoria flash.",
  queHace:
    "El controlador traduce lo que pide el sistema en operaciones sobre la memoria flash y reparte las escrituras entre las celdas. En un NVMe habla el protocolo NVMe a través de PCIe; en un M.2 SATA habla SATA. Su diseño cambia entre modelos y marcas, y es una de las razones por las que dos SSD con la misma forma no se comportan igual.",
  alElegir: [
    "Compara fichas de modelos completos, no solo el tipo de unidad.",
    "Si el SSD trae disipador, revisa que haya espacio para él en la ranura de tu placa.",
  ],
  hechos: [almNvmeProtocolo, nvmeLineasPcie, almM2SataProtocolo],
  relacionadas: ["memoria-nand", "llave-m2"],
  vistas: M2,
};

const memoriaNand: ParteContenido = {
  orden: 3,
  nombre: "Memoria flash (NAND)",
  nombreCorto: "NAND",
  alias: ["memoria flash", "chips de memoria del SSD"],
  resumen: "Son los chips donde se guardan los datos del SSD. A diferencia de la RAM, conservan la información aunque se apague el equipo.",
  queHace:
    "La memoria NAND es la memoria flash donde viven el sistema, los programas y tus archivos. Está formada por celdas que se desgastan con el uso, y el controlador se encarga de repartir ese desgaste. Por eso la ficha de cada SSD indica cuánta escritura soporta el modelo: es un dato del fabricante y cambia de un modelo a otro.",
  alElegir: [
    "Revisa en la ficha del modelo la resistencia a la escritura; aquí no damos cifras porque cambian por modelo.",
    "Guarda lo importante también en otra unidad: cualquier SSD puede fallar.",
  ],
  hechos: [almNandDesgaste],
  relacionadas: ["controlador"],
  vistas: M2,
};

const tornilloM2: ParteContenido = {
  orden: 4,
  nombre: "Tornillo de sujeción M.2",
  nombreCorto: "Tornillo",
  alias: ["tornillo del M.2", "separador"],
  resumen: "Es el tornillo, o en algunas placas un seguro plástico, que fija el extremo libre del SSD. Sin fijación, el módulo queda levantado y la ranura no lo retiene.",
  queHace:
    "El conector sostiene un extremo del SSD y el tornillo fija el otro a un separador de la placa. El punto de fijación va en una posición distinta según el largo del SSD, y algunas placas reemplazan el tornillo por un seguro plástico que no necesita herramientas. Si la placa trae un disipador M.2, suele ir por encima del SSD.",
  alElegir: [
    "Antes de instalar, ubica el separador que corresponde al largo de tu SSD y muévelo si hace falta.",
    "Guarda el tornillo y el separador que vienen con la placa: son diminutos y fáciles de perder.",
    "Si la placa trae disipador M.2, monta el SSD siguiendo las instrucciones del manual.",
  ],
  hechos: [m2Largos],
  relacionadas: ["ranura-m2"],
  vistas: M2,
};

const ranuraM2: ParteContenido = {
  orden: 5,
  nombre: "Ranura M.2 de la tarjeta madre",
  nombreCorto: "Ranura M.2",
  alias: ["slot M.2", "zócalo M.2"],
  resumen: "Es la ranura de la placa donde entra el SSD M.2. No todas admiten lo mismo: pueden aceptar NVMe, SATA o ambos.",
  queHace:
    "Cada ranura M.2 tiene su propio protocolo y su propia conexión con el procesador o el chipset. En algunas placas, ocupar ciertas ranuras desactiva puertos SATA o una ranura PCIe. Un SSD NVMe y una ranura de generaciones de PCIe distintas funcionan juntos, pero a la velocidad de la generación menor.",
  alElegir: [
    "Lee el manual: indica el protocolo de cada ranura M.2 y qué puertos comparte con ella.",
    "Cuenta cuántos SSD M.2 quieres instalar ahora y cuántos más adelante.",
    "Confirma que la ranura admite el largo de tu SSD.",
  ],
  hechos: [m2Protocolos, m2ComparteLineasSata, pcieCompatibilidadAtras],
  enlaces: [{ etiqueta: "Las ranuras M.2 en la tarjeta madre", pieza: "tarjeta-madre", parte: "m2" }],
  relacionadas: ["llave-m2", "tornillo-m2"],
  vistas: M2,
};

const conectorSataDatos: ParteContenido = {
  orden: 6,
  nombre: "Conector SATA de datos",
  nombreCorto: "SATA de datos",
  alias: ["cable SATA", "puerto de datos"],
  resumen: "Es el conector pequeño y plano por donde la unidad se comunica con la placa mediante un cable SATA.",
  queHace:
    "El cable de datos conecta la unidad con un puerto SATA de la placa. Tiene una forma que solo permite conectarlo en un sentido y no transmite energía: para eso la unidad usa otro conector. Es el mismo en un SSD SATA y en un disco duro.",
  alElegir: [
    "Usa un cable de datos por unidad.",
    "Conéctalo a un puerto SATA de la placa; el manual indica cuáles se desactivan al ocupar ranuras M.2.",
    "Revisa que el cable quede firme en ambos extremos.",
  ],
  hechos: [sataDatosYEnergia, almConectoresSataIguales],
  enlaces: [{ etiqueta: "Los puertos SATA en la tarjeta madre", pieza: "tarjeta-madre", parte: "sata" }],
  relacionadas: ["conector-sata-poder"],
  vistas: SATA,
};

const conectorSataPoder: ParteContenido = {
  orden: 7,
  nombre: "Conector SATA de energía",
  nombreCorto: "SATA de energía",
  alias: ["alimentación SATA", "cable de poder SATA"],
  resumen: "Es el conector ancho por donde la fuente de poder alimenta la unidad. Va en un cable aparte del de datos.",
  queHace:
    "El cable de energía sale de la fuente de poder y llega a la unidad. Es el mismo en un SSD SATA y en un disco duro. Si falta o queda flojo, la placa no detecta la unidad aunque el cable de datos esté bien conectado.",
  alElegir: [
    "Usa un conector de energía SATA de la fuente por cada unidad; un solo cable puede traer varios conectores.",
    "Los SSD M.2 no usan este conector: se alimentan por la ranura.",
    "Si la unidad no aparece, revisa primero los dos cables.",
  ],
  hechos: [sataDatosYEnergia, almConectoresSataIguales],
  enlaces: [{ etiqueta: "El conector SATA de energía en la fuente de poder", pieza: "fuente-de-poder", parte: "sata-poder" }],
  relacionadas: ["conector-sata-datos"],
  vistas: SATA,
};

const carcasa: ParteContenido = {
  orden: 8,
  nombre: "Carcasa de la unidad",
  nombreCorto: "Carcasa",
  alias: ["caja de la unidad", "chasis de la unidad"],
  resumen: "Es la cubierta de la unidad. En un SSD SATA protege la placa interna; en un disco duro cierra el mecanismo con platos y cabezales.",
  queHace:
    "En el SSD SATA la carcasa es una caja plana que contiene la placa con el controlador y la memoria flash. En el disco duro cierra el mecanismo interno: platos que giran y cabezales que leen y escriben. Eso no se ve en el dibujo, pero explica por qué el disco duro tiene piezas móviles y pide más cuidado al mover el equipo encendido.",
  alElegir: [
    "Respeta el tamaño de bahía de tu chasis: las unidades de escritorio y las de portátil no miden lo mismo.",
    "No abras la carcasa de un disco duro: el interior es delicado.",
    "Mueve el equipo apagado si lleva un disco duro.",
  ],
  hechos: [almFormasSata, almPiezasMoviles],
  relacionadas: ["conector-sata-datos", "conector-sata-poder"],
  vistas: SATA,
};

/* ---------- Secciones ---------- */
const seccionElegir: SeccionTexto = {
  id: "elegir",
  titulo: "Qué mirar al elegir almacenamiento",
  parrafos: [
    "Elegir almacenamiento empieza por saber qué admite tu placa y tu chasis: cuántas ranuras M.2 hay y de qué protocolo, cuántos puertos SATA y cuántas bahías.",
    "Lo que no se ve en el dibujo: dentro de un disco duro hay platos que giran y cabezales que leen y escriben, y en un SSD no hay piezas móviles. Es la diferencia física más clara entre los dos y la razón por la que se tratan distinto al mover el equipo.",
  ],
  vinetas: [
    "Protocolo de cada ranura M.2: NVMe, SATA o ambos; el manual lo indica por ranura.",
    "Cantidad de ranuras M.2 y de puertos SATA, y cuáles se desactivan al ocupar otras.",
    "Largo del SSD M.2 que admite la ranura.",
    "Bahías del chasis para unidades SATA, si piensas usar alguna.",
    "Cables de datos y de energía SATA disponibles en la fuente de poder.",
    "Uso previsto: sistema y programas, o archivos y copias de seguridad.",
    "Copias de seguridad: cualquier unidad puede fallar; guarda lo importante en más de un lugar.",
  ],
};

const seccionErrores: SeccionTexto = {
  id: "errores",
  titulo: "Errores comunes con el almacenamiento",
  parrafos: [
    "Casi todos estos tropiezos se evitan revisando el manual de la placa y la ficha de la unidad antes de comprar, y verificando que cada cable quede conectado.",
    "Los que empiezan con «Nos ha pasado» los hemos visto en el taller; los que empiezan con «Puede pasar» son riesgos conocidos que prevenimos al armar.",
  ],
};

/* ---------- Casos del taller ----------
 * `texto` continúa el rótulo que pone la interfaz, por eso empieza en minúscula. Ninguno es «vivido»: el dueño no contó casos de almacenamiento
 * (docs/piezas-errores-taller.md, sección «Almacenamiento y cliente»). aprobadoEn/aprobadoPor los fija el dueño. */
const casos: readonly Caso[] = [
  {
    id: "m2-ranura-sin-compatibilidad",
    tipo: "puede-pasar",
    texto:
      "comprar un SSD M.2 SATA para una ranura que solo admite NVMe, o al revés. Los dos entran por la forma, pero la placa puede no detectar la unidad. Revisa en el manual qué protocolo acepta cada ranura M.2.",
    hechos: [m2Protocolos],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "cables-sata-mal-conectados",
    tipo: "puede-pasar",
    texto: "dejar la unidad SATA con el cable de datos o el de energía suelto o sin conectar. La placa no la detecta aunque la unidad esté bien. Revisa los dos cables en ambos extremos.",
    hechos: [sataDatosYEnergia],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "m2-sin-tornillo",
    tipo: "puede-pasar",
    texto: "instalar el SSD M.2 sin fijarlo con el tornillo o en un separador que no corresponde a su largo. El módulo queda levantado o suelto y puede no hacer buen contacto.",
    hechos: [m2Largos],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "m2-desactiva-puertos-sata",
    tipo: "puede-pasar",
    texto: "llenar todas las ranuras M.2 y quedarte sin algunos puertos SATA, o sin una ranura PCIe, porque el manual indica que se comparten.",
    hechos: [m2ComparteLineasSata],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
];

export const ALMACENAMIENTO_CONTENIDO: PiezaContenido<AlmacenamientoParteId, AlmacenamientoVistaId> = {
  slug: "almacenamiento",
  estado: "borrador",
  piezaServicios: "almacenamiento",
  nombreCorto: "Almacenamiento",
  titulo: "SSD M.2 NVMe, SATA y disco duro: diferencias",
  descripcion: "Toca cada parte de un SSD M.2 NVMe, un SSD SATA y un disco duro, y mira cómo se conectan y qué diferencias hay. Qué revisar antes de elegir.",
  h1: "El almacenamiento, parte por parte",
  eyebrow: "piezas del PC",
  intro: [
    "El almacenamiento es donde el equipo guarda el sistema operativo, los programas y tus archivos, incluso cuando lo apagas. Hoy conviven tres formas de conectarlo: un SSD (disco de estado sólido) en una ranura M.2, un SSD SATA con cables y el clásico disco duro (HDD).",
    "Se ven distintos, pero lo que más importa al elegir es cómo se conectan: la ranura o el puerto que tiene tu placa. Toca cada parte del dibujo, cambia de tipo de unidad y mira qué hace cada pieza y qué conviene confirmar en el manual.",
  ],
  palabrasClave: ["SSD M.2 NVMe", "SSD SATA", "disco duro HDD", "diferencia entre SSD y HDD", "cómo elegir almacenamiento"],
  terminos: ["M.2", "NVMe", "SATA", "SSD", "HDD", "PCIe", "NAND"],
  sinonimos: ["disco de estado sólido"],
  publicadoEn: null,
  actualizadoEn: "2026-10-14",
  bloques: ["partes", "lista", "vistas", "comparar", "elegir", "errores", "preguntas"],
  vistas: [
    {
      id: "m2-nvme",
      etiqueta: "M.2 NVMe",
      resumen: "Un SSD M.2 NVMe pequeño y plano, con su controlador y su memoria flash, atornillado a una ranura M.2 de la placa.",
      etiquetaFigura: "Dibujo esquemático de un SSD M.2 NVMe, medio fuera de su ranura para que se vea la muesca de la llave, que se dibuja exagerada. Los modelos reales cambian en la cantidad de chips, el disipador y el largo.",
      notasPorParte: {
        "conector-sata-datos": "Un SSD M.2 NVMe no usa cable de datos SATA: se conecta directamente a la ranura de la placa.",
        "conector-sata-poder": "Un SSD M.2 no usa cable de energía: se alimenta por la ranura.",
        carcasa: "El SSD M.2 suele ir sin carcasa: la placa del circuito queda a la vista.",
      },
      aFavor: [
        aprobadoPorDueno(criterio("nvme-sin-cables", "Se instala directo en la placa, sin cables, y deja el interior del chasis más ordenado."), "2026-10-19", "NB"),
        aprobadoPorDueno(criterio("nvme-unidad-del-sistema", "Es nuestra opción habitual para la unidad donde van el sistema operativo y los programas."), "2026-10-19", "NB"),
      ],
      aConsiderar: [
        aprobadoPorDueno(criterio("nvme-ranura-compatible", "Revisa en el manual que la ranura M.2 que vas a usar admita NVMe y cuántas ranuras trae tu placa."), "2026-10-19", "NB"),
        aprobadoPorDueno(criterio("nvme-ranuras-compartidas", "Algunas ranuras comparten líneas con otros puertos; mira el manual antes de llenarlas todas."), "2026-10-19", "NB"),
      ],
    },
    {
      id: "m2-sata",
      etiqueta: "M.2 SATA",
      resumen: "Un SSD M.2 SATA con la misma forma que un NVMe, pero con otro protocolo y, normalmente, con dos muescas en el conector.",
      etiquetaFigura: "Dibujo esquemático de un SSD M.2 SATA, medio fuera de su ranura para que se vean sus muescas, que se dibujan exageradas. Por fuera se parece a un NVMe: el protocolo se confirma en la ficha del modelo.",
      notasPorParte: {
        "llave-m2": "En un M.2 SATA el conector suele tener dos muescas, a diferencia de un NVMe, que suele tener una sola.",
        "conector-sata-datos": "Un SSD M.2 SATA no usa cable de datos: aunque hable SATA, se conecta a la ranura M.2 de la placa.",
        "conector-sata-poder": "Un SSD M.2 no usa cable de energía: se alimenta por la ranura.",
        carcasa: "El SSD M.2 suele ir sin carcasa: la placa del circuito queda a la vista.",
      },
      aFavor: [aprobadoPorDueno(criterio("m2-sata-sin-cables", "Sirve cuando la placa tiene una ranura M.2 compatible con SATA y no quieres usar cables."), "2026-10-19", "NB")],
      aConsiderar: [
        aprobadoPorDueno(criterio("m2-sata-confusion-con-nvme", "Se confunde con facilidad con un NVMe porque tienen la misma forma; confirma el protocolo en la ficha antes de comprar."), "2026-10-19", "NB"),
        aprobadoPorDueno(criterio("m2-sata-ranura-nvme", "Si la ranura de tu placa admite solo NVMe, este tipo de SSD no funcionará allí."), "2026-10-19", "NB"),
      ],
    },
    {
      id: "ssd-sata",
      etiqueta: "SSD SATA",
      resumen: "Un SSD SATA en su carcasa plana, con el conector de datos y el de energía en el borde, listo para ir en una bahía del chasis.",
      etiquetaFigura: "Dibujo esquemático de un SSD SATA con su carcasa. Los modelos reales cambian en el acabado y en el grosor.",
      notasPorParte: {
        "ranura-m2": "Este tipo de unidad no usa ranura M.2: va a un puerto SATA de la placa.",
      },
      aFavor: [aprobadoPorDueno(criterio("ssd-sata-ampliar", "Sirve para ampliar el almacenamiento cuando la placa ya no tiene ranuras M.2 libres, o para actualizar un equipo con bahías."), "2026-10-19", "NB")],
      aConsiderar: [
        aprobadoPorDueno(criterio("ssd-sata-cables-y-bahia", "Necesita cable de datos, cable de energía y un lugar donde montarlo en el chasis; revisa que haya bahía o soporte."), "2026-10-19", "NB"),
      ],
    },
    {
      id: "hdd",
      etiqueta: "Disco duro",
      resumen: "Un disco duro de escritorio con su carcasa metálica y los mismos conectores SATA de datos y de energía que un SSD SATA.",
      etiquetaFigura: "Dibujo esquemático de un disco duro con su carcasa. Los platos y los cabezales van dentro y no se ven en el dibujo.",
      notasPorParte: {
        carcasa: "La carcasa del disco duro cierra el mecanismo: dentro hay platos que giran y cabezales que leen y escriben, y no se ven en el dibujo.",
        "ranura-m2": "El disco duro no usa ranura M.2: va a un puerto SATA de la placa.",
      },
      aFavor: [aprobadoPorDueno(criterio("hdd-archivo", "Sigue siendo una opción para guardar archivos grandes que no necesitan abrirse con urgencia, como copias de seguridad o videos."), "2026-10-19", "NB")],
      aConsiderar: [
        aprobadoPorDueno(criterio("hdd-no-sistema", "En equipos nuevos solemos dejar el sistema operativo en un SSD y usar el disco duro como almacén de archivos."), "2026-10-19", "NB"),
        aprobadoPorDueno(criterio("hdd-cuidado-al-mover", "Tiene piezas móviles: trátalo con cuidado y evita mover el equipo mientras está encendido."), "2026-10-19", "NB"),
      ],
    },
  ],
  selectorVistas: "Elige el tipo de unidad",
  partes: {
    "llave-m2": llaveM2,
    controlador,
    "memoria-nand": memoriaNand,
    "tornillo-m2": tornilloM2,
    "ranura-m2": ranuraM2,
    "conector-sata-datos": conectorSataDatos,
    "conector-sata-poder": conectorSataPoder,
    carcasa,
  },
  secciones: [seccionElegir, seccionErrores],
  casos,
  comparaciones: [
    {
      id: "tipos-de-unidad",
      titulo: "Los cuatro tipos de unidad según las especificaciones y las fichas",
      columnas: ["m2-nvme", "m2-sata", "ssd-sata", "hdd"],
      filas: [
        {
          etiqueta: "Protocolo o interfaz",
          valores: {
            "m2-nvme": { tipo: "hecho", hecho: almNvmeProtocolo },
            "m2-sata": { tipo: "hecho", hecho: almM2SataProtocolo },
            "ssd-sata": { tipo: "hecho", hecho: almConectoresSataIguales },
            hdd: { tipo: "hecho", hecho: almConectoresSataIguales },
          },
        },
        {
          etiqueta: "Dónde se conecta",
          valores: {
            "m2-nvme": { tipo: "hecho", hecho: m2Protocolos },
            "m2-sata": { tipo: "hecho", hecho: m2Protocolos },
            "ssd-sata": { tipo: "texto", texto: "Un puerto SATA de la placa, no una ranura M.2." },
            hdd: { tipo: "texto", texto: "Un puerto SATA de la placa, no una ranura M.2." },
          },
        },
        {
          etiqueta: "Llave o muesca del conector",
          valores: {
            "m2-nvme": { tipo: "hecho", hecho: almM2Llaves },
            "m2-sata": { tipo: "hecho", hecho: almM2Llaves },
            "ssd-sata": { tipo: "texto", texto: "No aplica: usa conectores SATA." },
            hdd: { tipo: "texto", texto: "No aplica: usa conectores SATA." },
          },
        },
        {
          etiqueta: "Forma y tamaño",
          valores: {
            "m2-nvme": { tipo: "hecho", hecho: m2Largos },
            "m2-sata": { tipo: "hecho", hecho: m2Largos },
            "ssd-sata": { tipo: "hecho", hecho: almFormasSata },
            hdd: { tipo: "hecho", hecho: almFormasSata },
          },
        },
        {
          etiqueta: "Cables que necesita",
          valores: {
            "m2-nvme": { tipo: "hecho", hecho: almM2SinCables },
            "m2-sata": { tipo: "hecho", hecho: almM2SinCables },
            "ssd-sata": { tipo: "hecho", hecho: sataDatosYEnergia },
            hdd: { tipo: "hecho", hecho: sataDatosYEnergia },
          },
        },
        {
          etiqueta: "Piezas móviles",
          valores: {
            "m2-nvme": { tipo: "hecho", hecho: almPiezasMoviles },
            "m2-sata": { tipo: "hecho", hecho: almPiezasMoviles },
            "ssd-sata": { tipo: "hecho", hecho: almPiezasMoviles },
            hdd: { tipo: "hecho", hecho: almPiezasMoviles },
          },
        },
        {
          etiqueta: "Uso que solemos darle",
          valores: {
            "m2-nvme": { tipo: "criterio", criterio: aprobadoPorDueno(criterio("uso-nvme", "Unidad principal del equipo, donde van el sistema y los programas."), "2026-10-19", "NB") },
            "m2-sata": { tipo: "criterio", criterio: aprobadoPorDueno(criterio("uso-m2-sata", "Cuando la placa tiene la ranura M.2 pero la unidad es SATA; confirma el protocolo antes de comprar."), "2026-10-19", "NB") },
            "ssd-sata": { tipo: "criterio", criterio: aprobadoPorDueno(criterio("uso-ssd-sata", "Ampliar el almacenamiento o actualizar un equipo que tiene bahías."), "2026-10-19", "NB") },
            hdd: { tipo: "criterio", criterio: aprobadoPorDueno(criterio("uso-hdd", "Archivo y copias de seguridad, junto con un SSD para el sistema."), "2026-10-19", "NB") },
          },
        },
      ],
    },
  ],
  faq: [
    {
      q: "¿Un SSD M.2 es lo mismo que un SSD NVMe?",
      a: "No necesariamente. M.2 es la forma y el conector; NVMe y SATA son protocolos. Hay SSD M.2 NVMe y SSD M.2 SATA, y se parecen por fuera, así que confirma el protocolo en la ficha.",
    },
    {
      q: "¿Puedo poner un SSD M.2 en cualquier ranura M.2?",
      a: "Depende de la placa. Cada ranura puede admitir NVMe, SATA o ambos, y algunas comparten líneas con puertos SATA o con una ranura PCIe. El manual de tu placa lo indica por ranura.",
    },
    {
      q: "¿Necesito cables para un SSD M.2?",
      a: "No. Un SSD M.2 se instala directamente en la ranura de la placa y se fija con un tornillo o con un seguro plástico, según la placa. Los SSD SATA y los discos duros sí necesitan un cable de datos y uno de energía.",
    },
    {
      q: "¿Puedo usar un disco duro y un SSD en el mismo equipo?",
      a: "Sí. Muchos equipos usan un SSD para el sistema y un disco duro para archivos, siempre que la placa tenga un puerto SATA libre, la fuente tenga conector de energía SATA y el chasis tenga una bahía.",
    },
    {
      q: "¿Qué hago si la unidad nueva no aparece en el equipo?",
      a: "Revisa primero que la BIOS la detecte. En un M.2, confirma que la ranura admita su protocolo. En una unidad SATA, revisa los dos cables. Si es nueva, quizá falte inicializarla desde el sistema operativo.",
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
