-- RedirectRule: colonnes hits / lastHitAt (manquantes dans growth_cms_complete)
ALTER TABLE "redirect_rules" ADD COLUMN IF NOT EXISTS "hits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "redirect_rules" ADD COLUMN IF NOT EXISTS "lastHitAt" TIMESTAMP(3);
