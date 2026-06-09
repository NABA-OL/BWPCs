export interface AdminNavItem {
  label: string;
  href: string;
  ready: boolean; // false = sección por construir (fases posteriores)
}

export const adminNav: AdminNavItem[] = [
  { label: "Resumen", href: "/admin", ready: true },
  { label: "Procesadores", href: "/admin/procesadores", ready: true },
  { label: "Gráficas", href: "/admin/graficas", ready: true },
  { label: "Componentes", href: "/admin/componentes", ready: true },
  { label: "Promedios", href: "/admin/promedios", ready: true },
  { label: "Cotizaciones", href: "/admin/cotizaciones", ready: true },
  { label: "Configuración", href: "/admin/configuracion", ready: true },
];
