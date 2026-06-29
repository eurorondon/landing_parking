"use client";
/**
 * TicketCompleto — Ticket térmico completo (227 × 637.8 pt)
 * Equivalente a GenerarPDFTicket.tsx del dashboard.
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
  1: "PLAN ESTÁNDAR",
  2: "PLAN PREMIUM",
  3: "PLAN PRIORITY",
};

interface Props {
  reservas: ReservaPDF[];
}

const TicketCompleto: React.FC<Props> = ({ reservas }) => (
  <Document>
    {reservas.map((item, index) => {
      const esPagadoOnline =
        (item.pago_confirmado ?? 0) === 1 &&
        (item.id_tipo_pago === 5 || item.id_tipo_pago === 7);

      const serviciosFijos = item.servicios.filter((s) => s.fijo === 2);

      return (
        <Page
          key={index}
          size={[227, 637.8]}
          style={{
            paddingTop: 28,
            paddingBottom: 28,
            paddingLeft: 14,
            paddingRight: 14,
            backgroundColor: "#f8f8f8",
            fontFamily: "Roboto",
          }}
        >
          {/* ── Cabecera: nro reserva + importe/teléfono ── */}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "bold", fontSize: 14 }}>
              {item.nro_reserva}
            </Text>
            <View style={{ alignItems: "flex-end", fontSize: 9, fontWeight: "bold" }}>
              <Text style={{ textTransform: "uppercase" }}>
                {esPagadoOnline ? "*PAGADO*" : "IMPORTE"} : {item.monto_total} €
              </Text>
              <Text>TELEFONO : {item.movil}</Text>
            </View>
          </View>

          {/* ── Logo / nombre ── */}
          <View style={{ alignItems: "center", marginTop: 10, marginBottom: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", letterSpacing: 0.5 }}>
              PARKING AERO MADRID
            </Text>
            <Text style={{ fontSize: 7, marginTop: 2, letterSpacing: 1 }}>
              AEROPUERTO MADRID-BARAJAS · T1-T2-T3-T4
            </Text>
            <Text style={{ fontSize: 7, marginTop: 2 }}>
              parkingaeromadrid.es
            </Text>
          </View>

          {/* ── Matrícula ── */}
          <View style={{ alignItems: "center", marginVertical: 8 }}>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>MATRÍCULA</Text>
            <Text style={{ fontSize: 28, fontWeight: "bold", letterSpacing: 2 }}>
              {item.matricula}
            </Text>
          </View>

          {/* ── Marca – Modelo ── */}
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>MARCA - MODELO</Text>
            <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
              {item.marcaModelo}
            </Text>
          </View>

          {/* ── Fecha de entrada ── */}
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>FECHA DE ENTRADA</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 15,
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

          {/* ── Fecha de salida ── */}
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>FECHA DE SALIDA</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 15,
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

          {/* ── Plan ── */}
          {[1, 2, 3].includes(item.plan) && (
            <View style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                {PLAN_LABEL[item.plan] ?? "PLAN ESTÁNDAR"}
              </Text>
            </View>
          )}

          {/* ── Servicios incluidos ── */}
          <View style={{ minHeight: 80 }}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#717171",
                marginVertical: 8,
              }}
            />
            {serviciosFijos.length > 0 && (
              <View>
                <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 5 }}>
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
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#717171",
                marginTop: 10,
              }}
            />
          </View>

          {/* ── Footer ── */}
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <Text style={{ fontSize: 8, fontWeight: "bold" }}>
              ASISTENCIA: +34 622 14 50 87
            </Text>
            <Text style={{ fontSize: 6, marginVertical: 4, textAlign: "center" }}>
              EL PARKING NO SE HACE RESPONSABLE DE ROTURA DE CRISTALES,
              DAÑOS MECÁNICOS Y OBJETOS NO DECLARADOS.
            </Text>
            <Text
              style={{
                fontSize: 6,
                textAlign: "center",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              PARKING AERO MADRID INFORMA A SUS CLIENTES QUE DEBEN TOMAR
              FOTOS/VÍDEOS DE SUS VEHÍCULOS EN LA ENTREGA EN LA TERMINAL
              PARA PODER RECLAMAR CUALQUIER DESPERFECTO A SU REGRESO.
            </Text>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              GRACIAS POR PREFERIRNOS
            </Text>
          </View>
        </Page>
      );
    })}
  </Document>
);

export default TicketCompleto;
