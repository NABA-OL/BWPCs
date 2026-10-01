"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-30
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useEffect, useRef, useState } from "react";
import { TOWER_FANS, TOWER_H, TOWER_LED, TOWER_SPRITE_PX, TOWER_W, type FanSprite } from "@/lib/tower-hero";

/*
 * Fondo de todo el sitio público: la torre de PC (línea fina, ya armada y quieta) como fondo fijo, detrás del texto.
 * `TowerHero` es el de la home (fondo + bloque del hero); `TowerBackdrop` es solo el fondo, para las demás páginas.
 * Solo se mueven los ventiladores, que giran con el scroll, y una luz del frente que parpadea de vez en cuando.
 *
 * La torre es una imagen (sin aspas, fondo transparente) y cada ventilador es un sprite de aspas de frente
 * colocado con la matriz afín de su plano, así que el giro con CSS se ve como un giro real en perspectiva
 * (sin WebGL ni librerías). Los archivos y las matrices salen del proyecto de video BWReel (ver CLAUDE.md).
 * El color sigue el tema: en oscuro se invierte la línea. Respeta prefers-reduced-motion (sin giro ni parpadeo).
 */

// Cuánto se ve la línea (0 a 1): igual de tenue que el dibujo anterior para no competir con el texto.
const INK_OPACITY = 0.2;
// Grados que giran las aspas por cada píxel de scroll.
const DEG_PER_PX = 0.45;

const BASE_LARGE = "/hero/tower-base.webp";
const BASE_SMALL = "/hero/tower-base-sm.webp";
const RAM_GLOW = "/hero/tower-ram.webp";
const SPRITES: Record<FanSprite, string> = {
  front120: "/hero/fan-front120.webp",
  gpuA: "/hero/fan-gpuA.webp",
  gpuB: "/hero/fan-gpuB.webp",
};

/** Fondo fijo con la torre y sus ventiladores que giran con el scroll. Va en cualquier página pública. */
export function TowerBackdrop() {
  const svgRef = useRef<SVGSVGElement>(null);
  const fanRefs = useRef<(SVGImageElement | null)[]>([]);
  // La versión pequeña sirve primero (pantallas chicas); en pantallas grandes se cambia a la de alta resolución.
  const [large, setLarge] = useState(false);

  useEffect(() => {
    setLarge(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = -1;
    const half = TOWER_SPRITE_PX / 2;
    const update = () => {
      const y = window.scrollY;
      if (y === last) return;
      last = y;
      const deg = y * DEG_PER_PX;
      // Atributo SVG (no CSS): las variables CSS + transform sobre elementos SVG no se refrescan bien en Safari (iPhone).
      // El sprite está de frente (eje hacia el espectador): giro antihorario = ángulo negativo (y hacia abajo).
      fanRefs.current.forEach((el, i) => {
        if (el) el.setAttribute("transform", `rotate(${(-deg * TOWER_FANS[i].dir).toFixed(2)} ${half} ${half})`);
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="flex h-full w-full items-center justify-center translate-x-[18%] sm:translate-x-[16%]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${TOWER_W} ${TOWER_H}`}
          className="h-[38vh] w-auto overflow-visible sm:h-[min(74vh,640px)]"
        >
          <image href={large ? BASE_LARGE : BASE_SMALL} width={TOWER_W} height={TOWER_H} className="tower-ink" opacity={INK_OPACITY} />
          {/* Brillo de las memorias RAM (color de acento, solo lo visible de ellas): respira muy despacio */}
          <image href={RAM_GLOW} width={TOWER_W} height={TOWER_H} className="tower-ram" />
          {TOWER_FANS.map((fan, i) => (
            <g key={i} transform={`matrix(${fan.m.join(" ")})`}>
              <image
                ref={(el) => {
                  fanRefs.current[i] = el;
                }}
                href={SPRITES[fan.sprite]}
                width={TOWER_SPRITE_PX}
                height={TOWER_SPRITE_PX}
                className="tower-ink"
                opacity={INK_OPACITY}
              />
            </g>
          ))}
          <rect className="tower-led" x={TOWER_LED.x - 5} y={TOWER_LED.y - 5} width={10} height={10} fill="var(--color-accent)" />
        </svg>
      </div>
    </div>
  );
}

/** Home: el fondo de la torre más el bloque del hero (solo el texto, altura normal). */
export function TowerHero({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TowerBackdrop />
      <section className="relative">
        <div className="mx-auto flex min-h-[88vh] max-w-6xl items-center px-4 sm:px-6">
          <div className="max-w-xl">{children}</div>
        </div>
      </section>
    </>
  );
}
