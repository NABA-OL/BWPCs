# Plan 2 de «Piezas a fondo»: de la tarjeta madre a las demás piezas

> Plan de arquitectura hecho en modo de solo lectura. Revisé el código real de BWPCs (piloto) y de BWReel. Cuando la idea choca con el código, manda el código y lo anoto. Ningún dato técnico de este documento queda afirmado como cierto: todo lo que es hardware aparece como pregunta «por verificar». Lo que el dueño dijo de memoria va marcado **(memoria del dueño)**.

---

## 0. Hallazgos que cambian el plan (léelos primero)

1. **El piloto no está en git.** `git status` muestra como *untracked* todo esto:
   - `src/lib/piezas/`, `src/components/piezas/`, `src/app/(public)/piezas/`, `public/piezas/`;
   - `scripts/check-piezas.mjs`, `docs/piezas-plan.md`, `docs/piezas-errores-taller.md`;
   - y los cambios modificados de `servicios/page.tsx`, `page.tsx`, `sitemap.ts`, `next.config.ts`, `check-logic.mjs`, `component-showcase.tsx`, `generate.ts`, `guias/[slug]/page.tsx`, `public/servicios/boards-*` y `lib/component-stage.ts`.

   Con varios agentes en paralelo tocando estos archivos, perderlos sería grave. **Primer paso: el dueño autoriza un commit del piloto y una rama `feat/piezas-2`.** El plan supone «contenido en git», y hoy no lo está.

2. **El piloto está atado a la tarjeta madre en más lugares de los que dice el plan 1.** Todos se generalizan en la Fase 0:

   | Dónde | Qué está fijo |
   |---|---|
   | `piezas/[pieza]/page.tsx` | `ETIQUETA_FIGURA` (texto de tarjeta madre); breadcrumb fijo "Tarjeta madre" (línea 271); `geo.vistas.unica` (línea 307); el resumen de `<details>` "Fuentes de los tamaños…"; secciones `tamanos/elegir/errores` cableadas |
   | `scripts/check-piezas.mjs` | Importa solo `TARJETA_MADRE_*`; la regla de sinónimos «placa base / motherboard / board una sola vez»; afirma "el piloto no trae variantes" |
   | `next.config.ts` | `redirects()` con la lista de sinónimos fija |
   | `BWReel/src/detailModel.ts` | `DetailSlug = "tarjeta-madre"`, `DetailVista = "unica"` |
   | `BWReel/scripts/piece-hotspots.ts` | `SLUG`/`VISTA` fijos; llama a `moboDetailFeatures("atx")` |
   | `BWReel/scripts/build-piece-assets.py` | `props = {"slug", "vista": "unica"}`; una vista por pieza |
   | `BWReel/src/parts/piezaIds.ts` | Duplica a mano `TARJETA_MADRE_PARTES`; solo lo vigila `check-mobo-detail.ts` |

3. **Modelos de BWReel que ya alimentan /servicios, el hero o los reels.** Se importan y nunca se editan:
   - `/servicios` (vía `stageModel.ts`): `ssd.ts`, `sata.ts`, `hdd.ts`, `cooler.ts`, `aio.ts`, `fan.ts`, `cpu.ts`, `socketParts.ts`, `ram.ts`, `gpu.ts` y, desde la Fase 2b, `moboDetail.ts`.
   - Reels: `gpuLayers.ts` (`GpuExplode`) y `psuInterior.ts` (`PsuInside`).

   La lista de `shasum` protegidos (`work/protected-shasums-*.txt`) hoy no incluye la mayoría. **Se amplía en la Fase 0** con todos esos archivos más `lineart/kit.ts`, `lineart/fill.ts` y `theme.ts`: cambiar uno de estos cambia todos los renders.

4. **Al reutilizar dibujos existentes se rompe la regla «cajas = fuente de verdad» de `moboDetail`.**
   - Exportan constantes, así que las cajas salen de ellas sin duplicar números: `ssd.ts` (`SSD`), `sata.ts` (`SATA`), `hdd.ts` (`HDD`), `cooler.ts` (`COOLER`), `aio.ts` (`AIO`), `psuInterior.ts` (solo `PSU`).
   - Tienen coordenadas en línea: `gpuLayers.ts` (`gpuPcb`: chip en `[-3,42]–[47,92]`, VRAM y VRM como listas literales), `psuInterior.ts` (`psuBoard`) y `psu.ts` (`psuBody`).
   - Para esos, la tabla de cajas copia las coordenadas, y un **chequeo automático nuevo** (`scripts/check-detail-cajas.ts`) exige que cada caja contenga geometría real del modelo renderizado (al menos N puntos de línea dentro). Así se detecta si el dibujo y las cajas se separan.

5. **El volumen de datos haría inviable la revisión en una sola sentada.** Al ritmo del piloto (59 hechos), 6 páginas nuevas suman entre 250 y 350, más los 59 del piloto, que **siguen sin verificar** y deben entrar en la misma revisión. Medidas:
   - meta de **≤ 20 hechos nuevos por pieza** (≤ 30 en procesador, por los sufijos);
   - un módulo de **hechos comunes** compartido (PCIe, SATA, DDR, sockets, conectores), que se verifica una sola vez;
   - prosa cualitativa;
   - aprobación en bloque de los ✅ (ver §4).

   Estimación honesta: unos 130 a 160 datos con fuente más unos 40 casos y criterios que solo requieren aprobación. Son **2 o 3 sesiones de unas 2 horas** del dueño, no una.

6. **Disco.** `df` hoy marca 4,8 GiB libres, pero el plan se diseña para **~1 GB**, como pidió el dueño.
   - `.next` ocupa 564 MB (caché de dev).
   - `pnpm build:check` necesita varios cientos de MB temporales en `.next-check`.
   - Cada `remotion bundle` pesa decenas de MB (el script ya lo borra).
   - `BWReel/work` pesa 559 MB (sobre todo `cinema*`) y `BWReel/out` 2,0 GB (videos del dueño).

   Regla: **una sola compilación y un solo render a la vez, en manos del integrador**; nunca en paralelo. Ver §5.4.

7. **BWReel no es git y habrá agentes en paralelo.** Si dos agentes editan `detailModel.ts` o `piezaIds.ts` a la vez, uno pisa al otro sin rastro. Por eso la Fase 0 deja **un módulo por pieza ya enchufado** (`src/detail/<slug>.ts` con un esqueleto) y cada agente toca solo sus archivos. Lo mismo en BWPCs: `registro.ts` importa desde la Fase 0 los esqueletos de todas las piezas.

8. **Enlaces cruzados con 404 en producción.** `ParteContenido.enlaces` es un `href` libre. Si la tarjeta madre enlaza a `/piezas/memoria-ram` mientras esa pieza es borrador, producción tendría un enlace roto. Los enlaces entre piezas se resuelven **por registro** (`{ pieza, parte? }`) y solo se pintan si el destino es visible en ese entorno.

9. **El generador del blog puede duplicar estas páginas mientras se construyen.** `lib/blog/generate.ts` suma solo las piezas visibles en producción (`piezasVisibles("produccion")`). Mientras las piezas nuevas sean borrador, la IA puede redactar una guía "DDR4 vs DDR5" (cron de los miércoles). Cambio: sumar **todas** las piezas registradas como "temas reservados", sin importar su estado.

10. **Trampas del decodificador de procesadores** (verificar, no afirmar):
    - La "G" de AMD ya no equivale a "con gráficos": en AM5, los Ryzen 7000/9000 sin "F" parecen traer gráficos básicos (N7).
    - En AMD el número de serie no es la generación: Ryzen 8000G sería AM5 y "anterior" a la 9000 (N8).
    - El decodificador **desglosa el patrón; no comprueba que el modelo exista**. La interfaz debe decirlo siempre.

11. **El mismo id de parte puede existir en varias vistas.** `VistaGeo.partes` ya es `Partial<Record<P, …>>`, así que una parte puede faltar en una vista (el PMIC no existe en DDR4). El explorador actual no contempla una parte elegida que no esté en la vista activa; hay que añadirlo.

---

## 1. Resumen, alcance y orden

**Qué se construye:** seis páginas nuevas bajo `/piezas/[pieza]` con el mismo patrón del piloto: dibujo clicable, panel, lista de partes, datos con fuente, casos del taller y CTA. Además:
- **varias vistas por pieza**, con un selector de chips de texto;
- **comparaciones**;
- **criterios de taller aprobados por el dueño**;
- el **decodificador de nombres de procesador**;
- el **índice `/piezas`**;
- enlaces desde cada paso de /servicios y desde el inicio;
- y la **hoja de verificación estándar**.

Todo se construye en borrador y se publica después de la revisión conjunta del dueño.

| Pieza | Slug | Vistas | Modelos en BWReel | Esfuerzo BWReel | Valor SEO / uso (por confirmar con Trends) |
|---|---|---|---|---|---|
| Memoria RAM | `memoria-ram` | `ddr4`, `ddr5` | Falta `ramDetail` (no se toca `ram.ts`) | 1,5 a 2 días, riesgo bajo-medio (posición de la muesca) | Alto ("ddr4 vs ddr5") |
| Almacenamiento | `almacenamiento` | `m2-nvme`, `m2-sata`, `ssd-sata`, `hdd` | `sata.ts` y `hdd.ts` existen; falta un M.2 con llave B+M | 1,5 a 2 días, riesgo bajo | Alto ("ssd vs hdd", "m.2 nvme vs sata") |
| Refrigeración | `refrigeracion` | `aire`, `liquida` | `cooler.ts`, `aio.ts` y `fan.ts` existen, con constantes | 1 a 1,5 días, riesgo bajo | Medio-alto |
| Procesador | `procesador` | `am4`, `am5`, `intel-lga` | **Modelos nuevos** (`cpu.ts` es PGA con socket LGA: inconsistente) | 3 a 4 días, riesgo medio-alto | Alto (decodificador: "qué significa la K / X3D") |
| Fuente de poder | `fuente-de-poder` | `por-fuera`, `por-dentro`, `conectores` | `psu.ts` y `psuInterior.ts` existen; **faltan los conectores** | 3 a 3,5 días, riesgo medio | Medio |
| Tarjeta gráfica | `tarjeta-grafica` | `armada`, `placa` | `gpu.ts` y `gpuLayers.ts` existen (coordenadas en línea) | 1,5 a 2 días, riesgo medio (marcadores densos en la placa) | Medio |

Más la **generalización (Fase 0): 1,5 a 2 días**, que es el camino crítico. Total de modelado en BWReel: unos 12 a 15 días-agente. El cuello de botella real es la revisión visual humana de las previsualizaciones y la sesión de verificación.

**Orden recomendado de construcción** (aunque se publique todo junto):
1. **RAM primero.** Valida de punta a punta el multivista (selector, parte ausente en una vista, comparación) con el modelo más chico.
2. **Almacenamiento.** Cuatro vistas, casi todo reutilizado; valida la densidad con 4 imágenes.
3. **Refrigeración.** Estrena `Criterio` (ventajas y desventajas como criterio de taller) con modelos que ya existen.
4. **Procesador.** El decodificador no depende de BWReel y arranca en paralelo desde la Fase 1; el modelo físico es el más caro.
5. **Fuente**, por la vista de conectores nueva.
6. **Gráfica.**

### Crítica honesta (qué es mala idea o caro, y alternativas)

- **Revisar todo junto al final concentra el riesgo.** Si una página trae muchos ❌, retrasa a todas. Recomiendo revisar todo junto (decisión del dueño) pero **publicar por lotes**: lo aprobado sale, y lo que necesita ajuste espera, sin bloquear al resto.
- **El modelo físico del procesador es lo más caro y lo de menor valor relativo.** El valor de búsqueda está en el decodificador.
  - Alternativa barata: 2 vistas (`pga` = AM4, `lga` = AM5 / Intel con contorno genérico) en lugar de 3, lo que ahorra ~1 día.
  - Alternativa más barata aún: publicar la página con el decodificador y la lista de partes **sin dibujo** (el contrato permite `geo: null`) y sumar el dibujo después.

  Recomiendo 3 vistas, con `geo: null` como salida de emergencia.
- **Fuente "por dentro".** Mostrar el interior puede invitar a abrirla. La página debe llevar un aviso visible de no abrir la fuente (hecho FP3 con fuente del fabricante), no solo en la prosa.
- **Comparaciones de "ventajas y desventajas".** Son criterio de taller, no datos. Van como `Criterio` (con aprobación del dueño y sin fuente), con el rótulo "Criterio de B & W", nunca como `Hecho`, y sin "mejor/peor" (se valida en `check:logic`).
- **Un decodificador "completo" de todos los SKU es una trampa de mantenimiento.** Se descarta una base de modelos. El decodificador es **por patrón**, con una tabla de sufijos y series fechada (`revisadoEn`), y responde "no reconocido" con elegancia.
- **Densidad en móvil.** La RAM (larga y delgada) y la placa de la gráfica (chip, VRAM y VRM juntos) pueden no cumplir los 24 px a 343 px de ancho. Mitigación, en este orden: ≤ 8 partes por vista, más zoom o recorte en BWReel, agrupar partes, y solo al final el botón "Ampliar" (`focusTransform` ya existe y está probado).

---

## 2. Cambios al contrato

### 2.1 `src/lib/piezas/types.ts` (a mano; sin imports de valores; compatible con `--experimental-strip-types`: nada de `enum` ni propiedades de parámetro)

```ts
export const PIEZA_SLUGS = ["tarjeta-madre", "procesador", "memoria-ram", "almacenamiento",
  "refrigeracion", "fuente-de-poder", "tarjeta-grafica"] as const;
export type PiezaSlug = (typeof PIEZA_SLUGS)[number];

/** Fuente única de las redirecciones (next.config.ts la importa). Nunca un slug real; kebab-case. */
export const SINONIMOS_SLUG: Readonly<Record<PiezaSlug, readonly string[]>> = {
  "tarjeta-madre": ["placa-base", "board", "motherboard"],
  procesador: ["cpu", "procesadores"],
  "memoria-ram": ["ram", "memoria"],
  almacenamiento: ["ssd", "disco-duro", "discos"],
  refrigeracion: ["disipador", "refrigeracion-liquida"],
  "fuente-de-poder": ["fuente", "psu", "fuente-de-alimentacion"],
  "tarjeta-grafica": ["grafica", "gpu", "tarjeta-de-video"],
};

/* Ids por pieza (BWReel los duplica en src/parts/piezaIds.ts; scripts/check-piece-ids.ts compara el texto). */
export const TARJETA_MADRE_VISTAS = ["unica"] as const;
export const MEMORIA_RAM_PARTES = ["contactos", "muesca", "chips-memoria", "pmic", "chip-spd", "ranura", "trabas"] as const;
export const MEMORIA_RAM_VISTAS = ["ddr4", "ddr5"] as const;
export const ALMACENAMIENTO_PARTES = ["llave-m2", "controlador", "memoria-nand", "tornillo-m2", "ranura-m2",
  "conector-sata-datos", "conector-sata-poder", "carcasa"] as const;
export const ALMACENAMIENTO_VISTAS = ["m2-nvme", "m2-sata", "ssd-sata", "hdd"] as const;
export const REFRIGERACION_PARTES = ["base", "heatpipes", "aletas", "ventilador", "bloque-bomba", "mangueras", "radiador"] as const;
export const REFRIGERACION_VISTAS = ["aire", "liquida"] as const;
export const PROCESADOR_PARTES = ["ihs", "marca-pin-1", "muescas", "pines-procesador", "contactos-socket", "tapa-sujecion", "palanca", "zocalo"] as const;
export const PROCESADOR_VISTAS = ["am4", "am5", "intel-lga"] as const;
export const FUENTE_PARTES = ["rejilla-ventilador", "entrada-ac", "interruptor", "banco-modular", "etiqueta",
  "filtro-emi", "rectificador", "pfc", "condensadores-primarios", "transformador", "salida-secundaria",
  "atx-24", "eps-cpu", "pcie-6-2", "12v-2x6", "sata-poder", "molex"] as const;
export const FUENTE_VISTAS = ["por-fuera", "por-dentro", "conectores"] as const;
export const TARJETA_GRAFICA_PARTES = ["ventiladores", "carcasa", "disipador", "backplate", "bracket",
  "conector-energia", "conector-pcie", "chip-grafico", "memoria-vram", "vrm"] as const;
export const TARJETA_GRAFICA_VISTAS = ["armada", "placa"] as const;

/** Bloques de la página, en orden (además de "inicio", que va siempre primero, y "fuentes"/"cotizar", que van al final). */
export type BloqueId = "partes" | "lista" | "nombres" | "vistas" | "comparar" | "tamanos" | "elegir" | "errores" | "preguntas";
export const IDS_RESERVADOS = ["inicio", "partes", "lista", "nombres", "vistas", "comparar", "tamanos", "elegir",
  "errores", "fuentes", "cotizar", "preguntas", "casos"] as const;   // + regla: ningún id de parte empieza por "vista-"

export interface Hecho { /* igual que hoy */ revisarCadaMeses?: 6 | 12 | 24 }  // volátiles (nombres, "se usa hoy") = 6
export interface Aprobacion { aprobadoEn: string | null; aprobadoPor: string | null }
/** Experiencia del taller. tipo "vivido" se pinta «Nos ha pasado», "puede-pasar" «Puede pasar» (el rótulo lo pone la UI, no el texto). */
export interface Caso extends Aprobacion { id: string; tipo: "vivido" | "puede-pasar"; texto: string; hechos?: readonly Hecho[] }
/** Criterio de B & W (no verificable con fuente): requiere aprobación del dueño, nunca "mejor/peor". */
export interface Criterio extends Aprobacion { id: string; texto: string }
export type Celda = { tipo: "hecho"; hecho: Hecho } | { tipo: "criterio"; criterio: Criterio } | { tipo: "texto"; texto: string };
export interface Comparacion<V extends string> {
  id: string; titulo: string; columnas: readonly V[];
  filas: readonly { etiqueta: string; valores: Readonly<Record<V, Celda>> }[];
}
export interface VistaContenido<P extends string, V extends string> {
  id: V; etiqueta: string;               // chip: "DDR5", "Por dentro"
  resumen: string;                       // sin cifras
  etiquetaFigura: string;                // reemplaza ETIQUETA_FIGURA fija
  notasPorParte?: Readonly<Partial<Record<P, string>>>; // incluye "En DDR4 no hay PMIC en el módulo"
  aFavor?: readonly Criterio[]; aConsiderar?: readonly Criterio[];  // refrigeración, almacenamiento
}
export type EnlaceParte =
  | { etiqueta: string; href: `/${string}` }                 // internos fijos (/cotizador, /guias)
  | { etiqueta: string; pieza: PiezaSlug; parte?: string };  // se resuelve con el registro; si no es visible, no se pinta

// ParteContenido: + vistas?: readonly string[]  (por defecto, todas); enlaces?: readonly EnlaceParte[]
// PiezaContenido<P, V>: + nombreCorto (breadcrumb), sinonimos: readonly string[] (cada uno exactamente 1 vez en la prosa),
//   bloques: readonly BloqueId[], vistas: readonly VistaContenido<P,V>[] (≥ 1; la primera es la inicial),
//   selectorVistas?: string ("Elige la generación"), casos?: readonly Caso[], criterios?: readonly Criterio[],
//   comparaciones?: readonly Comparacion<V>[], decodificador?: DatosDecodificador.
//   SE QUITA `variantes` (el piloto no lo usa; queda absorbido por `vistas`).

export interface PiezaExploradorProps {
  slug: PiezaSlug;
  vistas: readonly { id: string; etiqueta: string; geo: VistaGeo<string>; etiquetaFigura: string;
                     notas: Readonly<Record<string, string>> }[];
  partes: readonly ParteResumen[];       // `ParteResumen.vistas` = en cuáles existe
  selectorTitulo?: string;
}
```

En `registro.ts`: `PiezaRegistrada = { contenido; geo: PiezaGeo<string, string> | null }`, con `geo: null` en los esqueletos. La página pinta el explorador solo si hay geometría. Un borrador sin dibujo se puede revisar, y la puerta de publicación exige `geo` salvo que la pieza lleve `sinDibujo: true` (la salida de emergencia del procesador).

**Migración del piloto en la Fase 0, sin cambiar lo que se ve:**
- `vistas: [{ id: "unica", etiqueta: "ATX", etiquetaFigura: <texto actual> }]`;
- `sinonimos: ["placa base", "motherboard", "board"]`;
- `bloques: ["partes", "lista", "tamanos", "elegir", "errores"]`;
- los 10 párrafos «Nos ha pasado / Puede pasar» de `errores` pasan a `casos[]`; el párrafo de introducción queda en la sección.
- Los hechos que la tarjeta madre comparte (S1 a S5, P1 a P4, M1 a M4, T1, T2, R1 a R3, E1 a E3, I1) se **mueven** a `src/lib/piezas/comun.hechos.ts` con los mismos ids y se importan. Los ids de hecho pasan a ser **únicos en todo el sitio**: si dos piezas tienen el mismo id, debe ser el mismo objeto.

### 2.2 Decodificador de nombres de procesador

**Archivos:**
- `src/lib/piezas/procesador/decodificador.ts`: puro, sin imports de valores; lo carga `check:logic`.
- `src/lib/piezas/procesador.datos.ts`: tablas tipadas; los `hechoId` apuntan a hechos de `procesador.contenido.ts`.
- `src/components/piezas/decodificador-procesador.tsx`: isla de cliente.
- `src/components/piezas/decodificador-tablas.tsx`: servidor; la versión sin JS.

**Tipos (van en `types.ts`):**

```ts
export type MarcaCpu = "AMD" | "Intel";
export type Segmento = "escritorio" | "portatil";
export type FamiliaCpuId = "ryzen" | "ryzen-ai" | "core-i" | "core" | "core-ultra";
export interface FamiliaCpu { id: FamiliaCpuId; marca: MarcaCpu; nombre: string; gamas: readonly ("3"|"5"|"7"|"9")[];
  vigente: boolean; resumen: string; hechoIds: readonly string[] }
export interface SerieCpu { familia: FamiliaCpuId; prefijo: string; digitos: 3 | 4 | 5; etiqueta: string; // "12.ª generación", "serie 7000"
  segmento?: Segmento; hechoId: string }
export interface SufijoCpu { token: string; familias: readonly FamiliaCpuId[]; segmento: Segmento;
  significado: string; compone?: readonly string[]; hechoId: string }    // KF compone ["K","F"]
export interface EquivalenciaGama { gama: "3"|"5"|"7"|"9"; amd: string | null; intelClasico: string | null; intelActual: readonly string[] }
export interface DatosDecodificador { familias: readonly FamiliaCpu[]; series: readonly SerieCpu[]; sufijos: readonly SufijoCpu[];
  ejemplos: readonly { nombre: string; hechoId: string }[]; equivalencias: readonly EquivalenciaGama[]; revisadoEn: string }
export interface TrozoNombre { texto: string; tipo: "marca"|"familia"|"gama"|"serie"|"modelo"|"sufijo"; significado: string; hechoId?: string }
export type ResultadoDecodificacion =
  | { estado: "reconocido"; normalizado: string; marca: MarcaCpu; familia: FamiliaCpuId; segmento: Segmento | null; trozos: readonly TrozoNombre[] }
  | { estado: "incompleto"; normalizado: string; trozos: readonly TrozoNombre[]; falta: "familia"|"gama"|"numero"|"sufijo-desconocido"; resto?: string }
  | { estado: "invalido"; motivo: "vacio" | "muy-largo" | "caracteres" };
export function normalizarNombre(entrada: string): { ok: true; texto: string } | { ok: false; motivo: "vacio"|"muy-largo"|"caracteres" };
export function decodificarNombre(entrada: string, datos: DatosDecodificador): ResultadoDecodificacion;
```

**Validación y emparejamiento (lógica pura, determinista, sin red ni almacenamiento):**
1. `normalize("NFKC")`; quitar `™ ® ©`; pasar a minúsculas; colapsar espacios; `trim`.
2. Más de 60 caracteres → `muy-largo`. Fuera de `[a-z0-9 +\-]` → `caracteres`; cubre emoji, `<`, comillas y controles. Así se rechaza HTML sin necesidad de escaparlo; React escapa de todas formas.
3. Prefijo opcional `amd` o `intel`. Detección de familia, con la más larga primero: `ryzen ai` > `ryzen` | `r3/r5/r7/r9` (alias coloquial con nota) | `core ultra` > `core i[3579]` | `i[3579]` (implica core-i) > `core [357]`.
4. Gama, que debe pertenecer a `familia.gamas`.
5. Número: guion o espacio opcional en core-i. Se acepta `ryzen7`, pero no `i512400` (es ambiguo).
6. Serie: el prefijo del número más largo que coincida en `series`. Si no coincide, el número se describe solo como "modelo".
7. Sufijo: el **más largo primero** dentro de los de esa familia y segmento (`X3D` > `XT` > `X`; `KF`/`KS` > `K`/`F`; `HX`/`HS` > `H`). Lo que sobra → `incompleto` con `falta: "sufijo-desconocido"`.
8. Nunca lanza una excepción.

**UI accesible** (isla única, en la sección `#nombres`):
- `<form>` con `<label>` visible ("Escribe el nombre de un procesador") e `<input type="text" autocomplete="off" spellCheck={false} maxLength={60} aria-describedby>`, con letra de 16 px para que iOS no haga zoom.
- Botón "Desglosar" de 44 px y `<select>` "Probar con un ejemplo" con `<optgroup>` AMD / Intel.
- El resultado visual se actualiza al escribir. El `<p aria-live="polite">` anuncia solo al enviar o elegir un ejemplo, con un texto corto: "Ryzen 7 7800X3D: 4 partes reconocidas".
- Trozos del nombre en `font-mono`, cada uno en una caja hairline numerada, y una `<ol>` con número → significado. El trozo enfocado o elegido usa el único acento.
- Aviso fijo: "Esto explica cómo se lee el nombre; confirma en la página del fabricante que el modelo exista."
- Sin `useSearchParams`, que forzaría a renderizar en el cliente.
- Opcional en la Fase 2: leer `?cpu=` con `window.location` en un efecto, para compartir un desglose.

**Sin JS, degrada a tablas estáticas**, renderizadas en el servidor con la **misma** función `decodificarNombre`, que se ejecuta en la compilación (así es imposible que la tabla y la isla difieran):
- tabla de ejemplos desglosados;
- tabla de sufijos (token → significado, marca, segmento);
- tabla de equivalencias de gama.

La isla reserva altura en línea (`minHeight`) para no generar CLS. El HTML del servidor muestra dentro de esa caja un ejemplo ya desglosado, y el campo aparece al hidratar.

**Equivalencias de gama:** se presentan como "las dos marcas usan un número parecido para indicar la gama dentro de su propia línea; no significa que rindan igual". Nada de "mejor/peor". Las celdas inexistentes van con "—" (por ejemplo, si no existe "Core Ultra 3": N11).

### 2.3 Generalización de BWPCs

- **`registro.ts`:**
  - `PIEZAS: Record<PiezaSlug, PiezaRegistrada>` exhaustivo, con las 7 piezas desde la Fase 0;
  - `hrefPiezaServicios(pieceId)` generalizado (`piezaServicios` = `procesador`, `graficas`, `ram`, `boards`, `fuentes`, `refrigeracion`, `almacenamiento`; chasis no tiene pieza);
  - `resolverEnlace(e, entorno)`;
  - `hayIndice(entorno)` = 2 o más visibles.
- **Página `piezas/[pieza]/page.tsx`:**
  - recorre `contenido.bloques`;
  - `navItems` sale de una función pura `navDePieza(contenido)` (probada en `check:logic`);
  - breadcrumb con `contenido.nombreCorto`, más el paso intermedio "Piezas del PC" solo si `hayIndice`;
  - resumen de fuentes genérico ("Fuentes de esta página").
  - Componentes nuevos de servidor: `pieza-comparacion.tsx` (`<table>` con `<caption>` y `scope`; en 375 px va dentro de un `div` con `overflow-x-auto tabIndex={0} role="region" aria-label`), `pieza-casos.tsx` (rótulo mono «Nos ha pasado» / «Puede pasar») y `pieza-vistas.tsx` (sección `#vistas`: cada vista con su `<img>` sm `loading="lazy"`, su resumen y sus "a favor / a considerar"; es el respaldo sin JS del selector).
- **Explorador multivista** (`pieza-explorador.tsx`):
  - selector = enlaces `<a href="#vista-ddr5">` que apuntan a las figuras estáticas de `#vistas` (sin JS saltan a ellas; con JS se interceptan como los marcadores), dentro de `role="group" aria-label={selectorTitulo}`, con `aria-current` en la vista activa;
  - el cambio de imagen es instantáneo (una a la vez, sin fundido doble);
  - **la parte elegida se conserva al cambiar de vista**;
  - si la parte no existe en la vista nueva: no hay marcador, el panel muestra `notas[parte]` (o "Esta parte no está en esta versión") y el anuncio en vivo dice "Vista DDR4. El PMIC no está en esta versión";
  - `stepPart` recorre solo las partes de la vista activa.
  - **Sin CSS nuevo**: posiciones en estilo en línea y `.piece-ink`.
- **`next.config.ts`:** `redirects()` sale de `SINONIMOS_SLUG`, importado de `src/lib/piezas/types.ts`, que no tiene imports. `check:logic` verifica que ningún sinónimo coincida con un slug, que no haya duplicados y que sean kebab-case.
- **`sitemap.ts`:** sin cambios de lógica (ya usa `piezasVisibles("produccion")`); se suma `/piezas` cuando `hayIndice("produccion")`.
- **Índice `/piezas`** (`src/app/(public)/piezas/page.tsx`, SSG):
  - `notFound()` si no `hayIndice(entorno)`; en desarrollo y preview se ve con "Borrador" y `noindex`;
  - diseño: `PageHero` ("Piezas del PC, una por una") y una cuadrícula hairline (`gap-px bg-hairline`, como el bloque de guías) con una tarjeta por pieza: la imagen `-sm` de la vista inicial con `.piece-ink` y `width`/`height`, el h2 `nombreCorto`, la `descripcion` y "Ver las partes →";
  - orden = orden del recorrido de /servicios;
  - SEO: title "Piezas del PC explicadas una por una" (≤ 60), `CollectionPage` + `ItemList` (`ListItem` con url y name) + `BreadcrumbList` (Inicio › Piezas del PC), todo por `JsonLd`/`jsonLdString`; canonical `/piezas`;
  - enlace en el pie de página "Piezas del PC" solo si `hayIndice`.
- **/servicios:**
  - `componentes.map(c => ({ ...c, ...(href ? { href } : {}) }))` con `hrefPiezaServicios(c.id)`;
  - la línea en flujo normal ("Ver a fondo las partes de la tarjeta madre →") pasa a una lista de enlaces de las piezas visibles ("Ver a fondo: Procesadores · Gráficas · …");
  - regla: **si ninguna es visible, el HTML queda idéntico** al actual;
  - `.cs-list` no se toca; el enlace del escenario sigue con `tabIndex={-1}`.
- **Inicio:** la línea mono `GPU · CPU · RAM · Board · Fuente · Chasis · Refrigeración` pasa a un mapa palabra → `pieceId`, y cada palabra con pieza visible se enlaza (con ninguna visible, el HTML queda idéntico).
- **`lib/blog/generate.ts`:** suma todas las piezas registradas (cualquier estado) como "temas reservados" (hallazgo 9).
- **`public/llms.txt`:** al publicar, la línea "Piezas del PC" con el índice y cada pieza.
- **`scripts/check-piezas.mjs` se parte** en `scripts/check-piezas/{comun,hotspots,pieza,decodificador,registro,guardas}.mjs`. Así cada agente agrega casos en su archivo sin pisar a los demás. `check-logic.mjs` sigue con una línea de import. Las pruebas de integridad y de contenido recorren `PIEZAS` con una tabla de configuración por slug (lista de partes y lista de vistas).

### 2.4 Generalización de BWReel (sin tocar ningún archivo protegido)

- `src/parts/piezaIds.ts`: todas las listas `*_PARTES` y `*_VISTAS`, copiadas al pie de la letra. `scripts/check-piece-ids.ts` (reemplaza la comparación de `check-mobo-detail.ts`) compara el texto de cada constante en ambos archivos.
- `src/detail/<slug>.ts` (uno por pieza) exporta este contrato fijo:

  ```ts
  export const DETAIL: DetailModule<ParteId, VistaId> = {
    vistas: { ddr4: { zoom, target }, ddr5: { zoom, target } },
    build(vista): StageItem[],                                    // capa "base", mismo formato que hoy
    features(vista): Partial<Record<ParteId, FeatureCajas>>,      // partes presentes en esa vista
  };
  ```

  `tarjeta-madre.ts` envuelve lo que ya existe.
- `src/detailModel.ts` pasa a ser un registro que importa los 7 módulos (esqueletos desde la Fase 0); `DetailLayer` no cambia de forma.
- `scripts/piece-hotspots.ts --slug= --vista=`: genérico. Valida que `features(vista)` ⊆ ids de la pieza, que no esté vacío, el `visible ≥ 0,15` y la separación ≥ 24 px CSS a 343 px; si falla, aborta.
- `scripts/build-piece-assets.py`:
  - `SLUGS` con `const`, `idtype`, `idlist`, `vistalist` y `vistatype` por pieza;
  - nombres de archivo: `unica` → `<slug>.webp` (compatible con el piloto) y las demás → `<slug>-<vista>.webp` / `-<vista>-sm.webp`;
  - una OG por pieza desde la vista inicial;
  - escribe `satisfies PiezaGeo<IdType, VistaType>`;
  - valida que ningún slug sea prefijo de otro seguido de "-" (la limpieza de `--only` usa `startswith(s + "-")`).
- `scripts/check-detail-cajas.ts` (hallazgo 4): cada caja de cada parte contiene al menos N puntos de la geometría renderizada.
- **Aceptación de la Fase 0 en BWReel:** al regenerar `tarjeta-madre`, el `.geo.ts` sale idéntico salvo `generadoEn`, y las imágenes coinciden con `scripts/diff-frames.py --tol 0`. Los `shasum` protegidos no cambian.

---

## 3. Por pieza

Formato de cada una: slug y redirecciones, estructura (`bloques`), vistas y partes, modelos, contenido y datos a verificar. **Todo lo listado es una pregunta, no una afirmación.** La regla de redacción es la del piloto: prosa sin cifras, cifras solo en `Hecho`. Los hechos comunes se citan por id y se verifican una sola vez.

### 3.1 Procesador: `/piezas/procesador` (redirige `cpu`, `procesadores`)

- **Title:** "Procesador: partes y qué significan K, F, X y X3D" (≤ 60).
- **H1:** "El procesador por fuera y cómo leer su nombre".
- **Bloques:** `nombres` (el decodificador va **primero**: es la intención de búsqueda), `partes`, `lista`, `comparar` (AM4 / AM5 / Intel: tipo de contactos, memoria y si el disipador sirve; celdas de hechos comunes), `elegir`, `errores`, `preguntas` (solo si hay preguntas reales).
- **Vistas y partes:** el procesador flota sobre su socket abierto. ≤ 7 marcadores por vista.
  - `am4`: `ihs`, `marca-pin-1`, `pines-procesador`, `palanca`, `zocalo`.
  - `am5` e `intel-lga`: `ihs`, `marca-pin-1`, `muescas`, `contactos-socket`, `tapa-sujecion`, `palanca`, `zocalo`.
  - Los contactos planos bajo el procesador LGA no se ven desde la cámara: se explican con una nota de vista.
- **Modelos:** `src/parts/cpuDetail.ts` nuevo, con `cpuPaquete({plataforma})` (contorno, IHS, triángulo, muescas, pines solo en AM4) y `cpuSocket({plataforma})` (agujeros PGA más palanca, o campo de pines LGA más tapa y palanca), y `src/detail/procesador.ts`.
  - Esfuerzo: **3 a 4 días**, riesgo medio-alto (dimensiones y muescas por verificar; dibujo "esquemático" declarado en el pie de figura).
  - No se usan `cpu.ts` ni `socketParts.ts`, por la inconsistencia ya anotada.
- **Esquema pedagógico:**
  1. Qué hace (en una frase).
  2. Cómo leer el nombre (decodificador, sufijos, gamas).
  3. AMD e Intel por fuera (pines frente a contactos, el pin 1).
  4. Al elegir: socket y placa, gráficos integrados sí o no, disipador.
  5. Errores.
- **Datos a verificar** (meta ≤ 30; las fuentes son sugeridas, no consultadas):

| ID | Pregunta | Fuente primaria sugerida |
|---|---|---|
| N1 | **(memoria del dueño)** ¿Intel cambió "Core i5" por "Core 5" y "Core Ultra 5" desde 2023? ¿Qué distingue a "Core" de "Core Ultra"? | Intel Newsroom (anuncio de la marca); Intel "Processor Names and Numbers" |
| N2 | ¿Se siguen vendiendo Core i3/i5/i7/i9 de LGA 1700 al mismo tiempo que la línea nueva? | Intel ARK |
| N3 | En Core i: ¿los primeros dígitos del número son la generación (12400 → 12.ª)? | Intel "Processor Names and Numbers" |
| N4 | En Core Ultra: ¿el primer dígito es la serie (2xx = serie 2)? ¿Existe ya una serie 3 de escritorio o solo de portátil? | Intel ARK y Newsroom |
| N5a a N5i | Sufijos de Intel: K, F, KF, KS, T, H, HX, U, V (uno por hecho) | Intel "Processor Names and Numbers" |
| N6a a N6e | Sufijos de AMD de escritorio: X, X3D, G, F, XT. (AMD quizá no tenga una página de nomenclatura de escritorio: probable 🟡 con páginas de producto) | Páginas de producto de AMD; página de "3D V-Cache" |
| N7 | ¿Los Ryzen 7000/9000 de AM5 sin "G" traen gráficos integrados básicos (salvo los "F")? | Fichas de AMD ("Graphics Model") |
| N8 | ¿Ryzen 8000G es AM5? (para explicar que el número de serie no es la generación) | AMD |
| N9 | Portátiles AMD: ¿esquema "Ryzen AI 9 HX 370" y sufijos U / HS / HX? | AMD, página de Ryzen para portátiles |
| N10 | ¿Intel describe i3/i5/i7/i9 (y 3/5/7/9) como indicador relativo **dentro de su familia**? ¿AMD dice algo equivalente de Ryzen 3/5/7/9? | Intel; AMD (probable 🟡) |
| N11 | ¿Existen "Core Ultra 3" y "Core 3"? (decide los "—" de la tabla de equivalencias) | Intel ARK |
| N12 | ¿Hay X3D en AM4 y en AM5? | AMD |
| E1 a E6 | Que existan los 6 ejemplos (propuesta: Ryzen 5 5600G, Ryzen 7 7800X3D, Ryzen 5 7600X, Core i5-12400F, Core i7-14700K, Core Ultra 7 265K) | Ficha de cada uno en AMD / Intel ARK |
| Físicos | Comunes: S1 (AM4 PGA), S2 (AM5 LGA y DDR5), S3 (disipadores AM4 → AM5), S4 y S5 (LGA 1700 / LGA 1851), S6 (disipadores 1700 → 1851), S8 (marca del pin 1) | Ya en la lista del plan 1 |
| N20 | ¿LGA 1700 y LGA 1851 miden lo mismo y llevan muescas en posiciones distintas? | Intel (guías térmicas y mecánicas) |
| N21 | ¿La pasta térmica va entre el IHS y la base del disipador? | AMD "How to Install…" (ya citada en el piloto) |

- **Casos y criterios:**
  - Puede pasar: olvidar el plástico de la base del disipador; pasta mal aplicada; doblar pines (caso compartido con la tarjeta madre, redactado distinto).
  - **Criterio** (aprobación del dueño): "procesador de gama alta con el disipador básico de caja: preferimos como mínimo uno de torre, o uno de bajo perfil bueno si el chasis es pequeño".
  - Vivido (compartido): monitor conectado a la placa con un procesador sin gráficos integrados.

### 3.2 Memoria RAM: `/piezas/memoria-ram` (redirige `ram`, `memoria`)

- **Title:** "Memoria RAM DDR4 vs DDR5: partes y diferencias".
- **Bloques:** `partes` (selector DDR4 · DDR5), `lista`, `vistas`, `comparar`, `elegir` (enlaza a `/guias` para "cuánta RAM", sin repetirlo), `errores`.
- **Partes** (≤ 7 por vista): `contactos`, `muesca`, `chips-memoria`, `pmic` (solo `ddr5`; en `ddr4` va la nota "En DDR4 la regulación está en la placa"), `chip-spd`, `ranura`, `trabas`.
  - El módulo va levantado sobre un tramo de ranura con su llave alineada. Ese es el momento didáctico: al cambiar de DDR4 a DDR5 con la muesca elegida, se ve moverse.
- **Modelo:** `src/parts/ramDetail.ts` nuevo, con `ramModuleDetail({generacion})` (sin disipador, para ver los chips) y `dimmSlot({generacion})`; más `src/detail/memoria-ram.ts`. **1,5 a 2 días.** Riesgo: la posición de la muesca; si no hay medida primaria, se dibuja "esquemático" con la posición relativa que muestren los fabricantes.
- **Comparación DDR4 / DDR5** (filas): muesca (R1 común), PMIC (RM2), voltaje nominal (RM4), qué plataformas la usan (S2, S4, S5 comunes) y cómo se nombra la velocidad (RM5).

| ID | Pregunta | Fuente sugerida |
|---|---|---|
| R1 (común) | ¿Las dos tienen 288 contactos, con la muesca en distinta posición, y no se intercambian? | JEDEC JESD79-4 / JESD79-5; Kingston y Crucial (🟡) |
| RM2 | ¿DDR5 lleva el PMIC en el módulo? | JEDEC; documento técnico de Micron |
| RM4 | ¿Voltaje nominal de 1,2 V en DDR4 y 1,1 V en DDR5? (quitar si no aporta a la decisión) | JEDEC |
| RM5 | ¿"DDR5-6000" se mide en MT/s y no en MHz? | Kingston / Crucial / JEDEC |
| RM6 | ¿XMP (Intel) y EXPO (AMD) son perfiles que hay que activar en la BIOS y sin ellos la memoria corre a la velocidad base JEDEC? | Páginas de Intel XMP y de AMD EXPO |
| R3 (común) | Doble canal: ¿dos módulos en las ranuras que indica el manual? | Manuales |
| RM7 | ¿SO-DIMM (portátil) tiene otro tamaño y no sirve en escritorio? (solo texto, sin vista) | JEDEC / Crucial |
| RM3 | ¿DDR5 tiene dos subcanales por módulo? **Recomiendo quitarlo:** no ayuda a elegir | Micron |

- **Casos:**
  - Vivido: DDR5 traída para una placa DDR4 (reescrito, no copiado de la tarjeta madre).
  - Puede pasar: módulo a medio insertar.
  - Puede pasar (**propuesto por el agente, requiere aprobación**): memoria a menor velocidad por no activar el perfil.

### 3.3 Almacenamiento: `/piezas/almacenamiento` (redirige `ssd`, `disco-duro`, `discos`)

- **Title:** "SSD M.2 NVMe, SATA y disco duro: diferencias".
- **Bloques:** `partes`, `lista`, `vistas` (con "a favor / a considerar" por vista como `Criterio`), `comparar` (interfaz, dónde se conecta, cables que necesita, uso típico), `elegir`, `errores`.
- **Partes por vista:**
  - `m2-nvme` y `m2-sata`: `llave-m2`, `controlador`, `memoria-nand`, `tornillo-m2`, `ranura-m2`.
  - `ssd-sata`: `conector-sata-datos`, `conector-sata-poder`, `carcasa`.
  - `hdd`: los mismos tres. Platos y cabezales se explican como "lo que no se ve en el dibujo".
- **Modelos:**
  - `src/parts/m2Detail.ts` nuevo: `m2Module({llave: "m" | "b+m"})`. `ssd.ts` solo dibuja la llave M y no se toca; las medidas salen de `SSD`.
  - `sataDrive()` + `sataPlugs()` de `sata.ts` y `hddDisk()` de `hdd.ts`, importados.
  - `src/detail/almacenamiento.ts`.
  - **1,5 a 2 días**, riesgo bajo.
- **Datos:** comunes M1 a M4, T1, T2, P2 y P3; nuevos:

| ID | Pregunta | Fuente sugerida |
|---|---|---|
| AL1 | ¿El M.2 SATA suele llevar llave B+M y el NVMe llave M? | PCI-SIG (M.2); fichas de fabricantes |
| AL2 | ¿El SSD de 2,5″ y el HDD de 3,5″ usan los mismos conectores SATA de datos y de poder? | SATA-IO |
| AL3 | ¿El HDD tiene piezas móviles y es más sensible a golpes; el SSD no? | Seagate / WD (fichas y documentos técnicos) |
| AL4 | ¿Un NVMe de una generación PCIe funciona en una ranura de otra a la menor velocidad? (= P3) | PCI-SIG |

  Sin MB/s de productos ni TBW (se descartan: cambian por modelo).
- **Casos:**
  - Puede pasar: M.2 SATA en una ranura que solo acepta NVMe, o al revés.
  - Puede pasar: cables SATA de datos o de poder mal conectados (sale de la sección de la fuente).

### 3.4 Refrigeración: `/piezas/refrigeracion` (redirige `disipador`, `refrigeracion-liquida`)

- **Title:** "Disipador por aire o refrigeración líquida: diferencias".
- **Bloques:** `partes`, `lista`, `vistas` (**A favor / A considerar = `Criterio`**, con rótulo "Criterio de B & W"), `elegir`, `errores`.
  - El caso de flujo de aire va aquí, porque el chasis no tiene página: "todos los ventiladores entrando".
- **Partes:**
  - `aire`: `base`, `heatpipes`, `aletas`, `ventilador`.
  - `liquida`: `bloque-bomba`, `mangueras`, `radiador`, `ventilador`; `base` es la placa de contacto del bloque.
- **Modelos:** `coolerBody()`, `aioBody()` y `fanFrame()`/`fanBlades()` importados; cajas desde `COOLER` y `AIO`; `src/detail/refrigeracion.ts`. **1 a 1,5 días**, riesgo bajo.
- **Datos:** N21 (pasta, común con procesador), S3 y S6 (anclajes, comunes); nuevos:

| ID | Pregunta | Fuente sugerida |
|---|---|---|
| RF1 | ¿La base trae un plástico protector que hay que quitar? | Manual de cualquier fabricante de disipadores (Noctua, Cooler Master) |
| RF2 | ¿Los chasis indican la altura máxima del disipador? | Fichas de fabricantes de chasis |
| RF3 | ¿El tamaño del radiador se nombra por los ventiladores (120 / 240 / 280 / 360)? | Fabricantes de AIO |
| RF4 | ¿La bomba va a un cabezal AIO_PUMP o similar? (= H2 común) | Manuales |

- **Criterios por aprobar** (sin fuente; los redacta el agente con el tono del dueño):
  - aire a favor: menos piezas que pueden fallar, sin líquido, mantenimiento simple;
  - aire a considerar: altura frente al chasis, peso, puede tapar memorias altas;
  - líquida a favor: lleva el calor al radiador y libera espacio alrededor del socket;
  - líquida a considerar: la bomba es una pieza más que puede fallar, ubicación del radiador, instalación más larga.
- **Casos:**
  - Vivido (criterio): disipador de caja con un procesador de gama alta.
  - Vivido: ventiladores todos hacia adentro.
  - Puede pasar: plástico sin quitar; pasta mal aplicada.

### 3.5 Fuente de poder: `/piezas/fuente-de-poder` (redirige `fuente`, `psu`, `fuente-de-alimentacion`)

- **Title:** "Fuente de poder: partes por dentro y conectores".
- **Bloques:** `partes` (selector Por fuera · Por dentro · Conectores), `lista`, `vistas`, `elegir` (enlaza a `/guias` para vatios y 80 Plus, sin calcular vatios aquí), `errores`, `preguntas` ("¿Por qué mi PC no enciende?": incluye el interruptor; es una pregunta real del taller).
- **Aviso de seguridad visible** en `#partes`, no solo en la prosa: no abrir la fuente, porque los condensadores pueden guardar carga (FP3).
- **Partes:**
  - `por-fuera`: `rejilla-ventilador`, `entrada-ac`, `interruptor`, `banco-modular`, `etiqueta`.
  - `por-dentro`: `filtro-emi`, `rectificador`, `pfc`, `condensadores-primarios`, `transformador`, `salida-secundaria`.
  - `conectores`: `atx-24`, `eps-cpu`, `pcie-6-2`, `12v-2x6`, `sata-poder`, `molex`.
- **Modelos:**
  - `por-fuera`: `psuBody()` de `psu.ts`, importado; cajas copiadas más `check-detail-cajas`.
  - `por-dentro`: `psuShell()` + `psuBoard()` de `psuInterior.ts`, sin la tapa; cajas copiadas de `psuBoard` más el chequeo.
  - `conectores`: `src/parts/psuConectores.ts` nuevo (cabezas de cable en fila, con su rejilla de pines y su traba, sin marca).
  - `src/detail/fuente-de-poder.ts`.
  - **3 a 3,5 días.** Riesgo medio: conteo de pines y forma de las trabas (12V-2x6 con sus pines de señal).

| ID | Pregunta | Fuente sugerida |
|---|---|---|
| E1, E2, E3 (comunes) | 24 pines (20+4); EPS 4+4; EPS y PCIe no son intercambiables | Especificación ATX / EPS12V |
| FP1 | ¿PCIe 6+2 para gráficas? | Intel ATX 3.x Design Guide; PCI-SIG CEM |
| FP2 | ¿12V-2x6 (ATX 3.1 / PCIe CEM 5.1) reemplazó al 12VHPWR? ¿Debe quedar insertado por completo? Redactar **sin culpar a una marca** | Intel ATX 3.1; PCI-SIG |
| FP3 | ¿Los condensadores guardan carga peligrosa aunque la fuente esté desconectada (no abrirla)? | Advertencias del manual de un fabricante |
| FP4 | **(memoria del dueño)** ¿La orientación del ventilador depende de la ubicación (abajo con filtro → hacia abajo)? Si no hay fuente primaria, pasa a criterio | Manuales de chasis y de fuente |
| FP5 | ¿Los cables modulares de una fuente no deben usarse en otra porque el orden de pines cambia? | Manual de Corsair o Seasonic |
| FP6 | ¿SATA de poder de 15 pines? ¿Molex de 4 pines es de uso antiguo o periférico? | SATA-IO; especificación ATX |
| FP7 | ¿Etapas internas (filtro EMI, PFC activo, conmutación, transformador, rectificación y regulación)? Se explica cualitativo, con **un solo** hecho de respaldo | Nota técnica de fabricante (Infineon / TI / Seasonic) |
| FP8 | **(memoria del dueño)** ¿Cada conector de 8 pines de la gráfica con su propio cable, no uno ramificado? Si no hay guía del fabricante, pasa a criterio | Guía del fabricante de la gráfica o de la fuente |

- **Casos:**
  - Vivido: torre entregada con el interruptor en apagado.
  - Vivido: ventilador mal orientado.
  - Puede pasar: cables SATA mal conectados.
  - Puede pasar (**propuesto por el agente, requiere aprobación**): mezclar cables modulares de otra fuente.

### 3.6 Tarjeta gráfica: `/piezas/tarjeta-grafica` (redirige `grafica`, `gpu`, `tarjeta-de-video`)

- **Title:** "Partes de la tarjeta gráfica y para qué sirven".
- La primera vez el texto dice "tarjeta gráfica (tarjeta de video)": regla de sinónimos.
- **Bloques:** `partes`, `lista`, `elegir`, `errores`.
- **Partes:**
  - `armada`: `ventiladores`, `carcasa`, `disipador`, `backplate`, `bracket`, `conector-energia`, `conector-pcie`.
  - `placa`: `chip-grafico`, `memoria-vram`, `vrm`, `conector-energia`, `conector-pcie`, `bracket`.
  - `chip-grafico` lleva `opciones` de texto **NVIDIA · AMD · Intel** (chips, sin logos, sin dibujos por marca).
- **Modelos:** `gpuBody()` (`gpu.ts`) y `gpuPcb()`/`gpuHeatsink()` (`gpuLayers.ts`) importados; la placa se gira con `Matrix4` para que los componentes miren a la cámara (hoy miran a −Z); cajas copiadas más `check-detail-cajas`; `src/detail/tarjeta-grafica.ts`. **1,5 a 2 días.** Riesgo: chip, VRAM y VRM muy juntos en móvil (si no cumple, agrupar las VRAM en un solo marcador).

| ID | Pregunta | Fuente sugerida |
|---|---|---|
| P1, P4 (comunes) | ¿Va en la x16 principal, que sale del procesador? | Diagramas de bloque / manuales |
| FP1, FP2 (comunes con la fuente) | Conectores de energía | Ver la fuente |
| GR1 | ¿Nombres de la VRAM (GDDR6 / GDDR6X / GDDR7)? | JEDEC; Micron |
| GR2 | ¿NVIDIA, AMD e Intel diseñan el chip y las ensambladoras fabrican la tarjeta? | Páginas de NVIDIA, AMD e Intel (probable 🟡) |
| GR3 | ¿Los chasis indican el largo máximo de gráfica? | Fichas de chasis |
| I1 (común) | ¿La salida de video de la placa solo sirve con gráficos integrados? | Intel / AMD |

- **Casos:**
  - Vivido: gráfica sin el cable de alimentación.
  - Vivido: gráfica de tres ventiladores demasiado larga.
  - Vivido (compartido): monitor conectado a la placa.
  - Puede pasar: 12V-2x6 sin insertar por completo.
  - FP8 como criterio, si no hay fuente.

**Fuera de alcance a propósito:** decodificador de nombres de gráficas (posible fase 3), rendimiento y benchmarks.

---

## 4. Hoja de verificación (formato estándar)

**Archivos** (Markdown y JSON; pequeños):
- `docs/verificacion/<slug>.json`: fuente de verdad de la revisión.
- `docs/verificacion/<slug>.md`: generado a partir del JSON.
- `docs/verificacion/00-consolidada.md`: lo que el dueño lee.

**Generación:** `scripts/hoja-verificacion.mjs` (solo lectura del código; se carga con `--experimental-strip-types` igual que `check:logic`) recorre `PIEZAS` y `comun.hechos.ts` y escribe un esqueleto por dato con:
- `id`;
- dónde vive (pieza › parte › vista / sección / comparación);
- tipo (`hecho` / `caso` / `criterio`);
- texto publicado;
- fuentes candidatas.

Los hechos comunes van en `comun.json` una sola vez, con "lo usan: tarjeta-madre, memoria-ram…".

**Investigación** (un agente por página, en paralelo, con navegador; ver §5):
- completa en el JSON `fuenteVerificada {titulo, editor, url, consultadoEn}`, `parafrasis` (máximo 2 frases, sin copiar texto largo), `estado`, `propuesta` (`mantener` | `reformular` | `quitar`) y `textoPropuesto`;
- vuelve a generar el MD.

**Estados:**
- ✅ la fuente primaria dice lo mismo;
- 🟡 solo hay fuente secundaria, o la fuente lo dice en parte, o hay que ajustar la redacción;
- ❌ la fuente lo contradice o no se encontró fuente primaria en 2 intentos;
- ⚪ no es verificable con fuente (caso o criterio): solo lleva aprobación.

**Bloque por dato** (formato fijo del MD):

```md
### RM2 · PMIC en el módulo · memoria-ram › pmic · vista ddr5
- Texto publicado: «…»
- Fuente: [JEDEC JESD79-5…](https://…) · consultada 2026-10-20 · primaria
- Qué dice la fuente: …(paráfrasis)
- Estado: ✅   · Propuesta: mantener   · Texto propuesto: —
- Decisión del dueño: [ ] aprobar  [ ] ajustar → «…»  [ ] quitar
- Nota del dueño:
```

**Consolidada** (`00-consolidada.md`), en este orden:
1. **Tabla resumen** por página: total, ✅ / 🟡 / ❌ / ⚪, casos y criterios.
2. **Aprobación rápida:** `[ ] Apruebo todos los ✅ de: [ ] común [ ] tarjeta-madre [ ] procesador …`, que reduce la sesión a revisar por excepción.
3. Los ❌ de todas las páginas.
4. Los 🟡.
5. Los ⚪ (casos y criterios, agrupados por página: el dueño los aprueba como experiencia o criterio propio).
6. Al final, los ✅ completos, para muestreo.

**Aplicación de las decisiones** (un solo agente, secuencial):
- **aprobar**: `verificadoEn` = fecha de la sesión del dueño, `verificadoPor` = sus iniciales, fuentes con `consultadoEn`.
- **ajustar**: se cambia el `texto` y luego se marca como aprobado.
- **quitar**: se borra el `Hecho` y la prosa que dependía de él. Si deja una parte sin hechos, se acepta; si deja vacía una celda de comparación, se cambia por `texto` cualitativo o se quita la fila.
- **casos y criterios**: `aprobadoEn` y `aprobadoPor`.
- Se registra `decision` y `decididoEn` en el JSON.

**La puerta de publicación crece** (`publicacion.ts` + `check-piezas`):
- con `estado: "publicado"`, además de lo actual, cada `Caso` y `Criterio` necesita `aprobadoEn` y `aprobadoPor`;
- `geo !== null` salvo `sinDibujo`;
- **cada id publicado aparece en `docs/verificacion/<slug>.json` con `decision` `aprobar` o `ajustar`**, coherente con `verificadoPor`. Así ningún dato llega a producción sin una decisión registrada del dueño.

**Cómo se reducen los datos débiles** (reglas para redactar y para investigar):
1. Una cifra solo se publica si cambia una decisión de compra o de armado. Si no, se dice en prosa cualitativa.
2. Nada de fechas de lanzamiento, precios, rendimientos, MB/s de producto, TBW ni "vigencia" de plataformas.
3. Un dato compartido se verifica una vez (`comun.hechos.ts`).
4. Prioridad de fuentes: especificación u organismo (PCI-SIG, JEDEC, SATA-IO, Intel ATX), luego ficha oficial del fabricante del chip, luego manual de un modelo concreto. Una fuente secundaria (prensa técnica) solo sirve como 🟡 y nunca sola.
5. Sin fuente primaria en 2 intentos → la propuesta por defecto es reformular a cualitativo o quitar.
6. Lo que es experiencia u opinión pasa a `Caso` o `Criterio` y no se disfraza de `Hecho`.

---

## 5. Fases ejecutables

### 5.1 Fase −1: dueño y orquestador (secuencial)
- Commit del piloto y rama `feat/piezas-2` (con la autorización del dueño).
- Respuestas a §7.
- Espacio: `df -h` con ≥ 1,5 GB libres antes de cualquier render o `build:check`. Si no, la limpieza que el dueño apruebe (ver §7, pregunta 5).
- BWReel: copia `work/backup-<fecha>/` de `src/` y `scripts/` (~1 MB) y `shasum` de la lista ampliada (hallazgo 3).

### 5.2 Fase 0: contrato y generalización (secuencial, ~1,5 a 2 días; Opus para el contrato, o un Sonnet con este plan)

| Tarea | Archivos | Aceptación |
|---|---|---|
| **T0.1 Contrato BWPCs** | `types.ts` (§2.1 y §2.2), `comun.hechos.ts`, `registro.ts` (7 piezas, `geo: null` en las nuevas, `resolverEnlace`, `hayIndice`), esqueletos `<slug>.contenido.ts` (borrador, `partes` exhaustivas con textos "PENDIENTE", sin dígitos), `procesador.datos.ts` (esqueleto), migración de `tarjeta-madre.contenido.ts` (vistas, sinónimos, bloques, casos, hechos comunes importados), `publicacion.ts` (casos, criterios y geo) | `pnpm tsc --noEmit`; `pnpm check:logic`; en producción local (`VERCEL_ENV=production pnpm dev`) `/servicios`, `/` y `/guias/<slug>` dan un HTML idéntico a `main`; `/piezas/tarjeta-madre` en desarrollo se ve igual, salvo los rótulos de casos |
| **T0.2 Página y checks genéricos** | `piezas/[pieza]/page.tsx` (bloques, `navDePieza`, breadcrumb, fuentes), `scripts/check-piezas/*.mjs` (partido, recorre `PIEZAS`), `next.config.ts` (redirecciones desde `SINONIMOS_SLUG`) | Lo mismo, más `pnpm build:check` (solo el integrador) con `/piezas/[pieza]` como ● SSG |
| **T0.3 BWReel genérico** | `src/parts/piezaIds.ts`, `src/detail/*.ts` (7 esqueletos; `tarjeta-madre.ts` real), `src/detailModel.ts`, `scripts/piece-hotspots.ts`, `scripts/build-piece-assets.py`, `scripts/check-piece-ids.ts`, `scripts/check-detail-cajas.ts`, lista de `shasum` | Regenerar `tarjeta-madre`: geo idéntico salvo `generadoEn` e imágenes iguales (`diff-frames --tol 0`); `shasum` protegidos sin cambios; `git status` de BWPCs sin cambios en `public/servicios`, `public/hero`, `lib/component-stage.ts` ni `lib/tower-hero.ts` |
| **T0.4 Esqueleto de la hoja** | `scripts/hoja-verificacion.mjs`, `docs/verificacion/` | Genera los esqueletos de las 7 páginas más `comun` sin escribir fuera de `docs/verificacion` |

### 5.3 Fase 1: en paralelo, con los contratos fijos

Cada agente toca **solo** sus archivos. No corren `pnpm build`, `build:check` ni renders finales: solo previsualizaciones de baja resolución en `BWReel/work/piezas/<slug>/`, que se borran al aprobarse.

| Tarea (Sonnet) | Archivos | Depende de | Aceptación |
|---|---|---|---|
| **A-RAM** | `BWReel/src/parts/ramDetail.ts`, `src/detail/memoria-ram.ts` | T0.3 | `piece-hotspots --slug=memoria-ram --vista=ddr4|ddr5` sin abortar (≥ 24 px a 343 px, `visible ≥ 0,15`); `check-detail-cajas` y `check-piece-ids` pasan; `preview-piece.py` a 375 y grande, revisado a ojo; `shasum` intactos |
| **A-ALM** | `src/parts/m2Detail.ts`, `src/detail/almacenamiento.ts` | T0.3 | Igual, en 4 vistas |
| **A-REF** | `src/detail/refrigeracion.ts` | T0.3 | Igual, en 2 vistas |
| **A-CPU** | `src/parts/cpuDetail.ts`, `src/detail/procesador.ts` | T0.3 | Igual, en 3 vistas; medidas con comentario de fuente y fecha, o "por verificar" |
| **A-FP** | `src/parts/psuConectores.ts`, `src/detail/fuente-de-poder.ts` | T0.3 | Igual, en 3 vistas |
| **A-GR** | `src/detail/tarjeta-grafica.ts` | T0.3 | Igual, en 2 vistas |
| **B1 Explorador multivista** | `components/piezas/pieza-explorador.tsx`, `lib/piezas/hotspots.ts` (funciones por vista y la copia de `IDS_RESERVADOS`), `pieza-vistas.tsx`, `pieza-comparacion.tsx`, `pieza-casos.tsx`, `scripts/check-piezas/hotspots.mjs` | T0.1, T0.2 | Teclado completo; selector con y sin JS; la parte se conserva al cambiar de vista y la ausencia se anuncia; isla ≤ 8 KB gzip sin datos; sin `dangerouslySetInnerHTML`; sin CSS nuevo; 375 / 768 / 1280; claro y oscuro |
| **B2 Decodificador** | `lib/piezas/procesador/decodificador.ts`, `components/piezas/decodificador-procesador.tsx`, `decodificador-tablas.tsx`, `scripts/check-piezas/decodificador.mjs` | T0.1 | Casos de §6.1; tablas sin JS generadas por la misma función; altura reservada (CLS 0); `aria-live` solo al enviar |
| **B3 Índice y enlaces** | `app/(public)/piezas/page.tsx`, `servicios/page.tsx`, `(public)/page.tsx`, `site-footer.tsx`, `sitemap.ts`, `lib/blog/generate.ts`, `scripts/check-piezas/registro.mjs` | T0.1 | Con ninguna pieza visible, HTML idéntico en producción local; índice con 404 cuando hay menos de 2 visibles; JSON-LD válido |
| **C-CPU** | `procesador.contenido.ts`, `procesador.datos.ts` | T0.1 (con B2 en paralelo: el contrato de datos es fijo) | Reglas de prosa; todos los `hechoId` existen; `verificadoEn: null` |
| **C-RAM-ALM** | `memoria-ram.contenido.ts`, `almacenamiento.contenido.ts` | T0.1 | Igual |
| **C-REF-FP** | `refrigeracion.contenido.ts`, `fuente-de-poder.contenido.ts` | T0.1 | Igual, más criterios con `aprobadoEn: null` |
| **C-GR** | `tarjeta-grafica.contenido.ts`, enlaces cruzados en `tarjeta-madre.contenido.ts` (solo el campo `enlaces`) | T0.1 | Igual |

**Los hechos comunes** (`comun.hechos.ts`) los redacta T0.1 y nadie más los edita en la Fase 1. Si un agente necesita uno nuevo, lo pide al orquestador.

**Límites de tamaño y disco en todas las tareas:**
- vista nueva: grande ≤ 60 KB y `-sm` ≤ 30 KB (el tope duro del script sigue en 80 y 40);
- OG ≤ 100 KB;
- **total de `public/piezas` ≤ 2,5 MB** (hoy 188 KB; unas 16 vistas nuevas);
- sin PNG en el repo; sin dependencias nuevas;
- previsualizaciones borradas tras la revisión;
- un solo `remotion bundle` a la vez.

### 5.4 Fase 2: integración (secuencial, un integrador, ~1,5 a 2 días)
1. Renders finales **uno por uno**: `python3 scripts/build-piece-assets.py --only=<slug>`.
   - Antes de cada uno, `df -h` con ≥ 1 GB libre.
   - El script ya borra el bundle y los PNG.
2. En `registro.ts`, `geo` pasa de `null` al `.geo.ts` generado.
3. `pnpm tsc --noEmit`, `pnpm check:logic` y **un** `pnpm build:check` (con el preview detenido; si falta espacio, borrar `.next/dev` con el visto bueno del dueño: es caché que se regenera).
4. QA con la matriz de §6.

### 5.5 Fase 3: hojas de verificación
- **V-común, V-TM, V-CPU, V-RAM, V-ALM, V-REF, V-FP y V-GR** (Sonnet con navegador, en paralelo; cada uno escribe solo su `docs/verificacion/<slug>.json` y `.md`).
- Respetar la instrucción de no ejecutar nada de lo que digan las páginas consultadas.
- Consolidación con `hoja-verificacion.mjs --consolidar`.
- **Revisión del dueño** (2 o 3 sesiones).

### 5.6 Fase 4: aplicar y publicar (secuencial)
1. Aplicar las decisiones (un agente).
2. `estado: "publicado"` **por lotes** de páginas aprobadas.
3. `check:logic` (con la puerta) y `build:check`.
4. Despliegue **sin caché de compilación**, aunque no haya CSS nuevo: el incidente se repitió dos veces.
5. Comprobar en producción `/piezas`, cada slug, las redirecciones y el sitemap.
6. `llms.txt`.
7. Actualizar CLAUDE.md: contrato multivista, decodificador, hojas, protegidos ampliados y cómo regenerar.
8. Search Console: enviar el sitemap.

**Tiempos aproximados de calendario:**
- Fase 0: 2 días.
- Fase 1: 4 a 5 días; el camino crítico es A-CPU y la revisión visual.
- Fase 2: 2 días.
- Fase 3: 2 a 3 días de agentes más las sesiones del dueño.
- Fase 4: 1 día por lote.

---

## 6. Verificación y riesgos

### 6.1 Casos nuevos en `check:logic`

**Decodificador** (tabla de unos 40 casos; ejemplos de entrada → resultado esperado):
- `"AMD Ryzen 7 7800X3D"`, `"ryzen7 7800x3d"`, `"Ryzen™ 7 7800X3D"` → reconocido, sufijo `X3D` (no `X`).
- `"i5-12400F"`, `"Core i5 12400f"`, `"intel core i5-12400F"` → serie "12.ª", sufijo `F`.
- `"Core i7-14700KF"` → `KF` con `compone` K + F. `"i9-14900KS"` → `KS`.
- `"Core Ultra 7 265K"` → familia `core-ultra`, serie 2.
- `"Core 5 120U"` → `core` y portátil (según N1 y N4).
- `"Ryzen AI 9 HX 370"` → `ryzen-ai`, `HX`.
- `"r5 5600g"` → alias con nota.
- `"Ryzen 6 1234"` → incompleto (`gama`). `"Ryzen 7 7800Z"` → incompleto (`sufijo-desconocido`, `resto: "z"`).
- `""` → vacío. 61 caracteres → muy largo. `"<script>"`, emoji o `\u0000` → caracteres.

**Propiedades:**
- `normalizarNombre` es idempotente.
- Nunca lanza una excepción: 2000 cadenas pseudoaleatorias con semilla fija.
- Cada `SufijoCpu` se alcanza por al menos un caso.
- Cada ejemplo da `reconocido`.
- Tokens únicos por familia; el orden más largo primero se cumple.
- Todos los `hechoId` existen en el contenido.
- `revisadoEn` válido; **advertencia** si pasaron más de 6 meses.

**Multivista:**
- Ids de geo por vista = partes cuyo `vistas` incluye esa vista.
- `minAnchorSpacing(vista, 343) ≥ 24` en **cada** vista.
- `stepPart` y `nearestPart` restringidos a la vista.
- Parte ausente → `anchorPct` da `null` y el panel muestra la nota.
- Las vistas del contenido = `*_VISTAS` = vistas del geo, en el mismo orden.
- Las imágenes de cada vista existen, `sm` < grande, y se respetan los presupuestos nuevos.
- `public/piezas` ≤ 2,5 MB (suma con `fs`).

**Contenido:**
- Ids de hecho únicos en todo el sitio (salvo el mismo objeto compartido).
- Cada sinónimo aparece exactamente 1 vez en la prosa de su pieza.
- `bloques` sin duplicados, y cada bloque tiene contenido.
- `navDePieza` = ids que existen en la página.
- Sin "mejor / peor / superior / inferior" en criterios, comparaciones, `aFavor` y `aConsiderar`.
- Ningún texto de un `Caso` empieza por «Nos ha pasado» ni «Puede pasar» (el rótulo lo pone la UI).
- `EnlaceParte` con `pieza` apunta a un slug y a una parte válidos.
- Títulos ≤ 60 caracteres y descripciones de 120 a 160 en las 7 piezas y en el índice.

**Registro y enlaces:**
- `SINONIMOS_SLUG` sin choques.
- `hrefPiezaServicios` para los 7 `PieceId` (chasis → null).
- `hayIndice` con 0, 1 y 2 publicadas.
- `resolverEnlace` → null si el destino no es visible en producción.

**Puerta de publicación:** casos y criterios sin aprobación, `geo: null` sin `sinDibujo`, y un id publicado sin decisión en el JSON de verificación, todo debe bloquear.

**Guardas estáticas existentes:** sin `sharp`, `db/` ni `auth`, y sin `dangerouslySetInnerHTML`, extendidas a los archivos nuevos.

### 6.2 Accesibilidad
- **Teclado:** marcadores en orden pedagógico por vista; selector de vistas; Anterior y Siguiente; formulario del decodificador (Enter envía; el `<select>` de ejemplos); enlace de salto a la lista; foco nunca escondido bajo el encabezado fijo.
- **Lector de pantalla** (VoiceOver y TalkBack):
  - nombres de los marcadores: "3. PMIC, regulador de voltaje";
  - `aria-current` en la vista y en la parte elegidas;
  - anuncios cortos y solo al actuar;
  - tablas con `<caption>` y `scope`;
  - el decodificador anuncia un resumen, no cada tecla.
- axe sin errores en las 7 páginas, el índice y /servicios (`aria-hidden-focus`). Zoom al 200 %.

### 6.3 Móvil a 375 px
- ≤ 8 marcadores por vista, comprobado en BWReel (aborta) y en `check:logic`.
- Previsualización `preview_<slug>_<vista>_375.png` revisada a ojo antes del render final.
- Si una vista no cumple: más zoom, agrupar partes o, como último recurso, el "Ampliar" con `focusTransform`.
- El selector de vistas con 4 chips (almacenamiento) cabe en una fila de `font-mono text-xs` con `flex-wrap`, y cada chip mide al menos 44 px de alto.

### 6.4 Claro y oscuro
`.piece-ink` en todas las `<img>` (explorador, `#vistas` e índice). Contornos y chip activo en acento. Tablas, casos y decodificador solo con tokens (`border-hairline`, `text-panda`). Sin colores fijos en hex.

### 6.5 Regresión de /servicios y del hero
- `shasum` intactos de la lista ampliada.
- En BWPCs, `git diff --stat` vacío en `public/servicios`, `public/hero`, `lib/component-stage.ts` y `lib/tower-hero.ts`.
- HTML de `/servicios` y `/` en producción local idéntico a `main` mientras no haya nada publicado.
- Capturas del recorrido a 375 / 768 / 1280 en p ≈ 0,05 / 0,35 / 0,95, comparadas con `diff-frames.py --tol 0`. Recordatorio de CLAUDE.md: `tabs_select` y luego `scrollTo` + `dispatchEvent(new Event("scroll"))`.
- Navegar de /servicios a una pieza y volver: `data-tower-hidden` queda limpio.

### 6.6 SEO y JSON-LD
- Por pieza: `TechArticle` + `BreadcrumbList` (con "Piezas del PC" solo si existe el índice). `FAQPage` solo con preguntas reales (la fuente sí, por "no enciende"). En el procesador, opcional `DefinedTermSet` para el glosario de sufijos (útil para motores de IA, riesgo bajo).
- **Contenido delgado:** cada página lleva explorador, lista y al menos dos de {comparación, vistas con criterios, decodificador, casos}. Nada de una URL por parte.
- **Duplicado con /guias:**
  - la RAM no responde "cuánta necesito" y la fuente no calcula vatios (las dos enlazan a `/guias`);
  - el índice de guías está en Mongo y puede tener guías generadas por IA: **antes de redactar, un agente lista los títulos de la colección `guides`** (consulta de solo lectura con `MONGODB_URI` de `.env.local`) o se los pide al dueño;
  - el generador ya no podrá tomar estos temas (hallazgo 9).
- **Canibalización entre piezas:** las partes de la tarjeta madre enlazan a las páginas profundas (socket → procesador, ranuras-ram → RAM, m2 / sata → almacenamiento, pcie-principal → gráfica, conectores → fuente) y viceversa, siempre por `EnlaceParte` resuelto con el registro.

### 6.7 Datos que cambian rápido
- `Hecho.revisarCadaMeses`:
  - **6** para nombres de procesadores, sufijos, series, "se usa hoy" (conectores), plataformas vigentes y memoria que admiten;
  - **12** por defecto;
  - **24** para medidas de especificaciones (ATX, SATA).
- `advertenciasDePublicacion` usa ese valor. La fecha "revisado" visible sale del `verificadoEn` más reciente, como hoy.
- El decodificador lleva `revisadoEn` y avisa a los 6 meses.
- Un sufijo o una serie nueva cuesta una fila de datos, un caso de prueba y un hecho. Lo desconocido degrada a "incompleto" sin romper nada.
- Opcional: recordatorio semestral (calendario del dueño o un agente programado, si lo autoriza).

### 6.8 Otros riesgos
| Riesgo | Mitigación |
|---|---|
| Disco | Renders y compilaciones en serie, con `df` antes de cada uno |
| Agentes que pisan archivos de BWReel (sin git) | Módulos por pieza, más la copia de respaldo de la Fase −1 |
| El preview no emula `prefers-reduced-motion` | Probar a mano |
| `pnpm lint` roto en todo el repo | Se ignora |
| CSS viejo en Vercel | Cero CSS nuevo; posiciones en estilo en línea |
| Hidratación del decodificador | No leer `window` durante el render |
| `next.config.ts` importa `types.ts` | Debe seguir sin imports |
| `--only` y prefijos de slug | Validación en el script |

---

## 7. Preguntas para el dueño (máximo 5) y lo que se descarta

1. **Slugs.** Recomiendo `procesador`, `memoria-ram`, `almacenamiento`, `refrigeracion`, `fuente-de-poder` y `tarjeta-grafica`, con las redirecciones de §2.1 (incluida `tarjeta-de-video`). Antes, confirmar con Google Trends (Colombia) sobre todo "tarjeta gráfica" vs "tarjeta de video" y "almacenamiento" vs "ssd". Un slug no se cambia después de publicar.
2. **Dibujo del procesador.** Recomiendo **3 vistas** (AM4, AM5, Intel LGA), con la salida `geo: null` si se atrasa: el decodificador se puede publicar sin dibujo. Alternativa: 2 vistas (PGA y LGA), un día menos.
3. **Criterios de taller.** ¿Apruebas el formato "A favor / A considerar" con el rótulo "Criterio de B & W" (sin fuente, firmado por ti) para refrigeración y almacenamiento, y la frase sobre el disipador de caja con procesadores de gama alta? Recomiendo que sí: separa opinión de dato y cumple "nada de mejor/peor".
4. **Revisión y publicación.**
   - ¿Tus iniciales para `verificadoPor` / `aprobadoPor`?
   - ¿Aceptas la "aprobación rápida" de los ✅ (revisando por excepción y muestreando)?
   - ¿Publicar **por lotes** lo aprobado en vez de esperar a la última página?

   Recomiendo que sí a lo tres. La hoja incluye los 59 hechos del piloto, que siguen sin verificar.
5. **Repositorio y disco.**
   - ¿Autorizas el commit del piloto en `feat/piezas-2` (hoy está sin commitear)?
   - ¿Autorizas liberar espacio si hace falta? Por ejemplo, borrar `.next/dev` (caché que se regenera) y, solo con tu visto bueno explícito, carpetas de trabajo viejas de `BWReel/work` (`cinema*`, unos 500 MB). Nunca `BWReel/out`.

**Descartado a propósito:**
- página de chasis (su caso de flujo de aire va en refrigeración);
- logos y dibujos por marca;
- precios, plazos y garantías;
- rendimiento, benchmarks, MB/s de producto y TBW;
- fechas de lanzamiento y "vigencia" de plataformas;
- base de datos de modelos de procesador (el decodificador es por patrón);
- decodificador de gráficas (posible fase 3);
- calculadora de vatios en la página de la fuente (ya está la guía);
- vista de SO-DIMM y vista del interior del HDD (solo texto);
- Mini-ITX en 3D;
- WebGL, zoom con gestos y animaciones;
- guardar o medir lo que la gente escribe en el decodificador;
- `useSearchParams` en páginas estáticas;
- modificar `moboBoard`, `ram.ts`, `cpu.ts`, `gpu.ts`, `psu.ts`, `stageModel.ts` o cualquier modelo que ya use /servicios, el hero o los reels;
- regenerar /servicios o el hero.

---

### Archivos críticos para la implementación
- /Users/nabaol/Documents/BWPCs/src/lib/piezas/types.ts (contrato: slugs, ids por pieza y vista, `Caso`, `Criterio`, `Comparacion`, decodificador)
- /Users/nabaol/Documents/BWPCs/src/app/(public)/piezas/[pieza]/page.tsx y /Users/nabaol/Documents/BWPCs/src/components/piezas/pieza-explorador.tsx (generalización a bloques y multivista)
- /Users/nabaol/Documents/BWPCs/scripts/check-piezas.mjs (se parte en `scripts/check-piezas/*.mjs`) y /Users/nabaol/Documents/BWPCs/src/lib/piezas/publicacion.ts (puerta ampliada)
- /Users/nabaol/Documents/BWReel/scripts/build-piece-assets.py y /Users/nabaol/Documents/BWReel/scripts/piece-hotspots.ts (pipeline multipieza y multivista)
- /Users/nabaol/Documents/BWReel/src/detailModel.ts y /Users/nabaol/Documents/BWReel/src/parts/piezaIds.ts (registro por pieza en `src/detail/<slug>.ts`)
