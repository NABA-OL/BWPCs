/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/**
 * Interruptor de las cuentas de usuario. Mientras no estén listas las fases
 * legales y de recuperación (ver plan), el registro no debe estar abierto en
 * producción: sin NEXT_PUBLIC_ACCOUNTS_ENABLED=true las rutas responden 404 y el
 * botón del header no se muestra. Es NEXT_PUBLIC_ para que el header (cliente)
 * lo lea sin pedir nada al servidor.
 */
export const ACCOUNTS_ENABLED =
  process.env.NEXT_PUBLIC_ACCOUNTS_ENABLED === "true";
