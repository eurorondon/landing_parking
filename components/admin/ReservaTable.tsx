"use client";

import { fmtCurrency, fmtDateTime, type ReservaAdmin } from "@/lib/admin";
import { Badge, EmptyState, TypeBadge } from "./ui";

interface Props {
  rows: ReservaAdmin[];
  onDetail: (id: string) => void;
  onEdit: (r: ReservaAdmin) => void;
  onDelete: (id: string) => void;
}

/**
 * Listado de reservas adaptable:
 * - Escritorio: tabla completa.
 * - Móvil (≤768px): tarjetas táctiles (el cambio se hace por CSS
 *   con .res-table-desktop / .res-cards).
 */
export default function ReservaTable({ rows, onDetail, onEdit, onDelete }: Props) {
  if (rows.length === 0) return <EmptyState icon="📋" text="No hay reservas que mostrar." />;

  return (
    <>
      {/* ── Vista escritorio: tabla ── */}
      <table className="res-table-desktop">
        <thead>
          <tr>
            <th>ID</th><th>Cliente</th><th>Vehículo</th><th>Terminal</th>
            <th>Entrada</th><th>Salida</th><th>Precio</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><span className="td-mono">{r.id}</span></td>
              <td>
                <div className="td-name">{r.name}</div>
                <div style={{ fontSize: 12, color: "var(--gray-400)" }}>{r.phone}</div>
              </td>
              <td>
                <TypeBadge type={r.vehicleType} />
                <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 3 }}>{r.plate}</div>
              </td>
              <td><span style={{ fontWeight: 500, color: "var(--teal-600)" }}>{r.terminal}</span></td>
              <td>{fmtDateTime(r.checkIn)}</td>
              <td>{fmtDateTime(r.checkOut)}</td>
              <td style={{ fontWeight: 500, color: "var(--gray-900)" }}>{fmtCurrency(r.price)}</td>
              <td><Badge status={r.status} /></td>
              <td>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost btn-sm btn-icon" title="Ver detalle" onClick={() => onDetail(r.id)}>👁️</button>
                  <button className="btn btn-ghost btn-sm btn-icon" title="Editar" onClick={() => onEdit(r)}>✏️</button>
                  <button className="btn btn-danger btn-sm btn-icon" title="Eliminar" onClick={() => onDelete(r.id)}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Vista móvil: tarjetas ── */}
      <div className="res-cards">
        {rows.map((r) => (
          <div className="res-card" key={r.id} onClick={() => onDetail(r.id)}>
            <div className="res-card-top">
              <div>
                <div className="res-card-name">{r.name}</div>
                <div className="res-card-sub">
                  <span>{r.vehicleType === "car" ? "🚗" : "🏍️"} {r.plate}</span>
                  <span>· {r.terminal}</span>
                  {r.model && <span>· {r.model}</span>}
                </div>
              </div>
              <Badge status={r.status} />
            </div>
            <div className="res-card-dates">
              <div className="res-card-date">
                <b>Entrada</b>
                <span>{fmtDateTime(r.checkIn)}</span>
              </div>
              <div className="res-card-date">
                <b>Salida</b>
                <span>{fmtDateTime(r.checkOut)}</span>
              </div>
            </div>
            <div className="res-card-bottom">
              <div className="res-card-price">{fmtCurrency(r.price)}</div>
              <div className="res-card-actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm btn-icon" title="Ver detalle" onClick={() => onDetail(r.id)}>👁️</button>
                <button className="btn btn-ghost btn-sm btn-icon" title="Editar" onClick={() => onEdit(r)}>✏️</button>
                <button className="btn btn-danger btn-sm btn-icon" title="Eliminar" onClick={() => onDelete(r.id)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
