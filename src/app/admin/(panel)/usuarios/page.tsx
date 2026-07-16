// Desarrollado por BlacKraken Solutions
import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { UsersManager, type AdminRow } from "@/components/admin/users-manager";

export const metadata: Metadata = {
  title: "Usuarios",
  robots: { index: false, follow: false },
};

const fmtDate = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function UsuariosPage() {
  const session = await getSession();
  let rows: AdminRow[] = [];
  let currentNombreCompleto = "";
  let currentCedula = "";
  let currentFirmaBase64: string | null = null;
  let error: string | null = null;

  try {
    const col = await collections.admins();
    const docs = await col.find({}).sort({ creado: 1 }).toArray();
    rows = docs.map((a) => ({
      id: a._id!.toString(),
      usuario: a.usuario,
      nombreCompleto: a.nombreCompleto ?? "",
      creado: a.creado ? fmtDate.format(new Date(a.creado)) : "—",
    }));
    const current = docs.find((a) => a._id!.toString() === session?.sub);
    currentNombreCompleto = current?.nombreCompleto ?? "";
    currentCedula = current?.cedula ?? "";
    currentFirmaBase64 = current?.firmaBase64 ?? null;
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar los usuarios.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-component">
          Cambia tu contraseña y administra los usuarios del panel.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <UsersManager
          admins={rows}
          currentUserId={session?.sub ?? ""}
          currentUser={session?.usuario ?? ""}
          currentNombreCompleto={currentNombreCompleto}
          currentCedula={currentCedula}
          currentFirmaBase64={currentFirmaBase64}
        />
      )}
    </>
  );
}
