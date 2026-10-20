/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Vistas de una pieza, una por una (docs/piezas-plan-2.md §2.3): figura estática, resumen, diferencias por parte y criterios de B & W.
// Es el respaldo sin JS del selector del explorador (los chips saltan a `#vista-<id>`) y lo que se imprime. Componente de servidor.
import { PiezaCriterios } from "@/components/piezas/pieza-criterios";
import type { PiezaContenido, PiezaGeo } from "@/lib/piezas/types";

const SCROLL_BAJO_ENCABEZADO = { scrollMarginTop: "5rem" } as const; // el encabezado fijo mide 64 px

interface PiezaVistasProps {
  contenido: PiezaContenido<string, string>;
  geo: PiezaGeo<string, string> | null;
}

export function PiezaVistas({ contenido, geo }: PiezaVistasProps) {
  return (
    <div className="mt-8 space-y-10">
      {contenido.vistas.map((vista) => {
        const dibujo = geo && Object.prototype.hasOwnProperty.call(geo.vistas, vista.id) ? geo.vistas[vista.id] : null;
        const diferencias = Object.entries(vista.notasPorParte ?? {}).flatMap(([parteId, nota]) => {
          const parte = Object.prototype.hasOwnProperty.call(contenido.partes, parteId) ? contenido.partes[parteId] : undefined;
          return parte && nota ? [{ parteId, nombre: parte.nombreCorto, nota }] : [];
        });
        return (
          <article key={vista.id} id={`vista-${vista.id}`} aria-labelledby={`vista-${vista.id}-titulo`} style={SCROLL_BAJO_ENCABEZADO}>
            <h3 id={`vista-${vista.id}-titulo`} className="text-xl font-semibold text-panda">
              {vista.etiqueta}
            </h3>
            <p className="mt-3 max-w-prose text-base text-panda">{vista.resumen}</p>
            {dibujo ? (
              <figure className="m-0 mt-4 max-w-3xl">
                <div className="bg-vanilla" style={{ aspectRatio: `${dibujo.w} / ${dibujo.h}` }}>
                  <picture>
                    <source media="(max-width: 767px)" srcSet={dibujo.imagen.hrefSm} width={dibujo.imagen.anchoSm} height={dibujo.imagen.altoSm} />
                    {/* eslint-disable-next-line @next/next/no-img-element -- WebP ya optimizado por BWReel; <picture> sirve la versión móvil sin JS */}
                    <img
                      src={dibujo.imagen.href}
                      width={dibujo.imagen.ancho}
                      height={dibujo.imagen.alto}
                      alt={vista.etiquetaFigura}
                      loading="lazy"
                      decoding="async"
                      className="piece-ink block h-auto w-full"
                    />
                  </picture>
                </div>
              </figure>
            ) : null}
            {diferencias.length > 0 ? (
              <ul className="mt-4 max-w-prose list-disc space-y-1 pl-5 text-base text-panda marker:text-component">
                {diferencias.map((d) => (
                  <li key={d.parteId}>
                    <span className="font-medium">{d.nombre}:</span> {d.nota}
                  </li>
                ))}
              </ul>
            ) : null}
            <PiezaCriterios aFavor={vista.aFavor} aConsiderar={vista.aConsiderar} nivel={4} />
          </article>
        );
      })}
    </div>
  );
}
