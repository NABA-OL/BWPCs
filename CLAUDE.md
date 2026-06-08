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
- `src/components/` — públicos + `admin/` (`login-form`, `admin-shell`, `settings-form`).
- `src/lib/db/` — `mongodb` (conexión cacheada), `types`, `collections` (+ `DEFAULT_SETTINGS`).
- `src/lib/auth/` — `session` (jose JWT, cookie `bw_session`), `password` (bcrypt), `actions` (login/logout).
- `src/lib/admin/` — `stats`, `settings`. `src/lib/env.ts`, `src/lib/format.ts`, `src/lib/admin-nav.ts`.
- `public/brand/` — `logo.png` (con wordmark), `logo-solo.png` (solo panda).

## Auth admin
JWT propio (no NextAuth): cookie httpOnly `bw_session` firmada con `AUTH_SECRET` (jose). Admin en colección `admins` (bcrypt). `SecretAdminTrigger` (clic largo 5s en "© año") → `/admin/login`. Seed: `npm run seed` crea admin (`admin`/`bwadmin2026`) + settings.

## Entorno (.env.local)
`MONGODB_URI` (de Atlas/Vercel), `MONGODB_DB=bwpcs`, `AUTH_SECRET`. Ver `.env.example`. En Vercel falta añadir `AUTH_SECRET`.

## Comandos
- `npm run dev` · `npm run build` · `npx tsc --noEmit` · `npm run seed`

## Estado (fases en PLANEACION §10)
- ✅ Fase 0: scaffold, tokens, layout, header/footer, home.
- ✅ Fase 1: contenido real de Servicios/Nosotros/Contacto.
- ✅ Fase 2: conexión Mongo (seed corrido: admin + settings), auth admin, shell, Resumen, Configuración. Login y guardado verificados a nivel de código (curl GET/POST con cookie → sesión OK).
- Pendiente: Fase 2b (CRUD procesadores/gráficas/componentes/promedios/cotizaciones), Fase 3 (cotizador), Fase 4 (PDF), hero SVG line-art.

## Nota de verificación (preview)
El navegador headless del preview sirve la página *cross-site*, así que las cookies `sameSite=lax` (como `bw_session`) NO viajan en el POST de los Server Actions → login/guardado fallan SOLO en el preview. En un navegador real (localhost:3000 directo) y en producción funcionan. Para verificar mutaciones del admin, usar curl/node contra la BD, no el preview.
