/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-11-15
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { expect, test } from "@playwright/test";

// Páginas públicas principales. Cada una se prueba en los tres tamaños de pantalla de `playwright.config.ts`.
const PUBLIC_ROUTES = [
  "/",
  "/servicios",
  "/cotizador",
  "/ensambles",
  "/nosotros",
  "/contacto",
  "/guias",
  "/noticias",
  "/piezas",
] as const;

function screenshotName(route: string): string {
  return route === "/" ? "inicio" : route.slice(1).replaceAll("/", "-");
}

for (const route of PUBLIC_ROUTES) {
  test(`${route}: carga, tiene h1, sin errores ni desborde horizontal`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(route);
    expect(response?.status(), "estado HTTP").toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();

    const overflowPx = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflowPx, "desborde horizontal (px)").toBeLessThanOrEqual(0);
    expect(pageErrors, "errores de JavaScript en la página").toEqual([]);

    // Captura completa para revisar el diseño a ojo; queda en test-results/ (ignorada por git).
    await page.screenshot({
      path: testInfo.outputPath(`${screenshotName(route)}.png`),
      fullPage: true,
    });
  });
}
