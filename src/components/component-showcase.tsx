"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-01
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PieceSvg, type ImageSet } from "@/components/component-piece";
import { STAGE_PIECES, type PieceId, type StagePart, type StageView, type VariantId } from "@/lib/component-stage";
import {
  ANIM_END,
  ANIM_START,
  HEADER_PX,
  ROTOR_DEG_PER_PX,
  easeOutCubic,
  frameAt,
  scrollProgress,
  span,
  stageLayout,
  trackHeight,
} from "@/lib/component-showcase";

/*
 * Escenario de la sección Componentes de /servicios: un recorrido alto con un escenario pegado (sticky) que muestra UNA
 * pieza (o una variante de ella) a la vez. El progreso del scroll por el recorrido (0 a 1) elige el tramo y su animación
 * (ida y vuelta, sin capturar el scroll). Una pieza con variantes (aire/líquida, M.2/SATA/HDD) ocupa un tramo por variante:
 * sale una, instante vacío, entra la otra; el contador y el título solo se atenúan al entrar a la pieza y al salir de ella. La matemática vive en `lib/component-showcase.ts`; aquí solo se lee el scroll y se escribe el DOM.
 *
 * - Sin re-render por scroll: un rAF lee UNA vez `getBoundingClientRect` y escribe solo lo que cambió (opacidad y
 *   transform de los divs; atributos SVG en los elementos SVG, por Safari de iPhone). El único estado React es si ya se
 *   cargan las imágenes (la sección está cerca) y su versión.
 * - Mientras el recorrido está pegado se oculta la torre del fondo (`data-tower-hidden` en <html>, ver `tower-hero.tsx`).
 * - Sin JS o con movimiento reducido el CSS (`.cs-track` / `.cs-list`) muestra la lista de siempre; esto no se monta.
 */

export interface ShowcaseItem {
  id: PieceId;
  t: string;
  d: string;
  /** Pasos extra dentro de la pieza (mismo orden que `STAGE_PIECES[id].variants`). Sin ella, un solo tramo. */
  variants?: readonly { id: VariantId; label: string; d: string }[];
  /** Página "a fondo" de la pieza. El escenario es aria-hidden: el enlace es solo para mouse/toque (tabIndex -1); el accesible va en flujo normal en la página. */
  href?: string;
}

/** Cuánto avanza el flujo de aire (px de trazo por px de scroll). */
const AIR_PX_PER_SCROLL = 0.6;
const TOWER_HIDDEN_ATTR = "data-tower-hidden";
const pad = (n: number) => String(n).padStart(2, "0");

interface PartRuntime {
  el: SVGElement;
  part: StagePart;
  last: string;
}
interface SlotRuntime {
  wrap: HTMLDivElement | null;
  varText: HTMLDivElement | null;
  parts: PartRuntime[];
  opacity: number;
  shift: number;
  willChange: boolean;
}
interface HeadRuntime {
  el: HTMLDivElement | null;
  opacity: number;
  /** Variante resaltada en la fila de etiquetas (-1 = aún sin escribir). */
  variant: number;
}

const CHIP_DIM = 0.4;

/** Vista (SVG) que dibuja el tramo `k` de la pieza; null si el contrato de `STAGE_PIECES` no la trae (se omite del escenario). */
function viewFor(item: ShowcaseItem, k: number): StageView | null {
  const { variants } = STAGE_PIECES[item.id];
  const wanted = item.variants?.[k]?.id;
  return (wanted === undefined ? variants[0] : variants.find((v) => v.id === wanted)) ?? null;
}

function put(target: { el: Element; last: string }, name: string, value: string) {
  if (target.last === value) return;
  target.last = value;
  target.el.setAttribute(name, value);
}

export function ComponentShowcase({ items }: { items: ShowcaseItem[] }) {
  const n = items.length;
  const layout = useMemo(() => stageLayout(items.map((i) => i.variants?.length ?? 1)), [items]);
  const views = useMemo(() => layout.slots.map((sl) => viewFor(items[sl.piece], sl.variant)), [items, layout]);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const varTextRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chipRefs = useRef<(HTMLSpanElement | null)[][]>([]);
  const svgRefs = useRef<(SVGSVGElement | null)[]>([]);
  const [images, setImages] = useState<ImageSet>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || reduce) return;
    const root = document.documentElement;

    const slots: SlotRuntime[] = layout.slots.map((_, j) => {
      const view = views[j];
      const nodes = Array.from(svgRefs.current[j]?.querySelectorAll<SVGElement>("[data-i]") ?? []);
      return {
        wrap: slotRefs.current[j],
        varText: varTextRefs.current[j],
        parts: view ? nodes.map((el) => ({ el, part: view.parts[Number(el.dataset.i)], last: "" })) : [],
        opacity: -1,
        shift: Number.NaN,
        willChange: false,
      };
    });
    const heads: HeadRuntime[] = items.map((_, i) => ({ el: headRefs.current[i], opacity: -1, variant: -1 }));

    let trackLen = Math.max(track.offsetHeight - stage.offsetHeight, 0);
    let raf = 0;
    let listening = false;
    let loaded = false;
    let towerHidden = false;

    const animate = (r: SlotRuntime, t: number, scrolled: number) => {
      for (const p of r.parts) {
        const part = p.part;
        if (part.type === "image") {
          if (part.role === "slide") {
            const k = 1 - easeOutCubic(span(t, ANIM_START, 0.55));
            const [fx, fy] = part.from ?? [0, 0];
            put(p, "transform", `translate(${(fx * k).toFixed(1)} ${(fy * k).toFixed(1)})`);
          } else if (part.role === "glow") {
            put(p, "opacity", (span(t, 0.5, ANIM_END) * 0.6).toFixed(3));
          }
        } else if (part.type === "rotor") {
          const half = part.size / 2;
          const ang = -scrolled * ROTOR_DEG_PER_PX * part.dir;
          put(p, "transform", `rotate(${ang.toFixed(2)} ${half} ${half})`);
        } else if (part.kind === "trace") {
          put(p, "stroke-dashoffset", (1 - span(t, ANIM_START, 0.6)).toFixed(3));
        } else {
          put(p, "stroke-dashoffset", (-scrolled * AIR_PX_PER_SCROLL).toFixed(1));
        }
      }
    };

    const update = () => {
      raf = 0;
      const top = track.getBoundingClientRect().top;
      const p = scrollProgress(top, trackLen);
      const scrolled = Math.min(Math.max(HEADER_PX - top, 0), trackLen);
      const pinned = p > 0 && p < 1;
      if (pinned !== towerHidden) {
        towerHidden = pinned;
        root.toggleAttribute(TOWER_HIDDEN_ATTR, pinned);
      }
      const frame = frameAt(p, layout);
      slots.forEach((r, j) => {
        const active = j === frame.slot && frame.opacity > 0;
        const opacity = active ? frame.opacity : 0;
        const shift = active ? frame.shift : 0;
        const willChange = pinned && (j === frame.slot || j === frame.slot + 1); // solo el tramo activo y el siguiente
        if (willChange !== r.willChange && r.wrap) {
          r.willChange = willChange;
          r.wrap.style.willChange = willChange ? "opacity, transform" : "";
        }
        if (r.wrap && (opacity !== r.opacity || shift !== r.shift)) {
          r.wrap.style.visibility = active ? "visible" : "hidden";
          r.wrap.style.opacity = String(opacity);
          r.wrap.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
          if (r.varText) {
            r.varText.style.visibility = active ? "visible" : "hidden";
            r.varText.style.opacity = String(opacity);
          }
          r.opacity = opacity;
          r.shift = shift;
        }
        if (active) animate(r, frame.t, scrolled);
      });
      heads.forEach((h, i) => {
        const here = i === frame.piece && frame.pieceOpacity > 0;
        const opacity = here ? frame.pieceOpacity : 0;
        if (h.el && opacity !== h.opacity) {
          h.el.style.visibility = here ? "visible" : "hidden";
          h.el.style.opacity = String(opacity);
          h.opacity = opacity;
        }
        if (here && h.variant !== frame.variant) {
          h.variant = frame.variant;
          chipRefs.current[i]?.forEach((chip, k) => {
            if (chip) chip.style.opacity = k === frame.variant ? "1" : String(CHIP_DIM);
          });
        }
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const attach = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("scroll", schedule, { passive: true });
    };
    const detach = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", schedule);
    };

    // Cerca de la pantalla (150 % del alto de la ventana arriba y abajo): se cargan las imágenes y se escucha el scroll.
    const io = new IntersectionObserver(
      (entries) => {
        const near = entries[entries.length - 1].isIntersecting;
        if (near) {
          if (!loaded) {
            loaded = true;
            setImages(window.matchMedia("(min-width: 768px)").matches ? "lg" : "sm");
          }
          attach();
        } else {
          detach();
        }
        update(); // al salir fija el estado final (p = 0 o 1) aunque el último scroll no alcanzara a procesarse
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(track);

    const ro = new ResizeObserver(() => {
      trackLen = Math.max(track.offsetHeight - stage.offsetHeight, 0);
      schedule();
    });
    ro.observe(track);
    ro.observe(stage);

    update(); // si se recarga a mitad del recorrido, fija el estado ya

    return () => {
      detach();
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      root.removeAttribute(TOWER_HIDDEN_ATTR); // si no, al navegar a otra página la torre quedaría oculta
    };
  }, [items, layout, views, reduce]);

  return (
    <div ref={trackRef} className="cs-track" style={{ display: "none", height: trackHeight(layout.units) }}>
      <div
        ref={stageRef}
        aria-hidden="true"
        className="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-6 px-4"
      >
        <div className="relative h-[min(50dvh,460px)] w-[min(86vw,560px)]">
          {layout.slots.map((sl, j) => {
            const view = views[j];
            if (!view) return null;
            return (
              <div
                key={`${items[sl.piece].id}-${sl.variant}`}
                ref={(el) => {
                  slotRefs.current[j] = el;
                }}
                className="absolute inset-0"
                style={{ opacity: 0, visibility: "hidden" }}
              >
                <PieceSvg
                  piece={view}
                  images={images}
                  ref={(el) => {
                    svgRefs.current[j] = el;
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="w-full max-w-md text-center">
          <div className="grid">
            {items.map((item, i) => (
              <div
                key={item.id}
                ref={(el) => {
                  headRefs.current[i] = el;
                }}
                className="self-start [grid-area:1/1]"
                style={{ opacity: 0, visibility: "hidden" }}
              >
                <p className="font-mono text-sm text-component">
                  {pad(i + 1)} / {pad(n)}
                </p>
                <p className="mt-2 text-xl font-semibold">{item.t}</p>
                {item.variants && (
                  <p className="mt-1 font-mono text-[11px] sm:text-xs">
                    {item.variants.map((v, k) => (
                      <span key={v.id} className="whitespace-nowrap">
                        {k > 0 && <span style={{ opacity: CHIP_DIM }}> · </span>}
                        <span
                          ref={(el) => {
                            (chipRefs.current[i] ??= [])[k] = el;
                          }}
                          style={{ opacity: k === 0 ? 1 : CHIP_DIM }}
                        >
                          {v.label}
                        </span>
                      </span>
                    ))}
                  </p>
                )}
                {item.href && (
                  <p className="mt-2 font-mono text-xs">
                    <Link href={item.href} tabIndex={-1} className="underline underline-offset-4">
                      Ver a fondo
                    </Link>
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-1 grid">
            {layout.slots.map((sl, j) => {
              const item = items[sl.piece];
              return (
                <div
                  key={`${item.id}-${sl.variant}`}
                  ref={(el) => {
                    varTextRefs.current[j] = el;
                  }}
                  className="[grid-area:1/1]"
                  style={{ opacity: 0, visibility: "hidden" }}
                >
                  <p className="text-base text-panda">{item.variants?.[sl.variant]?.d ?? item.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
