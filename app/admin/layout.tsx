import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Panel de Administración | Parking Aero Madrid",
  robots: { index: false, follow: false }, // el panel no debe indexarse
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
