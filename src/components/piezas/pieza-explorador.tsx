"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Explorador de una pieza (docs/piezas-plan.md §5.2 a §5.6 y docs/piezas-plan-2.md §2.3): dibujo con marcadores numerados + panel, con una o varias vistas.
// Estado: la selección (vista + parte). La parte elegida se conserva al cambiar de vista; si no existe en la nueva, se anuncia y se limpia.
// Sin JS todo sigue siendo navegable: marcadores, anterior/siguiente y chips son enlaces (a las secciones de la lista y a las figuras de `#vistas`).
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import {
  anchorPct,
  cambiarVista,
  elegirParte,
  focusTransform,
  hrefDeVista,
  indicePartesPorVista,
  nearestPart,
  seleccionDesdeHash,
  seleccionInicial,
  stepPart,
} from "@/lib/piezas/hotspots";
import type { SeleccionExplorador } from "@/lib/piezas/hotspots";
import type { ParteGeo, ParteResumen, PiezaExploradorProps, Pt, VistaExplorador } from "@/lib/piezas/types";

const MARCADOR_PX = 24;
const OBJETIVO_BOTON_PX = 44;
/** Radio de captura del toque sobre el dibujo, en px CSS (se convierte a px del viewBox según el ancho real de la figura). */
const RADIO_TOQUE_PX = 44;
/** Espera antes de precargar las demás vistas, para no competir con la primera imagen. */
const ESPERA_PRECARGA_MS = 1200;
const ANCHO_MOVIL_PX = 767;

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda";
const TRANSICION = "transition-[transform,background-color,color] duration-150 motion-reduce:transition-none";

const SIN_ZOOM = { scale: 1, tx: 0, ty: 0 };
const TRANSICION_MARCADOR = "transition-[transform,background-color,color,left,top] duration-300 ease-out motion-reduce:transition-none";
const TRANSICION_ZOOM = "transition-transform duration-300 ease-out motion-reduce:transition-none";

const dosCifras = (n: number): string => String(n).padStart(2, "0");
const puntos = (contorno: readonly Pt[]): string => contorno.map(([x, y]) => `${x},${y}`).join(" ");
const tieneClave = (objeto: object, clave: string): boolean => Object.prototype.hasOwnProperty.call(objeto, clave);

/** Clic normal (sin teclas modificadoras): solo ahí se intercepta el enlace; con Ctrl/Cmd/Mayús se deja al navegador. */
function esClicSimple(e: MouseEvent<HTMLElement>): boolean {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

function reemplazarHash(hash: string): void {
  try {
    window.history.replaceState(null, "", hash);
  } catch {
    // replaceState puede lanzar en contextos restringidos (iframes en sandbox); la selección ya cambió, solo no se actualiza la URL.
  }
}

/** Baja a la caché las imágenes de las otras vistas (la versión que usaría este dispositivo) para que el cambio sea instantáneo. */
function precargarOtrasVistas(vistas: readonly VistaExplorador[], activa: string): () => void {
  const esMovil = typeof window.matchMedia === "function" && window.matchMedia(`(max-width: ${ANCHO_MOVIL_PX}px)`).matches;
  const temporizador = window.setTimeout(() => {
    for (const v of vistas) {
      if (v.id === activa) continue;
      const img = new Image();
      img.src = esMovil ? v.geo.imagen.hrefSm : v.geo.imagen.href;
    }
  }, ESPERA_PRECARGA_MS);
  return () => window.clearTimeout(temporizador);
}

export function PiezaExplorador({ slug, vistas, partes, selectorTitulo }: PiezaExploradorProps) {
  const [sel, setSel] = useState<SeleccionExplorador>(() => seleccionInicial(vistas[0]?.id ?? ""));
  const [vistaCambiada, setVistaCambiada] = useState(false);
  // La parte elegida se amplía hacia su `foco`; el botón "Ver todo el dibujo" lo apaga hasta la próxima selección.
  const [ampliado, setAmpliado] = useState(true);

  const porId = useMemo(() => new Map<string, ParteResumen>(partes.map((p) => [p.id, p])), [partes]);
  const indice = useMemo(() => indicePartesPorVista(vistas, partes), [vistas, partes]);
  const todosIds = useMemo(() => [...partes].sort((a, b) => a.orden - b.orden).map((p) => p.id), [partes]);

  const vista: VistaExplorador | undefined = vistas.find((v) => v.id === sel.vista) ?? vistas[0];
  const ids = useMemo<readonly string[]>(() => (vista ? (indice.get(vista.id) ?? []) : []), [indice, vista]);
  const ordenadas = useMemo(() => ids.flatMap((id) => porId.get(id) ?? []), [ids, porId]);
  const total = ordenadas.length;
  const indiceParte = sel.parte === null ? -1 : ids.indexOf(sel.parte);
  const parte = indiceParte >= 0 ? ordenadas[indiceParte] : null;
  const parteAusente = sel.ausente === null ? null : (porId.get(sel.ausente) ?? null);

  const irAVista = useCallback(
    (id: string) => {
      setSel((prev) => cambiarVista(prev, id, indice));
      setVistaCambiada(true);
      setAmpliado(true);
      reemplazarHash(hrefDeVista(id));
    },
    [indice],
  );

  const elegir = useCallback(
    (id: string) => {
      setSel((prev) => elegirParte(prev, id, indice));
      setVistaCambiada(false);
      setAmpliado(true);
      reemplazarHash(`#${id}`);
    },
    [indice],
  );

  // Enlace profundo (#parte y #vista-<id>): al montar y en hashchange. Un hash que no es ninguno (#lista, #fuentes…) no borra la elección.
  useEffect(() => {
    const leer = (anunciar: boolean) => {
      const hash = window.location.hash;
      setSel((prev) => seleccionDesdeHash(hash, prev, indice, todosIds) ?? prev);
      if (anunciar) setVistaCambiada(hash.startsWith(hrefDeVista("")));
    };
    leer(false);
    const alCambiarHash = () => leer(true);
    window.addEventListener("hashchange", alCambiarHash);
    return () => window.removeEventListener("hashchange", alCambiarHash);
  }, [indice, todosIds]);

  const idVistaActiva = vista?.id ?? "";
  useEffect(() => (vistas.length > 1 ? precargarOtrasVistas(vistas, idVistaActiva) : undefined), [vistas, idVistaActiva]);

  if (!vista) return null;

  const multi = vistas.length > 1;
  const geo = vista.geo;
  const imagen = geo.imagen;

  const alClicEnlace = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!esClicSimple(e)) return;
    e.preventDefault();
    elegir(id);
  };

  const alClicVista = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!esClicSimple(e)) return;
    e.preventDefault();
    irAVista(id);
  };

  const alTocarDibujo = (e: MouseEvent<HTMLDivElement>) => {
    const caja = e.currentTarget.getBoundingClientRect();
    if (caja.width <= 0 || caja.height <= 0) return;
    // Con ampliación, el punto tocado se devuelve a coordenadas del dibujo completo.
    const x = (((e.clientX - caja.left) / caja.width) * geo.w - zoom.tx) / zoom.scale;
    const y = (((e.clientY - caja.top) / caja.height) * geo.h - zoom.ty) / zoom.scale;
    const maxDist = (RADIO_TOQUE_PX * (geo.w / caja.width)) / zoom.scale;
    const id = nearestPart(geo, ids, x, y, maxDist);
    if (id) elegir(id);
  };

  const anterior = stepPart(ids, sel.parte, -1);
  const siguiente = stepPart(ids, sel.parte, 1);
  const geoElegida: ParteGeo | null = parte !== null && tieneClave(geo.partes, parte.id) ? (geo.partes[parte.id] ?? null) : null;
  const zoom = ampliado && geoElegida ? focusTransform(geoElegida.foco, geo.w, geo.h) : SIN_ZOOM;
  const hayZoom = zoom.scale > 1;
  const etiquetaPanel = `pieza-${slug}-panel`;
  const nota = (id: string): string | undefined => (tieneClave(vista.notas, id) ? vista.notas[id] : undefined);
  const notaParte = parte ? nota(parte.id) : undefined;

  const anuncio = parteAusente
    ? `${vistaCambiada ? `Vista ${vista.etiqueta}. ` : ""}${parteAusente.nombre}: esa parte no existe en esta vista.`
    : parte
      ? `${vistaCambiada ? `Vista ${vista.etiqueta}. ` : ""}${parte.nombre}, parte ${indiceParte + 1} de ${total}`
      : vistaCambiada
        ? `Vista ${vista.etiqueta}`
        : "";

  return (
    <div>
      <a
        href="#lista"
        className="sr-only focus:not-sr-only focus:mb-3 focus:inline-block focus:border focus:border-panda focus:bg-vanilla focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-panda print:hidden"
      >
        Saltar a la lista de partes
      </a>

      {multi ? (
        <div role="group" aria-label={selectorTitulo ?? "Elige la versión"} className="mb-4 flex flex-wrap gap-2 print:hidden">
          {vistas.map((v) => {
            const activa = v.id === vista.id;
            return (
              <a
                key={v.id}
                href={hrefDeVista(v.id)}
                onClick={alClicVista(v.id)}
                aria-current={activa ? "true" : undefined}
                className={`${TRANSICION} ${FOCO} inline-flex items-center justify-center border px-3 font-mono text-xs no-underline ${
                  activa ? "border-accent bg-accent text-accent-ink" : "border-panda bg-vanilla text-panda hover:border-accent"
                }`}
                style={{ minHeight: OBJETIVO_BOTON_PX, minWidth: OBJETIVO_BOTON_PX }}
              >
                {v.etiqueta}
              </a>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <figure className={multi ? "m-0 lg:col-span-7 print:hidden" : "m-0 lg:col-span-7"}>
          <div className="relative bg-vanilla" style={{ aspectRatio: `${geo.w} / ${geo.h}` }}>
            <div className="absolute inset-0 overflow-hidden">
            <div
              className={TRANSICION_ZOOM}
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "0 0",
                transform: hayZoom ? `translate(${(zoom.tx / geo.w) * 100}%, ${(zoom.ty / geo.h) * 100}%) scale(${zoom.scale})` : "none",
              }}
            >
            <picture>
              <source media="(max-width: 767px)" srcSet={imagen.hrefSm} width={imagen.anchoSm} height={imagen.altoSm} />
              {/* eslint-disable-next-line @next/next/no-img-element -- WebP ya optimizado por BWReel; <picture> sirve la versión móvil sin JS */}
              <img
                src={imagen.href}
                width={imagen.ancho}
                height={imagen.alto}
                alt={vista.etiquetaFigura}
                fetchPriority="high"
                decoding={vistaCambiada ? "sync" : "async"}
                className="piece-ink block h-auto w-full"
              />
            </picture>

            <svg
              viewBox={`0 0 ${geo.w} ${geo.h}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
              className="pointer-events-none absolute inset-0 h-full w-full text-accent"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
              {geoElegida?.contornos.map((contorno, i) =>
                contorno.length >= 3 ? (
                  <polygon
                    key={i}
                    points={puntos(contorno)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null,
              )}
            </svg>
            </div>
            </div>

            {/* Zona táctil: todo el dibujo elige la parte más cercana. Es solo comodidad para puntero/toque (aria-hidden): el teclado usa los marcadores. */}
            <div aria-hidden="true" onClick={alTocarDibujo} className="cursor-pointer print:hidden" style={{ position: "absolute", inset: 0 }} />

            {ordenadas.map((p) => {
              const base = anchorPct(geo, p.id);
              if (!base) return null;
              // Con ampliación el marcador va por fuera de la capa ampliada (conserva su tamaño) y se oculta si queda fuera del cuadro.
              const pos = hayZoom ? { left: base.left * zoom.scale + (zoom.tx / geo.w) * 100, top: base.top * zoom.scale + (zoom.ty / geo.h) * 100 } : base;
              if (pos.left < -2 || pos.left > 102 || pos.top < -2 || pos.top > 102) return null;
              const activa = p.id === sel.parte;
              return (
                <a
                  key={p.id}
                  href={`#${p.id}`}
                  onClick={alClicEnlace(p.id)}
                  aria-label={`${p.orden}. ${p.nombre}`}
                  aria-current={activa ? "true" : undefined}
                  className={`${TRANSICION_MARCADOR} ${FOCO} font-mono text-xs leading-none no-underline ${
                    activa ? "border-accent bg-accent text-accent-ink" : "border-panda bg-vanilla text-panda"
                  }`}
                  style={{
                    position: "absolute",
                    left: `${pos.left}%`,
                    top: `${pos.top}%`,
                    transform: activa ? "translate(-50%, -50%) rotate(45deg)" : "translate(-50%, -50%)",
                    width: MARCADOR_PX,
                    height: MARCADOR_PX,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    borderRadius: 2,
                    zIndex: 1,
                  }}
                >
                  <span className={TRANSICION} style={{ display: "block", transform: activa ? "rotate(-45deg)" : "none" }}>
                    {p.orden}
                  </span>
                </a>
              );
            })}
          </div>
          {hayZoom ? (
            <button
              type="button"
              onClick={() => setAmpliado(false)}
              className={`${FOCO} mt-2 inline-flex items-center border border-panda bg-vanilla px-3 font-mono text-xs text-panda print:hidden`}
              style={{ minHeight: OBJETIVO_BOTON_PX }}
            >
              Ver todo el dibujo
            </button>
          ) : null}
          <figcaption className="mt-2 text-xs text-component">{vista.etiquetaFigura}</figcaption>
        </figure>

        <section
          aria-labelledby={etiquetaPanel}
          className="border border-hairline bg-vanilla p-4 lg:sticky lg:top-20 lg:col-span-5 lg:p-6 print:hidden"
          style={{ minHeight: "12rem" }}
        >
          <div className="flex items-center justify-between gap-2">
            <a
              href={`#${anterior}`}
              onClick={alClicEnlace(anterior)}
              className={`${FOCO} inline-flex items-center text-sm font-medium text-panda`}
              style={{ minHeight: OBJETIVO_BOTON_PX, minWidth: OBJETIVO_BOTON_PX }}
            >
              <span aria-hidden="true">←&nbsp;</span>Anterior
            </a>
            <span className="font-mono text-sm text-component" aria-hidden="true">
              {indiceParte >= 0 ? dosCifras(indiceParte + 1) : "--"} / {dosCifras(total)}
            </span>
            <a
              href={`#${siguiente}`}
              onClick={alClicEnlace(siguiente)}
              className={`${FOCO} inline-flex items-center justify-end text-sm font-medium text-panda`}
              style={{ minHeight: OBJETIVO_BOTON_PX, minWidth: OBJETIVO_BOTON_PX }}
            >
              Siguiente<span aria-hidden="true">&nbsp;→</span>
            </a>
          </div>

          {parte ? (
            <>
              <p id={etiquetaPanel} className="mt-3 text-lg font-semibold leading-snug text-panda">
                {parte.nombre}
              </p>
              <p className="mt-2 text-base text-panda">{parte.resumen}</p>
              {notaParte ? <p className="mt-2 text-sm text-component">{notaParte}</p> : null}
              {parte.chips && parte.chips.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-panda">
                  {parte.chips.map((chip) => (
                    <li key={chip} className="border border-hairline px-2 py-1">
                      {chip}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-4">
                <a href={`#${parte.id}`} className={`${FOCO} text-sm font-medium text-panda underline underline-offset-4`}>
                  Leer todo sobre {parte.nombreCorto} <span aria-hidden="true">↓</span>
                </a>
              </p>
            </>
          ) : parteAusente ? (
            <>
              <p id={etiquetaPanel} className="mt-3 text-lg font-semibold leading-snug text-panda">
                {parteAusente.nombre}: no está en esta versión
              </p>
              <p className="mt-2 text-base text-panda">{nota(parteAusente.id) ?? `Esta parte no existe en la vista ${vista.etiqueta}.`}</p>
              <p className="mt-4">
                <a href={`#${parteAusente.id}`} className={`${FOCO} text-sm font-medium text-panda underline underline-offset-4`}>
                  Leer todo sobre {parteAusente.nombreCorto} <span aria-hidden="true">↓</span>
                </a>
              </p>
            </>
          ) : (
            <>
              <p id={etiquetaPanel} className="mt-3 text-base font-semibold text-panda">
                Toca un número para ir a esa parte
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {ordenadas.map((p) => (
                  <li key={p.id}>
                    <a
                      href={`#${p.id}`}
                      onClick={alClicEnlace(p.id)}
                      aria-label={`${p.orden}. ${p.nombre}`}
                      className={`${FOCO} inline-flex h-8 min-w-8 items-center justify-center border border-hairline px-1 font-mono text-xs text-panda hover:border-panda`}
                    >
                      {p.orden}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="sr-only" aria-live="polite">
            {anuncio}
          </p>
        </section>
      </div>
    </div>
  );
}
