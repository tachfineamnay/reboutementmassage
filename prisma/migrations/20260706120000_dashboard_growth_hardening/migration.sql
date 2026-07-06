-- Admin auth hardening and analytics idempotency.

CREATE TABLE IF NOT EXISTS "admin_login_attempts" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "success" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_login_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_login_attempts_email_createdAt_idx"
  ON "admin_login_attempts"("email", "createdAt");

CREATE INDEX IF NOT EXISTS "admin_login_attempts_ipAddress_createdAt_idx"
  ON "admin_login_attempts"("ipAddress", "createdAt");

CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "actorEmail" TEXT,
  "action" TEXT NOT NULL,
  "resource" TEXT,
  "resourceId" TEXT,
  "ipAddress" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_audit_logs_actorId_createdAt_idx"
  ON "admin_audit_logs"("actorId", "createdAt");

CREATE INDEX IF NOT EXISTS "admin_audit_logs_action_createdAt_idx"
  ON "admin_audit_logs"("action", "createdAt");

WITH ranked_events AS (
  SELECT
    ctid,
    ROW_NUMBER() OVER (PARTITION BY "eventId" ORDER BY "createdAt" ASC, "id" ASC) AS row_num
  FROM "pixel_event_logs"
)
DELETE FROM "pixel_event_logs" AS event
USING ranked_events
WHERE event.ctid = ranked_events.ctid
  AND ranked_events.row_num > 1;

DROP INDEX IF EXISTS "pixel_event_logs_eventId_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "pixel_event_logs_eventId_key"
  ON "pixel_event_logs"("eventId");
