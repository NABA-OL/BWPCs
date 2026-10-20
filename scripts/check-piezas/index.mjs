/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Punto de entrada de las comprobaciones de "Piezas a fondo" (docs/piezas-plan-2.md §2.3). Las importa `scripts/check-logic.mjs`.
// Cada tema vive en su archivo: así cada agente agrega casos sin pisar a los demás. Los imports se ejecutan en este orden.
import "./hotspots.mjs";
import "./contenido.mjs";
import "./pagina.mjs";
import "./publicacion.mjs";
import "./registro.mjs";
import "./decodificador.mjs";
import "./estaticas.mjs";

console.log("check:piezas OK");
