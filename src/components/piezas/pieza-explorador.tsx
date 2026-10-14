"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-11
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Explorador de una pieza (docs/piezas-plan.md §5.2 a §5.6): dibujo con marcadores numerados + panel. Único estado: la parte elegida.
// Sin JS todo sigue siendo navegable: los marcadores, anterior/siguiente y los chips son enlaces a las secciones de la lista.
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { anchorPct, nearestPart, partFromHash, stepPart } from "@/lib/piezas/hotspots";
import type { ParteGeo, ParteResumen, PiezaExploradorProps, Pt } from "@/lib/piezas/types";

const MARCADOR_PX = 24;
const OBJETIVO_BOTON_PX = 44;
/** Radio de captura del toque sobre el dibujo, en px CSS (se convierte a px del viewBox según el ancho real de la figura). */
const RADIO_TOQUE_PX = 44;

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda";
const TRANSICION = "transition-[transform,background-color,color] duration-150 motion-reduce:transition-none";

const dosCifras = (n: number): string => String(n).padStart(2, "0");
const puntos = (contorno: readonly Pt[]): string => contorno.map(([x, y]) => `${x},${y}`).join(" ");

/** Clic normal (sin teclas modificadoras): solo ahí se intercepta el enlace; con Ctrl/Cmd/Mayús se deja al navegador. */
function esClicSimple(e: MouseEvent<HTMLElement>): boolean {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

export function PiezaExplorador({ slug, vista, partes, etiquetaFigura }: PiezaExploradorProps) {
  const [elegida, setElegida] = useState<string | null>(null);

  const ordenadas = useMemo<readonly ParteResumen[]>(() => [...partes].sort((a, b) => a.orden - b.orden), [partes]);
  const ids = useMemo(() => ordenadas.map((p) => p.id), [ordenadas]);
  const total = ordenadas.length;
  const indice = elegida === null ? -1 : ids.indexOf(elegida);
  const parte = indice >= 0 ? ordenadas[indice] : null;

  const elegir = useCallback((id: string) => {
    setElegida(id);
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      // replaceState puede lanzar en contextos restringidos (iframes en sandbox); la parte ya quedó elegida, solo no se actualiza la URL.
    }
  }, []);

  // Enlace profundo: al montar y en hashchange. Un hash que no es una parte (#lista, #fuentes…) no borra la elección.
  useEffect(() => {
    const leer = () => {
      const id = partFromHash(window.location.hash, ids);
      if (id) setElegida(id);
    };
    leer();
    window.addEventListener("hashchange", leer);
    return () => window.removeEventListener("hashchange", leer);
  }, [ids]);

  const alClicEnlace = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!esClicSimple(e)) return;
    e.preventDefault();
    elegir(id);
  };

  const alTocarDibujo = (e: MouseEvent<HTMLDivElement>) => {
    const caja = e.currentTarget.getBoundingClientRect();
    if (caja.width <= 0 || caja.height <= 0) return;
    const x = ((e.clientX - caja.left) / caja.width) * vista.w;
    const y = ((e.clientY - caja.top) / caja.height) * vista.h;
    const maxDist = RADIO_TOQUE_PX * (vista.w / caja.width);
    const id = nearestPart(vista, ids, x, y, maxDist);
    if (id) elegir(id);
  };

  const anterior = stepPart(ids, elegida, -1);
  const siguiente = stepPart(ids, elegida, 1);
  const geoElegida: ParteGeo | null = elegida !== null && Object.prototype.hasOwnProperty.call(vista.partes, elegida) ? (vista.partes[elegida] ?? null) : null;
  const etiquetaPanel = `pieza-${slug}-panel`;
  const imagen = vista.imagen;

  return (
    <div>
      <a
        href="#lista"
        className="sr-only focus:not-sr-only focus:mb-3 focus:inline-block focus:border focus:border-panda focus:bg-vanilla focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-panda print:hidden"
      >
        Saltar a la lista de partes
      </a>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <figure className="m-0 lg:col-span-7">
          <div className="relative bg-vanilla" style={{ aspectRatio: `${vista.w} / ${vista.h}` }}>
            <picture>
              <source media="(max-width: 767px)" srcSet={imagen.hrefSm} width={imagen.anchoSm} height={imagen.altoSm} />
              {/* eslint-disable-next-line @next/next/no-img-element -- WebP ya optimizado por BWReel; <picture> sirve la versión móvil sin JS */}
              <img
                src={imagen.href}
                width={imagen.ancho}
                height={imagen.alto}
                alt={etiquetaFigura}
                fetchPriority="high"
                decoding="async"
                className="piece-ink block h-auto w-full"
              />
            </picture>

            <svg
              viewBox={`0 0 ${vista.w} ${vista.h}`}
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

            {/* Zona táctil: todo el dibujo elige la parte más cercana. Es solo comodidad para puntero/toque (aria-hidden): el teclado usa los marcadores. */}
            <div
              aria-hidden="true"
              onClick={alTocarDibujo}
              className="cursor-pointer print:hidden"
              style={{ position: "absolute", inset: 0 }}
            />

            {ordenadas.map((p) => {
              const pos = anchorPct(vista, p.id);
              if (!pos) return null;
              const activa = p.id === elegida;
              return (
                <a
                  key={p.id}
                  href={`#${p.id}`}
                  onClick={alClicEnlace(p.id)}
                  aria-label={`${p.orden}. ${p.nombre}`}
                  aria-current={activa ? "true" : undefined}
                  className={`${TRANSICION} ${FOCO} font-mono text-xs leading-none no-underline ${
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
          <figcaption className="mt-2 text-xs text-component">{etiquetaFigura}</figcaption>
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
              {indice >= 0 ? dosCifras(indice + 1) : "--"} / {dosCifras(total)}
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
            {parte ? `${parte.nombre}, parte ${indice + 1} de ${total}` : ""}
          </p>
        </section>
      </div>
    </div>
  );
}
