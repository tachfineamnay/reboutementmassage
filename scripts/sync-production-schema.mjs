import pg from "pg";

const { Client } = pg;
const RETRY_DELAY_MS = 5_000;
const RETRY_ATTEMPTS = 12;

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
];

function sleep(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function applySchemaPatch() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 3_000,
    query_timeout: 20_000,
    application_name: "lander-schema-sync",
  });

  try {
    await client.connect();

    for (const statement of schemaStatements) {
      await client.query(statement);
    }
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[schema-sync] DATABASE_URL is not set; skipping.");
    return;
  }

  const retry = process.argv.includes("--retry");
  const attempts = retry ? RETRY_ATTEMPTS : 1;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await applySchemaPatch();
      console.log("[schema-sync] Required admin columns are up to date.");
      return;
    } catch (error) {
      console.error(
        `[schema-sync] Attempt ${attempt}/${attempts} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt < attempts) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  process.exitCode = 1;
}

await main();
