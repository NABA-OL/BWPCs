/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-29
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/**
 * Cubierta de la intro de la home: fondo vainilla con "B & W" grande. Se pinta desde
 * el servidor, antes del header, y el CSS la muestra solo si `<html data-intro>` es
 * `play` o `burst` (ver `src/lib/intro.ts`); sin el atributo es `display:none`.
 */
export function IntroOverlay() {
  return (
    <div className="bw-intro" aria-hidden="true">
      <span className="bw-intro-mark" data-intro-mark>
        B&nbsp;&amp;&nbsp;W
        <span className="bw-intro-dot" />
      </span>
    </div>
  );
}
