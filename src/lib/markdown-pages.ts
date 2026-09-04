/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-27
 */

/**
 * Versión en Markdown de cada página pública, servida vía content negotiation
 * (`Accept: text/markdown`, ver proxy.ts) para agentes/LLMs que la prefieran
 * sobre el HTML renderizado. Mismo contenido de fondo que cada page.tsx.
 */
export const MARKDOWN_PAGES: Record<string, string> = {
  home: `# B & W

Ensamblamos tu PC a la medida y vendemos componentes sueltos en Colombia.

## Cómo funciona

1. **Cotiza en la web** — marca los componentes y obtén un estimado en segundos, sin registro.
2. **Confirma por WhatsApp** — ajustamos modelos exactos y precio final contigo.
3. **Recibe tu equipo** — armado, probado y listo para encender. Bogotá o envío a todo Colombia.

## Enlaces

- [Cotizador](/cotizador) — estimador de precio de PC a la medida.
- [Servicios](/servicios) — ensamblaje, venta de componentes y asesoría técnica.
- [Ensambles](/ensambles) — galería de PCs entregados a clientes reales.
- [Nosotros](/nosotros) — quién está detrás de B & W.
- [Contacto](/contacto) — WhatsApp, correo y cobertura de envíos.
`,

  servicios: `# Servicios

Ensamblaje a la medida y venta de componentes sueltos en Colombia.

- Seleccionamos cada componente según uso y presupuesto.
- Armamos, formateamos y configuramos el equipo desde cero.
- Vendemos piezas individuales al mejor precio: gráficas, procesadores, RAM, boards, fuentes, chasis, refrigeración.

Ver [cotizador](/cotizador) o [contacto](/contacto).
`,

  ensambles: `# Ensambles

Galería de PCs armados y entregados a clientes reales en Colombia.

Ver [cotizador](/cotizador) para estimar tu propio equipo o [contacto](/contacto) para escribirnos.
`,

  nosotros: `# Nosotros

B & W nació de la pasión por el hardware: armar un buen computador en Colombia no tiene por qué ser caro ni confuso.

- Importamos gráficas y procesadores para conseguir mejores precios que el mercado local.
- Recomendamos solo lo que el uso del cliente necesita.
- Cable management ordenado, temperaturas en su punto, equipo probado antes de entregar.

Ver [ensambles entregados](/ensambles) o [contacto](/contacto).
`,

  contacto: `# Contacto

- **WhatsApp** (canal principal): respondemos cotizaciones, dudas y pedidos.
- **Correo**: bandwmount@gmail.com
- **Cobertura**: Bogotá y envíos a todo Colombia.
- **Medios de pago**: Bre-B, tarjeta, PSE, Daviplata, Nequi.

Ver [cotizador](/cotizador) antes de escribir para tener un estimado listo.
`,

  cotizador: `# Cotizador de PC

Estimador de precio en pesos colombianos (COP), sin registro. Elige la gama de cada categoría de componente (Procesador, Gráfica, RAM, Board, Fuente, Chasis, Refrigeración) y obtén un total aproximado al instante, con recargo según medio de pago (Bre-B, tarjeta, PSE, Daviplata, Nequi).

El precio es un estimado aproximado; el precio final se confirma por WhatsApp — ver [contacto](/contacto).

Para consumo programático, ver el servidor MCP en \`/api/mcp\` (herramientas \`listar_categorias_cotizador\` y \`cotizar_pc\`).
`,

  privacidad: `# Privacidad

B & W recopila solo los datos necesarios para operar: el cotizador no requiere cuenta, y solo pedimos nombre, teléfono y correo si decides continuar la cotización por WhatsApp — para darle seguimiento a esa solicitud.

- **Cookies**: solo la cookie necesaria de sesión de administración (\`bw_session\`). Sin cookies de rastreo ni analítica de terceros.
- **Datos de cotizaciones**: nombre, teléfono y correo, guardados para dar seguimiento a la solicitud; no se comparten con terceros ni se usan para publicidad.
- **Contacto**: WhatsApp y correo son gestionados directamente por B & W.

Ver [contacto](/contacto) para solicitar acceso, corrección o eliminación de tus datos.
`,
};

/** Rutas públicas elegibles para negociación de contenido Markdown. */
export const MARKDOWN_ELIGIBLE_PATHS: Record<string, string> = {
  "/": "home",
  "/servicios": "servicios",
  "/ensambles": "ensambles",
  "/nosotros": "nosotros",
  "/contacto": "contacto",
  "/cotizador": "cotizador",
  "/privacidad": "privacidad",
};
