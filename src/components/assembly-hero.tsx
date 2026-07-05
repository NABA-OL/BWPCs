// Desarrollado por NABA-OL
"use client";

import { useEffect, useRef } from "react";

/*
 * Torre de PC en line-art como fondo fijo global (position: fixed, -z-10).
 * - <AssemblyHero> (home): se ENSAMBLA con el scroll y queda armada y quieta.
 * - <PcBackdrop> (demás páginas): ya armada, estática y quieta.
 * Ambas comparten el mismo dibujo, color y opacidades (PcLineArt) → ajustar
 * el color/opacidades en un solo lugar aplica a todo el sitio.
 * Ventiladores giran siempre (CSS). Respeta prefers-reduced-motion.
 */

// Opacidad de los componentes: MIN (desarmado) → MAX (armado).
const PART_OPACITY_MIN = 0.05;
const PART_OPACITY_MAX = 0.17;

export function AssemblyHero({ children }: { children: React.ReactNode }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const parts = Array.from(svg.querySelectorAll<SVGGElement>("[data-fx]"));
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const range = PART_OPACITY_MAX - PART_OPACITY_MIN;

    // Cache viewport metrics — reading innerWidth/innerHeight on every RAF frame
    // forces layout. Only refresh on resize.
    let explode = window.innerWidth < 640 ? 0.45 : 1;
    let viewH = window.innerHeight;

    const apply = (p: number) => {
      const k = 1 - p;
      for (const g of parts) {
        const fx = parseFloat(g.dataset.fx ?? "0") * explode;
        const fy = parseFloat(g.dataset.fy ?? "0") * explode;
        g.setAttribute("transform", `translate(${fx * k} ${fy * k})`);
        g.setAttribute("opacity", String(PART_OPACITY_MIN + range * p));
      }
    };

    if (reduce) {
      apply(1);
      return;
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Se arma durante el primer ~60% de un viewport y luego queda armado.
        const p = clamp(window.scrollY / (viewH * 0.6));
        apply(p);
      });
    };

    const onResize = () => {
      explode = window.innerWidth < 640 ? 0.45 : 1;
      viewH = window.innerHeight;
      onScroll();
    };

    apply(0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <Backdrop>
        <PcLineArt innerRef={svgRef} />
      </Backdrop>

      {/* Hero — solo el texto, altura normal */}
      <section className="relative">
        <div className="mx-auto flex min-h-[88vh] max-w-6xl items-center px-4 sm:px-6">
          <div className="max-w-xl">{children}</div>
        </div>
      </section>

      <FanSpinStyle />
    </>
  );
}

/** Fondo fijo con la torre YA ARMADA y estática (para las demás páginas). */
export function PcBackdrop() {
  return (
    <>
      <Backdrop>
        <PcLineArt assembled />
      </Backdrop>
      <FanSpinStyle />
    </>
  );
}

/** Contenedor fijo, centro-derecha, detrás de todo. */
function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="flex h-full w-full items-center justify-center translate-x-[18%] sm:translate-x-[16%]">
        {children}
      </div>
    </div>
  );
}

/**
 * El dibujo del PC (única fuente de verdad de color/opacidades).
 * `assembled` = piezas en su sitio con opacidad final (modo estático).
 * Con `innerRef` (modo animado), el JS controla transform/opacidad por scroll.
 */
function PcLineArt({
  innerRef,
  assembled = false,
}: {
  innerRef?: React.RefObject<SVGSVGElement | null>;
  assembled?: boolean;
}) {
  // En modo estático, las piezas ya están armadas a opacidad final.
  const partProps = assembled ? { opacity: PART_OPACITY_MAX } : {};

  return (
    <svg
      ref={innerRef}
      viewBox="0 0 360 420"
      className="h-[34vh] w-auto overflow-visible text-component sm:h-[min(70vh,580px)]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Chasis — la torre. Más transparente que los componentes. */}
      <path
        d="M40 26 H320 a8 8 0 0 1 8 8 V386 a8 8 0 0 1 -8 8 H40 a8 8 0 0 1 -8 -8 V34 a8 8 0 0 1 8 -8 Z"
        opacity={0.16}
      />
      <line x1="120" y1="34" x2="120" y2="386" stroke="currentColor" strokeWidth={1.2} opacity={0.05} />

      {/* Ventiladores frontales */}
      <g data-fx="-150" data-fy="0" {...partProps}>
        <Fan cx={76} cy={120} r={30} />
        <Fan cx={76} cy={250} r={30} />
      </g>

      {/* Motherboard */}
      <g data-fx="130" data-fy="0" {...partProps}>
        <rect x="146" y="64" width="166" height="262" rx="4" />
        <circle cx="160" cy="78" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="298" cy="78" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="160" cy="312" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="298" cy="312" r="2.2" fill="currentColor" stroke="none" />
      </g>

      {/* CPU + cooler */}
      <g data-fx="0" data-fy="-150" {...partProps}>
        <rect x="178" y="96" width="62" height="62" rx="3" />
        <Fan cx={209} cy={127} r={22} />
      </g>

      {/* RAM */}
      <g data-fx="40" data-fy="-180" {...partProps}>
        <rect x="262" y="96" width="9" height="92" rx="1.5" />
        <rect x="276" y="96" width="9" height="92" rx="1.5" />
        <rect x="290" y="96" width="9" height="92" rx="1.5" />
      </g>

      {/* GPU */}
      <g data-fx="170" data-fy="20" {...partProps}>
        <rect x="150" y="244" width="172" height="46" rx="3" />
        <Fan cx={196} cy={267} r={16} />
        <Fan cx={262} cy={267} r={16} />
      </g>

      {/* Fuente de poder */}
      <g data-fx="0" data-fy="170" {...partProps}>
        <rect x="46" y="344" width="268" height="48" rx="3" />
        <Fan cx={84} cy={368} r={18} />
        <line x1="150" y1="356" x2="300" y2="356" stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
        <line x1="150" y1="368" x2="300" y2="368" stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
        <line x1="150" y1="380" x2="300" y2="380" stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
      </g>

      {/* Botón de encendido */}
      <circle cx="76" cy="58" r="6" />
      <circle cx="76" cy="58" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FanSpinStyle() {
  return (
    <style>{`
      .bw-fan-blades {
        transform-box: fill-box;
        transform-origin: center;
        animation: bw-fan-spin 4s linear infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .bw-fan-blades { animation: none; }
      }
      @keyframes bw-fan-spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}

/** Ventilador line-art con aspas que giran (clase bw-fan-blades). */
function Fan({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const blades = [0, 60, 120, 180, 240, 300].map((deg) => {
    const a = (deg * Math.PI) / 180;
    const ix = cx + Math.cos(a) * (r * 0.32);
    const iy = cy + Math.sin(a) * (r * 0.32);
    const ox = cx + Math.cos(a + 0.6) * (r * 0.86);
    const oy = cy + Math.sin(a + 0.6) * (r * 0.86);
    return `M${ix.toFixed(1)} ${iy.toFixed(1)} Q${cx} ${cy} ${ox.toFixed(1)} ${oy.toFixed(1)}`;
  });
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} />
      <g className="bw-fan-blades">
        <circle cx={cx} cy={cy} r={r * 0.3} />
        <path d={blades.join(" ")} strokeWidth={1.2} opacity={0.75} />
      </g>
    </g>
  );
}
