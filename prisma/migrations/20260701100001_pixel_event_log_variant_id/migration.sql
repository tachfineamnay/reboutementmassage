-- PixelEventLog: attribution variante A/B
ALTER TABLE "pixel_event_logs" ADD COLUMN IF NOT EXISTS "variantId" TEXT;
