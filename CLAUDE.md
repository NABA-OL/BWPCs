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
- `src/app/` — rutas (home, servicios, cotizador, nosotros, contacto). Admin futuro en `/admin/*`.
- `src/components/` — `site-header`, `site-footer`, `brand-logo`, `page-hero`, `secret-admin-trigger`, `ui/button`.
- `src/lib/site-config.ts` — nav y contacto (migrará a settings en BD, Fase 2).
- `public/brand/` — `logo.png` (con wordmark), `logo-solo.png` (solo panda).

## Acceso admin oculto
`SecretAdminTrigger` envuelve el "© año" del footer: clic largo 5s → `/admin/login` (ruta pendiente, Fase 2).

## Comandos
- `npm run dev` · `npm run build` · `npx tsc --noEmit`

## Estado (fases en PLANEACION §10)
- ✅ Fase 0: scaffold, tokens, layout, header/footer, home, stubs de rutas.
- ⏳ Fase 1: contenido real de Servicios/Nosotros/Contacto.
- Pendiente: Fase 2 (admin + Mongo), Fase 3 (cotizador), Fase 4 (PDF).
