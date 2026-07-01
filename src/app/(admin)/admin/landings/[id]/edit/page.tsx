import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { growthLandingInclude } from "@/lib/growth/types";
import { computeLandingReadiness } from "@/lib/growth/landing-readiness";
import LandingEditor from "@/components/admin/growth/LandingEditor";

export const metadata: Metadata = { title: "Edit page — Platform Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; published?: string; publishBlocked?: string }>;
};

export default async function EditLandingPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved, published, publishBlocked } = await searchParams;

  const landing = await prisma.landingPage.findUnique({
    where: { id },
    include: growthLandingInclude,
  });
  if (!landing) notFound();

  const [destinations, offers, channels, tracking, crmRules, mediaAssets] = await Promise.all([
    prisma.destination.findMany({ orderBy: { cityName: "asc" } }),
    prisma.offer.findMany({ orderBy: { internalName: "asc" } }),
    prisma.whatsappChannel.findMany({ orderBy: { label: "asc" } }),
    prisma.trackingProfile.findMany({ orderBy: { label: "asc" } }),
    prisma.crmRoutingRule.findMany({ orderBy: { priority: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { filename: "asc" } }),
  ]);

  const readiness = computeLandingReadiness(landing);

  return (
    <div className="admin-page">
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "12px", fontWeight: "bold" }}>✅ Modifications enregistrées.</p>}
      {published === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "12px", fontWeight: "bold" }}>🚀 Page de destination publiée en LIVE.</p>}
      {publishBlocked === "1" && (
        <p role="alert" style={{ color: "#ef4444", marginBottom: "12px", fontWeight: "bold" }}>
          ❌ Publication bloquée : score de préparation inférieur à 80 ou noindex actif. Cochez "Force-publish" dans l'onglet SEO pour forcer la publication.
        </p>
      )}

      <LandingEditor
        landing={landing}
        destinations={destinations}
        offers={offers}
        channels={channels}
        tracking={tracking}
        crmRules={crmRules}
        mediaAssets={mediaAssets}
        readiness={readiness}
      />
    </div>
  );
}
