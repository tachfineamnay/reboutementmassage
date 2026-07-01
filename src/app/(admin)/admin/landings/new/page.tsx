import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import LandingEditor from "@/components/admin/growth/LandingEditor";

export const metadata: Metadata = { title: "New page — Platform Admin", robots: { index: false, follow: false } };
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

  return (
    <div className="admin-page" style={{ padding: "20px" }}>
      <LandingEditor
        destinations={destinations}
        offers={offers}
        channels={channels}
        tracking={tracking}
        crmRules={crmRules}
        mediaAssets={mediaAssets}
      />
    </div>
  );
}
