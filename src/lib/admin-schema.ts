import "server-only";
import { prisma } from "@/lib/prisma";

const globalForAdminSchema = globalThis as unknown as {
  adminSchemaReady?: boolean;
  adminSchemaPromise?: Promise<void>;
};

const schemaStatements = [
  `
    ALTER TABLE "articles"
      ADD COLUMN IF NOT EXISTS "translationGroupId" TEXT
  `,
  `
    ALTER TABLE "article_seo"
      ADD COLUMN IF NOT EXISTS "llmReadabilityScore" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "atomicAnswerPresent" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "schemaValidation" JSONB NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "geoChecklist" JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS "answerCoverageScore" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "lastGeoAuditAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "primaryQuestion" TEXT,
      ADD COLUMN IF NOT EXISTS "answerIntent" TEXT,
      ADD COLUMN IF NOT EXISTS "targetAudience" TEXT,
      ADD COLUMN IF NOT EXISTS "geoLocation" TEXT,
      ADD COLUMN IF NOT EXISTS "businessGoal" TEXT,
      ADD COLUMN IF NOT EXISTS "entityTargets" JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS "faqItems" JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS "evidenceNotes" JSONB NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "customJsonLd" JSONB NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS "aeoScore" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "geoScore" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "eeatScore" INTEGER NOT NULL DEFAULT 0
  `,
  `
    ALTER TABLE "lead_submissions"
      ADD COLUMN IF NOT EXISTS "companyName" TEXT,
      ADD COLUMN IF NOT EXISTS "jobTitle" TEXT,
      ADD COLUMN IF NOT EXISTS "propertyType" TEXT,
      ADD COLUMN IF NOT EXISTS "destination" TEXT,
      ADD COLUMN IF NOT EXISTS "leadSegment" TEXT,
      ADD COLUMN IF NOT EXISTS "intent" TEXT,
      ADD COLUMN IF NOT EXISTS "preferredChannel" TEXT,
      ADD COLUMN IF NOT EXISTS "routedToUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "urgency" TEXT,
      ADD COLUMN IF NOT EXISTS "needType" TEXT,
      ADD COLUMN IF NOT EXISTS "volumePotential" TEXT,
      ADD COLUMN IF NOT EXISTS "participantCount" TEXT,
      ADD COLUMN IF NOT EXISTS "currentLocation" TEXT,
      ADD COLUMN IF NOT EXISTS "branchData" JSONB NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "resendEmailId" TEXT,
      ADD COLUMN IF NOT EXISTS "notificationSentAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "notificationError" TEXT
  `,
  `
    ALTER TABLE "lead_submissions"
      ALTER COLUMN "selectedTime" DROP NOT NULL,
      ALTER COLUMN "selectedAt" DROP NOT NULL
  `,
  `
    CREATE INDEX IF NOT EXISTS "articles_translationGroupId_idx"
      ON "articles"("translationGroupId")
  `,
  `
    CREATE INDEX IF NOT EXISTS "lead_submissions_leadSegment_idx"
      ON "lead_submissions"("leadSegment")
  `,
] as const;

async function applyAdminSchema() {
  for (const statement of schemaStatements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

export async function ensureAdminSchema() {
  if (globalForAdminSchema.adminSchemaReady) return true;

  if (!globalForAdminSchema.adminSchemaPromise) {
    globalForAdminSchema.adminSchemaPromise = applyAdminSchema()
      .then(() => {
        globalForAdminSchema.adminSchemaReady = true;
        console.log("[admin-schema] Required admin columns are available.");
      })
      .catch((error) => {
        console.error("[admin-schema] Unable to repair the database schema.", error);
      })
      .finally(() => {
        globalForAdminSchema.adminSchemaPromise = undefined;
      });
  }

  await globalForAdminSchema.adminSchemaPromise;
  return Boolean(globalForAdminSchema.adminSchemaReady);
}
