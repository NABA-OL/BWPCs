/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-27
 */
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { getEstimatorContext, computeEstimate } from "@/lib/quote-estimator";

const handler = createMcpHandler((server) => {
  server.registerTool(
    "listar_categorias_cotizador",
    {
      title: "Listar categorías del cotizador",
      description:
        "Devuelve las categorías de componentes de PC que B & W cotiza (Procesador, Grafica, Board, Ram, Almacenamiento, Fuente, Chasis, RefrigeracionProce, Refrigeracion), cada una con sus gamas/opciones disponibles y el precio aproximado en COP de cada opción. Llama esta herramienta antes de cotizar_pc para saber qué categoria y opcionIndex usar.",
      inputSchema: z.object({}),
    },
    async () => {
      const ctx = await getEstimatorContext();
      return {
        content: [
          { type: "text", text: JSON.stringify(ctx.categories, null, 2) },
        ],
      };
    },
  );

  server.registerTool(
    "cotizar_pc",
    {
      title: "Cotizar PC",
      description:
        "Calcula el precio ESTIMADO en pesos colombianos (COP) de un PC ensamblado por B & W, a partir de la gama elegida en cada categoría de componente. Es un aproximado, no el precio final — el cliente debe confirmar por WhatsApp. Usa primero listar_categorias_cotizador para conocer las categorías válidas y el índice de cada opción.",
      inputSchema: z.object({
        seleccion: z
          .array(
            z.object({
              categoria: z
                .string()
                .describe(
                  'Clave de categoría tal como la devuelve listar_categorias_cotizador (ej. "Procesador", "Grafica").',
                ),
              opcionIndex: z
                .number()
                .int()
                .min(0)
                .describe(
                  "Índice (desde 0) de la opción/gama elegida dentro de las opciones de esa categoría.",
                ),
            }),
          )
          .min(1)
          .describe(
            "Una entrada por cada categoría de componente que el cliente quiere incluir en su PC.",
          ),
      }),
    },
    async ({ seleccion }) => {
      const ctx = await getEstimatorContext();
      try {
        const result = computeEstimate(ctx, seleccion);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Selección inválida.";
        return { content: [{ type: "text", text: message }], isError: true };
      }
    },
  );
});

export { handler as GET, handler as POST };
