import type { Metadata } from "next";
import Link from "next/link";
import { collections } from "@/lib/db/collections";
import { formatCOP } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { deleteQuoteAction } from "./actions";

export const metadata: Metadata = {
  title: "Cotizaciones",
  robots: { index: false, follow: false },
};

const fmtDate = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function CotizacionesPage() {
  let rows: {
    id: string;
    codigo: string;
    cliente: string | null;
    fecha: string;
    total: number;
    opciones: number;
  }[] = [];
  let error: string | null = null;

  try {
    const col = await collections.quotes();
    const docs = await col.find({}).sort({ creado: -1 }).toArray();
    rows = docs.map((q) => ({
      id: q._id!.toString(),
      codigo: q.codigo,
      cliente: q.cliente,
      fecha: fmtDate.format(new Date(q.fecha)),
      total: q.opciones[0]?.totales.base ?? 0,
      opciones: q.opciones.length,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar cotizaciones.";
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Cotizaciones
          </h1>
          <p className="mt-1 text-component">
            Crea, edita y descarga tus cotizaciones en PDF.
          </p>
        </div>
        <ButtonLink href="/admin/cotizaciones/nueva">Nueva</ButtonLink>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-component">
          Aún no hay cotizaciones.{" "}
          <Link
            href="/admin/cotizaciones/nueva"
            className="text-accent hover:underline"
          >
            Crea la primera
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-hairline">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-hairline/30 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Total (op. 1)</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 font-mono font-medium">{r.codigo}</td>
                  <td className="px-4 py-3 text-component">
                    {r.cliente || "—"}
                  </td>
                  <td className="px-4 py-3 text-component">{r.fecha}</td>
                  <td className="px-4 py-3 font-mono">{formatCOP(r.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <a
                        href={`/admin/cotizaciones/${r.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-component hover:text-panda"
                      >
                        PDF
                      </a>
                      <Link
                        href={`/admin/cotizaciones/${r.id}`}
                        className="text-component hover:text-panda"
                      >
                        Editar
                      </Link>
                      <form
                        action={deleteQuoteAction}
                        // eslint-disable-next-line
                      >
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="text-accent hover:underline"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
