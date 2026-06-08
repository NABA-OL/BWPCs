import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats, type AdminStats } from "@/lib/admin/stats";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Resumen",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  let stats: AdminStats | null = null;
  let error: string | null = null;
  try {
    stats = await getAdminStats();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al conectar con la base de datos.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Resumen</h1>
        <p className="mt-1 text-component">
          Estado general del catálogo y la configuración.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <h2 className="font-semibold text-accent">
            No se pudo conectar con la base de datos
          </h2>
          <p className="mt-2 text-sm text-panda">{error}</p>
        </div>
      ) : (
        stats && (
          <>
            {/* Métricas del catálogo */}
            <div className="mt-8 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Procesadores" value={stats.processors} href="/admin/procesadores" />
              <Metric label="Gráficas" value={stats.graphics} href="/admin/graficas" />
              <Metric label="Componentes" value={stats.components} href="/admin/componentes" />
              <Metric label="Cotizaciones" value={stats.quotes} href="/admin/cotizaciones" />
            </div>

            {/* TRM */}
            <section className="mt-8 border border-hairline p-6">
              <h2 className="text-sm font-medium text-component">
                TRM efectivo (con recargo de envío)
              </h2>
              {stats.trmEfectivo ? (
                <p className="mt-2 font-mono text-3xl font-medium">
                  ${formatNumber(stats.trmEfectivo)}
                </p>
              ) : (
                <p className="mt-2 text-panda">
                  Sin TRM aún.{" "}
                  <Link
                    href="/admin/configuracion"
                    className="text-accent hover:underline"
                  >
                    Configúralo
                  </Link>{" "}
                  para calcular precios de CPU y GPU en dólares.
                </p>
              )}
            </section>
          </>
        )
      )}
    </>
  );
}

function Metric({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-vanilla p-6 transition-colors hover:bg-hairline/40"
    >
      <p className="text-sm text-component">{label}</p>
      <p className="mt-1 font-mono text-3xl font-medium tabular-nums">
        {value}
      </p>
    </Link>
  );
}
