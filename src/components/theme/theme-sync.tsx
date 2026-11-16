"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-27
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { applyTheme, isThemeLocked, readStoredTheme, THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Mantiene al día el atributo de tema en `<html>` durante la navegación (el script
 * de `layout.tsx` solo corre en la carga completa: una navegación de Next entre,
 * por ejemplo, el sitio público y `/admin` no recarga la página). También
 * sincroniza el tema entre pestañas cuando cambia `localStorage`. No renderiza nada.
 */
export function ThemeSync() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (isThemeLocked(pathname)) {
      applyTheme("light");
      return;
    }
    applyTheme(readStoredTheme());
  }, [pathname]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === THEME_STORAGE_KEY && !isThemeLocked(pathname)) applyTheme(readStoredTheme());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pathname]);

  return null;
}
