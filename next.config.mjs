/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // URL canónica con barra final. La redirección 301 de la variante sin barra
  // la hace middleware.ts (solo para páginas): así /api/* (cron, fetch) no se
  // redirige y sigue respondiendo igual con o sin barra.
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
