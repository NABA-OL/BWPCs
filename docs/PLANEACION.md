# B & W — Planeación de la página web

> **B & W — Tu PC Master Race a buen precio**
> Emprendimiento de ensamble de computadores y venta de componentes (Colombia).
> Logo: oso panda gamer con control. Paleta: **blanco vainilla + negro + gris**.

---

## 1. Resumen del proyecto

Página web elegante y moderna para un emprendimiento de **ensamble de PC a la medida** y **venta de componentes sueltos** (GPU, CPU, RAM, board, fuente, chasis, refrigeración, etc.). El servicio principal es el **ensamblaje**, pero el cliente también puede comprar un solo componente.

La web reemplaza el flujo actual manual (Excel → copiar tabla → Word → exportar PDF) por:

1. Un **sitio público** que presenta el negocio y permite al usuario **cotizar su ensamble** de forma aproximada.
2. Un **panel administrativo** para gestionar listas de precios (procesadores y gráficas), componentes predeterminados, TRM, medios de pago y datos de contacto.
3. Generación de **cotizaciones en PDF** con un diseño profesional que respeta la estructura actual.

---

## 2. Stack tecnológico recomendado

| Capa | Elección | Por qué |
|------|----------|---------|
| Framework | **Next.js 15 (App Router) + TypeScript** | Render híbrido (SSR/ISR), API routes, despliegue nativo en Vercel. |
| Estilos | **Tailwind CSS + shadcn/ui** | Sistema de diseño rápido, accesible y muy personalizable a la paleta vainilla/negro/gris. |
| Base de datos | **MongoDB Atlas (free tier M0)** | Ver decisión abajo. |
| Auth admin | **Auth.js (NextAuth) — Credentials provider** | Login simple con contraseña hasheada (bcrypt), sesión en cookie httpOnly. |
| PDF | **@react-pdf/renderer** | Genera el PDF en el servidor sin navegador headless; ideal para serverless de Vercel. |
| TRM automático | **Vercel Cron + fetch/parse** | Job diario que actualiza el TRM en la BD. |
| Hosting | **Vercel** | Lo solicitado; integra cron, env vars y dominios. |

### Decisión: MongoDB Atlas vs Supabase

**Recomendación: MongoDB Atlas.**

- Una cotización es naturalmente un **documento con ítems variables** (no siempre incluye los mismos componentes). Eso encaja mejor en un modelo de documentos que en tablas rígidas.
- Es lo que ya tenías en mente y el *free tier* sobra para este volumen.
- Integra bien con Vercel vía driver oficial / Mongoose.

*Cuándo elegirías Supabase en su lugar:* si quisieras **Auth lista de fábrica** (correo/Google), almacenamiento de archivos y SQL relacional. Para este caso el login admin es tan simple que no justifica el cambio. **Vamos con Mongo.**

---

## 3. Arquitectura de la información (páginas públicas)

1. **Inicio (Home)**
   - Hero con el panda, nombre **B & W** y tagline *"Tu PC Master Race a buen precio"*.
   - Qué hacemos: ensamblaje + venta de componentes (íconos asociados a PC).
   - CTA principal → **Cotiza tu PC**.
2. **Servicios** — Ensamblaje (lo principal), venta de componentes individuales, formateo y configuración.
3. **Cotizador** — Sección interactiva donde el usuario arma su PC y obtiene un **valor aproximado** (ver §5).
4. **Sobre nosotros** — Historia del emprendimiento.
5. **Contacto** — WhatsApp y correo (editables desde el panel admin).
6. **Footer** — Métodos de pago (Bre-B, Bold, tarjetas), contacto, y el **año de derechos reservados** que es el acceso oculto al admin (§7).

---

## 4. Modelo de datos (colecciones MongoDB)

```
settings (documento único)
  trmScrapeado: number          // último valor leído de dolar-colombia.com
  trmRecargo: number = 148      // se suma al scrapeado
  trmManual: number | null      // override manual opcional
  trmActualizado: Date
  envioCPU: number = 110000
  envioGPU: number = 170000
  mediosPago: { tarjeta: 0.06, pse: 0.03, breB: 0.03, daviplata: 0.03 }
  servicioBase: number = 200000
  contacto: { whatsapp: string, email: string }

processors
  modelo: string                // "Ryzen 7600x"
  marca: "AMD" | "Intel"
  modoPrecio: "USD" | "COP"     // normalmente USD (casillero)
  baseUsd: number | null        // si modoPrecio = USD → se convierte
  precioManualCop: number | null// si modoPrecio = COP → valor fijo
  activo: boolean
  actualizado: Date

graphics
  modelo: string                // "RX 9060 XT 16gb"
  modoPrecio: "USD" | "COP"     // normalmente USD (casillero)
  baseUsd: number | null
  precioManualCop: number | null
  activo: boolean
  actualizado: Date

components                      // catálogo de fuente, ram, board, chasis, etc. (siempre en COP)
  categoria: "Fuente"|"Ram"|"Almacenamiento"|"Refrigeracion Proce"|"Chasis"|"Board"|"Refrigeracion"|"Mouse"|"Teclado"|"Monitor"|"Audifonos"
  marca: string
  modelo: string
  descripcion: string
  precioCop: number             // precio directo (Amazon Colombia)

categoryAverages                // precios promedio por categoría para el estimado público
  categoria: string
  promedioCop: number           // editable a mano o derivado del catálogo

quotes                          // cotizaciones guardadas / generadas
  codigo: string                // "2025-30"
  fecha: Date
  cliente: string | null
  opciones: [
    {
      titulo: "Opción 1"
      items: [ { categoria, modelo, precioCop, descripcion } ]
      servicio: number
      totales: { base, conTarjeta, conPse }
    }
  ]

admins
  usuario: string
  passwordHash: string          // bcrypt
```

---

## 5. Lógica de precios (el corazón del sistema)

Documentada a partir de tu Excel real:

```
TRM_efectivo = (trmManual ?? trmScrapeado) + trmRecargo(148)

precioCPU = precioManualCop  ??  (baseUsd * TRM_efectivo + envioCPU(110.000))
precioGPU = precioManualCop  ??  (baseUsd * TRM_efectivo + envioGPU(170.000))

Total      = Σ(items seleccionados) + Servicio
Con Tarjeta = Total * 1.06        // recargo 6%
Con PSE     = Total * 1.03        // recargo 3% (= Bre-B / Daviplata)
```

- **CPU y GPU** se eligen por selector → el precio se autocompleta desde la BD.
- **Fuente, RAM, board, chasis, etc.** se ingresan/seleccionan del catálogo (precios cargados a mano por ti, como hoy).
- El **servicio** es editable por cotización (si es solo un componente, se ajusta o se quita).
- No todos los componentes son obligatorios: el cotizador permite **omitir** los que no apliquen.

### TRM automático

- Fórmula original (Excel): `IMPORTXML("https://www.dolar-colombia.com/", "/html/body/div[1]/div[2]/div[2]/div[1]/div/div[2]/h2/span/text()")`.
- En la web: un **Vercel Cron diario** hace `fetch` de la página, parsea el valor con el mismo selector (vía `cheerio`), lo guarda en `settings.trmScrapeado`. Se le suma 148 al usarlo.
- Siempre habrá un **campo de override manual** en el admin por si el scraping falla o quieres fijarlo.

---

## 6. Cotizador público (experiencia del usuario)

**Concepto: estimado aproximado, SIN elegir modelo exacto.** El cliente solo marca **qué componentes quiere incluir** y recibe un rango de precio orientativo. No selecciona "Ryzen 7600x" ni "RX 9060"; solo dice "quiero procesador, gráfica, board, RAM y chasis".

Flujo:

1. El usuario **activa/desactiva categorías** (Procesador, Gráfica, Fuente, RAM, Almacenamiento, Board, Chasis, Refrigeración, etc.) según lo que quiera.
2. *(Opcional, fase posterior)* elige una **gama** general — Básica / Media / Alta — que ajusta los valores de referencia.
3. El sistema calcula un **estimado** usando **precios promedio** por categoría (configurables desde el admin, no modelos exactos).
4. Muestra: **Total aproximado**, **Con Tarjeta**, **Con PSE/Bre-B**, con la leyenda *"Precio aproximado, sujeto a cambios"*.
5. **CTA → WhatsApp**: botón "Me interesa, contactar" que abre WhatsApp con el resumen del estimado prellenado. **Aquí termina el flujo público** (no genera PDF, no guarda nada).

> El PDF y la cotización formal los haces tú después en el panel, con modelos y precios exactos. La mejora futura (que el usuario elija modelo exacto, varias opciones, etc.) queda fuera de esta primera versión.

### Valores de referencia (precios promedio)
- Cada categoría tiene un **precio promedio** que alimenta el estimado. Se puede derivar del catálogo (promedio de ítems activos) o fijarse a mano por categoría desde el admin.
- Procesador y gráfica también usan un promedio representativo (no se expone el selector de modelo al público).

---

## 7. Panel administrativo

**Acceso oculto:** en el footer, sobre el texto de *"© 2025 Derechos reservados"*, al **mantener presionado (clic largo) por más de 5 segundos** (touch en celular o mouse en desktop) → redirige a `/admin/login`. Contraseña básica inicial (cambiable luego).

Secciones del panel:

1. **Procesadores** — CRUD de la lista (modelo, USD base, precio manual, activo).
2. **Gráficas** — CRUD de la lista.
3. **Componentes** — catálogo de fuente, RAM, board, chasis, etc. con descripción.
4. **Plantillas / Ensambles predeterminados** — armados base reutilizables.
5. **TRM y envíos** — ver TRM scrapeado, override manual, recargos de envío.
6. **Medios de pago** — porcentajes (tarjeta 6%, PSE/Bre-B 3%).
7. **Contacto** — WhatsApp y correo (se reflejan en la web).
8. **Promedios por categoría** — valores de referencia que alimentan el **estimado público** (§6).
9. **Cotizaciones** — listar, crear, editar y **exportar PDF**. Aquí eliges para cada ítem el modelo, si se compra/añade, el valor (USD con conversión automática para CPU/GPU, o COP directo), el servicio, y soporta **varias opciones** (Opción 1, 2…). Estas **sí se guardan en BD**.

---

## 8. Generación de PDF (replicando tu plantilla)

Respetando el diseño actual:

- **Encabezado:** logo/wordmark **B & W**, tagline, fecha, círculos blanco/gris/negro decorativos, triángulos geométricos en esquinas.
- **Título** "COTIZACIÓN".
- **Una tabla por opción** (Item | Precio | Descripción) con filas: Procesador, Fuente, RAM, Almacenamiento, Refrigeración Proce, Chasis, Board, Gráfica, Servicio, **Total / Con Tarjeta / Con PSE**.
- **Footer:** logos de pago (Bre-B, Bold, Visa/Mastercard), contacto `(+57) 318 842 2533`, `bandwmount@gmail.com`, y el panda.
- Mejora respecto al Excel→Word: tabla con estética más limpia (tipografía, espaciado, encabezado en negro, filas alternas grises sutiles) en lugar de la rejilla de Excel.

Se construye con `@react-pdf/renderer` (componentes React → PDF), reutilizando los datos de la cotización.

---

## 9. Sistema de diseño visual

- **Colores:** Vainilla `#FAF8F3` (fondo), Negro `#0A0A0A` (texto/acentos), Grises `#6B6B6B`/`#E5E5E5` (secundarios). Alto contraste, look elegante y minimalista.
- **Tipografía:** una **serif** elegante para el wordmark "B & W" y titulares; una **sans** limpia (p. ej. Inter) para cuerpo.
- **Mascota:** el panda como acento de marca (loading, empty states, footer).
- **Motivos:** triángulos geométricos en esquinas (ya presentes en el PDF), círculos B/G/N.
- Totalmente **responsive** (móvil primero, dado que muchos clientes llegan por WhatsApp/celular).

---

## 10. Hoja de ruta por fases

**Fase 0 — Base**
- Proyecto Next.js + Tailwind + shadcn, paleta y tipografías, conexión a Mongo Atlas, layout público y footer.

**Fase 1 — Sitio público**
- Home, Servicios, Sobre nosotros, Contacto (datos desde `settings`).

**Fase 2 — Admin + datos**
- Login oculto (clic largo 5s), CRUD de procesadores/gráficas/componentes, settings (TRM, pagos, contacto).
- Cron de TRM.

**Fase 3 — Cotizador público**
- Selectores en vivo, cálculo de totales, aviso de precio aproximado.

**Fase 4 — PDF + cotizaciones**
- Generación de PDF con la plantilla, guardado de cotizaciones, soporte multi-opción, envío por WhatsApp.

**Fase 5 — Pulido**
- SEO, metadatos, animaciones sutiles, optimización de imágenes, cambio de contraseña admin.

---

## 11. Variables de entorno (Vercel)

```
MONGODB_URI=...
AUTH_SECRET=...
ADMIN_INITIAL_PASSWORD_HASH=...   # bcrypt
TRM_SOURCE_URL=https://www.dolar-colombia.com/
```

---

## 12. Decisiones tomadas (definidas con el cliente)

1. **PDF → solo lo genera el admin.** El cotizador público da un **estimado aproximado**; si al cliente le convence, contacta por **WhatsApp** y tú ajustas y generas el PDF oficial desde el panel.
2. **En BD se guardan solo TUS cotizaciones** (las que creas en el admin). Los estimados del público **no** se guardan.
3. **Catálogo con precios promedio precargados** para todas las categorías (fuente, RAM, board, chasis, etc.), editables. La extracción automática desde Amazon u otras páginas queda **para después**.
4. **Sin dominio propio por ahora** → se usa el de Vercel. Flujo: desarrollo **local** → repo en **GitHub** → importar a Vercel.
5. **Cotizador público = aproximado por categorías, sin elegir modelo exacto** (ver §6).

## 13. Cómo el admin carga precios (USD vs COP)

Regla del negocio: lo que supera ~**USD 200** se importa por **casillero** (gráficas y procesadores) → se paga en dólares + TRM + envío del casillero. Lo demás (fuente, RAM, board, chasis, etc., normalmente < USD 200) se compra **directo en Amazon Colombia en pesos**.

Por eso, en el panel:

- **Procesador y Gráfica:** se ingresan **normalmente en USD** y el sistema calcula `USD × TRM_efectivo + envío` (110.000 CPU / 170.000 GPU). *Opcionalmente* se puede sobrescribir con un valor fijo en **COP** si así lo prefieres.
- **Resto de componentes:** se ingresan **directamente en COP** (precio que ves en Amazon Colombia). Sin conversión.

Cada ítem de procesador/gráfica guarda un campo `modoPrecio: "USD" | "COP"` para saber cómo calcularlo.
