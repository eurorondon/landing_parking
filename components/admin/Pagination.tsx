"use client";

interface Props {
  total: number;
  /** Página actual, empezando en 0 */
  page: number;
  perPage: number;
  onPage: (page: number) => void;
  /** Si se pasa, se muestra el selector de "por página" */
  onPerPage?: (n: number) => void;
  perPageOptions?: number[];
  /** Texto del recuento, p. ej. "reservas" */
  noun?: string;
}

/** Números a mostrar: primera, última y las vecinas de la actual, con "…" en los huecos. */
function visiblePages(page: number, pages: number): (number | "…")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i);
  const keep = new Set<number>([0, pages - 1, page - 1, page, page + 1]);
  if (page <= 2) [1, 2, 3].forEach((n) => keep.add(n));
  if (page >= pages - 3) [pages - 2, pages - 3, pages - 4].forEach((n) => keep.add(n));
  const sorted = [...keep].filter((n) => n >= 0 && n < pages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1];
    if (i > 0 && n - prev === 2) out.push(prev + 1); // un solo hueco: mejor el número que "…"
    else if (i > 0 && n - prev > 2) out.push("…");
    out.push(n);
  });
  return out;
}

export default function Pagination({
  total, page, perPage, onPage, onPerPage, perPageOptions = [10, 25, 50, 100], noun = "reservas",
}: Props) {
  if (total === 0) return null;

  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pages - 1);
  const from = current * perPage + 1;
  const to = Math.min(total, (current + 1) * perPage);

  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, flexWrap: "wrap", marginTop: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 13, color: "var(--gray-500)" }}>
        <span>Mostrando {from}–{to} de {total} {noun}</span>
        {onPerPage && (
          <select
            className="filter-select"
            style={{ padding: "4px 8px", fontSize: 12.5 }}
            value={perPage}
            onChange={(e) => onPerPage(Number(e.target.value))}
            aria-label="Reservas por página"
          >
            {perPageOptions.map((n) => <option key={n} value={n}>{n} por página</option>)}
          </select>
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Paginación" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-ghost btn-sm" disabled={current === 0} onClick={() => onPage(current - 1)}>
            ‹ Anterior
          </button>
          {visiblePages(current, pages).map((n, i) =>
            n === "…" ? (
              <span key={`gap-${i}`} style={{ padding: "0 4px", color: "var(--gray-400)" }}>…</span>
            ) : (
              <button
                key={n}
                className={`btn ${n === current ? "btn-primary" : "btn-ghost"} btn-sm`}
                aria-current={n === current ? "page" : undefined}
                onClick={() => onPage(n)}
              >
                {n + 1}
              </button>
            ),
          )}
          <button className="btn btn-ghost btn-sm" disabled={current >= pages - 1} onClick={() => onPage(current + 1)}>
            Siguiente ›
          </button>
        </nav>
      )}
    </div>
  );
}
