import { Suspense } from "react";
import PlanSelector from "./_components/PlanSelector";

export const metadata = {
  title: "Reserva tu plaza · Parking Aero Madrid",
  robots: "noindex",
};

export default function PlanesPage() {
  return (
    <Suspense fallback={<div className="planes-loading">Cargando planes…</div>}>
      <PlanSelector />
    </Suspense>
  );
}
