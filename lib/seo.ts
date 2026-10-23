import type { Metadata } from "next";

export const SITE_URL = "https://parkingaeromadrid.es";

/** Imagen por defecto al compartir (1200×630, ver public/og-default.png) */
export const OG_IMAGE = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: "Parking Aero Madrid · Parking en Madrid-Barajas",
};

/**
 * Metadata completa de una página: title, description, canonical (misma forma
 * de URL que el sitemap: con barra final) y Open Graph / Twitter con imagen.
 * Next sustituye `openGraph` entero en cada página, por eso se repite aquí.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  /** Ruta con barra inicial y final, p. ej. "/parking-barajas/" */
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
}): Metadata {
  const ogTitle = opts.ogTitle ?? opts.title;
  const ogDescription = opts.ogDescription ?? opts.description;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    ...(opts.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: opts.path,
      siteName: "Parking Aero Madrid",
      locale: "es_ES",
      type: opts.type ?? "website",
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [OG_IMAGE.url],
    },
  };
}
