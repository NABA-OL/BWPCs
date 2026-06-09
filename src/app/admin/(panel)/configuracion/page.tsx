import type { Metadata } from "next";
import { getSettings } from "@/lib/admin/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Configuración",
  robots: { index: false, follow: false },
};

export default async function ConfiguracionPage() {
  let error: string | null = null;
  let initial = null;

  try {
    const s = await getSettings();
    initial = {
      trmScrapeado: s.trmScrapeado,
      trmManual: s.trmManual,
      trmRecargo: s.trmRecargo,
      envioCPU: s.envioCPU,
      envioGPU: s.envioGPU,
      servicioBase: s.servicioBase,
      tarjetaPct: Math.round(s.mediosPago.tarjeta * 1000) / 10,
      psePct: Math.round(s.mediosPago.pse * 1000) / 10,
      whatsapp: s.contacto.whatsapp,
      email: s.contacto.email,
      wordmarkPhrases: s.wordmarkPhrases ?? [],
    };
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar la configuración.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Configuración</h1>
        <p className="mt-1 text-component">
          TRM, envíos, servicio, recargos de pago y datos de contacto.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        initial && <SettingsForm initial={initial} />
      )}
    </>
  );
}
