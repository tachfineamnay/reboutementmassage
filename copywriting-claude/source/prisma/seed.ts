/**
 * Seed : crée le premier compte admin.
 *
 * Usage :
 *   npm run db:seed
 *   -- ou --
 *   ADMIN_EMAIL=admin@tms.fr ADMIN_PASSWORD=secret npx tsx prisma/seed.ts
 *
 * Variables d'environnement requises :
 *   DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans l'environnement"
    );
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL non défini");

  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });

    console.log(`✅ Admin créé / mis à jour : ${user.email} (id: ${user.id})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
