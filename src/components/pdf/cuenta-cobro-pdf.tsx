// Desarrollado por BlacKraken Solutions
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatCOP } from "@/lib/format";
import type { CuentaCobro } from "@/lib/db/types";

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
  tagline: { fontSize: 6, color: COLORS.gray, letterSpacing: 2, marginTop: 2 },
  circles: { flexDirection: "row", marginTop: 6, gap: 4 },
  circle: { width: 9, height: 9, borderRadius: 4.5 },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 22,
    letterSpacing: 1,
  },
  blockLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 4,
  },
  blockText: { fontSize: 9, marginBottom: 1 },
  partiesRow: { flexDirection: "row", gap: 24, marginBottom: 20 },
  partyCol: { flex: 1 },
  table: { borderWidth: 1, borderColor: COLORS.hairline, marginTop: 4 },
  thead: { flexDirection: "row", backgroundColor: COLORS.panda },
  th: {
    color: COLORS.vanilla,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  row: { flexDirection: "row", borderTopWidth: 1, borderColor: COLORS.hairline },
  cell: { paddingVertical: 5, paddingHorizontal: 8, fontSize: 8.5 },
  cDesc: { width: "46%" },
  cQty: {
    width: "12%",
    fontFamily: "Courier",
    textAlign: "center",
    borderLeftWidth: 1,
    borderColor: COLORS.hairline,
  },
  cUnit: {
    width: "21%",
    fontFamily: "Courier",
    textAlign: "center",
    borderLeftWidth: 1,
    borderColor: COLORS.hairline,
  },
  cTotal: {
    width: "21%",
    fontFamily: "Courier",
    textAlign: "center",
    borderLeftWidth: 1,
    borderColor: COLORS.hairline,
  },
  totalRow: { flexDirection: "row", borderTopWidth: 1, borderColor: COLORS.hairline },
  totalLabel: {
    width: "58%",
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  totalValue: {
    width: "21%",
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8.5,
    fontFamily: "Courier",
    textAlign: "center",
    borderLeftWidth: 1,
    borderColor: COLORS.hairline,
  },
  totalSpacer: { width: "21%", borderLeftWidth: 1, borderColor: COLORS.hairline },
  grandTotal: { backgroundColor: "#F2EFE9" },
  bankBlock: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    padding: 12,
  },
  signBlock: { marginTop: 30, alignItems: "flex-start" },
  signImage: { width: 120, height: 48, objectFit: "contain", marginBottom: 4 },
  signLine: {
    width: 180,
    borderTopWidth: 1,
    borderColor: COLORS.panda,
    marginTop: 4,
    paddingTop: 4,
  },
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
});

export function CuentaCobroPDF({
  cuenta,
  contactWhatsapp,
  contactEmail,
  logo,
}: {
  cuenta: CuentaCobro;
  contactWhatsapp: string;
  contactEmail: string;
  logo?: string;
}) {
  const fecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "short" }).format(
    new Date(cuenta.fecha),
  );

  return (
    <Document
      title={`Cuenta de cobro ${cuenta.numero}`}
      author="B & W"
      creator="B & W"
    >
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{fecha}</Text>
            <Text style={[styles.date, { marginTop: 2 }]}>
              Cuenta de cobro {cuenta.numero}
            </Text>
          </View>
          <View style={styles.brandBlock}>
            <Text style={styles.wordmark}>B &amp; W</Text>
            <Text style={styles.tagline}>TU PC MASTER RACE A BUEN PRECIO</Text>
            <View style={styles.circles}>
              <View style={[styles.circle, { backgroundColor: COLORS.panda }]} />
              <View style={[styles.circle, { backgroundColor: COLORS.gray }]} />
              <View style={[styles.circle, { backgroundColor: COLORS.hairline }]} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>CUENTA DE COBRO</Text>

        {/* Cliente / Cuenta bancaria */}
        <View style={styles.partiesRow}>
          <View style={styles.partyCol}>
            <Text style={styles.blockLabel}>CLIENTE</Text>
            <Text style={styles.blockText}>{cuenta.cliente.nombre}</Text>
            {cuenta.cliente.identificacion && (
              <Text style={styles.blockText}>
                C.C./NIT {cuenta.cliente.identificacion}
              </Text>
            )}
            {cuenta.cliente.direccion && (
              <Text style={styles.blockText}>{cuenta.cliente.direccion}</Text>
            )}
            {cuenta.cliente.telefono && (
              <Text style={styles.blockText}>{cuenta.cliente.telefono}</Text>
            )}
            {cuenta.cliente.email && (
              <Text style={styles.blockText}>{cuenta.cliente.email}</Text>
            )}
          </View>
        </View>

        {/* Tabla de ítems */}
        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.th, { width: "46%" }]}>Descripción</Text>
            <Text style={[styles.th, { width: "12%" }]}>Cant.</Text>
            <Text style={[styles.th, { width: "21%" }]}>Valor unit.</Text>
            <Text style={[styles.th, { width: "21%" }]}>Valor total</Text>
          </View>

          {cuenta.items.map((it, i) => (
            <View key={i} style={styles.row}>
              <Text style={[styles.cell, styles.cDesc]}>{it.descripcion}</Text>
              <Text style={[styles.cell, styles.cQty]}>{it.cantidad}</Text>
              <Text style={[styles.cell, styles.cUnit]}>
                {formatCOP(it.valorUnitario)}
              </Text>
              <Text style={[styles.cell, styles.cTotal]}>
                {formatCOP(it.cantidad * it.valorUnitario)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCOP(cuenta.subtotal)}</Text>
            <View style={styles.totalSpacer} />
          </View>
          {cuenta.descuentoValor > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Descuento ({cuenta.descuentoPct}%)
              </Text>
              <Text style={styles.totalValue}>
                -{formatCOP(cuenta.descuentoValor)}
              </Text>
              <View style={styles.totalSpacer} />
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCOP(cuenta.total)}</Text>
            <View style={styles.totalSpacer} />
          </View>
        </View>

        {/* Cuenta bancaria — cuenta normal y/o llave Bre-B, lo que aplique */}
        <View style={styles.bankBlock} wrap={false}>
          <Text style={styles.blockLabel}>CONSIGNAR A</Text>
          <Text style={styles.blockText}>{cuenta.cuentaBanco.banco}</Text>
          {cuenta.cuentaBanco.numero && (
            <Text style={styles.blockText}>
              {cuenta.cuentaBanco.tipoCuenta} N.° {cuenta.cuentaBanco.numero}
            </Text>
          )}
          {cuenta.cuentaBanco.llave && (
            <Text style={styles.blockText}>
              Transferencia inmediata Bre-B: {cuenta.cuentaBanco.llave}
            </Text>
          )}
          <Text style={styles.blockText}>
            Titular: {cuenta.cuentaBanco.titular}
          </Text>
        </View>

        {/* Firma */}
        <View style={styles.signBlock} wrap={false}>
          {cuenta.firmante.firmaBase64 && (
            <Image
              src={`data:image/png;base64,${cuenta.firmante.firmaBase64}`}
              style={styles.signImage}
            />
          )}
          <View style={styles.signLine}>
            <Text style={styles.blockText}>{cuenta.firmante.nombre}</Text>
            {cuenta.firmante.cedula && (
              <Text style={styles.blockText}>C.C. {cuenta.firmante.cedula}</Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {logo ? <Image src={logo} style={{ width: 22, height: 22 }} /> : null}
          </View>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${contactWhatsapp}  ·  ${contactEmail.toUpperCase()}  ·  ${pageNumber}/${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
