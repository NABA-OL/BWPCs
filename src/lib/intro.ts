/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-29
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/**
 * Intro de la home: "B & W" aparece en el centro, "explota" y de ese punto salen
 * los nodos del fondo. La intro es un ESTADO DEL DOCUMENTO (`<html data-intro>`),
 * no un componente: la decide y la termina un script en línea previo a la primera
 * pintura (como `THEME_INIT_SCRIPT`) y las piezas (cubierta, canvas, wordmark del
 * header, aviso de cookies) solo leen el atributo.
 *
 * Estados: `play` (cubierta con el wordmark) → `burst` (los nodos salen del centro
 * y la cubierta se funde) → `done`. Sin atributo = no hay intro.
 *
 * El contenido de la página NO se oculta con opacidad: queda pintado debajo de la
 * cubierta opaca para que el h1 siga siendo el candidato de LCP en la primera pintura.
 */
export type IntroPhase = "play" | "burst" | "done";

export const INTRO_ATTR = "data-intro";
export const INTRO_STORAGE_KEY = "bw-intro";
/** Tras verla, no se repite en 24 h (localStorage: sessionStorage es por pestaña y WhatsApp abre cada enlace como sesión nueva). */
export const INTRO_TTL_MS = 86_400_000;
/** Cuánto se ve el wordmark antes de explotar. */
export const INTRO_HOLD_MS = 900;
/** Duración del vuelo de los nodos hasta su posición final. */
export const INTRO_BURST_MS = 1400;
/** La cubierta empieza a fundirse a los X ms de la explosión y dura INTRO_FADE_MS. */
export const INTRO_FADE_DELAY_MS = 700;
export const INTRO_FADE_MS = 600;
/** Si nada la termina (JS roto, canvas caído), la cubierta se va sola y el estado pasa a `done`. */
export const INTRO_FAILSAFE_MS = 3500;

const SEARCH_ENGINES = "google|bing|duckduckgo|yahoo|ecosia|brave";

/**
 * Script en línea, al inicio de `<body>` y DESPUÉS del de tema. Solo hay intro en
 * `/` (sin hash), con la pestaña visible, sin movimiento reducido, sin ahorro de
 * datos, sin venir de un buscador y sin haberla visto en las últimas 24 h.
 * `?intro=1` salta lo del buscador, el ahorro de datos y la marca de las 24 h,
 * pero nunca el movimiento reducido. Cualquier fallo = sin intro.
 */
export const INTRO_INIT_SCRIPT = `(function(){try{var w=window,d=document,h=d.documentElement,L=w.location,A=${JSON.stringify(
  INTRO_ATTR,
)};if(L.pathname!=="/"||L.hash)return;if(d.visibilityState!=="visible")return;if(w.matchMedia&&w.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var f=/[?&]intro=1(&|$)/.test(L.search);if(!f){var c=navigator.connection;if(c&&c.saveData)return;try{var r=d.referrer?new URL(d.referrer).hostname:"";if(new RegExp("(^|\\\\.)(${SEARCH_ENGINES})\\\\.").test(r))return;}catch(e){}try{var t=+w.localStorage.getItem(${JSON.stringify(
  INTRO_STORAGE_KEY,
)})||0;if(Date.now()-t<${INTRO_TTL_MS})return;}catch(e){}}try{w.localStorage.setItem(${JSON.stringify(
  INTRO_STORAGE_KEY,
)},String(Date.now()));}catch(e){}w.__bwIntroT0=performance.now();h.setAttribute(A,"play");var ev=["pointerdown","keydown","wheel","touchstart","resize"];function end(user){if(h.getAttribute(A)==="done")return;h.setAttribute(A,"done");for(var i=0;i<ev.length;i++)w.removeEventListener(ev[i],skip,true);d.removeEventListener("visibilitychange",vis);if(user){var g=function(e){e.preventDefault();e.stopPropagation();};w.addEventListener("click",g,true);setTimeout(function(){w.removeEventListener("click",g,true);},400);}}function skip(e){end(e.type!=="resize");}function vis(){if(d.visibilityState==="hidden")end(false);}for(var i=0;i<ev.length;i++)w.addEventListener(ev[i],skip,{capture:true,passive:true});d.addEventListener("visibilitychange",vis);setTimeout(function(){end(false);},${INTRO_FAILSAFE_MS + 100});}catch(e){}})();`;

/** Fase actual leída del documento; null si no hay intro. */
export function introPhase(): IntroPhase | null {
  if (typeof document === "undefined") return null;
  const v = document.documentElement.getAttribute(INTRO_ATTR);
  return v === "play" || v === "burst" || v === "done" ? v : null;
}

export function setIntroPhase(phase: IntroPhase): void {
  document.documentElement.setAttribute(INTRO_ATTR, phase);
}

/** true mientras la cubierta está activa (play o burst). */
export function introActive(): boolean {
  const p = introPhase();
  return p === "play" || p === "burst";
}

/**
 * Ejecuta `cb` cuando la intro termina (o de inmediato si no hay intro).
 * Devuelve la función de limpieza para usar en el efecto.
 */
export function whenIntroDone(cb: () => void): () => void {
  if (!introActive()) {
    cb();
    return () => {};
  }
  const observer = new MutationObserver(() => {
    if (!introActive()) {
      observer.disconnect();
      cb();
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [INTRO_ATTR] });
  return () => observer.disconnect();
}

/** easeOutExpo: 0 → 0, 1 → 1, monótona; arranque brusco y llegada suave. */
export function easeOutExpo(u: number): number {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return 1 - Math.pow(2, -10 * u);
}

/** Realce de líneas durante la explosión: 1 + 1,4·(1−E)². Vale 1 al terminar. */
export function lineBoost(e: number): number {
  const k = 1 - Math.min(1, Math.max(0, e));
  return 1 + 1.4 * k * k;
}
