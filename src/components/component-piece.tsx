"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-01
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import type { Ref } from "react";
import type { StageView } from "@/lib/component-stage";

/*
 * Dibujo (SVG) de UNA vista (variante) de una pieza del escenario "Componentes en escena" (ver `component-showcase.tsx`).
 * Solo pinta las partes de `STAGE_PIECES` de atrás hacia adelante y marca con `data-i` / `data-part` los elementos
 * que se animan con el scroll: el padre los busca desde `ref` y escribe sus atributos SVG (no CSS: en Safari de iPhone
 * las variables CSS con transform sobre elementos SVG no se refrescan). Los valores iniciales ya van en el HTML del
 * servidor, así que hidratar no mueve nada.
 */

export type ImageSet = "sm" | "lg" | null;

interface PieceSvgProps {
  piece: StageView;
  /** null = aún sin cargar imágenes (la sección está lejos); "sm"/"lg" elige la versión pequeña o grande. */
  images: ImageSet;
  ref?: Ref<SVGSVGElement>;
}

export function PieceSvg({ piece, images, ref }: PieceSvgProps) {
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${piece.w} ${piece.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full overflow-visible"
      focusable="false"
    >
      {piece.parts.map((part, i) => {
        if (part.type === "image") {
          const href = images === null ? undefined : images === "lg" ? part.href : part.hrefSm;
          if (part.role === "glow") {
            // La opacidad base va en la imagen (la anima el padre); la pulsación lenta, en el <g> (se multiplican).
            return (
              <g key={i} className="piece-glow">
                <image data-i={i} data-part="glow" href={href} width={piece.w} height={piece.h} opacity={0} />
              </g>
            );
          }
          const [fx, fy] = part.role === "slide" ? (part.from ?? [0, 0]) : [0, 0];
          return (
            <image
              key={i}
              data-i={i}
              data-part={part.role}
              href={href}
              width={piece.w}
              height={piece.h}
              className="piece-ink"
              transform={part.role === "slide" ? `translate(${fx} ${fy})` : undefined}
            />
          );
        }
        if (part.type === "rotor") {
          const half = part.size / 2;
          return (
            <g key={i} transform={`matrix(${part.m.join(" ")})`}>
              <image
                data-i={i}
                data-part="rotor"
                href={images === null ? undefined : part.href}
                width={part.size}
                height={part.size}
                className="piece-ink"
                transform={`rotate(0 ${half} ${half})`}
              />
            </g>
          );
        }
        return part.kind === "trace" ? (
          <path
            key={i}
            data-i={i}
            data-part="trace"
            d={part.d}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="butt"
            strokeLinejoin="round"
            strokeDasharray="1 2"
            strokeDashoffset={1}
            className="text-panda"
          />
        ) : (
          <path
            key={i}
            data-i={i}
            data-part={part.kind}
            d={part.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={part.kind === "flow" ? 1.5 : 2}
            strokeLinecap="round"
            strokeDasharray={part.kind === "flow" ? "6 10" : "10 16"}
            strokeDashoffset={0}
            opacity={0.6}
            className="text-component"
          />
        );
      })}
    </svg>
  );
}
