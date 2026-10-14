# Plan de implementación: "Piezas a fondo", piloto con la tarjeta madre

> Plan de arquitectura (solo lectura). Revisé el código real de BWPCs y de BWReel. Cuando algo de la idea choca con el código, manda el código y lo dejo anotado. Ningún dato técnico de este documento queda afirmado como cierto: todos están marcados "por verificar".

---

## 0. Hallazgos que cambian la idea (léelos primero)

1. **La placa del modelo 3D actual no sirve tal cual para una página "exacta".** `BWReel/src/parts/mobo.ts` (`moboBoard`) es una caricatura correcta para el video, pero no es un diagrama ATX:
   - Mide 305 × 244, pero el borde trasero (E/S y soportes de las PCIe) quedó en el lado de 244 (`x = -152`). La placa también va montada así en la torre (`case.ts`: `zc = zCenter + xb`, `yc = yCenter - zb`), o sea "acostada" respecto a una ATX real.
   - Tiene 3 ranuras PCIe separadas 28 mm (`pcie(62…)`, `pcie(90…)`, `pcie(118…)`). La separación estándar está por verificar (P5).
   - Faltan el conector EPS del procesador, los cabezales de ventilador, los USB/audio frontales y una M.2 descubierta: la única M.2 está bajo disipador y no deja ver la llave.
   - **Recomendación:** un modelo nuevo, `moboDetail`, en un archivo nuevo, y **no tocar** `moboBoard`. Esa función la usan la torre del hero (`TowerAssets`), los recortes de procesador y RAM (`boardPatch`) y el paso "boards" de /servicios. Cambiarla obligaría a regenerar el hero y /servicios, lo que contradice la decisión 1.
2. **Hay una inconsistencia entre el CPU y el socket del modelo.** `cpu.ts` dibuja pines bajo el sustrato (tipo PGA, como AM4) y `socketParts.ts` dibuja una tapa con palanca (tipo LGA). Sirve para la placa (el socket se explica de forma genérica), pero **no se puede reutilizar para la página de procesador** (AM5 / Intel). Esa página necesitará modelos nuevos.
3. **El enlace "Ver a fondo" dentro de cada paso del recorrido no alcanza para accesibilidad.** El escenario es `aria-hidden="true"`, y con JS la `.cs-list` queda solo para lectores de pantalla. Un enlace enfocable dentro de la lista sería un foco invisible para quien navega con teclado. Propuesta mínima:
   - En el escenario, el enlace lleva `tabIndex={-1}` y solo sirve para mouse y toque.
   - Una línea con el enlace en flujo normal bajo el párrafo de la sección `#componentes`, visible siempre (con o sin JS, teclado, lector de pantalla).
   - La `.cs-list` no se toca.
4. **La densidad en móvil es el riesgo de UX número uno.** La vista isométrica de la placa a 343 px de ancho mide unos 200 px de alto (con la proporción de `boards/unica`, 498 × 294). Con unas 14 partes, los marcadores de 44 px no caben sin taparse.
   - Solución: marcadores visibles de 24 px.
   - Toque por "parte más cercana" sobre todo el dibujo (partición de Voronoi).
   - Botones anterior/siguiente de 44 px, más la lista completa como control equivalente.
   - Comprobar la separación mínima en `check:logic`.
5. **El costo total es grande: 5 piezas con variantes, un modelo 3D nuevo por pieza y entre 40 y 60 datos que hay que verificar por pieza.** Recomiendo **medir el piloto 6 a 8 semanas** antes de seguir con RAM, procesador, gráfica y fuente:
   - Search Console: impresiones y clics de "partes de la tarjeta madre".
   - Vercel Analytics: visitas de la página.
   - Paso de esa página a /cotizador.

---

## 1. Resumen y alcance del piloto

**Qué es:** una página estática (SSG) con:
- el dibujo isométrico de una tarjeta madre ATX típica, sacado de BWReel;
- unos 14 puntos numerados que se pueden tocar;
- un panel fijo bajo el dibujo (al lado en escritorio) con qué es y qué hace cada parte;
- la explicación completa de cada parte en el HTML: lista de secciones con datos y fuentes;
- tamaños (ATX / Micro-ATX / Mini-ITX), qué mirar al elegir, errores comunes de compatibilidad y CTA al cotizador.

**Dentro del piloto:**
- Ruta `/piezas/[pieza]` con una sola pieza (tarjeta madre).
- Contrato de tipos genérico, listo para variantes y comparaciones, aunque estas no se implementan.
- Pipeline nuevo en BWReel: modelo `moboDetail`, proyección de partes, imágenes y datos generados.
- Componente interactivo sin librerías.
- SEO: metadata, `TechArticle` y `BreadcrumbList`, sitemap y redirección.
- Enlaces desde /servicios (paso "Boards"), desde el inicio (la palabra "Board" de la línea mono) y desde las guías.
- Puerta de publicación: ningún dato sin verificar llega a producción.
- Casos nuevos en `check:logic` y actualización de CLAUDE.md.

**Fuera del piloto:**
- Páginas de RAM, procesador, gráfica y fuente (el modelo queda listo, ver §10).
- Chasis, refrigeración y almacenamiento (decisión del dueño).
- Ampliar o mover el dibujo en móvil: el contrato ya trae `foco`, pero la interacción queda para la fase 2.
- Página índice `/piezas`: se hace cuando haya 2 o más piezas, para no publicar contenido delgado.
- Versión Markdown para agentes (`Accept: text/markdown`): opcional, después.
- Precios, plazos, garantías y logos de marcas.

---

## 2. URL, rutas, archivos y SEO

### 2.1 URL recomendada

**`/piezas/tarjeta-madre`**, con redirección permanente de `/piezas/placa-base`, `/piezas/board` y `/piezas/motherboard`.

- En Colombia se dice "board" al hablar, pero como palabra de búsqueda es ambigua (skateboard, tableros…). "Placa base" es uso de España y "placa madre" del Cono Sur. Creo que "tarjeta madre" es el término escrito más usado en Colombia y México. **Hay que confirmarlo con Google Trends (CO) y Keyword Planner antes de fijar el slug** (pregunta 1, §9).
- El texto usa "tarjeta madre (board)" la primera vez y después "board", que es como ya habla el sitio ("Boards" en /servicios, "Board" en el inicio). Menciona una vez los sinónimos "placa base" y "motherboard".
- `/componentes` no se toca: es el catálogo con `SHOW_COMPONENTS_PAGE = false` en `src/lib/site-config.ts`.

### 2.2 Archivos (todos los nuevos llevan el encabezado BlacKraken `/* … */`)

```
src/lib/piezas/
  types.ts                      CONTRATO (a mano). Tipos + PIEZA_SLUGS + TARJETA_MADRE_PARTES (as const). Sin imports de valores.
  entorno.ts                    entornoActual(): "produccion" | "preview" | "desarrollo" (lee VERCEL_ENV). Puro.
  hotspots.ts                   Matemática pura: nearestPart, anchorPct, stepPart, partFromHash, focusTransform, minAnchorSpacing.
  tarjeta-madre.contenido.ts    Texto + hechos + fuentes (a mano). Solo `import type`.
  tarjeta-madre.geo.ts          GENERADO por BWReel (scripts/build-piece-assets.py). No editar a mano.
  registro.ts                   PIEZAS, piezasVisibles(entorno), piezaPorSlug(slug, entorno), hrefPiezaServicios(pieceId, entorno).
                                Imports relativos con extensión .ts (patrón de payment-methods.ts) para que check:logic los cargue.
src/components/piezas/
  pieza-explorador.tsx          "use client": figura (<picture> + capa SVG + marcadores <a>) + panel. Único estado React: parte elegida.
  pieza-partes.tsx              Servidor: lista <section id=parte> con h3, qué hace, al elegir, Datos (<dl> mono), opciones, <details> Fuentes.
  factores-forma.tsx            Servidor: SVG a escala dibujado con las medidas de los hechos (sin imágenes).
src/app/(public)/piezas/[pieza]/page.tsx
                                generateStaticParams (piezas visibles) + dynamicParams = false + generateMetadata.
public/piezas/
  tarjeta-madre.webp            ~1400 px, sin pérdida, ≤ 80 KB
  tarjeta-madre-sm.webp         ~900 px, ≤ 40 KB
  tarjeta-madre-og.jpg          1200×630, ≤ 120 KB
scripts/check-piezas.mjs        Casos nuevos. check-logic.mjs gana UNA línea: import "./check-piezas.mjs".
```

Cambios pequeños en archivos existentes:
- `src/components/component-showcase.tsx`: `ShowcaseItem.href?` y un enlace con `tabIndex={-1}` en la cabecera del paso.
- `src/app/(public)/servicios/page.tsx`: `href` en el ítem `boards` cuando la pieza está visible, y la línea en flujo normal.
- `src/app/(public)/page.tsx`: "Board" de la línea mono enlazado cuando la pieza esté publicada.
- `src/app/sitemap.ts`.
- `next.config.ts`: `redirects()`.
- `src/lib/blog/generate.ts`: sumar el título y la descripción de las piezas publicadas a `existentes`, para que la IA no escriba una guía duplicada.
- `public/llms.txt`: al publicar.
- `src/app/(public)/guias/[slug]/page.tsx`: bloque opcional "Piezas a fondo".

### 2.3 Metadata y datos estructurados

- **title:** "Partes de la tarjeta madre (board) y para qué sirven". La plantilla `%s · B & W` del layout raíz lo deja en unos 60 caracteres.
- **description (120 a 160 caracteres):** "Toca cada parte de una tarjeta madre y mira qué hace: socket, chipset, RAM, PCIe, M.2, SATA, VRM y conectores. Qué revisar antes de elegir la tuya."
- **canonical:** `/piezas/tarjeta-madre`. **openGraph:** `type: "article"`, imagen `/piezas/tarjeta-madre-og.jpg`, `url` absoluta; el `locale` `es_CO` se hereda.
- **JSON-LD:**
  - **BreadcrumbList**, con `BreadcrumbJsonLd` existente: Inicio › Tarjeta madre. En el piloto no hay paso intermedio porque `/piezas` no existe todavía y daría 404.
  - **TechArticle** (subtipo de `Article`), con la misma forma que `articleSchema` de `guias/[slug]/page.tsx`: `headline`, `description`, `inLanguage: "es-CO"`, `datePublished`, `dateModified` (= fecha de verificación más reciente), `author` y `publisher` Organization, `image`. Va por `<JsonLd>`, que ya usa `jsonLdString`.
  - **FAQPage:** solo si hay una sección real de preguntas, y reutilizando `FaqSection` (ya emite FAQPage con `jsonLdString`). Google dejó de mostrar ese resultado enriquecido para sitios comerciales, así que su valor es para motores de IA. Riesgo bajo, pero no se fuerza.
  - **HowTo: no.** La página no es un "cómo hacer" y Google retiró ese resultado enriquecido.
  - **DefinedTermSet:** opcional después (glosario de partes, útil para GEO).
- **robots:** las piezas en borrador se publican solo fuera de producción y con `robots: { index: false }`. No hay cambios en `robots.ts`.
- **sitemap.ts:** sumar solo las piezas con `estado === "publicado"`, con `lastModified` = `actualizadoEn` y `priority 0.7`.
- **Enlazado interno:**
  - /servicios: paso "Boards" y la línea en flujo normal (§0.3).
  - Inicio: "Board" en la línea `GPU · CPU · RAM · Board…` de `#hacemos`. Es un enlace discreto que no compite con el CTA.
  - Guías: bloque "Piezas a fondo".
  - Desde la pieza hacia las guías: un enlace a `/guias` (el índice siempre existe). Las guías están en Mongo y pueden despublicarse; el slug no cambia, pero un enlace fijo a una guía despublicada daría 404.
- **Guías existentes:** el historial de git muestra 4 originales (`cuanto-cuesta-armar-un-pc-en-colombia`, `cuanta-ram-necesito`, `cuantos-vatios-necesita-mi-fuente`, `80-plus-vs-cybenetics`). Puede haber más generadas por IA en la colección `guides`: **revisar sus títulos en la BD antes de redactar**. No hay solapamiento directo con "partes de la tarjeta madre"; la sección de memoria enlaza a "cuánta RAM necesito" en vez de repetirla.

---

## 3. Modelo de datos (contrato)

### 3.1 Dónde vive el contenido: archivo TS en git, no Mongo ni admin

- **Exhaustividad por tipos:** `partes: Record<TarjetaMadreParteId, …>`. Si el generador agrega o quita una parte, `tsc` falla. Con Mongo eso sería un error en tiempo de ejecución.
- **Revisión:** cada dato lleva fuente y fecha de verificación, y el diff de git es el registro de revisión. El admin de guías es JSON crudo, a propósito simple, y no lleva fuentes.
- La geometría también está en git (generada). Contenido y geometría deben avanzar juntos.
- **Sin dependencia de BD en la compilación ni en tiempo de ejecución:** la página es 100 % estática.
- El contenido cambia poco. Para editarlo basta una PR.

### 3.2 Tipos exactos (`src/lib/piezas/types.ts`)

```ts
export const PIEZA_SLUGS = ["tarjeta-madre"] as const; // luego: "memoria-ram" | "procesador" | "tarjeta-grafica" | "fuente-de-poder"
export type PiezaSlug = (typeof PIEZA_SLUGS)[number];
export type EstadoContenido = "borrador" | "revision" | "publicado";
export type Entorno = "produccion" | "preview" | "desarrollo";

/** IDs fijos de la tarjeta madre: BWReel debe emitir exactamente estos (lee este archivo al generar). Orden = orden de lectura. */
export const TARJETA_MADRE_PARTES = [
  "socket", "chipset", "vrm", "conector-cpu", "ranuras-ram", "pcie-principal", "pcie-secundarias",
  "m2", "sata", "conector-24-pines", "puertos-traseros", "cabezales-ventilador", "conectores-frontales", "bateria-cmos",
] as const;
export type TarjetaMadreParteId = (typeof TARJETA_MADRE_PARTES)[number];

/* ---------- Geometría (la genera BWReel; px del viewBox = px de diseño) ---------- */
export type Pt = readonly [number, number];
export interface Rect { x: number; y: number; w: number; h: number }
export interface ImagenPieza {
  href: string; hrefSm: string;           // "/piezas/tarjeta-madre.webp", "/piezas/tarjeta-madre-sm.webp"
  ancho: number; alto: number;            // px reales del archivo grande
  anchoSm: number; altoSm: number;
}
export interface ParteGeo {
  ancla: Pt;                              // centro del marcador (sobre la zona VISIBLE de la parte)
  contornos: readonly (readonly Pt[])[];  // polígonos proyectados (uno o varios: p. ej. 2 ranuras), para resaltar
  foco: Rect;                             // recuadro con margen para ampliar (fase 2)
  visible: number;                        // 0..1 fracción visible de la cara superior (raycast)
}
export interface VistaGeo<P extends string> {
  w: number; h: number;                   // viewBox; w/h = ancho/alto de la imagen (exacto)
  imagen: ImagenPieza;
  partes: Readonly<Partial<Record<P, ParteGeo>>>;
}
export interface PiezaGeo<P extends string, V extends string = "unica"> {
  generadoEn: string;                     // ISO
  modelo: string;                         // hash corto de los fuentes 3D (detecta desfase)
  vistas: Readonly<Record<V, VistaGeo<P>>>;
}

/* ---------- Contenido (a mano) ---------- */
export interface Fuente {
  titulo: string; editor: string;         // "AMD", "Intel", "PCI-SIG", "JEDEC", "SATA-IO", "Manual <modelo>"
  url: string;                            // https
  consultadoEn: string;                   // YYYY-MM-DD
}
export interface Hecho {
  id: string;                             // kebab-case, único en la pieza ("am5-memoria")
  texto: string;                          // lo que se muestra (aquí SÍ puede haber cifras)
  fuentes: readonly Fuente[];             // ≥ 1 primaria para publicar
  verificadoEn: string | null;            // YYYY-MM-DD; null = pendiente
  verificadoPor: string | null;           // iniciales de quien revisó
  nota?: string;                          // interno, no se muestra
}
export interface OpcionParte {            // socket → AM4 / AM5 / LGA 1700 / LGA 1851
  id: string; etiqueta: string;           // texto del chip, nunca logo
  marca?: "AMD" | "Intel" | "NVIDIA";
  resumen: string;                        // sin cifras
  vigente: boolean;                       // plataforma actual o anterior (en vez de fechas)
  hechos: readonly Hecho[];
}
export interface ParteContenido {
  orden: number;                          // 1..n: número del marcador y de la sección
  nombre: string; nombreCorto: string;    // "Socket del procesador" / "Socket"
  alias?: readonly string[];              // "zócalo"
  resumen: string;                        // panel, ≤ 160 caracteres, sin cifras
  queHace: string;                        // sin cifras
  alElegir: readonly string[];            // viñetas, sin cifras
  hechos: readonly Hecho[];
  opciones?: { titulo: string; items: readonly OpcionParte[] };
  relacionadas?: readonly string[];       // ids de otras partes ("vrm" ↔ "conector-cpu")
  enlaces?: readonly { etiqueta: string; href: `/${string}` }[]; // solo internos
}
export interface SeccionTexto { id: string; titulo: string; parrafos: readonly string[]; vinetas?: readonly string[]; hechos?: readonly Hecho[] }
export interface FactorForma { id: string; nombre: string; anchoMm: number; altoMm: number; hecho: Hecho }

/* Variantes y comparaciones: listas para RAM/CPU; el piloto NO las usa (check:logic lo exige). */
export interface VarianteContenido<P extends string, V extends string> {
  id: V; etiqueta: string; resumen: string;           // "DDR4"
  notasPorParte?: Readonly<Partial<Record<P, string>>>;
}
export interface Comparacion<V extends string> {
  titulo: string; columnas: readonly V[];
  filas: readonly { etiqueta: string; valores: Readonly<Record<V, Hecho>> }[];
}

export interface PiezaContenido<P extends string, V extends string = "unica"> {
  slug: PiezaSlug; estado: EstadoContenido;
  piezaServicios?: string;                // PieceId del recorrido de /servicios ("boards") para "Ver a fondo"
  titulo: string; descripcion: string; h1: string; eyebrow: string; // eyebrow sin mayúsculas sostenidas
  intro: readonly string[]; palabrasClave: readonly string[];
  terminos: readonly string[];            // nombres de estándar permitidos en prosa: "M.2", "DDR4", "DDR5", "AM5", "LGA 1700"…
  publicadoEn: string | null; actualizadoEn: string;
  partes: Readonly<Record<P, ParteContenido>>;   // exhaustivo
  secciones: readonly SeccionTexto[];             // "elegir", "errores"
  factoresForma?: readonly FactorForma[];
  faq?: readonly { q: string; a: string }[];
  variantes?: readonly VarianteContenido<P, V>[];
  comparaciones?: readonly Comparacion<V>[];
  cta: { titulo: string; texto: string; etiqueta: string; href: "/cotizador" };
}

/** Lo único que recibe el componente de cliente (no se manda el texto largo al navegador). */
export interface ParteResumen { id: string; orden: number; nombre: string; nombreCorto: string; resumen: string }
```

### 3.3 Reglas del contrato

- El archivo generado exporta `TARJETA_MADRE_GEO = {…} satisfies PiezaGeo<TarjetaMadreParteId>`. Con `satisfies`, `tsc` marca ids desconocidos (exceso de propiedades); `check:logic` marca los que faltan.
- Coordenadas en **px del viewBox**, redondeadas a 0,1, igual que `STAGE_PIECES`. Los marcadores HTML usan porcentajes calculados con `anchorPct` (tamaño fijo en px CSS en cualquier pantalla).
- Ids de sección reservados que ninguna parte puede usar: `partes`, `lista`, `tamanos`, `elegir`, `errores`, `fuentes`, `cotizar`, `preguntas`.

---

## 4. Pipeline desde BWReel

> BWReel **no es repositorio git**. Antes de tocarlo hay que sacar una copia con fecha de `src/` y `scripts/` a `work/backup-AAAAMMDD/`, y anotar el `shasum` de `src/parts/mobo.ts`, `src/stageModel.ts`, `src/parts/case.ts`, `scripts/build-component-assets.py` y `scripts/build-tower-assets.py`. Esos archivos deben quedar idénticos.

### 4.1 Archivos nuevos en BWReel (ninguno modifica los existentes)

| Archivo | Qué hace |
|---|---|
| `src/parts/moboDetail.ts` | Modelo ATX fiel (dimensiones y posiciones por verificar con la especificación ATX: orificios, separación de ranuras, zona de E/S). Exporta `MOBO_DETAIL_FEATURES: Record<id, { min: V3; max: V3; extra?: {min;max}[] }>` y `moboDetail()`, que dibuja **a partir de esas mismas cajas** (una sola fuente de verdad para el dibujo y los puntos). Usa el kit de líneas existente (`box`, `circle`, `cylY`, `LW`) para mantener el mismo trazo que /servicios. |
| `src/detailModel.ts` | Vistas de detalle: `DETAIL_VIEWS = { "tarjeta-madre/unica": { zoom ≈ 1.8, target: centro } }`, `buildDetail(slug, vista)` en el formato `StageItem` existente (una capa `base`), y reutiliza `project()` de `stageModel.ts` por import, sin editarlo. El lienzo de Remotion es 1080 de ancho: con zoom ≤ 2,6 la placa cabe. |
| Composición `DetailLayer` (en un `src/DetailAssets.tsx` nuevo, registrada en `Root.tsx` con una línea; es el único toque a un archivo existente, solo un registro) | Igual que `PieceLayer`, para las vistas de detalle. |
| `scripts/piece-hotspots.ts` | Por cada id importado de `…/BWPCs/src/lib/piezas/types.ts` (esbuild resuelve la ruta absoluta; si al modelo le falta un id, aborta): (1) proyecta las 8 esquinas de cada caja con `project()` y calcula la envolvente convexa → `contornos`; (2) muestrea la cara superior (rejilla 7×7, levantada 0,03 mm) con un rayo hacia la cámara contra los rellenos, igual que `visibleRuns` de `component-stage.ts` → `visible`; (3) `ancla` = muestra visible más cercana al centroide de lo visible; (4) separación: reubicación codiciosa del ancla dentro de lo visible hasta lograr ≥ 24 px CSS entre marcadores a 343 px de ancho de figura, y si no se puede, aborta; (5) `foco` = caja del contorno + margen, ajustada al viewBox. Salida: JSON por stdout. |
| `scripts/build-piece-assets.py` | Copia el patrón de `build-component-assets.py`: bundle de Remotion, render a SCALE 2 (grande) y 1,3 (sm), recorte al viewBox, WebP sin pérdida con presupuestos (grande ≤ 80 KB, sm ≤ 40 KB), OG 1200×630 en JPEG sobre vainilla (sin texto), escribe `src/lib/piezas/<slug>.geo.ts` con el encabezado BlacKraken y la línea "Generado por BWReel (scripts/build-piece-assets.py). No editar a mano.". `--only=<slug>`: copia `public/piezas` a staging y borra solo el prefijo de esa pieza (no pisa a las demás). |
| `scripts/preview-piece.py` | Como `preview-tower.py`: compone la imagen grande con los contornos, los marcadores numerados (tamaño de móvil y de escritorio) y el círculo de 24 px, y escribe `work/piezas/preview_<slug>_{lg,375}.png` para revisarlo a ojo. |

### 4.2 Atomicidad

Igual que en los scripts actuales:
1. Todo se escribe en `work/piezas/staging/`.
2. Se valida: cada `href` existe; sm < grande; presupuestos; `w/h` del viewBox = `ancho/alto` de la imagen (±0,5 %); los ids son exactamente `TARJETA_MADRE_PARTES`; `visible ≥ 0,15` por parte; separación mínima.
3. Solo si todo pasa: `public/piezas → public/piezas.old`, `staging → public/piezas`, se borra `.old`, y el `.ts` se escribe con `os.replace`.
4. Los **nombres de archivo son estables** (sin hash). Si el proceso se cae entre el intercambio y el `.ts`, el `.ts` viejo sigue apuntando a archivos existentes.

### 4.3 Qué existe y qué falta (placa)

| Parte | ¿Existe en `moboBoard`? | En `moboDetail` |
|---|---|---|
| Socket con palanca | Sí (genérico, 60×60) | Reutiliza el estilo; tamaño de referencia por verificar |
| VRM (disipadores en L) y condensadores | Sí | Reutiliza la forma |
| Chipset con disipador | Sí | Reubicar |
| M.2 con disipador | Sí, 1 | + **1 M.2 descubierta** con separador y llave visible (nuevo) |
| PCIe | 3, separadas 28 mm | Separación y cantidad según ATX (por verificar) |
| DIMM ×4 | Sí | Reubicar |
| ATX 24 pines | Sí | Reubicar al borde frontal |
| SATA | 3 cajas | Ajustar |
| Batería CMOS | Sí | Reubicar |
| E/S trasera | Bloque genérico | Bloque con hileras sugeridas, sin puertos de marca |
| **EPS 8 pines (4+4)** | **No** | Nuevo |
| **Cabezales de ventilador** | **No** | Nuevo (2 o 3) |
| **USB frontal 19/20 pines, USB-C frontal, audio HD** | **No** | Nuevo |
| Panel frontal | Ambiguo (una hilera) | Explícito |
| Chip BIOS, LEDs de diagnóstico | No | **No se dibujan**: se explican en el texto ("lo que no se ve en el dibujo") |

### 4.4 Esfuerzo (una persona; con agentes baja, pero la revisión visual es humana)

| Tarea | Días |
|---|---|
| `moboDetail` + verificación de posiciones ATX | 2 a 3 |
| `detailModel` + composición | 0,5 |
| `piece-hotspots.ts` (proyección, visibilidad, separación) | 1 a 1,5 |
| `build-piece-assets.py` (render, WebP, OG, validación, intercambio, TS) | 1 |
| `preview-piece.py` | 0,5 |
| **Total BWReel** | **5 a 6,5 días** |

Atajo para desbloquear: un **v0** del pipeline (unas 0,5 días) contra el `moboBoard` actual, importado sin editar y con cajas aproximadas de lo que ya existe. Así la UI y la página se integran con datos reales mientras se hace `moboDetail`.

### 4.5 Alternativa más barata (no recomendada)

Usar `moboBoard` tal cual con el aviso "dibujo esquemático, no a escala" ahorra unos 2 a 3 días, pero deja una placa con la E/S y las ranuras en el borde equivocado en una página que vende exactitud (pregunta 2).

---

## 5. UI/UX

### 5.1 Estructura de la página (orden del DOM = orden de lectura)

1. `TowerBackdrop` (convención de todas las páginas públicas) y `PageHero`: eyebrow en mono "Piezas del PC · revisado AAAA-MM-DD", H1 en Geist 800, intro de 1 o 2 frases, CTA "Cotiza tu PC" y `ShareButton`. Ese botón usa `location.href`, así que comparte con el `#parte` sin cambios.
2. `#partes`: la figura y el panel dentro de una tarjeta `bg-vanilla` opaca con borde hairline, para que la torre no se vea a través del dibujo.
3. `#lista`, "Las partes, una por una": secciones `01…14`.
4. `#tamanos`: ATX / Micro-ATX / Mini-ITX a escala.
5. `#elegir`: qué mirar al elegir.
6. `#errores`: errores comunes de compatibilidad.
7. `#fuentes` (`<details>`), `#cotizar` (CTA).

### 5.2 Layout

- **Móvil (375):** figura a todo el ancho (unos 343 × 200 px). Debajo, el panel con altura mínima reservada (unas 12 rem), para que el contenido no salte al cambiar de parte:
  - fila superior: `← Anterior · 03 / 14 · Siguiente →`, botones de 44 px;
  - nombre (Geist 600);
  - resumen (400);
  - para el socket, chips de texto en mono `AM4 · AM5 · LGA 1700 · LGA 1851`;
  - "Leer todo sobre el socket ↓" (`#socket`).
- **Tablet (768):** igual, con la figura más grande.
- **Escritorio (≥ 1024):** cuadrícula de 7/12 para la figura y 5/12 para el panel, con el panel `sticky top-20` al lado. La lista va abajo a todo el ancho.

### 5.3 Figura (sin librerías)

- `<picture>` con `<source media="(max-width: 767px)" srcset=sm>` y `<img src=lg width height alt fetchpriority="high" decoding="async" class="piece-ink">`. Es la misma lógica de "sm < 768" del sitio, pero sin JS. La regla oscura `html[data-theme="dark"] .piece-ink` ya existe y sirve para un `<img>`: **cero CSS nuevo para modo oscuro**.
- Encima, `<svg viewBox="0 0 w h" preserveAspectRatio="none" aria-hidden>`, solo con el contorno de la parte elegida (trazo `currentColor` en `text-accent`, 2 px, sin relleno).
- **Marcadores = HTML `<a href="#socket">`** posicionados con **estilo en línea** (`position:absolute; left:%; top:%; transform:translate(-50%,-50%); width:24px; height:24px`). La posición crítica en línea los protege del incidente de CSS viejo.
  - Visual: cuadrado de 24 px con radio de 2 px, número `font-mono text-xs`, fondo vainilla y borde panda de 1,5 px.
  - Elegido: fondo de acento, texto `accent-ink` y giro de 45° (el cuadrado se vuelve rombo, mismo motivo que `SectionNav`).
  - Enfoque: `outline 2px panda, offset 2`.
- **Toque en cualquier punto del dibujo:** una capa transparente bajo los marcadores calcula la parte más cercana (`nearestPart`, distancia máxima unos 60 px de viewBox). Todo el dibujo funciona como zona táctil sin solapes.
- Pie de figura: "Dibujo de una tarjeta madre ATX típica. La ubicación de cada parte cambia según el modelo."

### 5.4 Interacción

- **Con JS:** al hacer clic en un marcador se cancela el salto (`preventDefault`), se elige la parte y se ejecuta `history.replaceState(null, "", "#socket")`: no hay salto ni basura en el historial.
- Teclado: `Tab` recorre los marcadores **en orden pedagógico** (DOM ordenado por `orden`, no por posición); `Enter` elige.
- Anterior/Siguiente son `<a href="#id-vecino">`: funcionan sin JS y con JS se interceptan. Dan la vuelta del 14 al 1.
- **Enlace profundo:** al montar se lee `location.hash` (`partFromHash`) y se elige la parte. El navegador además hace scroll a la sección `#socket` de la lista, y eso es lo deseado para un enlace compartido: el texto completo arriba y el dibujo ya marcado. Hay un oyente de `hashchange` para los enlaces internos de la lista.
- La sección usa `scroll-mt-20`, o el equivalente en estilo en línea, porque el encabezado es fijo de 64 px.
- **Sin JS:** cada marcador salta a su sección, anterior/siguiente también, y el panel muestra un texto fijo: "Toca un número para ir a esa parte" más la lista de partes como enlaces.

### 5.5 Accesibilidad

- `<figure aria-labelledby>` + `alt` descriptivo.
- Cada marcador: `aria-label="3. VRM, alimentación del procesador"` y `aria-current="true"` en el elegido.
- Panel: `<section aria-labelledby>`. Un `<p class="sr-only" aria-live="polite">` anuncia solo "VRM, parte 3 de 14" (no todo el texto). El foco se queda en el marcador.
- Enlace "Saltar a la lista de partes", visible al enfocarlo, antes de los marcadores.
- Contraste: la regla del 3:1 para controles se cumple (acento sobre vainilla; en oscuro, tokens ya pensados para AA). El texto del número sobre el acento también cumple.
- Tamaño de objetivo: 24 px más la separación verificada (WCAG 2.5.8) y la lista como control equivalente. Anterior/siguiente miden 44 px.
- Idioma, jerarquía (H1, luego h2 por sección, luego h3 por parte) y nada de `div` clicable.

### 5.6 Movimiento

- Lo único que se anima: la transición de 150 ms del marcador elegido (rotación y color). Las reglas globales de `prefers-reduced-motion` ya la anulan.
- **No se anima:** recorrido automático, marcadores que laten en bucle, zoom o paneo, aparición de secciones con el scroll, fundidos del panel, despiece, nada ligado al scroll y nada de tooltips.

### 5.7 Tono visual

- Geist 800 en el H1, 700 en los h2, 600 en los nombres de parte y 400 en el cuerpo.
- Datos en `<dl>` con valores `font-mono text-sm`.
- Eyebrows en minúsculas iniciales, sin mayúsculas sostenidas.
- Un solo acento por pantalla: en la figura, solo el marcador elegido y su contorno. El botón de acento del CTA queda lejos, al final.
- Sin sombras en superficies estáticas, bordes de 2 px como máximo.

### 5.8 Móvil: ampliar o desplazar

- **No** al desplazamiento horizontal: esconde partes y pelea con el gesto de volver.
- **Sí** a la imagen completa con marcadores de 24 px, el toque por cercanía y la lista.
- Fase 2 opcional: botón "Ampliar" que aplica `focusTransform(foco)` (escala de 1 a 3 que deja el recuadro dentro de la figura, sin gestos; instantáneo con movimiento reducido). El dato `foco` ya viene en el contrato.
- **Alternativa descartada:** placa vertical "como va en el chasis". Da el doble de resolución en móvil, pero obliga a un panel fijo abajo tipo hoja y a desplazarse sobre la figura.

### 5.9 Componentes de BWPCs que se reutilizan

`PageHero`, `ButtonLink`, `BreadcrumbJsonLd`, `JsonLd` + `jsonLdString`, `FaqSection` (si hay preguntas), `TowerBackdrop`, la regla `.piece-ink`.

---

## 6. Contenido

### 6.1 Esquema pedagógico de la página

1. **Qué es:** la placa que conecta todo; se elige según el procesador.
2. **Las partes** (este es el `orden`):
   1. socket
   2. chipset
   3. VRM
   4. conector del procesador (EPS)
   5. ranuras de RAM
   6. PCIe principal
   7. PCIe secundarias
   8. M.2
   9. SATA
   10. 24 pines
   11. puertos traseros
   12. ventiladores
   13. conectores frontales
   14. batería CMOS

   Además, "lo que no se ve en el dibujo": chip de la BIOS/UEFI y botones de la BIOS.
3. **Tamaños** (ATX, Micro-ATX, Mini-ITX): qué cabe en qué chasis.
4. **Qué mirar al elegir:** socket y chipset, generación de memoria, tamaño frente al chasis, cantidad de M.2, puertos traseros que de verdad usas, VRM según el procesador, BIOS al día.
5. **Errores comunes de compatibilidad.** Ideal: 3 a 5 casos reales del taller, sin datos personales (pregunta 5).
6. **CTA:** "¿Prefieres no revisar compatibilidades tú mismo? En el cotizador eliges la gama de cada pieza y antes de confirmar revisamos contigo que todo encaje." Botón "Cotiza tu PC" con el acento, hacia `/cotizador`. La frase sobre la revisión debe aprobarla el dueño (pregunta 4).

### 6.2 Reglas de tono

- Español neutro de Colombia, tuteo, sin voseo ("elige", "revisa"; nunca "elegí"). Igual que el sitio ("Cuéntanos qué necesitas").
- Sin precios, plazos, garantías, "el mejor" ni superlativos. Sin promesas de compatibilidad garantizada.
- Marcas solo como texto (AMD, Intel, NVIDIA), nunca logos.
- **Regla de cifras:** la prosa (`resumen`, `queHace`, `alElegir`, `secciones.parrafos`) **no lleva cifras**, salvo los nombres de estándar listados en `terminos` (M.2, DDR4, AM5…). Toda cifra vive en un `Hecho` con fuente. `check:logic` lo hace cumplir.
- Fechas visibles: "revisado AAAA-MM-DD", tomada del `verificadoEn` más reciente.
- Sinónimos una sola vez: placa base, motherboard, board.

### 6.3 Lista de datos que hay que verificar con fuente primaria (NINGUNO se da por cierto)

Cada uno se convierte en un `Hecho` con `fuentes[]`, `verificadoEn` y `verificadoPor`. Estado inicial de todos: **pendiente**.

| ID | Pregunta a verificar | Fuente primaria sugerida |
|---|---|---|
| S1 | ¿AM4 es PGA (pines en el procesador)? ¿Qué familias Ryzen soporta? | AMD (páginas de plataforma y producto) |
| S2 | ¿AM5 es LGA (contactos en la placa)? ¿Cuántos contactos? ¿Solo admite DDR5? | AMD |
| S3 | ¿Los disipadores de AM4 montan en AM5 sin adaptador? | AMD, fabricantes de disipadores |
| S4 | ¿Qué generaciones de Intel Core usan LGA 1700? ¿Admite DDR4 o DDR5 según la placa? | Intel ARK, fichas de plataforma |
| S5 | ¿Qué procesadores usan LGA 1851 (¿Core Ultra serie 200S?)? ¿Qué memoria admite? | Intel |
| S6 | ¿Los disipadores de LGA 1700 sirven en LGA 1851? | Intel, fabricantes |
| S7 | ¿Mismo socket garantiza compatibilidad? (casos de BIOS o chipset) | Listas de compatibilidad AMD/Intel, manuales |
| S8 | ¿Marca de alineación del pin 1 (triángulo) en procesador y socket? | AMD/Intel, guías de instalación |
| S9 | ¿Vigencia anunciada de AM5? (riesgo: es promesa de un tercero; recomiendo no publicarla) | AMD |
| C1 | ¿Qué chipsets son de AM5 (A620, B650, B650E, X670, X670E, B850, X870, X870E)? | AMD |
| C2 | ¿Qué chipsets permiten overclock del procesador y de la memoria (AMD y Intel)? | AMD, Intel |
| C3 | ¿Qué chipsets son de LGA 1700 (H610, B660, H670, Z690, B760, Z790) y de LGA 1851 (¿B860, Z890, H810?)? | Intel |
| C4 | ¿El chipset se une al procesador por un enlace (DMI en Intel, PCIe en AMD) que comparten los dispositivos conectados a él? | Intel, AMD |
| C5 | ¿Qué depende del procesador y qué del chipset (líneas PCIe, USB, M.2)? | Diagramas de bloque AMD/Intel, manuales |
| F1 | ¿ATX = 305 × 244 mm? | Especificación ATX (Intel) |
| F2 | ¿Micro-ATX hasta 244 × 244 mm? | Especificación microATX |
| F3 | ¿Mini-ITX = 170 × 170 mm? | Especificación Mini-ITX (VIA) |
| F4 | ¿Máximo de ranuras de expansión por formato (¿7 / 4 / 1?)? | Especificaciones |
| F5 | ¿Un chasis ATX acepta Micro-ATX y Mini-ITX (orificios compatibles)? | Especificación ATX, fabricantes de chasis |
| F6 | ¿E-ATX tiene medida estándar? (si no, no dar cifra) | Fabricantes |
| P1 | ¿Tamaños físicos x1, x4, x8 y x16? ¿Una ranura física x16 puede ir cableada a x4 u x8? | PCI-SIG + un manual de ejemplo |
| P2 | ¿Ancho de banda por línea de PCIe 3.0, 4.0 y 5.0? | PCI-SIG |
| P3 | ¿Compatibilidad hacia atrás entre generaciones (funciona a la menor)? | PCI-SIG |
| P4 | ¿La x16 principal sale del procesador y las demás suelen salir del chipset? | Diagramas de bloque, manuales |
| P5 | ¿Separación estándar entre ranuras (¿20,32 mm?)? (para el modelo; no hace falta publicarla) | Especificación ATX |
| P6 | ¿Ocupar ciertas M.2 puede reducir líneas de una PCIe o apagar puertos SATA (según el modelo)? | Manuales |
| M1 | ¿Llaves M, B y E de M.2 y qué conecta cada una? | PCI-SIG (especificación M.2) |
| M2 | ¿Largos 2230, 2242, 2260, 2280 y 22110, con 22 mm de ancho? | PCI-SIG |
| M3 | ¿Una ranura M.2 puede ser solo NVMe, solo SATA o ambas? | Manuales, PCI-SIG |
| M4 | ¿NVMe usa líneas PCIe (¿x4 típico?)? | NVM Express, PCI-SIG |
| T1 | ¿SATA III = 6 Gb/s (¿unos 600 MB/s útiles?)? | SATA-IO |
| T2 | ¿Cada unidad SATA necesita cable de datos a la placa y cable de energía SATA desde la fuente? | SATA-IO, especificación ATX |
| R1 | ¿DDR4 y DDR5 tienen 288 contactos y la muesca en distinta posición, por lo que no se intercambian? | JEDEC (JESD79-4 / JESD79-5) |
| R2 | ¿Cada placa admite solo una generación de memoria? | AMD/Intel, manuales |
| R3 | ¿En escritorio, dos canales; con 4 ranuras, dos por canal; con 2 módulos van en las ranuras que indica el manual (¿A2/B2?)? | Manuales |
| R4 | (Para la página de RAM) ¿DDR5 trae dos subcanales por módulo y el PMIC en el módulo? | JEDEC |
| V1 | ¿Qué hace el VRM (bajar los 12 V de la fuente al voltaje del procesador)? | Intel/AMD, notas técnicas de fabricantes |
| V2 | No publicar cifras de "fases" ni "más fases = mejor" sin fuente y sin matiz | — |
| E1 | ¿Conector principal de 24 pines (20+4)? | Especificación ATX |
| E2 | ¿Conector del procesador EPS12V de 8 pines (4+4)? ¿Algunas placas traen 8+4 u 8+8? | Especificación ATX, manuales |
| E3 | ¿EPS 4+4 y PCIe 6+2 no son intercambiables y tienen codificación distinta? | Especificación ATX |
| H1 | ¿El cabezal de ventilador de 4 pines (PWM) acepta ventiladores de 3 pines (control por voltaje)? | Especificación Intel de ventiladores PWM de 4 hilos |
| H2 | ¿Nombres CPU_FAN, CPU_OPT, SYS_FAN/CHA_FAN, AIO_PUMP? ¿Aviso al arrancar sin nada en CPU_FAN? | Manuales |
| H3 | ¿Panel frontal = encendido, reinicio, LED de encendido y LED de disco? | Intel Front Panel I/O Connectivity Design Guide |
| H4 | ¿USB 2.0 de 9 pines, USB 3.x de 19/20 pines, USB-C frontal (¿Key-A?)? | Intel, USB-IF |
| H5 | ¿Cabezal de audio HD (AAFP)? | Intel |
| I1 | ¿Las salidas de video de la placa solo funcionan con un procesador con gráficos integrados (¿Intel serie F sin ellos?)? | Intel, AMD |
| I2 | ¿Escudo de E/S integrado o suelto? | Manuales (dato blando) |
| I3 | ¿Existen botones de BIOS Flashback y de Clear CMOS? (nombres por fabricante) | Manuales ASUS, MSI y Gigabyte |
| B1 | ¿La batería es CR2032? | Manuales |
| B2 | ¿Qué conserva la batería (reloj, configuración; depende de la plataforma)? | Manuales, notas de fabricantes |
| B3 | ¿UEFI reemplazó a la BIOS clásica, aunque se le siga diciendo "BIOS"? | UEFI Forum |
| B4 | ¿Un procesador nuevo en una placa vieja puede requerir actualizar la BIOS? ¿Flashback lo permite sin procesador? | AMD/Intel, manuales |
| B5 | ¿Windows 11 exige TPM 2.0 (fTPM/PTT) y arranque seguro? | Microsoft |
| O1 | ¿Separadores (standoffs) y orificios estándar por formato? | Especificación ATX |

---

## 7. Fases ejecutables y reparto entre agentes

### Fase 0: contrato (secuencial, ~0,5 días, Opus o un Sonnet)

Antes hay que tener respondidas las preguntas 1 y 2 (§9).

- **T0. Contrato.**
  - Archivos: `src/lib/piezas/types.ts` (§3.2 tal cual), `src/lib/piezas/entorno.ts` y `src/lib/piezas/registro.ts`, con firmas y cuerpo mínimo.
  - Contrato de BWReel: ruta y nombre del `.geo.ts`, export `TARJETA_MADRE_GEO`, nombres de imagen; queda escrito en §2.2.
  - Props fijas de `PiezaExplorador`: `{ slug: PiezaSlug; vista: VistaGeo<string>; partes: readonly ParteResumen[]; etiquetaFigura: string }`.
  - Aceptación: `pnpm tsc --noEmit` y `pnpm check:logic` pasan sin cambios de comportamiento.

### Fase 1: en paralelo, con el contrato fijo

**A. Pipeline y modelo en BWReel** (Sonnet; revisión visual humana)
- A0, v0 (~0,5 días): `piece-hotspots.ts` y `build-piece-assets.py` contra el `moboBoard` actual (importado, sin editar). Escribe `public/piezas/*` y `src/lib/piezas/tarjeta-madre.geo.ts`.
  - Aceptación: `tsc` pasa con `satisfies`; el script aborta si falta un id.
- A1 (2 a 3 días): `moboDetail.ts` + `MOBO_DETAIL_FEATURES`.
  - Aceptación: medidas y posiciones con la especificación ATX citada en un comentario (con la fecha de consulta); las cajas de las 14 partes dibujan la parte.
- A2 (1 a 1,5 días): `detailModel.ts`, `DetailLayer` y la versión final de `piece-hotspots.ts` (visibilidad, separación, foco).
- A3 (1 día): `build-piece-assets.py` final + `preview-piece.py`.
  - Aceptación:
    - presupuestos cumplidos;
    - `preview_tarjeta-madre_375.png` sin marcadores encimados;
    - `shasum` idéntico en los 5 archivos protegidos (§4);
    - en BWPCs, `git status` sin cambios en `public/servicios`, `public/hero`, `src/lib/component-stage.ts` ni `src/lib/tower-hero.ts`.

**B. Componente de UI** (Sonnet)
- Archivos: `src/lib/piezas/hotspots.ts`, `src/components/piezas/pieza-explorador.tsx`, `pieza-partes.tsx`, `factores-forma.tsx`.
- Entradas: `types.ts` y el v0 de A (mientras tanto, un fixture **fuera de `src`**, sin commitear).
- `hotspots.ts` no lleva imports de valores (solo `import type`).
- Aceptación:
  - teclado completo;
  - enlace profundo con `#parte`;
  - sin JS (JavaScript desactivado en el navegador): los marcadores saltan a las secciones;
  - 375, 768 y 1280; claro y oscuro;
  - sin `dangerouslySetInnerHTML`;
  - la isla de cliente pesa ≤ 6 KB gzip;
  - posición crítica en estilo en línea.

**C. Contenido y hechos** (Sonnet redacta; una persona verifica)
- Archivo: `src/lib/piezas/tarjeta-madre.contenido.ts`, con todos los textos de §6 y cada hecho de §6.3 con `verificadoEn: null` y fuentes candidatas (URL primaria).
- Aceptación: `tsc`; las reglas de prosa de `check:logic` pasan en borrador; la puerta de publicación falla, y eso es lo esperado.
- Después: verificación humana dato por dato (2 a 4 días de calendario).

**D. Página, SEO y enlaces** (Sonnet)
- Archivos:
  - `src/app/(public)/piezas/[pieza]/page.tsx` (`generateStaticParams` + `dynamicParams = false`, metadata, TechArticle, Breadcrumb, aviso de "Borrador" fuera de producción);
  - `sitemap.ts`, `next.config.ts` (`redirects`);
  - `servicios/page.tsx` + `component-showcase.tsx` (§0.3);
  - `(public)/page.tsx` ("Board" enlazado);
  - `lib/blog/generate.ts`;
  - bloque en `guias/[slug]/page.tsx`.
- Aceptación:
  - `pnpm build:check` pasa;
  - la página sale como estática (●/SSG en la salida del build);
  - ningún import de `sharp`, `images/process`, `auth.ts` ni de la BD en `src/app/(public)/piezas`, `src/components/piezas` ni `src/lib/piezas`;
  - /servicios en modo producción (`VERCEL_ENV=production pnpm dev`) da HTML idéntico a `main`.

**E. Comprobaciones** (Sonnet; empieza cuando existan los esqueletos de B y C)
- Archivos: `scripts/check-piezas.mjs` + una línea de import en `scripts/check-logic.mjs`.
- Aceptación: los casos de §8.1 pasan y la puerta de publicación se activa al cambiar `estado` a "publicado" con un hecho sin verificar.

### Fase 2: integración y publicación (secuencial)

1. A1-A3 reemplazan el v0. Se revisa la previsualización y se ajustan anclas si hace falta (siempre desde BWReel, nunca a mano).
2. Verificación humana de §6.3 → `verificadoEn` y `verificadoPor` → `estado: "publicado"`.
3. QA completo (§8).
4. Despliegue **sin caché de compilación** (Redeploy y desmarcar "Use existing Build Cache") y comprobación del CSS servido (§8.6).
5. `llms.txt` y actualización de CLAUDE.md: sección "Piezas a fondo (/piezas/[pieza])" con el pipeline, el contrato, la puerta de publicación, las trampas, cómo regenerar y la nota de que BWReel no es git.

### Tiempos

| Bloque | Duración |
|---|---|
| Fase 0 | 0,5 días |
| Fase 1 | 5 a 6 días (A es el camino crítico; B, C, D y E ocurren dentro de ese margen) |
| Verificación de hechos | 2 a 4 días, en paralelo con A |
| Fase 2 | 1,5 a 2 días |
| **Total** | **unas 2 semanas de calendario** |

---

## 8. Verificación

### 8.1 Casos nuevos en `check:logic` (`scripts/check-piezas.mjs`)

**Matemática pura (`hotspots.ts`):**
- `nearestPart`:
  - en el ancla exacta devuelve esa parte;
  - un empate se resuelve por menor `orden`;
  - más allá de `maxDist` devuelve `null`;
  - `NaN` devuelve `null`.
- `anchorPct`: devuelve 0 a 100 y es coherente con `w` y `h`.
- `stepPart`: da la vuelta (14 → 1, 1 → 14) y un id desconocido devuelve el primero.
- `partFromHash`:
  - funciona con y sin `#`;
  - decodifica URI;
  - rechaza ids desconocidos y los reservados.
- `focusTransform`:
  - foco completo da la identidad;
  - la escala queda entre 1 y 3;
  - el recuadro queda dentro de la figura;
  - un foco degenerado no divide por cero.
- `minAnchorSpacing(vista, 343)` ≥ 24 px CSS.

**Integridad de datos:**
- Los ids de contenido son iguales a los de la geometría y a `TARJETA_MADRE_PARTES`.
- `orden` es único y contiguo de 1 a n.
- Anclas y contornos quedan dentro del viewBox; `visible ≥ 0,15`.
- `w/h` coincide con `ancho/alto` (±0,5 %).
- Cada `href` y `hrefSm` existe en `public/` y sm < grande (con `fs`).
- No hay choques con los ids reservados.
- El slug cumple `/^[a-z0-9-]+$/`.
- `titulo` ≤ 60 caracteres y `descripcion` entre 120 y 160.
- El piloto no trae `variantes` ni `comparaciones`.

**Reglas de contenido:**
- Prosa sin cifras, después de quitar los `terminos`.
- Enlaces internos que empiezan por `/`.
- Sin "garantía", "precio" ni "$" en la prosa.

**Puerta de publicación:** si `estado === "publicado"`, entonces cada hecho tiene `verificadoEn` en formato AAAA-MM-DD y no en el futuro, `verificadoPor`, y al menos una fuente `https` con `consultadoEn`. Si un hecho publicado tiene más de 12 meses, se imprime una **advertencia** (no un fallo) de revisión anual.

**Registro:**
- `piezasVisibles("produccion")` solo devuelve las publicadas; en preview y desarrollo, todas.
- `hrefPiezaServicios("boards", "produccion")` es `null` mientras la pieza no esté publicada.

**Guardas estáticas (escaneo de texto, como la regla de "pagada"):**
- Sin `dangerouslySetInnerHTML` en `src/components/piezas` ni en `src/app/(public)/piezas`.
- Sin imports de `sharp`, `images/process`, `user-auth/auth` ni `db/` en esas carpetas ni en `src/lib/piezas`.

### 8.2 Comandos

`pnpm tsc --noEmit`, `pnpm check:logic` y `pnpm build:check` (nunca `pnpm build`, y sin el preview corriendo durante la compilación). `pnpm lint` está roto en todo el repo: se ignora.

### 8.3 Accesibilidad

- Solo teclado: orden de marcadores, salto, anterior/siguiente, enfoque visible y que nunca quede escondido bajo el encabezado.
- VoiceOver (iOS y macOS) y TalkBack: nombre de cada marcador, anuncio corto, `aria-current`.
- axe sin errores, incluido `aria-hidden-focus` en /servicios.
- Contraste en claro y oscuro.
- Zoom del navegador al 200 %.

### 8.4 Matriz de pruebas

- Anchos: 375, 768 y 1280.
- Tema claro y oscuro: el `<img>` se invierte con `.piece-ink` y el contorno queda en acento.
- `prefers-reduced-motion`: sin transición. El preview no lo emula, así que se prueba a mano.
- Sin JS.
- Impresión: la figura con números y la lista completa; el panel interactivo se oculta.
- Navegación cliente desde /servicios y hacia /servicios: la torre no queda oculta (`data-tower-hidden` limpio).

### 8.5 Regresión de /servicios

- **HTML:** con `VERCEL_ENV=production pnpm dev`, `curl` a /servicios en `main` y en la rama. El diff debe ser vacío, salvo identificadores de compilación.
- **Imágenes:** capturas a 375, 768 y 1280 con `p ≈ 0,05 / 0,35 (Boards) / 0,95`, guardadas en carpetas por ancho y comparadas con `BWReel/scripts/diff-frames.py` (`--tol 0`).
- En desarrollo (pieza visible), la única diferencia permitida es el enlace en la cabecera de "Boards" y la línea en flujo normal.
- Recordatorio de CLAUDE.md: `tabs_select` antes de verificar y `scrollTo` + `dispatchEvent(new Event("scroll"))`.

### 8.6 Endurecimiento de CSS (incidentes 2026-09-29 y 2026-10-02)

- Objetivo: **cero bloques nuevos en `globals.css`**. Modo oscuro con `.piece-ink` existente; posición, tamaño y `aspect-ratio` en estilo en línea.
- Si hace falta una regla nueva (prefijo `pz-`): el elemento nace con `style="display:none"` en línea y el CSS lo muestra con `!important`, de modo que con CSS viejo solo se pierde lo decorativo.
- Tras desplegar, bajar el `.css` de `/piezas/tarjeta-madre` y de `/servicios` en producción y buscar las clases nuevas (y `cs-track`). Si falta algo, redesplegar sin caché de compilación.

### 8.7 Lighthouse (producción, móvil)

Rendimiento ≥ 95, Accesibilidad 100, Buenas prácticas ≥ 96 (el aviso de CSP se conoce), SEO 100. LCP < 2,0 s con una imagen sm de 40 KB o menos. CLS de 0: `width` y `height` en el `<img>` y altura mínima del panel.

---

## 9. Decisiones que necesitan al dueño (máximo 5) y lo que se descarta

1. **¿Slug "tarjeta-madre", "placa-base" o "board"?**
   - Recomiendo `/piezas/tarjeta-madre`, con redirecciones desde las otras dos y "board" en el texto, tras confirmar con Trends y Keyword Planner (Colombia).
   - El slug no se cambia después de publicar.
2. **¿Modelo ATX nuevo y fiel (`moboDetail`, unos 2 a 3 días más) o la placa actual con "dibujo esquemático"?**
   - Recomiendo el modelo nuevo: la actual tiene la E/S y las ranuras en el borde de 244 mm, 3 ranuras a 28 mm y no tiene EPS ni cabezales. Choca con una página que promete exactitud.
3. **¿Quién verifica y firma los datos (`verificadoPor`), y aceptas que la página no se publica hasta que el 100 % esté verificado?**
   - Recomiendo que sí: la puerta en `check:logic` lo hace cumplir, y en preview se ve como borrador con `noindex`.
4. **¿Aceptas la frase del CTA "antes de confirmar revisamos contigo que todo encaje"?**
   - Es una descripción del servicio, no una garantía. Si prefieres, "Te ayudamos a elegir una combinación compatible".
5. **¿Puedes aportar 3 a 5 errores reales de compatibilidad vistos en el taller (sin datos de clientes)?**
   - Recomiendo que sí: experiencia de primera mano es lo que más pesa para Google (E-E-A-T) y para que los motores de IA citen la página. Sin eso, la sección queda genérica.

**Descartado a propósito:**
- WebGL o visores 3D en el navegador; tooltips; logos.
- Precios en la página (`/componentes` sigue con su interruptor).
- Página `/piezas` con una sola pieza; una URL por parte (contenido delgado); HowTo.
- Contenido en Mongo o admin.
- Recorrido automático, zoom con gestos, despiece animado.
- Desplazamiento horizontal en móvil; placa vertical "como en el chasis".
- Resaltado por parte con imágenes renderizadas (el contorno vectorial cuesta 0 KB).
- Versión Markdown en el piloto.
- Modificar `moboBoard` o regenerar /servicios o el hero.

---

## 10. Cómo escalar sin rehacer el modelo

- **Contrato:** ya es genérico en `P` (partes) y `V` (vistas). Cada pieza nueva suma:
  - su lista `…_PARTES` en `types.ts`;
  - su `*.contenido.ts` y `*.geo.ts` (generado);
  - una entrada en `PIEZA_SLUGS` y `registro.ts`.
- **Pipeline:** `build-piece-assets.py --only=<slug>` con una entrada en `DETAIL_VIEWS` por vista. Las vistas de una pieza comparten ids de parte. Al cambiar de vista **se conserva la parte elegida**: con la muesca elegida, cambiar DDR4 → DDR5 la muestra moviéndose, y ese es el momento didáctico.
- **UI:** un selector de vistas con chips de texto en mono ("DDR4 · DDR5"). Cambia imagen y capa de forma instantánea, sin fundido simultáneo (una a la vez, como en /servicios). `Comparacion` se pinta en el servidor como tabla de hechos.
- **Memoria RAM** (2 a 3 días): parametrizar un `ramModuleDetail({ generacion })` **nuevo** con la muesca en la posición JEDEC verificada (R1), cortada en el borde del PCB, y el PMIC en DDR5 (R4). No se toca `ram.ts`, que usan la torre y /servicios. Vistas `ddr4 | ddr5`.
- **Procesador** (3 a 4 días): modelos nuevos de encapsulado y socket. El `cpu.ts` actual es PGA con socket LGA (§0.2). Vistas `am4 | am5 | lga1700 | lga1851`, o solo las vigentes; partes: contactos, IHS, marca del pin 1, muescas de alineación. AMD e Intel como chips de texto.
- **Tarjeta gráfica** (unos 2 días): reutilizar `gpuLayers.ts` (carcasa, disipador, PCB, backplate) en vistas `armada | por-dentro`. Partes: chip, VRAM, VRM, conector 12V-2x6 (ya existe en `gpu.ts`), borde PCIe, bracket. NVIDIA, AMD e Intel van como `opciones` de texto, no como dibujos distintos: una gráfica genérica no debe parecer de una marca.
- **Fuente de poder** (3 a 4 días): `psuInterior.ts` existe, así que la vista `por-dentro` sale casi lista. Falta modelar los conectores para la vista `conectores` (24 pines, EPS 4+4, PCIe 6+2, 12V-2x6, SATA y Molex; cuáles "se usan hoy" está por verificar). Enlazar con las guías existentes de vatios y 80 Plus.
- **Índice `/piezas`:** se crea con la segunda pieza publicada. En ese momento, el breadcrumb pasa a Inicio › Piezas del PC › X y cada paso de /servicios gana su "Ver a fondo" de forma automática (`hrefPiezaServicios`).
- **Antes de construir la segunda pieza:** revisar las métricas del piloto (§0.5).

---

### Archivos críticos para la implementación

- /Users/nabaol/Documents/BWPCs/src/lib/piezas/types.ts (nuevo: el contrato)
- /Users/nabaol/Documents/BWPCs/src/components/component-showcase.tsx y /Users/nabaol/Documents/BWPCs/src/app/(public)/servicios/page.tsx (enlace "Ver a fondo" sin romper el recorrido)
- /Users/nabaol/Documents/BWReel/scripts/build-component-assets.py y /Users/nabaol/Documents/BWReel/scripts/component-stage.ts (patrón a copiar para `build-piece-assets.py` y `piece-hotspots.ts`)
- /Users/nabaol/Documents/BWReel/src/stageModel.ts (`project()`, cámara isométrica; se reutiliza sin editarlo) y /Users/nabaol/Documents/BWReel/src/parts/mobo.ts (referencia que no se toca para `moboDetail.ts`)
- /Users/nabaol/Documents/BWPCs/scripts/check-logic.mjs (más el nuevo `scripts/check-piezas.mjs`)

---

## Adenda 2026-10-11: tamaños (ATX, Micro-ATX, Mini-ITX) y "el tamaño no es calidad"

Pedido del dueño: la sección `#tamanos` debe mostrar las tres versiones y dejar claro que **el tamaño no hace mejor ni peor una placa**. Contexto real de su taller: hay clientes que creen que las placas pequeñas son de baja calidad o de gama baja, y no es así; una Micro-ATX puede ser tan buena como una ATX, y una Mini-ITX suele costar más que una ATX normal.

- **Visual (`factores-forma.tsx`, servidor, SVG sin imágenes):** las tres placas dibujadas **a escala real y superpuestas** (ATX de fondo, Micro-ATX y Mini-ITX anidadas en la misma esquina de orificios), con etiqueta de nombre y de medidas en mono. Las medidas salen de `FactorForma.anchoMm/altoMm` (hechos F1 a F3, por verificar con la especificación). Con el mismo patrón de selección que el explorador (tocar una placa la resalta y muestra su resumen), o simplemente tres tarjetas debajo; sin JS, tres tarjetas.
- **Mensaje (en `secciones` con id `tamanos`, en la prosa y también como línea destacada junto al dibujo):** "El tamaño de la placa no define su calidad. Cambia cuántas ranuras y puertos trae y en qué chasis cabe. Hay placas pequeñas de gama alta y placas grandes de gama baja." Sin cifras ni nombres de marca. Es una afirmación de criterio del dueño, no un dato con fuente: va como texto editorial, no como `Hecho`.
- **Sobre el precio (que Mini-ITX suele costar más):** se redacta cualitativo ("a veces cuestan más por llevar lo mismo en menos espacio") y **lo debe aprobar el dueño**: es experiencia de taller, no verificable con fuente primaria. Nada de cifras ni de precios en pesos.
- **Qué cambia de verdad según el tamaño** (cada punto por verificar antes de publicar): cantidad de ranuras de expansión y de memoria, cantidad de M.2 y SATA, y espacio para disipar el VRM. Se presenta como "qué cambia" y nunca como "mejor/peor".
- **Contrato:** `FactorForma` ganó `resumen` y `paraQuien` (ambos sin cifras). `check:logic` verifica que ningún `resumen`/`paraQuien` contenga "mejor", "peor", "superior", "inferior" ni "gama baja/alta" comparando tamaños.
- **Esfuerzo extra:** ~0,5 días (SVG a escala + texto). No requiere modelo 3D.

### Adenda 2026-10-11 (b): Micro-ATX en el recorrido de /servicios (Fase 2b, después del piloto)

Pedido del dueño: ya que se hace un modelo nuevo de placa, reemplazar la que muestra el paso "Boards" del recorrido de /servicios por una Micro-ATX.

- **Es viable y barato** si el modelo nace parametrizado: `moboDetail(formato: "atx" | "micro-atx" | "mini-itx")`. El piloto usa `"atx"` para la página; `"micro-atx"` se necesita para este reemplazo. Mini-ITX solo se necesita como contorno a escala (SVG), no como modelo 3D.
- **Cómo se hace sin romper nada:** `scripts/build-component-assets.py --only=boards` ya regenera solo esa pieza de forma atómica. Basta cambiar, en `BWReel/src/stageModel.ts`, **solo la entrada `boards`** para que dibuje `moboDetail("micro-atx")`. `moboBoard` **no se toca**: lo siguen usando el hero, los recortes del procesador y la RAM, y los reels.
- **Qué cambia en /servicios:** la imagen y las partes del paso "Boards" (`public/servicios/boards-*.webp` y la entrada `boards` de `lib/component-stage.ts`, ambos generados). Los demás pasos y el hero quedan idénticos. Los stills de regresión de /servicios deben diferir **solo** en el paso Boards.
- **Consistencia:** el hero (torre) y los pasos de procesador/RAM seguirán mostrando la placa actual; en el recorrido cada pieza se ve aislada, así que la diferencia casi no se nota. Si se quiere uniformidad total, es otra tarea (cambiar `moboBoard` obliga a regenerar hero y reels): no se hace sin pedirlo.
- **Textos:** el párrafo del paso "Boards" en `servicios/page.tsx` no debe prometer "ATX": revisarlo al hacer el cambio.
- **Esfuerzo extra:** ~1 día (layout Micro-ATX en `moboDetail`: menos ranuras PCIe, hasta 4 DIMM, menos puertos) + regenerar y comparar. Orden: después de que el piloto esté publicado o, como mínimo, con el ATX aprobado a ojo.
