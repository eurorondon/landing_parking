"use client";

import dynamic from "next/dynamic";

// Botones flotantes (WhatsApp / llamada): no son contenido indexable ni necesarios
// para el primer pintado, así que su JS se carga aparte, tras la hidratación inicial.
const StickyButtonsInner = dynamic(() => import("./StickyButtonsInner"), { ssr: false });

export default function StickyButtons() {
  return <StickyButtonsInner />;
}
