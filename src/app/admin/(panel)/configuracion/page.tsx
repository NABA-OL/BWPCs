/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { getSettings } from "@/lib/admin/settings";
import { collections } from "@/lib/db/collections";
import { SettingsForm } from "@/components/admin/settings-form";
import { TrmRefreshButton } from "@/components/admin/trm-refresh-button";

export const metadata: Metadata = {
  title: "Configuración",
  robots: { index: false, follow: false },
};

export default async function ConfiguracionPage() {
  let error: string | null = null;
  let initial = null;
  let trmActualizado: Date | null = null;

  try {
    const [s, admins, banks] = await Promise.all([
      getSettings(),
      collections.admins().then((c) => c.find({}).sort({ usuario: 1 }).toArray()),
      collections.bankAccounts().then((c) => c.find({}).sort({ creado: 1 }).toArray()),
    ]);
    trmActualizado = s.trmActualizado;
    initial = {
      trmScrapeado: s.trmScrapeado,
      trmManual: s.trmManual,
      trmRecargo: s.trmRecargo,
      envioCPU: s.envioCPU,
      envioGPU: s.envioGPU,
      envioComponentes: s.envioComponentes ?? {},
      servicioBase: s.servicioBase,
      tarjetaPct: Math.round(s.mediosPago.tarjeta * 1000) / 10,
      psePct: Math.round(s.mediosPago.pse * 1000) / 10,
      breBPct: Math.round((s.mediosPago.breB ?? 0) * 1000) / 10,
      whatsapp: s.contacto.whatsapp,
      email: s.contacto.email,
      wordmarkPhrases: s.wordmarkPhrases ?? [],
      firmanteDefaultId: s.firmanteDefaultId ?? "",
      bancoDefaultId: s.bancoDefaultId ?? "",
      firmantes: admins.map((a) => ({
        id: a._id!.toString(),
        label: `${a.nombreCompleto?.trim() || a.usuario}${a.firmaBase64 ? "" : " (sin firma cargada)"}`,
      })),
      bancos: banks.map((b) => ({
        id: b._id!.toString(),
        label: `${b.banco}${b.llave ? " · llave Bre-B" : ""}${b.numero ? ` · ${b.tipoCuenta} ${b.numero}` : ""}`,
      })),
    };
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Error al cargar la configuración.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Configuración
        </h1>
        <p className="mt-1 text-component">
          TRM, envíos, servicio, recargos de pago y datos de contacto.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        initial && (
          <>
            <section className="mt-8 border border-hairline p-6">
              <h2 className="text-lg font-semibold">TRM automática</h2>
              <p className="mt-1 text-sm text-component">
                Valor oficial de la Superintendencia Financiera de Colombia. Se
                actualiza solo cada día (cron) y puedes refrescarlo a demanda.
                El TRM manual de abajo, si lo defines, tiene prioridad.
              </p>
              <div className="mt-4">
                <TrmRefreshButton actualizado={trmActualizado} />
              </div>
            </section>
            <SettingsForm initial={initial} />
          </>
        )
      )}
    </>
  );
}
