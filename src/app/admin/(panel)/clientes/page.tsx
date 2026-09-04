/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
import {
  ClientManager,
  type ClientRow,
} from "@/components/admin/client-manager";

export const metadata: Metadata = {
  title: "Clientes",
  robots: { index: false, follow: false },
};

export default async function ClientesPage() {
  let rows: ClientRow[] = [];
  let error: string | null = null;

  try {
    const col = await collections.clients();
    const docs = await col.find({}).sort({ nombre: 1 }).toArray();
    rows = docs.map((c) => ({
      id: c._id!.toString(),
      nombre: c.nombre,
      identificacion: c.identificacion,
      direccion: c.direccion,
      telefono: c.telefono,
      email: c.email,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar clientes.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Clientes</h1>
        <p className="mt-1 text-component">
          Clientes guardados para reutilizar en cuentas de cobro.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <ClientManager rows={rows} />
      )}
    </>
  );
}
