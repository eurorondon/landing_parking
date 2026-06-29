"use client";
/**
 * TicketSobre — Etiqueta de sobre (227 × 391 pt)
 * Equivalente a GenerarPDFSobres.tsx del dashboard.
 * Una página por reserva.
 */
import React from "react";
import { Page, Text, Document, Font, View } from "@react-pdf/renderer";
import type { ReservaPDF } from "./tipos";
import { abrevTerminal } from "./tipos";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Me5Q.ttf" },
    {
      src: "https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmWUlfBBc9.ttf",
      fontWeight: "bold",
    },
  ],
});

const PLAN_LABEL: Record<number, string> = {
  1: "Plan Estándar",
  2: "Plan Premium",
  3: "Plan Priority",
};

interface Props {
  reservas: ReservaPDF[];
}

const TicketSobre: React.FC<Props> = ({ reservas }) => (
  <Document>
    {reservas.map((item, index) => {
      const esPagadoOnline =
        (item.pago_confirmado ?? 0) === 1 &&
        (item.id_tipo_pago === 5 || item.id_tipo_pago === 7);

      const serviciosFijos = item.servicios.filter((s) => s.fijo === 2);

      return (
        <Page
          key={index}
          size={[227, 391]}
          style={{
            padding: 14,
            backgroundColor: "#f8f8f8",
            fontFamily: "Roboto",
            position: "relative",
          }}
        >
          {/* ── Nro reserva (top-left) ── */}
          <View style={{ position: "absolute", top: 14, left: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              {item.nro_reserva}
            </Text>
          </View>

          {/* ── Importe y teléfono (top-right) ── */}
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 11, fontWeight: "bold", textTransform: "uppercase" }}>
              {esPagadoOnline ? "*PAGADO*" : "IMPORTE"} : {item.monto_total} €
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>
              TELF: {item.movil}
            </Text>
          </View>

          {/* ── Medio reserva (icono texto) ── */}
          <View style={{ marginTop: 4, marginBottom: 4 }}>
            <Text style={{ fontSize: 8 }}>
              {item.medio_reserva === 1
                ? "📞 TELÉFONO"
                : item.medio_reserva === 2
                ? "🏢 AGENCIA"
                : "🌐 WEB"}
            </Text>
          </View>

          {/* ── Matrícula ── */}
          <View style={{ alignItems: "center", marginTop: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 9, textTransform: "uppercase" }}>Matrícula</Text>
            <Text style={{ fontSize: 28, fontWeight: "bold" }}>{item.matricula}</Text>
          </View>

          {/* ── Marca - Modelo ── */}
          <View style={{ alignItems: "center", marginBottom: 6 }}>
            <Text style={{ fontSize: 9, textTransform: "uppercase" }}>Marca - Modelo</Text>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>{item.marcaModelo}</Text>
          </View>

          {/* ── Fecha Entrada + Terminal ── */}
          <View style={{ alignItems: "center", marginBottom: 4 }}>
            <Text style={{ fontSize: 9, textTransform: "uppercase" }}>Fecha de Entrada</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 10,
              }}
            >
              <View>
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>{item.fecha_entrada}</Text>
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>{item.hora_entrada}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                {abrevTerminal(item.terminal_entrada)}
              </Text>
            </View>
          </View>

          {/* ── Fecha Salida + Terminal ── */}
          <View style={{ alignItems: "center", marginBottom: 6 }}>
            <Text style={{ fontSize: 9, textTransform: "uppercase" }}>Fecha de Salida</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 10,
              }}
            >
              <View>
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>{item.fecha_salida}</Text>
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>{item.hora_salida}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                {abrevTerminal(item.terminal_salida)}
              </Text>
            </View>
          </View>

          {/* ── Separador ── */}
          <View
            style={{ borderBottomWidth: 1, borderBottomColor: "#333", marginBottom: 6 }}
          />

          {/* ── Plan ── */}
          {[1, 2, 3].includes(item.plan) && (
            <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 4 }}>
              {PLAN_LABEL[item.plan]}
            </Text>
          )}

          {/* ── Servicios incluidos ── */}
          {serviciosFijos.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 4 }}>
                INCLUYE:
              </Text>
              {serviciosFijos.map((s, i) => (
                <Text
                  key={i}
                  style={{ fontSize: 8, textTransform: "uppercase", marginBottom: 2 }}
                >
                  {s.nombre_servicio}
                </Text>
              ))}
            </View>
          )}

          {/* ── Pie: nombre cliente ── */}
          <View style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
            <View
              style={{ borderBottomWidth: 1, borderBottomColor: "#333", marginBottom: 6 }}
            />
            <Text style={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase" }}>
              CLIENTE: {item.nombre}
            </Text>
          </View>
        </Page>
      );
    })}
  </Document>
);

export default TicketSobre;
