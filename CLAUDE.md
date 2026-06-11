# B & W — Guía del proyecto

Web de **B & W** (ensamble de PC y venta de componentes, Colombia). Ver `docs/PLANEACION.md` (plan completo), `docs/DESIGN.md` (sistema de diseño) y `docs/PRODUCT.md` (producto/marca).

## Stack
- **Next.js 16** (App Router) + TypeScript + **Tailwind CSS v4** (tokens en `src/app/globals.css` vía `@theme`).
- Fuentes: **Geist** (sans, display/body) y **JetBrains Mono** (precios/specs).
- Despliegue: Vercel. Flujo: local → GitHub → Vercel. BD futura: **MongoDB Atlas**.

## Convenciones de diseño (resumen — la fuente es `docs/DESIGN.md`)
- Paleta: vainilla `#FAF8F3`, panda black `#0A0A0A`, gris `#6B6B6B`, hairline `#E5E5E5`, **un solo acento** azul eléctrico `#2563EB` (≤10% de pantalla).
- Jerarquía por **peso** (800 display ↔ 400 body), no por color. Color solo en interactivos.
- Sin mayúsculas en eyebrows/labels (solo en labels de botón). Sin sombras en superficies estáticas. Sin segundo acento. Bordes 2px máx.
- **Mobile-first** (375px), `prefers-reduced-motion`, WCAG AA.
- Precios en `font-mono`. Panda como momento puntual, no patrón.

## Estructura
- `src/app/(public)/` — sitio público (home, servicios, cotizador, nosotros, contacto) con su `layout` (header/footer). El root `layout.tsx` solo monta html/body/fuentes.
- `src/app/admin/login/` — login (público). `src/app/admin/(panel)/` — shell autenticado (`layout` valida sesión) con `page` (resumen) y `configuracion`.
- `src/proxy.ts` — protege `/admin/*` (Edge, verifica JWT). Convención Next 16 "proxy" (antes "middleware").
- `src/components/` — públicos + `admin/` (`login-form`, `admin-shell`, `settings-form`). `brand-wordmark` (header): "B & W" se expande revelando frases (barrido simétrico de `max-width`, sin opacidad) y rota por `settings.wordmarkPhrases` (ej. Build&Wire, Bits&Watts) en cada iteración (al cargar + cada 60s). Las frases son editables en admin → Configuración y se sirven por `GET /api/wordmark` (el componente las fetchea al montar; las páginas siguen estáticas). Cuadrito de acento en la "s" del H1 del hero (`.bw-accent-mark` en globals.css): pulsa alternando cuadro↔rombo.
- `src/lib/db/` — `mongodb` (conexión cacheada), `types`, `collections` (+ `DEFAULT_SETTINGS`).
- `src/lib/auth/` — `session` (jose JWT, cookie `bw_session`), `password` (bcrypt), `actions` (login/logout).
- `src/lib/admin/` — `stats`, `settings`. `src/lib/env.ts`, `src/lib/format.ts`, `src/lib/admin-nav.ts`.
- `public/brand/` — `logo.png` (con wordmark), `logo-solo.png` (solo panda).

## Público extras
- **Aviso de cookies** (`components/cookie-consent.tsx`, montado en `(public)/layout`): banner Aceptar/Rechazar; recuerda la elección en `localStorage` (`bw-cookie-consent`). Solo hay cookie necesaria (`bw_session`), sin tracking.
- **Cotizador**: el precio se muestra como `≈ ...` con aviso reforzado de que es aproximado según la gama y no es el precio final.

## Admin extras
- **Usuarios** (`/admin/usuarios`): cambiar contraseña propia + crear admins (contraseña autogenerada que se muestra una vez) + eliminar (no a sí mismo). Acciones en `usuarios/actions.ts`.
- **Gráficas** tienen `marca` (chip: AMD/NVIDIA/Intel) + `ensambladora` (AIB: MSI/ASUS/… texto con datalist); procesadores AMD/Intel. **Resumen** muestra desglose por marca (procesadores, gráficas) y componentes por categoría/marca (`lib/admin/stats.ts` con aggregation).
- **Cotizaciones**: el dropdown "Desde catálogo" agrupa por categoría (`<optgroup>`); las cotizaciones nuevas empiezan vacías (sin ítem por defecto).

## Auth admin
JWT propio (no NextAuth): cookie httpOnly `bw_session` firmada con `AUTH_SECRET` (jose). Admin en colección `admins` (bcrypt). `SecretAdminTrigger` (clic largo 5s en "© año") → `/admin/login`. Seed: `npm run seed` crea admin (`admin`/`bwadmin2026`) + settings.

## Entorno (.env.local)
`MONGODB_URI` (de Atlas/Vercel), `MONGODB_DB=bwpcs`, `AUTH_SECRET`. Ver `.env.example`. En Vercel falta añadir `AUTH_SECRET`.

## Comandos
- `npm run dev` · `npm run build` · `npx tsc --noEmit` · `npm run seed`

## Estado (fases en PLANEACION §10)
- ✅ Fase 0: scaffold, tokens, layout, header/footer, home.
- ✅ Fase 1: contenido real de Servicios/Nosotros/Contacto.
- ✅ Fase 2: conexión Mongo (seed corrido: admin + settings), auth admin, shell, Resumen, Configuración. En producción (vercel.json fija framework Next.js).
- ✅ Fase 2b: CRUD de Procesadores, Gráficas (USD→COP con TRM vía `lib/pricing.ts`), Componentes (COP) y Promedios. TRM manual fijado en 3950; catálogo inicial sembrado desde el Excel. Pricing verificado (190 USD × 4098 + 110000 = 888.620). Cotizaciones = Fase 4 (con PDF).
- ✅ Fase 3: cotizador público (`/cotizador`) — el cliente elige **una gama por categoría** (opciones con precio en `categoryOptions`, ej. Procesador: baja/media/alta/tope), Total/Con Tarjeta/Con PSE en vivo, CTA WhatsApp con resumen. Preselección "gama media" en core, "No incluir" en refrigeración. Defaults en `lib/categories.ts` (`DEFAULT_ESTIMATOR_OPTIONS`), gestionables en admin → **Cotizador** (`/admin/promedios`, `estimator-options-form`). Estática con `revalidate=3600` + `revalidatePath('/cotizador')` al guardar. Favicon `logo-solo.ico` (metadata.icons en root layout). Footer con crédito "Desarrollado por NABA-OL".
- ✅ Fase 4: cotizaciones admin (lista, nueva, editar) con builder multi-opción (`quote-builder`), ítems desde catálogo o manuales, totales en vivo. PDF con `@react-pdf/renderer` (`components/pdf/quote-pdf.tsx`) vía route `cotizaciones/[id]/pdf` (runtime nodejs, protegido por proxy+getSession). PDF verificado: replica la plantilla (header B&W, tabla, totales, footer con panda/medios de pago/contacto). Cotización demo 2025-30 sembrada.
- ✅ Hero SVG line-art (`components/assembly-hero.tsx`): **fondo fijo global** (`position: fixed -z-10`, centro-derecha, trazo `text-component`, ~50% más pequeño y explosión reducida en móvil). Dibujo compartido en `PcLineArt` (única fuente de color/opacidades: `PART_OPACITY_MIN/MAX`, chasis opacidad en el markup). Dos usos: **`AssemblyHero`** (home) se ensambla con el scroll (~60% de viewport) y queda armado; **`PcBackdrop`** (Servicios/Nosotros/Contacto/Cotizador) ya armado y estático. Ventiladores giran siempre (CSS `bw-fan-spin`). `prefers-reduced-motion` → armado sin animar. ⚠️ El preview captura el scroll de forma inconsistente; verificar en navegador real. ⚠️ No correr `npm run build` con el preview dev activo (corrompe `.next/dev`): parar el preview primero.
- ✅ **TRM automática (Superfinanciera):** `lib/trm.ts` (`fetchTrmOficial`) consume el servicio web SOAP oficial de la Superintendencia Financiera (POST text/xml, operación `queryTCRM`, devuelve `<value>`; sin keystore — eso es solo para el cliente Java del PDF). Lo refresca el cron diario de Vercel `0 11 * * *` → `GET /api/cron/trm` (protegido con `CRON_SECRET` Bearer si está definida) y el botón "Actualizar TRM ahora" en admin → Configuración (`refreshTrmAction`). Guarda en `settings.trmScrapeado` + `trmActualizado`; el `trmManual` (override) tiene prioridad. **Pendiente del usuario en Vercel:** definir `CRON_SECRET` en env.
- El proyecto cubre todas las fases del plan. Mejoras futuras posibles: editar contacto desde admin (ya en Configuración), más pulido.

## Nota de verificación (preview)
El navegador headless del preview sirve la página *cross-site*, así que las cookies `sameSite=lax` (como `bw_session`) NO viajan en el POST de los Server Actions → login/guardado fallan SOLO en el preview. En un navegador real (localhost:3000 directo) y en producción funcionan. Para verificar mutaciones del admin, usar curl/node contra la BD, no el preview.
