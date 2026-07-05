// Desarrollado por NABA-OL
import type { Metadata } from "next";
import Link from "next/link";
import {
  getAdminStats,
  type AdminStats,
  type BrandCount,
} from "@/lib/admin/stats";
import { formatNumber } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/categories";

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
    error =
      e instanceof Error ? e.message : "Error al conectar con la base de datos.";
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

            {/* Por marca */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <BrandPanel
                title="Procesadores por marca"
                href="/admin/procesadores"
                brands={stats.processorsByBrand}
              />
              <BrandPanel
                title="Gráficas por marca"
                href="/admin/graficas"
                brands={stats.graphicsByBrand}
              />
            </div>

            {/* Componentes por categoría */}
            <section className="mt-6 border border-hairline p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Componentes por categoría</h2>
                <Link
                  href="/admin/componentes"
                  className="text-sm text-accent hover:underline"
                >
                  Ver todos
                </Link>
              </div>
              {stats.componentsByCategory.length === 0 ? (
                <p className="mt-3 text-sm text-component">Aún no hay componentes.</p>
              ) : (
                <div className="mt-4 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2">
                  {stats.componentsByCategory.map((c) => (
                    <div key={c.categoria} className="bg-vanilla p-4">
                      <div className="flex items-baseline justify-between">
                        <span className="font-medium">
                          {CATEGORY_LABELS[c.categoria]}
                        </span>
                        <span className="font-mono text-lg">{c.count}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.marcas.map((m) => (
                          <Chip key={m.marca} brand={m} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* TRM */}
            <section className="mt-6 border border-hairline p-6">
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
      <p className="mt-1 font-mono text-3xl font-medium tabular-nums">{value}</p>
    </Link>
  );
}

function BrandPanel({
  title,
  href,
  brands,
}: {
  title: string;
  href: string;
  brands: BrandCount[];
}) {
  return (
    <section className="border border-hairline p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={href} className="text-sm text-accent hover:underline">
          Gestionar
        </Link>
      </div>
      {brands.length === 0 ? (
        <p className="mt-3 text-sm text-component">Sin registros.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {brands.map((b) => (
            <Chip key={b.marca} brand={b} big />
          ))}
        </div>
      )}
    </section>
  );
}

function Chip({ brand, big = false }: { brand: BrandCount; big?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-hairline ${
        big ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs"
      }`}
    >
      <span className="text-component">{brand.marca}</span>
      <span className="font-mono font-medium">{brand.count}</span>
    </span>
  );
}
