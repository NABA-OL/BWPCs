const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Formatea un valor en pesos colombianos: 1234567 → "$1.234.567". */
export function formatCOP(value: number): string {
  return COP.format(Math.round(value));
}

/** Formatea un número plano con separadores: 3736.09 → "3.736,09". */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
