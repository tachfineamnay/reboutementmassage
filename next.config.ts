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
        source: "/stories/:locale/:slug",
        destination: "/stories/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
