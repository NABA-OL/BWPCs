/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-27
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/**
 * Modo oscuro del sitio PÚBLICO. Claro por defecto siempre; el oscuro se
 * activa a mano (no sigue `prefers-color-scheme`) y se recuerda en
 * `localStorage`. El admin, `/style-guide`, los PDF, los correos y las
 * imágenes de historias quedan fuera a propósito (ver CLAUDE.md).
 */
export type ThemeName = "light" | "dark";

export const THEME_STORAGE_KEY = "bw-theme";
export const THEME_ATTRIBUTE = "data-theme";

/** Rutas que siempre se ven en claro, sin importar lo guardado. */
export const THEME_LOCKED_PREFIXES = ["/admin", "/style-guide"];

export function isThemeLocked(pathname: string): boolean {
  return THEME_LOCKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Lee la preferencia guardada; ante cualquier fallo (privado, bloqueado) asume claro. */
export function readStoredTheme(): ThemeName {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Pone o quita el atributo de tema en `<html>`. No toca `localStorage`. */
export function applyTheme(theme: ThemeName): void {
  const root = document.documentElement;
  if (theme === "dark") root.setAttribute(THEME_ATTRIBUTE, "dark");
  else root.removeAttribute(THEME_ATTRIBUTE);
}

/**
 * Script en línea para `<head>`/inicio de `<body>`, antes de la primera pintura:
 * si la ruta no está bloqueada y el usuario había elegido oscuro, pone el atributo
 * ya mismo para no parpadear de claro a oscuro al cargar. Arma la cadena a partir
 * de las mismas constantes de arriba, para no duplicar los literales a mano.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,p=location.pathname,l=${JSON.stringify(
  THEME_LOCKED_PREFIXES,
)};for(var i=0;i<l.length;i++){if(p===l[i]||p.indexOf(l[i]+"/")===0)return;}if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="dark")d.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},"dark");}catch(e){}})();`;
