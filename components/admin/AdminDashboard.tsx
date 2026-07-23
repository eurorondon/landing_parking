"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_CONFIG,
  STATUS_LABEL,
  type AdminConfig,
  type ReservaAdmin,
  type ReservaStatus,
} from "@/lib/admin";
import HomeSection from "./HomeSection";
import ReservationsSection from "./ReservationsSection";
import CalendarSection from "./CalendarSection";
import ClientsSection from "./ClientsSection";
import ReportsSection from "./ReportsSection";
import SettingsSection from "./SettingsSection";
import PlanningSection from "./PlanningSection";
import CuponesSection from "./CuponesSection";
import ReservationFormModal from "./ReservationFormModal";
import DetailModal from "./DetailModal";

type Section = "home" | "reservations" | "calendar" | "clients" | "reports" | "planning" | "cupones" | "settings";

const TITLES: Record<Section, string> = {
  home:         "Inicio",
  reservations: "Reservas",
  calendar:     "Calendario",
  clients:      "Clientes",
  reports:      "Reportes",
  planning:     "Planning",
  cupones:      "Cupones",
  settings:     "Configuración",
};

interface Toast { id: number; msg: string; type?: "success" | "error"; }

export default function AdminDashboard() {
  const router = useRouter();
  const [section, setSection] = useState<Section>("home");
  const [reservas, setReservas] = useState<ReservaAdmin[]>([]);
  const [config, setConfig] = useState<AdminConfig>(DEFAULT_CONFIG);
  const [cargado, setCargado] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ReservaAdmin | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, type?: "success" | "error") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const cargar = useCallback(async () => {
    try {
      const [resR, resC] = await Promise.all([
        fetch("/api/admin/reservas"),
        fetch("/api/admin/config"),
      ]);
      if (resR.ok) setReservas((await resR.json()).reservations ?? []);
      if (resC.ok) setConfig((await resC.json()).config ?? DEFAULT_CONFIG);
    } catch {
      toast("No se pudieron cargar los datos", "error");
    } finally {
      setCargado(true);
    }
  }, [toast]);

  useEffect(() => { cargar(); }, [cargar]);

  /* ── Acciones ── */

  function navegar(sec: Section) {
    setSection(sec);
    setSidebarOpen(false);
  }

  function abrirNueva() {
    setEditing(null);
    setFormOpen(true);
  }

  function abrirEditar(r: ReservaAdmin) {
    setDetailId(null);
    setEditing(r);
    setFormOpen(true);
  }

  async function guardarReserva(data: Partial<ReservaAdmin> & { enviarEmail?: boolean }) {
    try {
      const res = editing
        ? await fetch(`/api/admin/reservas/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        : await fetch("/api/admin/reservas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
      if (!res.ok) throw new Error();
      if (editing) {
        toast("Reserva actualizada correctamente", "success");
      } else {
        // La reserva ya está guardada aunque el correo falle: se avisa sin marcarlo como error de alta
        const { emailEnviado } = await res.json().catch(() => ({ emailEnviado: false }));
        toast(
          data.enviarEmail === false
            ? "Reserva creada (sin enviar correo)"
            : emailEnviado
              ? "Reserva creada y correo enviado al cliente"
              : "Reserva creada, pero no se pudo enviar el correo",
          data.enviarEmail !== false && !emailEnviado ? "error" : "success",
        );
      }
      setFormOpen(false);
      setEditing(null);
      await cargar();
    } catch {
      toast("No se pudo guardar la reserva", "error");
    }
  }

  async function cambiarEstado(id: string, status: ReservaStatus) {
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast("Estado actualizado a: " + STATUS_LABEL[status], "success");
      setDetailId(null);
      await cargar();
    } catch {
      toast("No se pudo actualizar el estado", "error");
    }
  }

  async function eliminarReserva(id: string) {
    if (!confirm("¿Eliminar esta reserva? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Reserva eliminada");
      setDetailId(null);
      await cargar();
    } catch {
      toast("No se pudo eliminar la reserva", "error");
    }
  }

  async function reenviarEmail(id: string, email: string, guardar: boolean) {
    try {
      const res = await fetch(`/api/admin/reservas/${id}/reenviar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, guardar }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      toast(
        data.guardado
          ? `Correo enviado a ${data.email} y guardado en la ficha`
          : `Correo enviado a ${data.email}`,
        "success",
      );
      if (data.guardado) await cargar();
    } catch (err) {
      toast(err instanceof Error ? err.message : "No se pudo enviar el correo", "error");
    }
  }

  async function guardarConfig(cfg: AdminConfig) {
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) throw new Error();
      setConfig((await res.json()).config);
      toast("Configuración guardada correctamente", "success");
    } catch {
      toast("No se pudo guardar la configuración", "error");
    }
  }

  async function borrarTodo() {
    if (!confirm("¿Seguro que quieres borrar TODAS las reservas? Esta acción es irreversible.")) return;
    await fetch("/api/admin/reservas", { method: "DELETE" });
    toast("Datos borrados");
    await cargar();
  }

  async function restaurarDemo() {
    await fetch("/api/admin/demo", { method: "POST" });
    toast("Datos demo restaurados", "success");
    await cargar();
  }

  async function cerrarSesion() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  /* ── Render ── */

  // Badge del menú: reservas pendientes (a la espera de que llegue el vehículo)
  const pendientes = reservas.filter((r) => r.status === "confirmed").length;
  const detalle = detailId ? reservas.find((r) => r.id === detailId) ?? null : null;
  const hoy = new Date();

  const navItems: { sec: Section; icon: string; label: string; badge?: number }[] = [
    { sec: "home", icon: "🏠", label: "Inicio" },
    { sec: "reservations", icon: "📋", label: "Reservas", badge: pendientes },
    { sec: "calendar", icon: "📅", label: "Calendario" },
  ];
  const navItems2: { sec: Section; icon: string; label: string }[] = [
    { sec: "clients",  icon: "👥", label: "Clientes"       },
    { sec: "reports",  icon: "📊", label: "Reportes"       },
    { sec: "planning", icon: "🗓️", label: "Planning"  },
    { sec: "cupones",  icon: "🎟️", label: "Cupones"   },
  ];

  return (
    <div className="admin-shell">
      {/* ── SIDEBAR ── */}
      <aside id="sidebar" className={sidebarOpen ? "open" : ""}>
        <div className="sb-logo">
          <div className="sb-logo-name"><span className="sb-dot" />{config.businessName}</div>
          <div className="sb-logo-sub">Panel de Administración</div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Principal</div>
          {navItems.map((it) => (
            <div key={it.sec} className={`sb-item${section === it.sec ? " active" : ""}`} onClick={() => navegar(it.sec)}>
              <span className="sb-icon">{it.icon}</span> {it.label}
              {it.badge ? <span className="sb-badge">{it.badge}</span> : null}
            </div>
          ))}
          <div className="sb-section">Gestión</div>
          {navItems2.map((it) => (
            <div key={it.sec} className={`sb-item${section === it.sec ? " active" : ""}`} onClick={() => navegar(it.sec)}>
              <span className="sb-icon">{it.icon}</span> {it.label}
            </div>
          ))}
          <div className="sb-section">Sistema</div>
          <div className={`sb-item${section === "settings" ? " active" : ""}`} onClick={() => navegar("settings")}>
            <span className="sb-icon">⚙️</span> Configuración
          </div>
        </nav>
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">AD</div>
            <div className="sb-user-info">
              <div className="sb-user-name">Administrador</div>
              <div className="sb-user-role">Acceso completo</div>
            </div>
            <button className="sb-logout" onClick={cerrarSesion} title="Cerrar sesión">Salir</button>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div id="sb-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── MAIN ── */}
      <main id="main">
        <header id="topbar">
          <button id="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Abrir menú">☰</button>
          <div id="topbar-title">{TITLES[section]}</div>
          <div className="topbar-date">
            {hoy.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <button className="btn btn-amber btn-sm" onClick={abrirNueva}>+ Nueva reserva</button>
        </header>

        <div id="content">
          {!cargado ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <p>Cargando datos…</p>
            </div>
          ) : (
            <>
              {section === "home" && (
                <HomeSection
                  reservas={reservas}
                  onDetail={setDetailId}
                  onEdit={abrirEditar}
                  onDelete={eliminarReserva}
                  goReservations={() => navegar("reservations")}
                />
              )}
              {section === "reservations" && (
                <ReservationsSection
                  reservas={reservas}
                  onDetail={setDetailId}
                  onEdit={abrirEditar}
                  onDelete={eliminarReserva}
                  onNew={abrirNueva}
                />
              )}
              {section === "calendar" && <CalendarSection reservas={reservas} onDetail={setDetailId} />}
              {section === "clients" && <ClientsSection reservas={reservas} />}
              {section === "reports"  && <ReportsSection  reservas={reservas} />}
              {section === "planning" && <PlanningSection />}
              {section === "cupones"  && <CuponesSection toast={toast} />}
              {section === "settings" && (
                <SettingsSection
                  config={config}
                  onSave={guardarConfig}
                  onClearAll={borrarTodo}
                  onRestoreDemo={restaurarDemo}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* ── MOBILE BAR ── */}
      <div id="mobile-bar">
        <div className={`mb-item${section === "home" ? " active" : ""}`} onClick={() => navegar("home")}>
          <span className="mb-icon">🏠</span>Inicio
        </div>
        <div className={`mb-item${section === "reservations" ? " active" : ""}`} onClick={() => navegar("reservations")}>
          <span className="mb-icon">📋</span>Reservas
          {pendientes > 0 && <span className="mb-badge">{pendientes}</span>}
        </div>
        <div className="mb-item mb-create" onClick={abrirNueva}>
          <span className="mb-icon">＋</span>
        </div>
        <div className={`mb-item${section === "clients" ? " active" : ""}`} onClick={() => navegar("clients")}>
          <span className="mb-icon">👥</span>Clientes
        </div>
        <div className={`mb-item${section === "settings" ? " active" : ""}`} onClick={() => navegar("settings")}>
          <span className="mb-icon">⚙️</span>Ajustes
        </div>
      </div>

      {/* ── TOASTS ── */}
      <div id="toast">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item${t.type ? ` ${t.type}` : ""}`}>{t.msg}</div>
        ))}
      </div>

      {/* ── MODALES ── */}
      {formOpen && (
        <ReservationFormModal
          config={config}
          editing={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={guardarReserva}
        />
      )}
      {detalle && (
        <DetailModal
          reserva={detalle}
          onClose={() => setDetailId(null)}
          onChangeStatus={cambiarEstado}
          onEdit={abrirEditar}
          onDelete={eliminarReserva}
          onResendEmail={reenviarEmail}
        />
      )}
    </div>
  );
}
