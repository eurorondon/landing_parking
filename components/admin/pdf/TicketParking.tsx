"use client";
/**
 * TicketParking — Ticket pequeño de parking (227 × 198 pt)
 * Formato idéntico a GenerarPDFTicketParking.tsx del dashboard.
 *
 * ⚠️ FIX v4: con padding:20 en todos lados el contenido overflow.
 *    Se usa paddingHorizontal:20 / paddingVertical:8 para mantener
 *    el aspecto visual con el contenido en una sola página.
 */
import React from "react";
import { Page, Text, Document, Font, View } from "@react-pdf/renderer";
import type { ReservaPDF } from "./tipos";

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

interface Props {
  reservas: ReservaPDF[];
}

const TicketParking: React.FC<Props> = ({ reservas }) => (
  <Document>
    {reservas.map((item, index) => (
      <Page
        key={index}
        size={[227, 198]}
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 8,       // reducido de 20→8 para que el contenido quepa en 1 página
          paddingBottom: 8,
          backgroundColor: "#f8f8f8",
          fontFamily: "Roboto",
        }}
      >
        <View style={{ alignItems: "center", marginTop: 10 }}>
          {/* Matrícula */}
          <Text style={{ fontSize: 12, textTransform: "uppercase" }}>
            Matrícula
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", marginTop: 8 }}>
            {item.matricula}
          </Text>

          {/* Fecha de Salida */}
          <Text
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              marginTop: 18,
            }}
          >
            Fecha de Salida
          </Text>
          <Text style={{ fontSize: 30, fontWeight: "bold", marginTop: 8 }}>
            {item.fecha_salida}
          </Text>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            {item.hora_salida}
          </Text>
        </View>
      </Page>
    ))}
  </Document>
);

export default TicketParking;
