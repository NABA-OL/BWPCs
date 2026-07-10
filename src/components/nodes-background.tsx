// Desarrollado por BlacKraken Solutions
"use client";

import { useEffect, useRef } from "react";

/*
 * Fondo de "red de nodos" tipo circuito impreso (PCB) / red de datos.
 * Puntos (pads) que derivan lentamente y se unen con líneas finas cuando están
 * cerca. Al acercar el mouse, los nodos cercanos se conectan a él en azul acento
 * y son atraídos muy sutilmente (efecto "circuito que sigue el cursor").
 *
 * Capa <canvas> fija en -z-20: queda DETRÁS de la torre (Backdrop -z-10) y del
 * contenido. pointer-events:none para no bloquear clics.
 * Respeta prefers-reduced-motion (red estática) y pausa con la pestaña oculta.
 */

// Paleta de marca en componentes RGB (para componer rgba con alpha variable).
const NODE_RGB = "10,10,10"; // panda black
const LINE_RGB = "107,107,107"; // component gray
// El acento se lee del token CSS --color-accent en runtime (carmesí #c83c2a).
const ACCENT_FALLBACK = "200,60,42";

/** Convierte un hex (#rgb o #rrggbb) a "r,g,b"; null si no es válido. */
function hexToRgb(hex: string): string | null {
  const h = hex.trim().replace("#", "");
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return [r, g, b].some(Number.isNaN) ? null : `${r},${g},${b}`;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b].some(Number.isNaN) ? null : `${r},${g},${b}`;
  }
  return null;
}

const LINK_DIST = 130; // distancia máx. para unir dos nodos (px)
const POINTER_DIST = 170; // radio de conexión/atracción al cursor (px)
const MAX_SPEED = 0.5; // límite de velocidad por nodo

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function NodesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Acento real de la marca, leído del token CSS (carmesí #c83c2a).
    const accentRgb =
      hexToRgb(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--color-accent",
        ),
      ) ?? ACCENT_FALLBACK;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    function buildNodes() {
      const isSmall = width < 640;
      const density = isSmall ? 22000 : 15000; // px² por nodo
      const count = Math.max(
        18,
        Math.min(Math.round((width * height) / density), isSmall ? 36 : 90),
      );
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // El <canvas> es un elemento reemplazado: NO se estira con inset-0, así
      // que medimos el viewport y fijamos su tamaño CSS explícitamente.
      width = window.innerWidth || document.documentElement.clientWidth;
      height = window.innerHeight || document.documentElement.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function step() {
      for (const n of nodes) {
        // Atracción muy sutil hacia el cursor.
        if (pointer.active) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < POINTER_DIST * POINTER_DIST && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = (1 - d / POINTER_DIST) * 0.02;
            n.vx += (dx / d) * f;
            n.vy += (dy / d) * f;
          }
        }
        // Límite de velocidad.
        const sp = Math.hypot(n.vx, n.vy);
        if (sp > MAX_SPEED) {
          n.vx = (n.vx / sp) * MAX_SPEED;
          n.vy = (n.vy / sp) * MAX_SPEED;
        }
        n.x += n.vx;
        n.y += n.vy;
        // Rebote suave en los bordes.
        if (n.x <= 0) {
          n.x = 0;
          n.vx = Math.abs(n.vx);
        } else if (n.x >= width) {
          n.x = width;
          n.vx = -Math.abs(n.vx);
        }
        if (n.y <= 0) {
          n.y = 0;
          n.vy = Math.abs(n.vy);
        } else if (n.y >= height) {
          n.y = height;
          n.vy = -Math.abs(n.vy);
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // Líneas entre nodos cercanos (O(n²), n acotado).
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.18;
            ctx!.strokeStyle = `rgba(${LINE_RGB},${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // Conexiones al cursor en azul acento.
      if (pointer.active) {
        for (const n of nodes) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < POINTER_DIST * POINTER_DIST) {
            const alpha = (1 - Math.sqrt(d2) / POINTER_DIST) * 0.5;
            ctx!.strokeStyle = `rgba(${accentRgb},${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(pointer.x, pointer.y);
            ctx!.lineTo(n.x, n.y);
            ctx!.stroke();
          }
        }
      }

      // Nodos como cuadritos (pads SMD); los cercanos al cursor se acentúan.
      for (const n of nodes) {
        const near =
          pointer.active &&
          Math.hypot(pointer.x - n.x, pointer.y - n.y) < POINTER_DIST;
        ctx!.fillStyle = near
          ? `rgba(${accentRgb},0.85)`
          : `rgba(${NODE_RGB},0.45)`;
        const s = 2.4;
        ctx!.fillRect(n.x - s / 2, n.y - s / 2, s, s);
      }
    }

    resize();

    // Movimiento reducido: una sola pasada estática, sin bucle ni cursor.
    if (reduce) {
      draw();
      const onResizeStatic = () => {
        resize();
        draw();
      };
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    let raf = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      step();
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerUp = (e: PointerEvent) => {
      // En táctil, soltar desactiva; con mouse se mantiene.
      if (e.pointerType !== "mouse") pointer.active = false;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        loop();
      }
    };

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    loop();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20"
    />
  );
}
