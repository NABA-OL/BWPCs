import { defineConfig } from "@playwright/test";

// Con E2E_BASE_URL se prueba un sitio ya publicado (p. ej. un preview de Vercel) y no se levanta servidor local.
const externalBaseUrl = process.env.E2E_BASE_URL;
const localBaseUrl = "http://localhost:3002";

// Usa el Google Chrome instalado en el sistema (`channel: "chrome"`): no descarga un navegador propio y sirve igual en el servidor y en GitHub Actions.
const chrome = { channel: "chrome", reducedMotion: "reduce" } as const;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: externalBaseUrl ?? localBaseUrl, ...chrome },
  projects: [
    { name: "movil-375", use: { viewport: { width: 375, height: 812 } } },
    { name: "tablet-768", use: { viewport: { width: 768, height: 1024 } } },
    { name: "escritorio-1440", use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: externalBaseUrl
    ? undefined
    : { command: "pnpm dev", url: localBaseUrl, reuseExistingServer: true, timeout: 120_000 },
});
