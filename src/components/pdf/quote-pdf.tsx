/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { CATEGORY_LABELS } from "@/lib/categories";
import { formatCOP } from "@/lib/format";
import type { Quote } from "@/lib/db/types";

const COLORS = {
  panda: "#0A0A0A",
  vanilla: "#FAF8F3",
  gray: "#6B6B6B",
  hairline: "#E5E5E5",
  accent: "#C83C2A",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 44,
    paddingBottom: 70,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.panda,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  date: { fontSize: 8, color: COLORS.gray },
  brandBlock: { alignItems: "flex-end" },
  wordmark: { fontSize: 18, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  tagline: {
    fontSize: 6,
    color: COLORS.gray,
    letterSpacing: 2,
    marginTop: 2,
  },
  circles: { flexDirection: "row", marginTop: 6, gap: 4 },
  circle: { width: 9, height: 9, borderRadius: 4.5 },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 22,
    letterSpacing: 1,
  },
  optionLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 8,
  },
  table: { borderWidth: 1, borderColor: COLORS.hairline },
  thead: { flexDirection: "row", backgroundColor: COLORS.panda },
  th: {
    color: COLORS.vanilla,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: COLORS.hairline,
  },
  cell: { paddingVertical: 5, paddingHorizontal: 8, fontSize: 8.5 },
  cItem: { width: "34%", flexDirection: "row", alignItems: "center" },
  cItemCat: { fontFamily: "Helvetica-Bold", color: COLORS.panda },
  cItemModel: { color: COLORS.accent, fontFamily: "Helvetica-Bold" },
  cPrice: {
    width: "22%",
    fontFamily: "Courier",
    textAlign: "center",
    borderLeftWidth: 1,
    borderColor: COLORS.hairline,
  },
  cDesc: {
    width: "44%",
    color: COLORS.gray,
    borderLeftWidth: 1,
    borderColor: COLORS.hairline,
  },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: COLORS.hairline,
  },
  totalLabel: {
    width: "34%",
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  totalValue: {
    width: "22%",
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8.5,
    fontFamily: "Courier",
    textAlign: "center",
    borderLeftWidth: 1,
    borderColor: COLORS.hairline,
  },
  totalSpacer: {
    width: "44%",
    borderLeftWidth: 1,
    borderColor: COLORS.hairline,
  },
  grandTotal: { backgroundColor: "#F2EFE9" },
  note: { marginTop: 18, fontSize: 8, fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderColor: COLORS.hairline,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 7, color: COLORS.gray, letterSpacing: 1 },
  footerPay: { fontSize: 7, color: COLORS.panda, fontFamily: "Helvetica-Bold" },
});

function OptionTable({ option }: { option: Quote["opciones"][number] }) {
  return (
    <View style={styles.table}>
      <View style={styles.thead}>
        <Text style={[styles.th, { width: "34%" }]}>Item</Text>
        <Text style={[styles.th, { width: "22%" }]}>Precio</Text>
        <Text style={[styles.th, { width: "44%" }]}>Descripción</Text>
      </View>

      {option.items.map((it, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.cell, styles.cItem]}>
            <Text style={styles.cItemCat}>
              {CATEGORY_LABELS[it.categoria]}
              {it.modelo ? "  " : ""}
            </Text>
            <Text style={styles.cItemModel}>{it.modelo}</Text>
          </View>
          <Text style={[styles.cell, styles.cPrice]}>
            {formatCOP(it.precioCop)}
          </Text>
          <Text style={[styles.cell, styles.cDesc]}>{it.descripcion}</Text>
        </View>
      ))}

      {option.servicio > 0 && (
        <View style={styles.row}>
          <View style={[styles.cell, styles.cItem]}>
            <Text style={styles.cItemCat}>Servicio</Text>
          </View>
          <Text style={[styles.cell, styles.cPrice]}>
            {formatCOP(option.servicio)}
          </Text>
          <Text style={[styles.cell, styles.cDesc]}>
            Ensamblaje, formateo y configuración
          </Text>
        </View>
      )}

      <View style={[styles.totalRow, styles.grandTotal]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCOP(option.totales.base)}</Text>
        <View style={styles.totalSpacer} />
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Con Tarjeta</Text>
        <Text style={styles.totalValue}>
          {formatCOP(option.totales.conTarjeta)}
        </Text>
        <View style={styles.totalSpacer} />
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Con PSE / Bre-B</Text>
        <Text style={styles.totalValue}>
          {formatCOP(option.totales.conPse)}
        </Text>
        <View style={styles.totalSpacer} />
      </View>
    </View>
  );
}

export function QuotePDF({
  quote,
  contactWhatsapp,
  contactEmail,
  logo,
}: {
  quote: Quote;
  contactWhatsapp: string;
  contactEmail: string;
  logo?: string;
}) {
  const fecha = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
  }).format(new Date(quote.fecha));

  return (
    <Document
      title={`Cotización ${quote.codigo}`}
      author="B & W"
      creator="B & W"
    >
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{fecha}</Text>
            <Text style={[styles.date, { marginTop: 2 }]}>
              Cotización {quote.codigo}
              {quote.cliente ? ` · ${quote.cliente}` : ""}
            </Text>
          </View>
          <View style={styles.brandBlock}>
            <Text style={styles.wordmark}>B &amp; W</Text>
            <Text style={styles.tagline}>TU PC MASTER RACE A BUEN PRECIO</Text>
            <View style={styles.circles}>
              <View
                style={[styles.circle, { backgroundColor: COLORS.panda }]}
              />
              <View style={[styles.circle, { backgroundColor: COLORS.gray }]} />
              <View
                style={[styles.circle, { backgroundColor: COLORS.hairline }]}
              />
            </View>
          </View>
        </View>

        <Text style={styles.title}>COTIZACIÓN</Text>

        {quote.opciones.map((opt, i) => (
          <View key={i} wrap={false}>
            <Text style={styles.optionLabel}>
              {opt.titulo?.toUpperCase() || `OPCIÓN ${i + 1}`}
            </Text>
            <OptionTable option={opt} />
          </View>
        ))}

        <Text style={styles.note}>*Precio sujeto a cambios</Text>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {logo ? (
              <Image src={logo} style={{ width: 22, height: 22 }} />
            ) : null}
            <Text style={styles.footerPay}>Bre-B · Bold · Tarjeta · PSE</Text>
          </View>
          <Text style={styles.footerText}>
            {contactWhatsapp} · {contactEmail.toUpperCase()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
