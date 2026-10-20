/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// `--verificar` de scripts/hoja-verificacion.mjs (docs/piezas-plan-2.md §5.6): amarra el CÓDIGO (única fuente del contenido) con las DECISIONES del dueño
// (única fuente de lo decidido, en docs/verificacion/*.json). Solo lectura: usa los objetos reales `PIEZAS` y `HECHOS_COMUNES`.
// Reglas (cada mensaje sale como `hoja/id: problema → archivo:línea, qué hacer`):
//  H1 cada hecho aprobar/ajustar existe una sola vez (el mismo objeto en todas las piezas que lo usan)
//  H2 el texto del código es el que leyó el dueño (aprobar) o el que ajustó (ajustar)
//  H3 verificadoEn/verificadoPor del código son la fecha y las iniciales de la decisión (incluye los 32 de la tarjeta madre)
//  H4 cada fuente del código es https, con fecha real y no futura, y figura entre las consultadas de la hoja con esa fecha
//  H5 un hecho quitado ya no está en PIEZAS, HECHOS_COMUNES ni en el decodificador, ni queda su literal "id" en el código de las piezas
//  H6 en cada fusión el destino existe y las referencias del decodificador que apuntaban al origen ahora apuntan al destino
//  H7 casos y criterios aprobados: aprobadoEn/Por de la decisión, texto sin cambios, «vivido» confirmado, «puede-pasar» no; un caso quitado ya no está
//  H8 completitud: nada verificado/aprobado en el código sin decisión, ni dato sin entrada, ni entrada sin decisión
//  H9 una entrada huérfana solo se acepta con decisión «quitar»
// Avisos (no fallan): pendientes mencionados en notas, palabras clave de hechos quitados que siguen en prosa, ajustes que meten experiencia del taller sin
// fuente, hechos sin `revisarCadaMeses`. Con `--para-publicar`, H4 exige además una fuente primaria (según el `tipo` de la hoja).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { HECHOS_COMUNES } from "../src/lib/piezas/comun.hechos.ts";
import { SLUGS_HOJA, SLUG_COMUN, esFechaHoja, validarHoja } from "../src/lib/piezas/hoja.ts";
import { PIEZAS } from "../src/lib/piezas/registro.ts";
import { PIEZA_SLUGS } from "../src/lib/piezas/types.ts";
import { criteriosDe, hechosDe, prosaDe } from "./check-piezas/comun.mjs";
import { ARCHIVOS_ESCRIBIBLES, RAIZ_REPO } from "./hoja-aplicar.mjs";
import { indexarAprobables, indexarHechos, leerFuente } from "./hoja-codigo.mjs";
import { ARCHIVO_LINEA_BASE, fechaDeHoy, referenciasDecodificador } from "./hoja-congelar.mjs";
import { linea } from "./hoja-md.mjs";
import { DIR_VERIFICACION, leerHojas } from "./hoja-verificacion.mjs";

const CARPETAS_LITERALES = ["src/lib/piezas", "src/components/piezas", "src/app/(public)/piezas"];
const PENDIENTE_EN_NOTA = /pendiente|mencionar|confirmar (?:la redacci|antes de publicar)|redacción por revisar/i;
const SIN_FUENTE_DEL_TALLER = /sin fuente/i;
const MENCIONA_TALLER = /taller|\bNB\b/;
const PALABRAS_VACIAS = new Set(["porque", "cuando", "donde", "desde", "hasta", "entre", "sobre", "según", "puede", "pueden", "tiene", "tienen", "tambien", "también", "ademas", "además", "mismo", "misma", "cada", "otros", "otras", "algunas", "algunos", "estos", "estas", "suele", "suelen", "forma", "formas", "tipos", "parte", "partes"]);

const norm = (valor) => linea(valor);
const rutaDeHoja = (slug) => `docs/verificacion/${slug}.json`;

/* ---------- Datos reales ---------- */
/** Índice de lo que hay en el contenido real: hechos (por id, con los objetos distintos y las piezas que los usan), casos y criterios (por `pieza:id`). */
export function indexarReales(piezas, comunes) {
  const hechos = new Map();
  const casos = new Map();
  const criterios = new Map();
  const sumar = (id, objeto, dueno) => {
    const previo = hechos.get(id) ?? { objetos: new Set(), piezas: new Set(), enComun: false };
    previo.objetos.add(objeto);
    if (dueno === SLUG_COMUN) previo.enComun = true;
    else previo.piezas.add(dueno);
    hechos.set(id, previo);
  };
  for (const slug of PIEZA_SLUGS) {
    const contenido = piezas[slug].contenido;
    for (const h of hechosDe(contenido)) sumar(h.id, h, slug);
    for (const caso of contenido.casos ?? []) casos.set(`${slug}:${caso.id}`, caso);
    for (const c of criteriosDe(contenido)) criterios.set(`${slug}:${c.id}`, c);
  }
  for (const h of comunes) sumar(h.id, h, SLUG_COMUN);
  return { hechos, casos, criterios };
}

const hojaDeDato = (info) => (info.piezas.size >= 2 || info.piezas.size === 0 ? SLUG_COMUN : [...info.piezas][0]);

/** Lugares del código: { hechos: id → {archivo, linea}, aprobables: `tipo:slug:id` → {archivo, linea} } desde el texto de los archivos escribibles. */
export function ubicarEnCodigo(textos) {
  const hechos = new Map();
  const aprobables = new Map();
  for (const [ruta, texto] of textos) {
    const sf = leerFuente(texto, ruta);
    for (const h of indexarHechos(sf)) if (!hechos.has(h.id)) hechos.set(h.id, { archivo: ruta, linea: h.linea });
    const slug = PIEZA_SLUGS.find((s) => ruta.endsWith(`/${s}.contenido.ts`));
    if (!slug) continue;
    for (const a of indexarAprobables(sf)) if (!aprobables.has(`${a.tipo}:${slug}:${a.id}`)) aprobables.set(`${a.tipo}:${slug}:${a.id}`, { archivo: ruta, linea: a.linea });
  }
  return { hechos, aprobables };
}

/** Líneas donde aparece el id como literal exacto ("id") y donde solo lo menciona un texto. `archivos`: [{ ruta, texto }]. */
export function buscarId(id, archivos) {
  const exactas = [];
  const menciones = [];
  const exacto = new RegExp(`(["'\`])${id.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\1`);
  const suelto = new RegExp(`(?<![a-z0-9-])${id.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?![a-z0-9-])`);
  for (const { ruta, texto } of archivos) {
    texto.split("\n").forEach((l, i) => {
      if (!l.includes(id)) return;
      if (exacto.test(l)) exactas.push(`${ruta}:${i + 1}`);
      else if (suelto.test(l)) menciones.push(`${ruta}:${i + 1}`);
    });
  }
  return { exactas, menciones };
}

/** Lee los .ts/.tsx de las carpetas donde puede quedar el literal de un hecho quitado. */
export function leerArchivosParaLiterales(raiz = RAIZ_REPO) {
  const archivos = [];
  const recorrer = (dir) => {
    for (const nombre of readdirSync(dir)) {
      const completa = join(dir, nombre);
      if (statSync(completa).isDirectory()) recorrer(completa);
      else if (/\.(ts|tsx)$/.test(nombre)) archivos.push({ ruta: relative(raiz, completa), texto: readFileSync(completa, "utf8") });
    }
  };
  for (const carpeta of CARPETAS_LITERALES) recorrer(join(raiz, carpeta));
  return archivos;
}

/* ---------- Palabras clave de un hecho quitado ---------- */
export function palabrasClave(texto) {
  const crudas = (norm(texto).toLowerCase().match(/[a-záéíóúñü0-9][a-záéíóúñü0-9.+-]*/g) ?? []).map((p) => p.replace(/[.+-]+$/, ""));
  const palabras = crudas.filter((p) => (p.length >= 7 || /\d/.test(p)) && !PALABRAS_VACIAS.has(p));
  return [...new Set(palabras)];
}

const SEGMENTOS_MAXIMOS_DE_UNA_CLAVE = 4;

/**
 * Segmentos de prosa que repiten dos o más palabras clave DISTINTIVAS de un hecho quitado. Una palabra es distintiva si aparece en pocos segmentos de la pieza
 * (así «gráfica» o «conectores», que están en todas partes, no disparan avisos). `prosa`: [[lugar, texto]]. Devuelve [{ lugar, palabras }].
 */
export function prosaConClaves(claves, prosa) {
  const bajos = prosa.map(([lugar, texto]) => [lugar, norm(texto).toLowerCase()]);
  const distintivas = claves.filter((p) => bajos.filter(([, t]) => t.includes(p)).length <= SEGMENTOS_MAXIMOS_DE_UNA_CLAVE);
  const resultado = [];
  for (const [lugar, texto] of bajos) {
    const palabras = distintivas.filter((p) => texto.includes(p));
    if (palabras.length >= 2) resultado.push({ lugar, palabras });
  }
  return resultado;
}

/* ---------- Verificación ---------- */
/**
 * Verifica y devuelve { errores, avisos } (objetos { hoja, id, regla, texto }). Pura salvo por lo que recibe:
 * { hojas: Map, piezas, comunes, lineaBase|null, ubicaciones: {hechos, aprobables}|null, archivos: [{ruta,texto}]|null, hoy, paraPublicar, soloHojas|null }.
 */
export function verificar({ hojas, piezas, comunes, lineaBase = null, ubicaciones = null, archivos = null, hoy, paraPublicar = false, soloHojas = null }) {
  const errores = [];
  const avisos = [];
  const reales = indexarReales(piezas, comunes);
  const donde = (tipo, slug, id) => {
    const lugar = tipo === "hecho" ? ubicaciones?.hechos.get(id) : ubicaciones?.aprobables.get(`${tipo}:${slug}:${id}`);
    return lugar ? `${lugar.archivo}:${lugar.linea}` : rutaDeHoja(slug);
  };
  const error = (hoja, id, regla, problema, lugar, accion) => errores.push({ hoja, id, regla, texto: `${hoja}/${id}: ${regla} ${problema} → ${lugar}, ${accion}` });
  const aviso = (hoja, id, regla, texto) => avisos.push({ hoja, id, regla, texto: `${hoja}/${id}: ${texto}` });

  // Entradas por clave y hojas por id de hecho.
  const entradasHecho = new Map(); // id → [{ slug, e }]
  const entradasAprob = new Map(); // `tipo:slug:id` → { slug, e }
  for (const [slug, hoja] of hojas) {
    for (const e of hoja.entradas) {
      if (e.tipo === "hecho") entradasHecho.set(e.id, [...(entradasHecho.get(e.id) ?? []), { slug, e }]);
      else entradasAprob.set(`${e.tipo}:${slug}:${e.id}`, { slug, e });
    }
  }
  for (const [slug, hoja] of hojas) for (const m of validarHoja(hoja)) error(slug, "(esquema)", "H0", `la hoja no es válida: ${m}`, rutaDeHoja(slug), "corrige el JSON o corre --validar");

  const fusionOrigen = new Set((lineaBase?.fusiones ?? []).map((f) => f.origen));
  const referenciasActuales = new Map(referenciasDecodificador(piezas.procesador.contenido.decodificador).map((r) => [`${r.campo}|${r.clave}`, r]));

  for (const [slug, hoja] of hojas) {
    for (const e of hoja.entradas) {
      const lugarHoja = rutaDeHoja(slug);
      const d = e.decision;
      // H9 y H8 por entrada
      if (e.huerfana) {
        if (d?.valor !== "quitar") error(slug, e.id, "H9", `es huérfana (su ${e.tipo} ya no está en el código) y su decisión no es «quitar»`, lugarHoja, "restaura el dato en el código o cambia la decisión a «quitar»");
        continue;
      }
      if (d === null) {
        error(slug, e.id, "H8", `no tiene decisión del dueño`, lugarHoja, "decídelo en la hoja o quítalo del código");
        continue;
      }

      if (e.tipo === "hecho") {
        const info = reales.hechos.get(e.id);
        const lugar = donde("hecho", slug, e.id);
        const copias = entradasHecho.get(e.id) ?? [];
        if (copias.length > 1) error(slug, e.id, "H1", `está en ${copias.length} hojas (${copias.map((c) => c.slug).join(", ")})`, lugarHoja, "déjalo en una sola hoja (corre --esqueleto --todas)");

        if (d.valor === "quitar") {
          // H5
          const fusion = fusionOrigen.has(e.id);
          if (info) {
            error(slug, e.id, "H5", `se decidió quitarlo y sigue en el contenido${fusion ? " (fusionado)" : ""}`, lugar, `bórralo junto con la prosa que dependía de él${fusion ? " y mueve lo útil al hecho de destino" : ""}`);
          } else {
            for (const ref of referenciasActuales.values()) {
              const apunta = ref.hechoId === e.id || (ref.hechoIds ?? []).includes(e.id);
              if (apunta && !fusion) error(slug, e.id, "H5", `el decodificador (${ref.campo} ${ref.clave}) todavía apunta a este hecho quitado`, "src/lib/piezas/procesador.datos.ts", "cambia la referencia a otro hecho o quita la fila");
            }
            if (archivos) {
              const { exactas, menciones } = buscarId(e.id, archivos);
              for (const lugarLiteral of exactas) error(slug, e.id, "H5", `queda el literal "${e.id}" en el código`, lugarLiteral, "bórralo");
              if (menciones.length > 0) aviso(slug, e.id, "H5", `lo menciona un texto o nota (${menciones.slice(0, 3).join(", ")}${menciones.length > 3 ? "…" : ""}); revisa que no sea una referencia viva`);
            }
          }
          continue;
        }

        // H1
        if (!info) {
          error(slug, e.id, "H1", `no existe en el contenido (decisión «${d.valor}»)`, lugarHoja, "restaura el hecho o cambia la decisión a «quitar»");
          continue;
        }
        if (info.objetos.size !== 1) {
          error(slug, e.id, "H1", `existe ${info.objetos.size} veces como objetos distintos (${[...info.piezas, ...(info.enComun ? [SLUG_COMUN] : [])].join(", ")})`, lugar, "deja un solo objeto en comun.hechos.ts que las piezas importen");
          continue;
        }
        if (info.piezas.size >= 2 && !info.enComun) error(slug, e.id, "H1", `lo usan ${info.piezas.size} piezas pero no está en comun.hechos.ts`, lugar, "muévelo a comun.hechos.ts");
        const real = [...info.objetos][0];

        // H2
        if (e.textoRevisado === null) error(slug, e.id, "H2", "no tiene textoRevisado", lugarHoja, "corre --congelar (una sola vez)");
        else {
          const esperado = d.valor === "ajustar" ? d.textoFinal : e.textoRevisado;
          if (norm(real.texto) !== norm(esperado)) {
            const pendiente = d.valor === "ajustar" && norm(real.texto) === norm(e.textoRevisado);
            error(slug, e.id, "H2", pendiente ? "el texto sigue siendo el original y la decisión es ajustarlo" : `el texto del código no es ${d.valor === "ajustar" ? "el ajustado" : "el que aprobó el dueño"}`, lugar, pendiente ? "corre --aplicar" : "devuélvelo al texto de la decisión o vuelve a decidir");
          }
        }
        // H3
        if (real.verificadoEn !== d.en || real.verificadoPor !== d.por) {
          error(slug, e.id, "H3", `verificadoEn/verificadoPor son ${real.verificadoEn ?? "null"}/${real.verificadoPor ?? "null"} y la decisión es ${d.en}/${d.por}`, lugar, "corre --aplicar (nunca los escribas a mano)");
        }
        // H4
        if (real.fuentes.length === 0) error(slug, e.id, "H4", "no tiene fuentes", lugar, "corre --aplicar");
        for (const f of real.fuentes) {
          const url = typeof f.url === "string" ? f.url : "";
          if (!url.startsWith("https://")) error(slug, e.id, "H4", `la fuente «${url}» no es https`, lugar, "usa la URL https consultada");
          else if (!esFechaHoja(f.consultadoEn)) error(slug, e.id, "H4", `la fuente ${url} no tiene una consultadoEn válida («${f.consultadoEn}»)`, lugar, "corre --aplicar");
          else if (f.consultadoEn > hoy) error(slug, e.id, "H4", `la fuente ${url} tiene consultadoEn en el futuro (${f.consultadoEn})`, lugar, "corrige la fecha");
          else {
            const enHoja = e.fuentesConsultadas.find((c) => c.url === url && c.consultadoEn === f.consultadoEn);
            if (!enHoja) error(slug, e.id, "H4", `la fuente ${url} (${f.consultadoEn}) no figura entre las consultadas de la hoja`, lugar, "corre --aplicar o agrégala a la hoja si de verdad se consultó");
          }
        }
        if (paraPublicar && !real.fuentes.some((f) => e.fuentesConsultadas.some((c) => c.url === f.url && c.consultadoEn === f.consultadoEn && c.tipo === "primaria"))) {
          error(slug, e.id, "H4", "no tiene ninguna fuente primaria (--para-publicar)", lugar, "agrega y consulta una fuente primaria o quita el hecho");
        }
        // Avisos
        if (real.revisarCadaMeses === undefined) aviso(slug, e.id, "A4", "sin revisarCadaMeses (se revisará cada 12 meses por defecto)");
        if (d.valor === "ajustar" && d.nota && SIN_FUENTE_DEL_TALLER.test(d.nota) && MENCIONA_TALLER.test(d.nota)) aviso(slug, e.id, "A3", "el ajuste mete experiencia del taller sin fuente (según su nota); confirma que el texto lo dice como criterio y no como dato");
        // H6
        const fusion = (lineaBase?.fusiones ?? []).filter((f) => f.destino === e.id);
        for (const f of fusion) {
          const origen = entradasHecho.get(f.origen)?.[0]?.e;
          if (!origen || origen.decision?.valor !== "quitar") error(slug, e.id, "H6", `la fusión ${f.origen} → ${e.id} exige que el origen esté decidido como «quitar»`, rutaDeHoja(f.hojaOrigen), "corrige la hoja del origen");
        }
      } else {
        // caso o criterio
        const clave = e.tipo === "caso" ? reales.casos.get(`${slug}:${e.id}`) : reales.criterios.get(`${slug}:${e.id}`);
        const lugar = donde(e.tipo, slug, e.id);
        if (d.valor === "quitar") {
          if (clave) error(slug, e.id, "H7", `se decidió quitar este ${e.tipo} y sigue en el contenido`, lugar, "bórralo");
          continue;
        }
        if (!clave) {
          error(slug, e.id, "H7", `el ${e.tipo} no existe en el contenido (decisión «${d.valor}»)`, rutaDeHoja(slug), "restáuralo o cambia la decisión a «quitar»");
          continue;
        }
        if (clave.aprobadoEn !== d.en || clave.aprobadoPor !== d.por) {
          error(slug, e.id, "H7", `aprobadoEn/aprobadoPor son ${clave.aprobadoEn ?? "null"}/${clave.aprobadoPor ?? "null"} y la decisión es ${d.en}/${d.por}`, lugar, "corre --aplicar (nunca los escribas a mano)");
        }
        if (e.textoRevisado === null) error(slug, e.id, "H7", "no tiene textoRevisado", rutaDeHoja(slug), "corre --congelar (una sola vez)");
        else if (norm(clave.texto) !== norm(e.textoRevisado)) error(slug, e.id, "H7", `el texto cambió después de aprobarlo`, lugar, "devuélvelo al texto aprobado o vuelve a decidir");
        if (e.tipo === "caso") {
          if (e.casoTipo === "vivido" && clave.confirmadoPorDueno !== true) error(slug, e.id, "H7", "es «Nos ha pasado» y no está confirmado por el dueño (confirmadoPorDueno)", lugar, "corre --aplicar");
          if (e.casoTipo === "puede-pasar" && clave.confirmadoPorDueno === true) error(slug, e.id, "H7", "es «Puede pasar» y aparece confirmado como vivido", lugar, "quita confirmadoPorDueno");
          if (clave.tipo !== e.casoTipo) error(slug, e.id, "H7", `el tipo del caso en el código (${clave.tipo}) no es el de la hoja (${e.casoTipo})`, lugar, "alinea el tipo");
        }
      }
      if (d.nota && PENDIENTE_EN_NOTA.test(d.nota)) aviso(slug, e.id, "A1", `la nota menciona algo pendiente: «${linea(d.nota).slice(0, 140)}»`);
    }
  }

  // H8: completitud del lado del código
  const tieneAprobado = new Set(); // ids de hecho con decisión aprobar/ajustar
  for (const [id, copias] of entradasHecho) if (copias.some(({ e }) => e.decision && e.decision.valor !== "quitar")) tieneAprobado.add(id);
  for (const [id, info] of reales.hechos) {
    const owner = hojaDeDato(info);
    const lugar = donde("hecho", owner, id);
    const copias = entradasHecho.get(id);
    if (!copias || copias.every(({ e }) => e.huerfana)) {
      error(owner, id, "H8", "es un hecho del contenido sin entrada en ninguna hoja", lugar, "corre --esqueleto --todas y decídelo");
      continue;
    }
    const verificado = [...info.objetos].some((h) => h.verificadoEn !== null || h.verificadoPor !== null);
    if (verificado && !tieneAprobado.has(id)) error(owner, id, "H8", "está verificado en el código sin una decisión aprobar/ajustar en las hojas", lugar, "regístrala en la hoja o déjalo sin verificar");
  }
  for (const [mapa, tipo] of [[reales.casos, "caso"], [reales.criterios, "criterio"]]) {
    for (const [clave, objeto] of mapa) {
      const [slug, ...resto] = clave.split(":");
      const id = resto.join(":");
      const entrada = entradasAprob.get(`${tipo}:${slug}:${id}`);
      const lugar = donde(tipo, slug, id);
      if (!entrada || entrada.e.huerfana) error(slug, id, "H8", `es un ${tipo} del contenido sin entrada en la hoja`, lugar, "corre --esqueleto --todas y decídelo");
      else if (objeto.aprobadoEn && !(entrada.e.decision && entrada.e.decision.valor !== "quitar")) error(slug, id, "H8", `está aprobado en el código sin una decisión aprobar en la hoja`, lugar, "regístrala en la hoja o quita la aprobación");
    }
  }

  // H6: referencias del decodificador
  for (const f of lineaBase?.fusiones ?? []) {
    const destino = entradasHecho.get(f.destino)?.[0]?.e;
    if (!destino || !destino.decision || destino.decision.valor === "quitar") error(f.hojaDestino, f.destino, "H6", `es el destino de la fusión desde ${f.origen} y no está aprobado/ajustado`, rutaDeHoja(f.hojaDestino), "apruébalo o cambia la fusión");
    else if (!reales.hechos.has(f.destino)) error(f.hojaDestino, f.destino, "H6", `es el destino de la fusión desde ${f.origen} y no existe en el contenido`, rutaDeHoja(f.hojaDestino), "restáuralo");
  }
  for (const ref of lineaBase?.referencias ?? []) {
    const ids = ref.hechoId !== undefined ? [ref.hechoId] : ref.hechoIds;
    const fusionadas = ids.map((id) => (lineaBase.fusiones.find((f) => f.origen === id) ?? { destino: id }).destino);
    if (fusionadas.every((id, i) => id === ids[i])) continue;
    const actual = referenciasActuales.get(`${ref.campo}|${ref.clave}`);
    const hoja = lineaBase.fusiones.find((f) => ids.includes(f.origen))?.hojaOrigen ?? "procesador";
    const id = ids.find((x) => fusionadas[ids.indexOf(x)] !== x) ?? ids[0];
    if (!actual) {
      error(hoja, id, "H6", `la referencia ${ref.campo} «${ref.clave}» del decodificador ya no existe`, "src/lib/piezas/procesador.datos.ts", "restaura la fila o confirma que se quitó a propósito (actualiza la línea base)");
      continue;
    }
    const ahora = actual.hechoId !== undefined ? [actual.hechoId] : actual.hechoIds;
    const bien = ids.every((origen, i) => (fusionadas[i] === origen ? ahora.includes(origen) : ahora.includes(fusionadas[i]) && !ahora.includes(origen)));
    if (!bien) error(hoja, id, "H6", `la referencia ${ref.campo} «${ref.clave}» del decodificador apunta a ${ahora.join(", ")} y, tras la fusión, debe apuntar a ${fusionadas.join(", ")}`, "src/lib/piezas/procesador.datos.ts", "cambia el hechoId/hechoIds al destino de la fusión");
  }

  // Avisos: palabras clave de hechos quitados que siguen en la prosa de su pieza.
  for (const [slug, hoja] of hojas) {
    for (const e of hoja.entradas) {
      if (e.tipo !== "hecho" || e.decision?.valor !== "quitar") continue;
      const claves = palabrasClave(e.textoRevisado ?? e.textoPublicado);
      if (claves.length < 2) continue;
      const piezasDelHecho = e.usadoPor.length > 0 ? e.usadoPor : PIEZA_SLUGS.includes(slug) ? [slug] : [];
      for (const pieza of piezasDelHecho) {
        for (const { lugar, palabras } of prosaConClaves(claves, prosaDe(piezas[pieza].contenido))) {
          aviso(slug, e.id, "A2", `su prosa sigue en ${pieza} › ${lugar} (coincide con: ${palabras.slice(0, 4).join(", ")}); revisa si dependía del hecho quitado`);
        }
      }
    }
  }

  const filtrar = (lista) => (soloHojas ? lista.filter((x) => soloHojas.includes(x.hoja)) : lista);
  return { errores: filtrar(errores), avisos: filtrar(avisos) };
}

/** Carga todo desde disco y verifica. `soloHojas`: slugs o null (todas). */
export function verificarContraDisco({ soloHojas = null, hoy = fechaDeHoy(), paraPublicar = false, dir = DIR_VERIFICACION, raiz = RAIZ_REPO } = {}) {
  const hojas = leerHojas(dir);
  const textos = new Map(ARCHIVOS_ESCRIBIBLES.map((ruta) => [ruta, readFileSync(join(raiz, ruta), "utf8")]));
  let lineaBase = null;
  try {
    lineaBase = JSON.parse(readFileSync(join(dir, ARCHIVO_LINEA_BASE), "utf8"));
  } catch {
    lineaBase = null;
  }
  const resultado = verificar({ hojas, piezas: PIEZAS, comunes: HECHOS_COMUNES, lineaBase, ubicaciones: ubicarEnCodigo(textos), archivos: leerArchivosParaLiterales(raiz), hoy, paraPublicar, soloHojas });
  return { ...resultado, hojas, lineaBase };
}

function conteoPor(lista, campo) {
  const cuenta = new Map();
  for (const x of lista) cuenta.set(x[campo], (cuenta.get(x[campo]) ?? 0) + 1);
  return cuenta;
}

/** CLI: `--verificar [<hoja>|--todas] [--para-publicar] [--hoy=AAAA-MM-DD]`. Pone process.exitCode = 1 si hay errores. */
export function cmdVerificar(argumentos, dir = DIR_VERIFICACION) {
  const paraPublicar = argumentos.includes("--para-publicar");
  const opcionHoy = argumentos.find((a) => a.startsWith("--hoy="));
  const hoy = opcionHoy ? opcionHoy.slice("--hoy=".length) : fechaDeHoy();
  if (!esFechaHoja(hoy)) throw new Error(`--hoy debe ser AAAA-MM-DD, no «${hoy}»`);
  const pedidas = argumentos.filter((a) => !a.startsWith("--"));
  for (const slug of pedidas) if (!SLUGS_HOJA.includes(slug)) throw new Error(`hoja desconocida: «${slug}». Opciones: ${SLUGS_HOJA.join(", ")} o --todas`);
  const soloHojas = pedidas.length > 0 ? pedidas : null;
  const { errores, avisos, lineaBase } = verificarContraDisco({ soloHojas, hoy, paraPublicar, dir });
  if (lineaBase === null) console.log(`AVISO: no hay ${ARCHIVO_LINEA_BASE} (corre --congelar una vez); H6 no se puede comprobar`);
  for (const e of errores) console.log(`ERROR ${e.texto}`);
  for (const a of avisos) console.log(`AVISO ${a.texto}`);
  const destino = soloHojas ?? SLUGS_HOJA;
  const porHoja = conteoPor(errores, "hoja");
  const porRegla = [...conteoPor(errores, "regla")].sort().map(([r, n]) => `${r}:${n}`).join(" ");
  console.log(`\nResumen (${paraPublicar ? "para publicar, " : ""}hoy ${hoy}): ${errores.length} errores, ${avisos.length} avisos.`);
  console.log(`  por hoja: ${destino.map((s) => `${s} ${porHoja.get(s) ?? 0}`).join(" · ")}`);
  if (errores.length > 0) console.log(`  por regla: ${porRegla}`);
  if (errores.length > 0) process.exitCode = 1;
}
