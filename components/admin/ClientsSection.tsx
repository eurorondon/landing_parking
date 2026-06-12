"use client";

import { useMemo, useState } from "react";
import { fmtCurrency, fmtDate, type ReservaAdmin } from "@/lib/admin";
import { EmptyState } from "./ui";

interface Cliente {
  name: string;
  phone: string;
  email: string;
  reservations: number;
  total: number;
  lastDate: string;
  vehicle: string;
}

export default function ClientsSection({ reservas }: { reservas: ReservaAdmin[] }) {
  const [search, setSearch] = useState("");

  const clientes = useMemo(() => {
    const map: Record<string, Cliente> = {};
    reservas.forEach((r) => {
      const k = (r.email || r.phone || r.name).toLowerCase();
      if (!map[k]) {
        map[k] = {
          name: r.name, phone: r.phone, email: r.email,
          reservations: 0, total: 0, lastDate: r.checkIn,
          vehicle: r.model || r.vehicleType,
        };
      }
      map[k].reservations++;
      map[k].total += Number(r.price) || 0;
      if (r.checkIn > map[k].lastDate) map[k].lastDate = r.checkIn;
      if (r.model) map[k].vehicle = r.model;
    });
    const q = search.toLowerCase().trim();
    return Object.values(map)
      .filter((c) => !q || [c.name, c.phone, c.email].some((f) => (f || "").toLowerCase().includes(q)))
      .sort((a, b) => b.total - a.total);
  }, [reservas, search]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Clientes</div>
          <div className="page-sub">Historial consolidado de todos los clientes</div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {clientes.length === 0 ? (
            <EmptyState icon="👥" text="No hay clientes." />
          ) : (
            <>
              {/* ── Vista escritorio: tabla ── */}
              <table className="client-table-desktop">
                <thead>
                  <tr>
                    <th>Cliente</th><th>Teléfono</th><th>Correo</th><th>Reservas</th>
                    <th>Total gastado</th><th>Última reserva</th><th>Vehículo habitual</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => {
                    const initials = c.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                    return (
                      <tr key={c.email || c.phone || c.name}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="client-avatar">{initials}</div>
                            <div className="td-name">{c.name}</div>
                          </div>
                        </td>
                        <td>{c.phone || "—"}</td>
                        <td style={{ fontSize: 13 }}>{c.email || "—"}</td>
                        <td><span style={{ fontWeight: 600, color: "var(--teal-600)" }}>{c.reservations}</span></td>
                        <td style={{ fontWeight: 500 }}>{fmtCurrency(c.total)}</td>
                        <td>{fmtDate(c.lastDate)}</td>
                        <td>{c.vehicle || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ── Vista móvil: tarjetas ── */}
              <div className="client-cards">
                {clientes.map((c) => {
                  const initials = c.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                  return (
                    <div className="client-card" key={c.email || c.phone || c.name}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="client-avatar">{initials}</div>
                        <div style={{ minWidth: 0 }}>
                          <div className="td-name">{c.name}</div>
                          <div style={{ fontSize: 12, color: "var(--gray-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.phone || "—"} · {c.email || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="client-card-stats">
                        <div className="client-card-stat">
                          <b>Reservas</b>
                          <span style={{ color: "var(--teal-600)", fontWeight: 600 }}>{c.reservations}</span>
                        </div>
                        <div className="client-card-stat">
                          <b>Total</b>
                          <span>{fmtCurrency(c.total)}</span>
                        </div>
                        <div className="client-card-stat">
                          <b>Última</b>
                          <span>{fmtDate(c.lastDate)}</span>
                        </div>
                        <div className="client-card-stat">
                          <b>Vehículo</b>
                          <span>{c.vehicle || "—"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
