import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { LandingBuilderPreview } from "@/components/admin/builder/LandingBuilderPreview";
import { LandingBuilderReadiness } from "@/components/admin/builder/LandingBuilderReadiness";
import { LandingBuilderShell } from "@/components/admin/builder/LandingBuilderShell";
import { LandingBuilderStepper } from "@/components/admin/builder/LandingBuilderStepper";
import { LandingConversionStep } from "@/components/admin/builder/LandingConversionStep";
import { LandingHeroStep } from "@/components/admin/builder/LandingHeroStep";
import { LandingMarketStep } from "@/components/admin/builder/LandingMarketStep";
import { LandingOfferStep } from "@/components/admin/builder/LandingOfferStep";
import { LandingProofStep } from "@/components/admin/builder/LandingProofStep";
import { LandingSeoStep } from "@/components/admin/builder/LandingSeoStep";
import LandingEditor from "@/components/admin/growth/LandingEditor";
import { createLandingBuilderDefaults } from "@/lib/admin/builder/landing-builder-defaults";
import { computeLandingBuilderReadiness } from "@/lib/admin/builder/landing-builder-readiness";
import builderStyles from "@/components/admin/builder/LandingBuilder.module.css";

export const metadata: Metadata = { title: "Nouvelle page locale — TMS Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewLandingPage() {
  await ensureAdminSchema();

  const [destinations, offers, channels, tracking, crmRules, mediaAssets] = await Promise.all([
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
    prisma.offer.findMany({ orderBy: { internalName: "asc" } }),
    prisma.whatsappChannel.findMany({ orderBy: { label: "asc" } }),
    prisma.trackingProfile.findMany({ orderBy: { label: "asc" } }),
    prisma.crmRoutingRule.findMany({ orderBy: { priority: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { filename: "asc" } }),
  ]);

  const builderDraft = createLandingBuilderDefaults();
  const readiness = computeLandingBuilderReadiness(builderDraft);

  return (
    <LandingBuilderShell
      title="Nouvelle page locale"
      sidebar={
        <>
          <LandingBuilderStepper />
          <LandingBuilderReadiness score={readiness.score} issues={readiness.issues} />
        </>
      }
    >
      <LandingMarketStep>
        <p className="admin-page__meta">
          Choisir la destination, la langue et le slug public. {destinations.length} destination
          {destinations.length !== 1 ? "s" : ""} disponible{destinations.length !== 1 ? "s" : ""}.
        </p>
      </LandingMarketStep>
      <LandingOfferStep>
        <p className="admin-page__meta">
          Relier l&apos;offre et le canal WhatsApp avant publication. {offers.length} offre
          {offers.length !== 1 ? "s" : ""} et {channels.length} canal{channels.length !== 1 ? "s" : ""} prêts à être utilisés.
        </p>
      </LandingOfferStep>
      <LandingHeroStep>
        <p className="admin-page__meta">
          Saisir le titre, le sous-titre, les CTA et l&apos;image hero depuis la médiathèque.
        </p>
      </LandingHeroStep>
      <LandingProofStep>
        <p className="admin-page__meta">
          Ajouter badges, témoignages et preuves locales sans toucher au JSON avancé.
        </p>
      </LandingProofStep>
      <LandingConversionStep>
        <p className="admin-page__meta">
          Vérifier formulaire court, routage GHL, tracking et intention lead.
        </p>
      </LandingConversionStep>
      <LandingSeoStep>
        <p className="admin-page__meta">
          Préparer titre SEO, meta description, canonical, hreflang et noindex de brouillon.
        </p>
      </LandingSeoStep>
      <LandingBuilderPreview value={builderDraft} />

      <details className={builderStyles.expert}>
        <summary className={`admin-btn admin-btn--ghost ${builderStyles.expertSummary}`}>
          Mode expert : formulaire complet actuel
        </summary>
        <LandingEditor
          destinations={destinations}
          offers={offers}
          channels={channels}
          tracking={tracking}
          crmRules={crmRules}
          mediaAssets={mediaAssets}
        />
      </details>
    </LandingBuilderShell>
  );
}
