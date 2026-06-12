"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Contraseña incorrecta.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={entrar}>
        <div className="login-title">
          <span className="sb-dot" /> Parking Aero Madrid
        </div>
        <p className="login-sub">Acceso al panel de administración</p>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            className={`form-input${error ? " error" : ""}`}
            type="password"
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            placeholder="••••••••"
          />
          {error && <span className="form-error">{error}</span>}
        </div>
        <button
          type="submit"
          className="btn btn-amber"
          style={{ width: "100%", justifyContent: "center", marginTop: 16, padding: 12 }}
          disabled={enviando || !password}
        >
          {enviando ? "Entrando…" : "Entrar al panel"}
        </button>
      </form>
    </div>
  );
}
