import "./landing.css";

/** Layout de la web pública: carga los estilos de la landing solo en estas rutas */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="page-bg" />
      {children}
    </>
  );
}
