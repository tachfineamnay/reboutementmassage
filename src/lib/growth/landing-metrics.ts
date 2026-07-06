import { prisma } from "@/lib/prisma";
import { getLandingMetricField, type GrowthMetricEventName } from "@/lib/growth/events";
import { getUtcDateOnly } from "@/lib/admin/date-windows";

export async function incrementLandingMetric(
  landingPageId: string,
  eventName: GrowthMetricEventName,
  increment = 1
) {
  const field = getLandingMetricField(eventName);
  if (!field) return;

  const today = getUtcDateOnly();

  await prisma.landingMetricDaily.upsert({
    where: {
      landingPageId_date: { landingPageId, date: today },
    },
    create: {
      landingPageId,
      date: today,
      [field]: increment,
    },
    update: {
      [field]: { increment },
    },
  });
}

export async function incrementLandingLeadMetric(landingPageId: string, increment = 1) {
  return incrementLandingMetric(landingPageId, "lead_created", increment);
}
