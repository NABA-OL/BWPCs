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
import { conRevision, hecho, verificadoPorDueno } from "./constructores.ts";
import { PROCESADOR_DECODIFICADOR } from "./procesador.datos.ts";
import type { Caso, Criterio, Fuente, Hecho, ParteContenido, PiezaContenido, ProcesadorParteId, ProcesadorVistaId, SeccionTexto } from "./types.ts";

/* ---------- Fuentes candidatas ----------
 * Solo la página de nombres de Intel se abrió (2026-10-14). */
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
/* ---------- Hechos de nomenclatura (los usa el decodificador; viven en la sección «nombres») ----------
 * Los de series y generaciones son volátiles: revisión cada seis meses. */
const marcaCoreIACore = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-intel-marca-core-i-a-core",
      "Intel dejó de usar la letra i en sus nombres nuevos: ahora hay Core 3, Core 5 y Core 7, y Core Ultra 5, 7 y 9. Los nombres anteriores, como Core i5, siguen existiendo en procesadores de generaciones anteriores.",
      [
        INTEL_NOMBRES,
        { titulo: "Intel® Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/ark.html", consultadoEn: "2026-10-14" },
        { titulo: "Intel Announces Major Brand Update Ahead of Upcoming Meteor Lake Launch", editor: "Intel", url: "https://www.intel.com/content/www/us/en/newsroom/news/intel-announces-major-brand-update-upcoming-meteor-lake-launch.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-15, hoja procesador): aprobar. aprobado por NB (2026-10-15). Duda de NB sin resolver: confirmar cómo se numeran los Core Ultra (primer dígito = generación, dos siguientes = gama); lo cubre el hecho cpu-core-sin-ultra-numero.",
    ),
    "2026-10-15",
    "NB",
  ),
  6,
);
const coreVsCoreUltra = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-core-vs-core-ultra",
      "Core Ultra es la familia de mayor nivel de Intel, con gamas 5, 7 y 9. Core, sin Ultra, es la familia de uso general, con gamas 3, 5 y 7.",
      [
        INTEL_NOMBRES,
        { titulo: "Intel Announces Major Brand Update Ahead of Upcoming Meteor Lake Launch", editor: "Intel", url: "https://www.intel.com/content/www/us/en/newsroom/news/intel-announces-major-brand-update-upcoming-meteor-lake-launch.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const coreIGeneracion = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-core-i-generacion",
      "En los Core i de escritorio, el número de modelo indica la generación: en los de cinco dígitos, los dos primeros son la generación (12400 es de la 12.ª y 14700 de la 14.ª); en los de cuatro dígitos, como los de la 9.ª generación (por ejemplo, 9700), la generación es solo el primer dígito y el resto ubica la gama dentro de la serie.",
      [
        { titulo: "Intel® Core™ i5-12400F Processor (18M Cache, up to 4.40 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/specifications.html", consultadoEn: "2026-10-14" },
        { titulo: "Intel® Core™ i7 processor 14700K (33M Cache, up to 5.60 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/236783/intel-core-i7-processor-14700k-33m-cache-up-to-5-60-ghz/specifications.html", consultadoEn: "2026-10-14" },
        INTEL_NOMBRES,
      ],
      "Decisión de NB (2026-10-19, hoja procesador): ajustar. ajustado por NB (2026-10-19): la regla de los dos dígitos no sirve para generaciones anteriores a la 10.ª. Ejemplo de cuatro dígitos sin fuente abierta: verificar.",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const coreILga1700Vigentes = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-core-i-lga1700-vigentes",
      "Intel mantiene en su catálogo, como lanzados, procesadores Core i3, i5, i7 e i9 de LGA 1700, aunque la línea nueva use LGA 1851. Si hay existencias en tiendas depende de cada distribuidor.",
      [
        { titulo: "Intel® Core™ i5-12400F Processor (18M Cache, up to 4.40 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/specifications.html", consultadoEn: "2026-10-14" },
        { titulo: "Intel® Core™ i7 processor 14700K (33M Cache, up to 5.60 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/236783/intel-core-i7-processor-14700k-33m-cache-up-to-5-60-ghz/specifications.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-19, hoja procesador): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19)",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const coreUltraSerie = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-core-ultra-serie",
      "En Core Ultra el primer dígito del número de modelo indica la serie: 165H es de la serie 1 y 265K de la serie 2. La serie 2 de escritorio usa el socket LGA 1851.",
      [
        { titulo: "Intel® Core™ Ultra Processors Names and Numbers", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000097596/processors/intel-core-ultra-processors.html", consultadoEn: "2026-10-14" },
        { titulo: "Intel® Core™ Ultra 7 Processor 265K (30M Cache, up to 5.50 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html", consultadoEn: "2026-10-14" },
        { titulo: "Information About Intel® Core™ Ultra Boxed Desktop Processors (Series 2)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000099656/processors.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const coreSinUltraNumero = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-core-sin-ultra-numero",
      "Con su cambio de nombres, Intel dejó de usar la «i» y los números de cinco dígitos (como 12400 o 14700): ahora los procesadores son Core o Core Ultra, con un número de modelo de tres dígitos. Los Core Ultra son los de gama más alta. La numeración de generaciones se reinició: el primer dígito es la generación (la primera usa la serie 100, la segunda la serie 200) y los dos siguientes ubican la gama dentro de la serie.",
      [INTEL_NOMBRES],
      "Decisión de NB (2026-10-19, hoja procesador): ajustar. ajustado por NB (2026-10-19): la parte del reinicio de la numeración y de «Ultra = gama más alta» viene de NB, sin fuente abierta (Intel solo confirma los tres dígitos). Duda de NB: la serie siguiente a la 200; verificar. Redacción por revisar.",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const intelGamasRelativas = verificadoPorDueno(
  hecho(
    "cpu-intel-gamas-relativas",
    "Intel presenta 3, 5, 7 y 9 (con o sin la letra i) como niveles de rendimiento dentro de cada familia, de menor a mayor. El número no sirve para comparar entre familias distintas.",
    [
      INTEL_NOMBRES,
      { titulo: "Intel® Core™ i5-12400F Processor (18M Cache, up to 4.40 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/specifications.html", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const amdGamasRelativas = verificadoPorDueno(
  hecho(
    "cpu-amd-gamas-relativas",
    "AMD nombra sus procesadores Ryzen con una gama dentro de la línea: Ryzen 3 es la gama baja, Ryzen 5 la media, Ryzen 7 la alta y Ryzen 9 la premium o entusiasta.",
    [
      { titulo: "AMD Ryzen™ Desktop Processors", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen.html", consultadoEn: "2026-10-14" },
      { titulo: "AMD Ryzen Processor Cooling Solutions", editor: "AMD", url: "https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja procesador): ajustar. ajustado por NB (2026-10-19): enumerar las gamas en vez de «de menor a mayor». La clasificación en baja, media, alta y premium es del taller; AMD no la define.",
  ),
  "2026-10-19",
  "NB",
);
const coreUltraEscritorioGamas = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-core-ultra-escritorio-gamas",
      "En la serie 2 de escritorio, Intel ofrece Core Ultra 5, 7 y 9.",
      [
        { titulo: "Intel® Core™ Ultra Desktop Processors (Series 2) Product Brief", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/docs/processors/core-ultra/core-ultra-desktop-processors-series-2-brief.html", consultadoEn: "2026-10-14" },
        { titulo: "Intel® Core™ Ultra 7 Processor 265K (30M Cache, up to 5.50 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const intelSufijosK = verificadoPorDueno(
  hecho(
    "cpu-intel-sufijos-k",
    "En los procesadores Intel, las letras al final del modelo indican características. En escritorio: K, desbloqueado; F, requiere tarjeta gráfica dedicada; KF, combina K y F; S, edición especial; T, consumo optimizado. En portátil: U, eficiente en consumo; H, alto rendimiento; HX y HK, máximo rendimiento con todos los modelos desbloqueados. Algunos sufijos existen solo en portátil o solo en escritorio: confirma en la ficha de Intel.",
    [
      { titulo: "Intel® Processor Names, Numbers and Generation List", editor: "Intel", url: "https://www.intel.com/content/www/us/en/processors/processor-numbers.html", consultadoEn: "2026-10-19" },
      { titulo: "What Do the Letters Mean in Intel® Processor Names?", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000058567/processors/intel-core-processors.html", consultadoEn: "2026-10-19" },
      { titulo: "Intel® Core™ Ultra Desktop Processors (Series 2) Product Brief", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/docs/processors/core-ultra/core-ultra-desktop-processors-series-2-brief.html", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja procesador): ajustar. ajustado por NB (2026-10-19); verificado en Intel (2026-10-19) por agente. Verificado literal en intel.com: K, F, S, T (escritorio) y U, H, HX, HK (portátil); T = «power-optimized lifestyle»; HX y HK = «highest performance, all SKUs unlocked» en la tabla de portátil (el artículo de soporte define HK como «high performance optimized for mobile, unlocked»). KF = K + F es deducción (Intel lo lista sin definirlo) y se dejó como «combina K y F». RECORTADO: KS, porque Intel no lo define en ninguna de las dos páginas. Quitado «de máximo/alto rendimiento y desbloqueado» para H; Intel solo dice alto rendimiento. Se quitó «multiplicador» porque Intel solo dice «unlocked». Se quitó «su significado puede variar entre generaciones»: ninguna fuente lo respalda. curl a intel.com devuelve un bloqueo; las páginas se leyeron con WebFetch.",
  ),
  "2026-10-19",
  "NB",
);
const intelSufijoT = verificadoPorDueno(
  hecho(
    "cpu-intel-sufijo-t",
    "En Intel de escritorio, T indica un procesador optimizado para consumir menos energía.",
    [
      INTEL_NOMBRES,
      { titulo: "What Do the Letters Mean in Intel® Processor Names?", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000058567/processors/intel-core-processors.html", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const intelSufijosUV = verificadoPorDueno(
  hecho(
    "cpu-intel-sufijos-u-v",
    "En portátiles de Intel, U indica bajo consumo. V aparece como sufijo de portátil de Core Ultra.",
    [
      { titulo: "What Do the Letters Mean in Intel® Processor Names?", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000058567/processors/intel-core-processors.html", consultadoEn: "2026-10-14" },
      INTEL_NOMBRES,
      { titulo: "Intel® Core™ Ultra Processors Names and Numbers", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000097596/processors/intel-core-ultra-processors.html", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const amdSufijosXXt = verificadoPorDueno(
  hecho(
    "cpu-amd-sufijos-x-xt",
    "En los procesadores AMD Ryzen, las letras al final del modelo indican variantes. En escritorio: X3D, con memoria caché 3D V-Cache (existe en AM4 y en AM5); G, con gráficos integrados Radeon; F, sin gráficos integrados (la ficha de AMD indica que requiere tarjeta gráfica dedicada). En portátil: U, para equipos delgados y de autonomía; HS, de alto rendimiento en equipos más delgados; HX, de máximo rendimiento; y también hay modelos HX3D con 3D V-Cache. En los nombres «Ryzen AI», como el Ryzen AI 9 HX 370, AMD indica que el procesador incluye un motor de IA dedicado (NPU). Otros sufijos, como X, XT, GE o H, no se definen aquí: confirma en la ficha de AMD.",
    [
      { titulo: "AMD Ryzen™ Desktop Processors", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ 5 5600X Desktop Processors", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600x.html", consultadoEn: "2026-10-14" },
      { titulo: "AMD 3D V-Cache™ Technology", editor: "AMD", url: "https://www.amd.com/en/products/processors/technologies/3d-v-cache.html", consultadoEn: "2026-10-14" },
      { titulo: "AMD Ryzen™ 7 7800X3D Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ 7 5800X3D Gaming Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-7-5800x3d.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ 7 8700G Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-7-8700g.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen Processor Cooling Solutions", editor: "AMD", url: "https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html", consultadoEn: "2026-10-14" },
      { titulo: "AMD Ryzen™ Processors for Laptops", editor: "AMD", url: "https://www.amd.com/en/products/processors/laptop/ryzen.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ AI 9 HX 370", editor: "AMD", url: "https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-9-hx-370.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ 5 7500F", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7500f.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ 7 5800XT", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-7-5800xt.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ 9 7950X3D Gaming Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-9-7950x3d.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ 9 9955HX3D", editor: "AMD", url: "https://www.amd.com/en/products/processors/laptop/ryzen/9000-series/amd-ryzen-9-9955hx3d.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ 7 7840HS", editor: "AMD", url: "https://www.amd.com/en/products/processors/laptop/ryzen/7000-series/amd-ryzen-7-7840hs.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ 7 7840U", editor: "AMD", url: "https://www.amd.com/en/products/processors/laptop/ryzen/7000-series/amd-ryzen-7-7840u.html", consultadoEn: "2026-10-19" },
      { titulo: "AMD Ryzen™ AI - Windows PCs with AI Built In", editor: "AMD", url: "https://www.amd.com/en/products/processors/consumer/ryzen-ai.html", consultadoEn: "2026-10-19" },
      { titulo: "What Does U, H, HS, And HX Mean In AMD Processors?", editor: "SlashGear", url: "https://www.slashgear.com/1695345/what-does-u-h-hs-hx-mean-amd-processors", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja procesador): ajustar. ajustado por NB (2026-10-19); revisado por agente (2026-10-19) contra amd.com (curl con user-agent de navegador; WebFetch dio timeout). Verificado en fichas AMD: X3D = modelos con AMD 3D V-Cache (7950X3D, 7800X3D en AM5; 5800X3D en AM4); HX3D de portátil con 3D V-Cache (9955HX3D); G = 8700G con Radeon 780M (se deduce del modelo, AMD no define la letra); F = la ficha del 7500F indica «Discrete Graphics Card Required» (deducción de un modelo; el 5800XT, sin F, también lo indica); «Ryzen AI» = NPU dedicada (página Ryzen AI de AMD). RECORTADO por no tener fuente abierta que lo defina: X (mayor rendimiento), XT, GE (menor consumo; no se halló ficha), U, H, HS, HX (solo SlashGear, secundaria, que no se usa) y los textos «de bajo consumo / alto rendimiento / máximo rendimiento». CORREGIDO: «AI identifica procesadores de portátil» era falso: la ficha del 8700G (escritorio) también se presenta «with AMD Ryzen AI»; el texto ahora no limita «Ryzen AI» a portátil. | NB (2026-10-19): conservar U, HS y HX con SlashGear como fuente SECUNDARIA (no AMD). Siguen fuera X, XT, GE y H por no tener ninguna fuente.",
  ),
  "2026-10-19",
  "NB",
);
const amdSufijoF = verificadoPorDueno(
  hecho(
    "cpu-amd-sufijo-f",
    "Los Ryzen de escritorio con sufijo F no traen gráficos integrados y necesitan una tarjeta gráfica aparte.",
    [
      { titulo: "AMD Ryzen™ 5 7500F", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7500f.html", consultadoEn: "2026-10-14" },
      { titulo: "AMD Ryzen™ 5 8400F Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-5-8400f.html", consultadoEn: "2026-10-14" },
      { titulo: "AMD Ryzen™ Desktop Processors", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen.html", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
);
const amd8000gAm5 = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-amd-8000g-am5",
      "Los Ryzen serie 8000G de escritorio, como el Ryzen 7 8700G, usan el socket AM5 y traen gráficos integrados.",
      [
        { titulo: "AMD Ryzen™ 7 8700G Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-7-8700g.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const amdSerieNoEsGeneracion = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-amd-serie-no-es-generacion",
      "En AMD, el primer dígito del número de modelo es la serie: la serie 5000 de escritorio usa AM4 y las series 7000, 8000G y 9000 usan AM5. Por eso conviene mirar la serie y el socket en la ficha, no solo la gama (3, 5, 7 o 9).",
      [
        { titulo: "AMD Ryzen™ 5 5600X Desktop Processors", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600x.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 7 5800X3D Gaming Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-7-5800x3d.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 7 7700X Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 7 8700G Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/8000-series/amd-ryzen-7-8700g.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 5 9600X", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-5-9600x.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-19, hoja procesador): ajustar. aprobada la propuesta de reformular (NB, 2026-10-19): con la serie se deduce la plataforma (un 5000 es AM4).",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const amdAm5GraficosIntegrados = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-amd-am5-graficos-integrados",
      "Los Ryzen serie 7000 y 9000 para AM5 sin sufijo F incluyen gráficos integrados básicos.",
      [
        { titulo: "AMD Ryzen™ 5 7600X Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600x.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 7 7700X Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 5 9600X", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-5-9600x.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 7 9700X", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9700x.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 5 7500F", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7500f.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const ejemplosAmd = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-ejemplos-amd",
      "Los Ryzen 5 5600G, Ryzen 7 7800X3D y Ryzen 5 7600X existen como productos de AMD.",
      [
        { titulo: "AMD Ryzen Processor Cooling Solutions", editor: "AMD", url: "https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 7 7800X3D Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html", consultadoEn: "2026-10-14" },
        { titulo: "AMD Ryzen™ 5 7600X Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600x.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);
const ejemplosIntel = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-ejemplos-intel",
      "Los Core i5-12400F, Core i7-14700K y Core Ultra 7 265K existen como productos de Intel.",
      [
        { titulo: "Intel® Core™ i5-12400F Processor (18M Cache, up to 4.40 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/134587/intel-core-i512400f-processor-18m-cache-up-to-4-40-ghz/specifications.html", consultadoEn: "2026-10-14" },
        { titulo: "Intel® Core™ i7 processor 14700K (33M Cache, up to 5.60 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/236783/intel-core-i7-processor-14700k-33m-cache-up-to-5-60-ghz/specifications.html", consultadoEn: "2026-10-14" },
        { titulo: "Intel® Core™ Ultra 7 Processor 265K (30M Cache, up to 5.50 GHz) - Product Specifications", editor: "Intel", url: "https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
    ),
    "2026-10-19",
    "NB",
  ),
  6,
);

/* ---------- Hechos de las partes físicas ---------- */
const lga1851NoCompatible = conRevision(
  verificadoPorDueno(
    hecho(
      "cpu-lga1700-lga1851-muescas",
      "LGA 1851 no es compatible con las placas de LGA 1700: los dos sockets se parecen, pero tienen distinto número de contactos y un procesador de uno no funciona en el otro.",
      [
        { titulo: "Information About Intel® Core™ Ultra Boxed Desktop Processors (Series 2)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000099656/processors.html", consultadoEn: "2026-10-14" },
        { titulo: "Artículo de soporte de Intel sobre el socket LGA1700 (000088168)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000088168/processors/intel-core-processors.html", consultadoEn: "2026-10-14" },
      ],
      "Decisión de NB (2026-10-15, hoja procesador): ajustar. aprobada la propuesta de reformular (NB, 2026-10-15). NB confirma que los disipadores sí son compatibles entre ambos (ya cubierto por el hecho socket-disipadores-lga1700-lga1851).",
    ),
    "2026-10-15",
    "NB",
  ),
  6,
);
const ihsTapaMetalica = verificadoPorDueno(
  hecho(
    "cpu-ihs-tapa-metalica",
    "La tapa metálica del procesador (IHS, por integrated heat spreader) cubre el chip y es la superficie que toca la base del disipador, tanto en AMD como en Intel. Entre las dos superficies de metal tiene que haber un buen contacto, con pasta térmica, almohadilla térmica o metal líquido, por lo que conviene que ambas estén limpias y lisas.",
    [
      { titulo: "How to Install or Remove an AMD CPU Cooler (CPU-7)", editor: "AMD", url: "https://www.amd.com/en/resources/support-articles/faqs/CPU-7.html", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-15, hoja procesador): ajustar. ajustado por NB (2026-10-15): redacción general para ambas marcas. Experiencia del taller sin fuente: un procesador doblado por la presión del seguro del socket no hace contacto con el disipador (no se incluyó en el texto).",
  ),
  "2026-10-15",
  "NB",
);
const potenciaDisipador = verificadoPorDueno(
  hecho(
    "cpu-potencia-disipador",
    "Cada procesador declara una potencia (TDP en AMD, potencia base en ARK de Intel) y el disipador debe estar diseñado para cubrirla.",
    [
      { titulo: "Information About Intel® Core™ Ultra Boxed Desktop Processors (Series 2)", editor: "Intel", url: "https://www.intel.com/content/www/us/en/support/articles/000099656/processors.html", consultadoEn: "2026-10-14" },
      { titulo: "AMD Ryzen™ 7 7800X3D Desktop Processor", editor: "AMD", url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html", consultadoEn: "2026-10-14" },
      { titulo: "AMD Ryzen Processor Cooling Solutions", editor: "AMD", url: "https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html", consultadoEn: "2026-10-14" },
    ],
    "Decisión de NB (2026-10-19, hoja procesador): aprobar. aprobado en lote por NB (2026-10-19): verificado con fuente consultada",
  ),
  "2026-10-19",
  "NB",
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
    "En el socket AM4, de tipo PGA, cada pin del procesador entra en un orificio del socket.",
  alElegir: ["Instala el procesador sin presionarlo ni deslizarlo: debe bajar solo, con la palanca levantada.", "Si un pin se dobla, no lo enderezcas sin experiencia: llévalo a revisar antes de forzarlo."],
  hechos: [am4PgaRyzen],
  relacionadas: ["marca-pin-1", "palanca"],
  vistas: ["am4"],
};

const contactosSocket: ParteContenido = {
  orden: 5,
  nombre: "Contactos del socket",
  nombreCorto: "Contactos",
  resumen: "En AM5 los contactos están en la placa, no en el procesador. Un contacto doblado daña la placa.",
  queHace:
    "Son pequeñas puntas o láminas en el socket de la placa. El procesador se apoya sobre ellas por su cara inferior.",
  alElegir: ["No toques los contactos ni pases nada por encima de ellos.", "Guarda la tapa plástica del socket de una placa usada: protege los contactos al transportarla."],
  hechos: [am5Lga],
  relacionadas: ["tapa-sujecion", "zocalo"],
  vistas: ["am5", "intel-lga"],
};

const tapaSujecion: ParteContenido = {
  orden: 6,
  nombre: "Tapa de sujeción del socket",
  nombreCorto: "Tapa",
  resumen: "Marco metálico del socket que se baja sobre el procesador en los sockets LGA.",
  queHace: "Se baja sobre el borde del procesador una vez colocado, y la palanca la cierra.",
  alElegir: ["Cierra la tapa con la palanca sin golpearla; si ofrece mucha resistencia, revisa que el procesador esté alineado.", "No la cierres sin procesador instalado."],
  hechos: [],
  relacionadas: ["palanca", "contactos-socket"],
  vistas: ["am5", "intel-lga"],
};

const palanca: ParteContenido = {
  orden: 7,
  nombre: "Palanca de sujeción",
  nombreCorto: "Palanca",
  resumen: "Se levanta para abrir el socket y se baja para asegurar el procesador.",
  queHace:
    "Es el brazo metálico junto al socket. Levantada, deja libre el procesador; bajada, lo asegura. Hay que moverla con calma y sin torcerla.",
  alElegir: ["Levántala por completo antes de colocar o retirar el procesador.", "Si se siente trabada, no la fuerces: revisa que el procesador esté asentado."],
  hechos: [],
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
  intelSufijosUV,
  amdSufijosXXt,
  amdSufijoF,
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
    "Cada letra y número del nombre dice algo. Primero van la marca y la familia, luego un número de gama dentro de esa familia, después un número de modelo que suele indicar la generación o la serie y, al final, unas letras que cuentan una característica: si trae gráficos integrados, si está desbloqueado o si es de portátil.",
    "Intel y AMD usan un número de gama parecido para ordenar su propia línea. En AMD, las gamas se leen como baja (Ryzen 3), media (Ryzen 5), alta (Ryzen 7) y premium (Ryzen 9). Que dos procesadores lleven el mismo número no significa que rindan igual: compáralos por sus fichas, no por el número.",
    "Los nombres cambian con el tiempo. Intel ha ido cambiando la forma de nombrar sus familias, y hoy conviven nombres anteriores como Core i5 con los nuevos como Core 5 y Core Ultra 5. En AMD no des por hecho que un número mayor sea una plataforma más reciente: confirma el socket en la ficha. En los Core i el número de modelo indica la generación; en Core, sin Ultra, y en Core Ultra, la serie. Usa el desglose para orientarte y confirma siempre en la página del fabricante que el modelo exista.",
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
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "monitor-sin-graficos-integrados",
    tipo: "vivido",
    texto:
      "conectar el monitor a la salida de video de la placa con un procesador que no trae gráficos integrados: no hay imagen. En ese caso el monitor va a la tarjeta gráfica.",
    confirmadoPorDueno: true,
    hechos: [videoRequiereGraficosIntegrados],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "plastico-base-disipador",
    tipo: "puede-pasar",
    texto:
      "olvidar quitar el plástico protector de la base del disipador, sea de aire o líquido: el procesador se calienta porque la base no hace contacto con su tapa metálica.",
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
    id: "pines-doblados-al-instalar",
    tipo: "puede-pasar",
    texto:
      "doblar pines al instalar el procesador: en AM4 los del procesador y en los sockets LGA los contactos de la placa. Pasa al no alinear la marca del pin uno o al forzar el procesador o la tapa.",
    hechos: [socketMarcaPinUno],
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
  {
    id: "comparar-solo-por-numero",
    tipo: "puede-pasar",
    texto:
      "comparar dos procesadores solo por el número del modelo, sin revisar la generación, el socket ni las letras del final, y terminar con uno que no entra en la placa o que no trae gráficos integrados.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
  },
];

// Criterio de taller (opinión de B & W, no dato): lo aprueba el dueño. No lleva fuente ni compara «mejor/peor».
const criterios: readonly Criterio[] = [
  {
    id: "disipador-de-caja-con-procesador-exigente",
    texto:
      "Con un procesador de gama alta, el disipador básico que viene de fábrica suele quedarse corto, porque está pensado para uno de gama baja. Preferimos como mínimo un disipador de torre, aunque sea de un solo ventilador. Si el chasis es pequeño y no cabe, usamos uno de bajo perfil de buena calidad.",
    aprobadoEn: "2026-10-19",
    aprobadoPor: "NB",
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
      resumen: "Un procesador Intel sobre su socket LGA abierto, con la tapa de sujeción levantada.",
      etiquetaFigura: "Dibujo esquemático de un procesador Intel flotando sobre un socket LGA, para que se vean los contactos del socket. Es un contorno genérico, sin marcas ni números de socket.",
      notasPorParte: {
        "pines-procesador": "En esta vista no se ve la cara inferior del procesador, ni pines ni contactos.",
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
