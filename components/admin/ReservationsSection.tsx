"use client";

import { useMemo, useState } from "react";
import type { ReservaAdmin, ReservaStatus, VehicleType } from "@/lib/admin";
import Pagination from "./Pagination";
import ReservaTable from "./ReservaTable";

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
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return reservas
      .filter((r) => {
        if (status && r.status !== status) return false;
        if (type && r.vehicleType !== type) return false;
        // Coincide si la terminal filtrada es la de entrada o la de salida
        if (terminal && r.terminalEntrada !== terminal && r.terminalSalida !== terminal) return false;
        if (q && ![r.name, r.phone, r.email, r.plate].some((f) => (f || "").toLowerCase().includes(q))) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reservas, search, status, type, terminal]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pages - 1);
  const paged = filtered.slice(safePage * perPage, (safePage + 1) * perPage);

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
          <option value="autocaravana">Autocaravana</option>
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

      <Pagination
        total={filtered.length} page={safePage} perPage={perPage}
        onPage={setPage} onPerPage={(n) => { setPerPage(n); setPage(0); }}
      />
    </div>
  );
}
