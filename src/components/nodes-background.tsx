"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

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

// Paleta de marca: se lee de los tokens CSS en runtime (no hardcodeada), para que
// la red cambie sola con el modo oscuro. Los literales son solo el respaldo si el
// navegador no da la variable computada.
const NODE_FALLBACK = "10,10,10"; // panda black
const LINE_FALLBACK = "107,107,107"; // component gray
const ACCENT_FALLBACK = "200,60,42"; // carmesí #c83c2a

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

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Colores reales de la marca, leídos de los tokens CSS: cambian solos al
    // alternar el modo oscuro (los tokens se redefinen en globals.css).
    let nodeRgb = NODE_FALLBACK;
    let lineRgb = LINE_FALLBACK;
    let accentRgb = ACCENT_FALLBACK;
    function refreshPalette() {
      const style = getComputedStyle(document.documentElement);
      nodeRgb = hexToRgb(style.getPropertyValue("--color-panda")) ?? NODE_FALLBACK;
      lineRgb = hexToRgb(style.getPropertyValue("--color-component")) ?? LINE_FALLBACK;
      accentRgb = hexToRgb(style.getPropertyValue("--color-accent")) ?? ACCENT_FALLBACK;
    }
    refreshPalette();

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
            ctx!.strokeStyle = `rgba(${lineRgb},${alpha})`;
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
          : `rgba(${nodeRgb},0.45)`;
        const s = 2.4;
        ctx!.fillRect(n.x - s / 2, n.y - s / 2, s, s);
      }
    }

    resize();

    // El tema (claro/oscuro) puede cambiar sin recargar la página: al notarlo,
    // se refresca la paleta y se redibuja (el bucle animado ya toma el valor nuevo solo).
    const themeObserver = new MutationObserver(() => {
      refreshPalette();
      if (reduce) draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Movimiento reducido: una sola pasada estática, sin bucle ni cursor.
    if (reduce) {
      draw();
      const onResizeStatic = () => {
        resize();
        draw();
      };
      window.addEventListener("resize", onResizeStatic);
      return () => {
        window.removeEventListener("resize", onResizeStatic);
        themeObserver.disconnect();
      };
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
      themeObserver.disconnect();
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
