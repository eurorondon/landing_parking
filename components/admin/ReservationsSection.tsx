"use client";

import { useMemo, useState } from "react";
import type { ReservaAdmin, ReservaStatus, VehicleType } from "@/lib/admin";
import ReservaTable from "./ReservaTable";

const PER_PAGE = 10;

interface Props {
  reservas: ReservaAdmin[];
  onDetail: (id: string) => void;
  onEdit: (r: ReservaAdmin) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export default function ReservationsSection({ reservas, onDetail, onEdit, onDelete, onNew }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | ReservaStatus>("");
  const [type, setType] = useState<"" | VehicleType>("");
  const [terminal, setTerminal] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return reservas
      .filter((r) => {
        if (status && r.status !== status) return false;
        if (type && r.vehicleType !== type) return false;
        if (terminal && r.terminal !== terminal) return false;
        if (q && ![r.name, r.phone, r.email, r.plate].some((f) => (f || "").toLowerCase().includes(q))) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reservas, search, status, type, terminal]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const safePage = Math.min(page, Math.max(0, pages - 1));
  const paged = filtered.slice(safePage * PER_PAGE, (safePage + 1) * PER_PAGE);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reservas</div>
          <div className="page-sub">Gestiona todas las reservas del parking</div>
        </div>
        <button className="btn btn-amber" onClick={onNew}>+ Nueva reserva</button>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por nombre, teléfono, correo o matrícula…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value as "" | ReservaStatus); setPage(0); }}>
          <option value="">Todos los estados</option>
          <option value="confirmed">Pendiente</option>
          <option value="inside">Activa</option>
          <option value="finished">Finalizada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <select className="filter-select" value={type} onChange={(e) => { setType(e.target.value as "" | VehicleType); setPage(0); }}>
          <option value="">Todo tipo</option>
          <option value="car">Coche</option>
          <option value="moto">Moto</option>
        </select>
        <select className="filter-select" value={terminal} onChange={(e) => { setTerminal(e.target.value); setPage(0); }}>
          <option value="">Todas terminales</option>
          <option value="T1">T1</option>
          <option value="T2">T2</option>
          <option value="T3">T3</option>
          <option value="T4">T4</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <ReservaTable rows={paged} onDetail={onDetail} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--gray-500)", alignSelf: "center" }}>{filtered.length} reservas</span>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              className={`btn ${i === safePage ? "btn-primary" : "btn-ghost"} btn-sm`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
