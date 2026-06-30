import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  // Prisma et bcrypt nécessitent une exécution côté serveur Node.js uniquement
  serverExternalPackages: ["@prisma/client", "bcryptjs", "sharp"],
  async redirects() {
    return [
      {
        source: "/stories/fr/:slug",
        destination: "/fr/stories/:slug",
        permanent: true,
      },
      {
        source: "/stories/en/:slug",
        destination: "/en/stories/:slug",
        permanent: true,
      },
      {
        source: "/stories/es/:slug",
        destination: "/es/stories/:slug",
        permanent: true,
      },
      {
        source: "/en/mexico-city-private-session",
        destination: "/en/mexico-city-french-body-reset",
        permanent: true,
      },
      {
        source: "/es/sesion-privada-cdmx",
        destination: "/es/reset-corporal-frances-cdmx",
        permanent: true,
      },
      {
        source: "/fr/seance-privee-mexico-city",
        destination: "/fr/french-body-reset-mexico-city",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
