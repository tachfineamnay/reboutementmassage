import "server-only";
import { prisma } from "@/lib/prisma";

const globalForAdminSchema = globalThis as unknown as {
  adminSchemaReady?: boolean;
  adminSchemaPromise?: Promise<boolean>;
};

async function checkAdminSchema() {
  await prisma.$queryRaw`SELECT 1`;
  return true;
}

export async function ensureAdminSchema() {
  if (globalForAdminSchema.adminSchemaReady) return true;

  if (!globalForAdminSchema.adminSchemaPromise) {
    globalForAdminSchema.adminSchemaPromise = checkAdminSchema()
      .then((ok) => {
        globalForAdminSchema.adminSchemaReady = ok;
        return ok;
      })
      .catch((error) => {
        console.error("[admin-schema] Database schema check failed.", error);
        return false;
      })
      .finally(() => {
        globalForAdminSchema.adminSchemaPromise = undefined;
      });
  }

  return globalForAdminSchema.adminSchemaPromise;
}
