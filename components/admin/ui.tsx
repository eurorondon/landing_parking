import { STATUS_CLASS, STATUS_LABEL, type ReservaStatus, type VehicleType } from "@/lib/admin";

export function Badge({ status }: { status: ReservaStatus }) {
  return <span className={`badge ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function TypeBadge({ type }: { type: VehicleType }) {
  return (
    <span className={`badge ${type === "car" ? "badge-car" : "badge-autocaravana"}`}>
      {type === "car" ? "🚗 Coche" : "🚐 Autocaravana"}
    </span>
  );
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p>{text}</p>
    </div>
  );
}
