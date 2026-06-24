import { Suspense } from "react";
import ReservaForm from "./_components/ReservaForm";

export const metadata = {
  title: "Completa tu reserva · Parking Aero Madrid",
  robots: "noindex",
};

export default function ReservarPage() {
  return (
    <Suspense fallback={<div className="planes-loading">Cargando…</div>}>
      <ReservaForm />
    </Suspense>
  );
}
