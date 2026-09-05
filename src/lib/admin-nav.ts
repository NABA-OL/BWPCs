/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
export interface AdminNavItem {
  label: string;
  href: string;
  ready: boolean; // false = sección por construir (fases posteriores)
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export type AdminNavEntry = AdminNavItem | AdminNavGroup;

export function isAdminNavGroup(entry: AdminNavEntry): entry is AdminNavGroup {
  return "items" in entry;
}

export const adminNav: AdminNavEntry[] = [
  { label: "Resumen", href: "/admin", ready: true },
  {
    label: "Partes",
    items: [
      { label: "Procesadores", href: "/admin/procesadores", ready: true },
      { label: "Gráficas", href: "/admin/graficas", ready: true },
      { label: "Componentes", href: "/admin/componentes", ready: true },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "Solicitudes", href: "/admin/solicitudes", ready: true },
      { label: "Cotizador", href: "/admin/promedios", ready: true },
      { label: "Cotizaciones", href: "/admin/cotizaciones", ready: true },
      { label: "Cuentas de cobro", href: "/admin/cuentas-cobro", ready: true },
      { label: "Clientes", href: "/admin/clientes", ready: true },
      { label: "Cuentas bancarias", href: "/admin/cuentas-bancarias", ready: true },
      { label: "Ensambles", href: "/admin/ensambles", ready: true },
    ],
  },
  {
    label: "Contenido",
    items: [
      { label: "Noticias", href: "/admin/noticias", ready: true },
      { label: "Blog", href: "/admin/blog", ready: true },
    ],
  },
  {
    label: "Administración",
    items: [
      { label: "Usuarios", href: "/admin/usuarios", ready: true },
      { label: "Configuración", href: "/admin/configuracion", ready: true },
    ],
  },
];
