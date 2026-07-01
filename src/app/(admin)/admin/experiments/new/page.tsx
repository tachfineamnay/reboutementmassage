import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";
import ExperimentEditor from "@/components/admin/growth/ExperimentEditor";

export const metadata: Metadata = { title: "Nouvelle expérience — Growth CMS", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewExperimentPage() {
  await ensureAdminSchema();

  const [landings, testimonials] = await Promise.all([
    prisma.landingPage.findMany({ orderBy: { heroTitle: "asc" }, select: { id: true, heroTitle: true } }),
    prisma.testimonial.findMany({ orderBy: { displayName: "asc" }, select: { id: true, displayName: true } }),
  ]);

  return (
    <div className="admin-page">
      <ExperimentEditor
        landings={landings}
        testimonials={testimonials}
      />
    </div>
  );
}
