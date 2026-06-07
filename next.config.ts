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
    ];
  },
};

export default nextConfig;
