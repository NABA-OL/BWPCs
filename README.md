# B & W · Sitio web oficial

Sitio web de **B & W**, negocio colombiano de ensamble de computadores y venta de componentes. Incluye un cotizador público en tiempo real, una galería de builds realizados y un panel de administración completo.

**Producción:** [bwpcs.vercel.app](https://bwpcs.vercel.app)

---

## Características

### Sitio público

- **Cotizador en tiempo real** — el usuario elige la gama de cada componente (baja / media / alta / tope) y obtiene un estimado de precio instantáneo en COP, con opción tarjeta y PSE. Genera un resumen listo para enviar por WhatsApp.
- **Galería de ensambles** — portfolio de builds realizados, con soporte para fotos directas (Imgur, Google Fotos, etc.) e Instagram embeds nativos.
- **Sección "Ensambles recientes"** en el inicio — aparece automáticamente al agregar el primer build desde el admin.
- **SEO optimizado** — sitemap.xml, robots.txt, Open Graph, Twitter Card y JSON-LD de LocalBusiness para búsquedas locales en Colombia.
- Páginas: Inicio · Servicios · Ensambles · Cotizador · Nosotros · Contacto.

### Panel de administración (`/admin`)

| Sección | Funcionalidad |
|---|---|
| **Resumen** | Dashboard con totales de catálogo y desglose por marca/categoría |
| **Procesadores** | CRUD con filtros por marca (AMD / Intel), búsqueda y paginación |
| **Gráficas** | CRUD con filtros por marca (NVIDIA / AMD / Intel), autocomplete de modelos |
| **Componentes** | CRUD por categoría (RAM, SSD, Board, Fuente, Chasis, Refrigeración) |
| **Cotizador** | Gestión de gamas y precios estimados por categoría |
| **Cotizaciones** | Builder multi-ítem con precios en vivo + exportación a PDF |
| **Ensambles** | Galería CRUD con URL de imagen, título, specs y orden |
| **Configuración** | Wordmark, TRM manual / automática (Superfinanciera), frases del header |
| **Usuarios** | Cambio de contraseña, crear admins, eliminar |

### TRM automática

Consume el servicio SOAP oficial de la **Superintendencia Financiera de Colombia** (`queryTCRM`). Se actualiza diariamente con un cron de Vercel (`0 11 * * *`) y también manualmente desde el panel. El `trmManual` tiene prioridad sobre el automático.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 16** (App Router, Server & Client Components) |
| Lenguaje | **TypeScript** (strict) |
| Estilos | **Tailwind CSS v4** (tokens en `globals.css` vía `@theme`) |
| Base de datos | **MongoDB Atlas** (`mongodb` v7, tipado con generics) |
| Auth | JWT propio con **jose** + cookies httpOnly · contraseñas con **bcrypt** |
| PDF | **@react-pdf/renderer** (cotizaciones exportables) |
| Fuentes | **Geist** (sans) · **JetBrains Mono** (precios y specs) |
| Deploy | **Vercel** (Crons, ISR con `revalidate`, Edge proxy) |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          # Sitio público con layout header/footer
│   │   ├── page.tsx       # Home
│   │   ├── servicios/
│   │   ├── ensambles/
│   │   ├── cotizador/
│   │   ├── nosotros/
│   │   └── contacto/
│   ├── admin/
│   │   ├── login/         # Login público
│   │   └── (panel)/       # Shell autenticado
│   │       ├── page.tsx   # Resumen
│   │       ├── procesadores/
│   │       ├── graficas/
│   │       ├── componentes/
│   │       ├── promedios/
│   │       ├── cotizaciones/
│   │       ├── ensambles/
│   │       ├── configuracion/
│   │       └── usuarios/
│   ├── api/
│   │   ├── cron/trm/      # Actualización diaria de TRM
│   │   └── wordmark/      # Frases del header (GET público)
│   ├── sitemap.ts         # /sitemap.xml
│   └── robots.ts          # /robots.txt
├── components/
│   ├── admin/             # Componentes del panel (managers, forms)
│   ├── ui/                # Botones, inputs reutilizables
│   ├── pdf/               # Plantilla de cotización en PDF
│   ├── tower-hero.tsx     # torre de fondo con ventiladores que giran con el scroll (home y resto)
│   ├── builds-grid.tsx    # Grilla paginada de ensambles (público)
│   └── instagram-embed.tsx# Embed nativo de publicaciones de Instagram
├── lib/
│   ├── db/                # Conexión MongoDB, tipos, colecciones
│   ├── auth/              # Sesión JWT, acciones de login/logout
│   ├── admin/             # stats, settings
│   ├── trm.ts             # Cliente SOAP Superfinanciera
│   ├── pricing.ts         # Conversión USD → COP con TRM
│   ├── categories.ts      # Categorías y opciones del cotizador
│   ├── instagram.ts       # Helper isInstagramUrl()
│   └── site-config.ts     # Nav, contacto, config estática
└── proxy.ts               # Middleware Edge: protege /admin/*
```

---

## Variables de entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
MONGODB_URI=mongodb+srv://...      # Cadena de conexión de MongoDB Atlas
MONGODB_DB=bwpcs                   # Nombre de la base de datos
AUTH_SECRET=...                    # Secret para firmar JWT (mín. 32 chars)
CRON_SECRET=...                    # Bearer token para el cron de TRM (opcional)
```

En **Vercel**, define las mismas variables en el dashboard del proyecto.

---

## Comandos

```bash
npm run dev          # Servidor de desarrollo (localhost:3000)
npm run build        # Build de producción
npx tsc --noEmit     # Verificación de tipos sin compilar
npm run seed         # Crea el admin inicial y settings en MongoDB
```

El seed crea:
- **Admin:** usuario y contraseña tomados de `ADMIN_USER` y `ADMIN_PASSWORD` en `.env.local` (obligatorias, mínimo 12 caracteres; no hay valores por defecto)
- **Settings** por defecto (TRM manual = 3950, frases del wordmark, opciones del cotizador)

---

## Autenticación

JWT propio (sin NextAuth). La cookie `bw_session` (httpOnly, sameSite=lax) se firma con `AUTH_SECRET` via **jose**. El proxy de Edge (`src/proxy.ts`) verifica el token en cada ruta `/admin/*` (excepto `/admin/login`).

Para acceder al login desde el sitio público: clic largo (5 s) en el crédito `© año` del footer.

---

## Despliegue

El proyecto se despliega automáticamente en Vercel al hacer push a `main`. El archivo `vercel.json` define el framework y el cron diario de TRM.

Para el cron de TRM: define `CRON_SECRET` en Vercel → Settings → Environment Variables.

---

## Créditos

Desarrollado por **[NABA-OL](https://nabaol.vercel.app)**.
