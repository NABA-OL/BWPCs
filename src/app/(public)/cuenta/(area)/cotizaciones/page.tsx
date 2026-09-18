/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { redirect } from "next/navigation";

// La lista de cotizaciones ahora es la página principal de la cuenta (/cuenta).
// Se conserva esta ruta para enlaces antiguos.
export default function CotizacionesRedirect() {
  redirect("/cuenta");
}
