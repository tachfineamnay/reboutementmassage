WITH ranked_leads AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "eventId" ORDER BY "createdAt" ASC, id ASC) AS row_num
  FROM "lead_submissions"
  WHERE "eventId" IS NOT NULL
)
UPDATE "lead_submissions"
SET "eventId" = NULL
WHERE id IN (
  SELECT id
  FROM ranked_leads
  WHERE row_num > 1
);

DROP INDEX IF EXISTS "lead_submissions_eventId_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "lead_submissions_eventId_key"
  ON "lead_submissions"("eventId");
