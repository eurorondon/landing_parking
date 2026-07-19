"use client";

import { useState } from "react";
import { fmtCurrency, fmtDateTime, type ReservaAdmin, type ReservaStatus } from "@/lib/admin";
import { Badge, TypeBadge } from "./ui";

interface Props {
  reserva: ReservaAdmin;
  onClose: () => void;
  onChangeStatus: (id: string, status: ReservaStatus) => void;
  onEdit: (r: ReservaAdmin) => void;
  onDelete: (id: string) => void;
  /** Reenvía la confirmación; `guardar` decide si el correo se fija en la ficha */
  onResendEmail: (id: string, email: string, guardar: boolean) => Promise<void>;
}

export default function DetailModal({ reserva: r, onClose, onChangeStatus, onEdit, onDelete, onResendEmail }: Props) {
  const [email, setEmail] = useState(r.email);
  const [guardarEmail, setGuardarEmail] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Solo tiene sentido guardar si el correo escrito difiere del de la ficha
  const emailCambiado = email.trim() !== r.email.trim();

  async function reenviar() {
    setEnviando(true);
    try {
      await onResendEmail(r.id, email.trim(), emailCambiado && guardarEmail);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal wide">
        <div className="modal-header">
          <div className="modal-title">Reserva {r.id}</div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <div className="detail-section-title">Estado actual</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Badge status={r.status} /> <TypeBadge type={r.vehicleType} />
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Datos del cliente</div>
            <div className="detail-grid">
              <div><div className="detail-label">Nombre</div><div className="detail-value">{r.name}</div></div>
              <div><div className="detail-label">Teléfono</div><div className="detail-value">{r.phone}</div></div>
              <div><div className="detail-label">Correo</div><div className="detail-value" style={{ fontSize: 13 }}>{r.email}</div></div>
              <div><div className="detail-label">Terminal</div><div className="detail-value">{r.terminal}</div></div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Vehículo</div>
            <div className="detail-grid">
              <div><div className="detail-label">Matrícula</div><div className="detail-value"><span className="td-mono">{r.plate}</span></div></div>
              <div><div className="detail-label">Modelo</div><div className="detail-value">{r.model || "—"}</div></div>
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-title">Fechas</div>
            <div className="detail-grid">
              <div><div className="detail-label">Entrada</div><div className="detail-value">{fmtDateTime(r.checkIn)}</div></div>
              <div><div className="detail-label">Salida</div><div className="detail-value">{fmtDateTime(r.checkOut)}</div></div>
            </div>
          </div>

          <div className="price-preview" style={{ marginTop: 4 }}>
            <span className="price-preview-label">Precio total</span>
            <span className="price-preview-val">{fmtCurrency(r.price)}</span>
          </div>

          <div className="detail-section" style={{ marginTop: 16 }}>
            <div className="detail-section-title">Confirmación por correo</div>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--gray-500)", lineHeight: 1.5 }}>
              Reenvía el mismo correo de confirmación que se envió al reservar. Puedes
              cambiar la dirección para enviarlo a otro sitio.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@cliente.com"
                style={{ flex: "1 1 240px" }}
              />
              <button
                className="btn btn-amber"
                onClick={reenviar}
                disabled={enviando || !email.trim()}
              >
                {enviando ? "Enviando…" : "📧 Reenviar confirmación"}
              </button>
            </div>
            {emailCambiado && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "var(--gray-600)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={guardarEmail}
                  onChange={(e) => setGuardarEmail(e.target.checked)}
                />
                Guardar <strong>{email.trim()}</strong> como correo del cliente
                <span style={{ color: "var(--gray-500)" }}>
                  (déjalo sin marcar para un envío puntual)
                </span>
              </label>
            )}
          </div>

          {r.notes && (
            <div style={{ marginTop: 14, padding: 12, background: "var(--gray-50)", borderRadius: "var(--radius-sm)", fontSize: 13.5, color: "var(--gray-600)" }}>
              📝 {r.notes}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {r.status === "confirmed" && (
            <button className="btn btn-primary" onClick={() => onChangeStatus(r.id, "inside")}>🅿️ Marcar activa</button>
          )}
          {r.status === "inside" && (
            <button className="btn btn-ghost" onClick={() => onChangeStatus(r.id, "finished")}>🏁 Finalizar</button>
          )}
          {r.status !== "cancelled" && r.status !== "finished" && (
            <button className="btn btn-danger" onClick={() => onChangeStatus(r.id, "cancelled")}>🚫 Cancelar</button>
          )}
          <button className="btn btn-ghost" onClick={() => onEdit(r)}>✏️ Editar</button>
          <button className="btn btn-danger" onClick={() => onDelete(r.id)}>🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  );
}
