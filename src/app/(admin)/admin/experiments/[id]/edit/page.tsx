import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import ExperimentEditor from "@/components/admin/growth/ExperimentEditor";

export const metadata: Metadata = { title: "Éditer expérience — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditExperimentPage({ params, searchParams }: PageProps) {
  await ensureAdminSchema();
  const { id } = await params;
  const { saved } = await searchParams;

  const [experiment, landings, testimonials] = await Promise.all([
    prisma.experiment.findUnique({
      where: { id },
      include: { variants: true },
    }),
    prisma.landingPage.findMany({ orderBy: { heroTitle: "asc" }, select: { id: true, heroTitle: true } }),
    prisma.testimonial.findMany({ orderBy: { displayName: "asc" }, select: { id: true, displayName: true } }),
  ]);
  if (!experiment) notFound();

  return (
    <div className="admin-page">
      {saved === "1" && <p role="status" style={{ color: "var(--admin-green)", marginBottom: "16px", fontWeight: "bold" }}>✅ Expérience A/B enregistrée.</p>}
      <ExperimentEditor
        experiment={experiment}
        landings={landings}
        testimonials={testimonials}
      />
    </div>
  );
}
