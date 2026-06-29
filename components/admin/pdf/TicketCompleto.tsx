"use client";
/**
 * TicketCompleto — Ticket térmico completo (227 × 637.8 pt)
 * Formato idéntico a GenerarPDFTicket.tsx del dashboard.
 */
import React from "react";
import { Page, Text, Document, Font, View, Image } from "@react-pdf/renderer";
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

/** Icono del canal de reserva */
function medioIcon(medio: number): string {
  if (medio === 1) return "/phone.png";
  if (medio === 2) return "/tags.png";
  return "/globe.png";
}

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
          {/* ── Fila superior: nro reserva | importe + teléfono ── */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                {item.nro_reserva}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-end",
                fontSize: 9,
                fontWeight: "bold",
              }}
            >
              <Text style={{ textTransform: "uppercase" }}>
                {esPagadoOnline ? "*PAGADO*" : "IMPORTE"} : {item.monto_total} €
              </Text>
              <Text>TELEFONO : {item.movil}</Text>
            </View>
          </View>

          {/* ── Icono medio reserva ── */}
          <View style={{ position: "relative" }}>
            <View style={{ fontSize: 8 }}>
              <Image
                src={medioIcon(item.medio_reserva)}
                style={{ width: 18, height: 18, marginRight: 5 }}
              />
            </View>
          </View>

          {/* ── Logo ── */}
          <View style={{ alignItems: "center" }}>
            <Image
              src="/logo.jpg"
              style={{ width: 113, height: 113 }}
            />
          </View>

          {/* ── Matrícula ── */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            <Text style={{ fontSize: 9 }}>MATRÍCULA</Text>
            <Text style={{ fontSize: 28 }}> {item.matricula}</Text>
          </View>

          {/* ── Marca – Modelo ── */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 10,
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>MARCA - MODELO</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {item.marcaModelo}
            </Text>
          </View>

          {/* ── Fecha de Entrada ── */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 10,
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>FECHA DE ENTRADA</Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingHorizontal: 15,
              }}
            >
              <View style={{ textAlign: "left" }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
                  {item.fecha_entrada}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
                  {item.hora_entrada}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
                  {abrevTerminal(item.terminal_entrada)}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Fecha de Salida ── */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>FECHA DE SALIDA</Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingHorizontal: 15,
              }}
            >
              <View style={{ textAlign: "left" }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
                  {item.fecha_salida}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
                  {item.hora_salida}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "bold", textTransform: "uppercase" }}>
                  {abrevTerminal(item.terminal_salida)}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Plan ── */}
          {[1, 2, 3, 4].includes(item.plan ?? 0) && (
            <View style={{ marginTop: 8, marginBottom: 0 }}>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                {item.plan === 1
                  ? "PLAN ESTÁNDAR"
                  : item.plan === 2
                  ? "PLAN PREMIUM"
                  : item.plan === 3
                  ? "PLAN PRIORITY"
                  : "PLAN ECONÓMICO"}
              </Text>
            </View>
          )}

          {/* ── Servicios incluidos ── */}
          <View style={{ minHeight: 100, position: "relative" }}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "#717171",
                marginTop: 10,
              }}
            />
            {serviciosFijos.length > 0 && (
              <View style={{ marginBottom: 15 }}>
                <Text
                  style={{
                    marginTop: 5,
                    marginBottom: 7,
                    fontWeight: "bold",
                    fontSize: 9,
                  }}
                >
                  INCLUYE:
                </Text>
                {serviciosFijos.map((s, i) => (
                  <Text
                    key={i}
                    style={{
                      textTransform: "uppercase",
                      fontSize: 8,
                      fontWeight: "bold",
                      marginBottom: 2,
                    }}
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
                marginBottom: 5,
                position: "absolute",
                bottom: 0,
                width: "100%",
              }}
            />
          </View>

          {/* ── Footer ── */}
          <View style={{ textAlign: "center" }}>
            <Text style={{ fontSize: 8, fontWeight: "bold" }}>
              ASISTENCIA EN EL AEROPUERTO: +34 622 14 50 87
            </Text>
            <Text
              style={{
                fontSize: 6,
                fontWeight: "bold",
                marginVertical: 5,
              }}
            >
              EL PARKING NO SE HACE RESPONSABLE DE LA ROTURA DE CRISTALES,
              DAÑOS MECÁNICOS Y OBJETOS NO DECLARADOS.
            </Text>
            <Text
              style={{
                fontSize: 6,
                fontWeight: "bold",
                marginVertical: 2,
                textTransform: "uppercase",
              }}
            >
              PARKING AERO MADRID INFORMA A SUS CLIENTES QUE DEBEN TOMAR
              FOTOS/VÍDEOS DE SUS VEHÍCULOS EN LA ENTREGA DEL MISMO EN LA
              TERMINAL DEL AEROPUERTO PARA PODER RECLAMAR CUALQUIER
              DESPERFECTO EN LA RECOGIDA A SU REGRESO.
            </Text>
            <Text style={{ fontSize: 10, fontWeight: "bold", marginTop: 5 }}>
              GRACIAS POR PREFERIRNOS
            </Text>
          </View>
        </Page>
      );
    })}
  </Document>
);

export default TicketCompleto;
