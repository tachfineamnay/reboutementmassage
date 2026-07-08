import "@/app/campaign-growth.css";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import { computePuckReadiness } from "@/lib/builder/puck-readiness";
import { createDefaultPuckDataFromLanding, getPuckDataFromLanding, isPuckLanding } from "@/lib/builder/default-puck-data";
import { getLandingPublicPath, getPreviewUrl } from "@/lib/builder/puck-utils";
import { growthLandingInclude } from "@/lib/growth/types";
import AdminPageHeader from "@/components/admin/growth/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/growth/AdminStatusBadge";
import StudioClient from "@/components/admin/studio/StudioClient";

export const metadata: Metadata = { title: "Builder legacy — TMS Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function LandingStudioPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { created } = await searchParams;

  const landing = await prisma.landingPage.findUnique({
    where: { id },
    include: growthLandingInclude,
  });
  if (!landing) notFound();

  const initialized = isPuckLanding(landing.content);
  const initialData = initialized ? getPuckDataFromLanding(landing) : createDefaultPuckDataFromLanding(landing);
  const readiness = computePuckReadiness(initialized ? landing : { ...landing, content: { puckData: initialData } });
  const liveUrl = getLandingPublicPath(landing);
  const previewUrl = getPreviewUrl(landing);

  return (
    <div className="admin-page admin-page--studio">
      <AdminPageHeader
        title="Builder legacy"
        meta={`${landing.heroTitle} · ${landing.locale}`}
        description="Édition visuelle Puck (legacy). Ne pas utiliser pour les pages premium. La publication reste bloquée tant que la readiness est insuffisante."
      >
        <AdminStatusBadge status={landing.status} />
        <Link href="/admin/pages" className="admin-btn admin-btn--ghost">
          Retour
        </Link>
      </AdminPageHeader>

      {created === "1" ? (
        <p className="landing-studio__message" role="status">
          Brouillon créé. Le contenu du builder est prêt à être ajusté.
        </p>
      ) : null}

      <StudioClient
        landing={{ id: landing.id, title: landing.heroTitle, status: landing.status }}
        initialData={initialData}
        initialized={initialized}
        readiness={readiness}
        liveUrl={liveUrl}
        previewUrl={previewUrl}
        expertUrl={`/admin/landings/${landing.id}/edit`}
        settingsUrl={`/admin/pages/${landing.id}/settings`}
      />
    </div>
  );
}
