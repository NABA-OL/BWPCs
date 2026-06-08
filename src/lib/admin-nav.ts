export interface AdminNavItem {
  label: string;
  href: string;
  ready: boolean; // false = sección por construir (fases posteriores)
}

export const adminNav: AdminNavItem[] = [
  { label: "Resumen", href: "/admin", ready: true },
  { label: "Procesadores", href: "/admin/procesadores", ready: false },
  { label: "Gráficas", href: "/admin/graficas", ready: false },
  { label: "Componentes", href: "/admin/componentes", ready: false },
  { label: "Promedios", href: "/admin/promedios", ready: false },
  { label: "Cotizaciones", href: "/admin/cotizaciones", ready: false },
  { label: "Configuración", href: "/admin/configuracion", ready: true },
];
