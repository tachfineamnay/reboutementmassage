import { prisma } from "@/lib/prisma";

const METRIC_FIELD_MAP: Record<string, keyof import("@prisma/client").Prisma.LandingMetricDailyUpdateInput> = {
  landing_viewed: "views",
  hero_whatsapp_clicked: "whatsappClicks",
  sticky_whatsapp_clicked: "stickyClicks",
  form_started: "formStarts",
  form_submitted: "formSubmits",
  booking_clicked: "bookingClicks",
  video_played: "videoPlays",
};

export async function incrementLandingMetric(
  landingPageId: string,
  eventName: string,
  increment = 1
) {
  const field = METRIC_FIELD_MAP[eventName];
  if (!field) return;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

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
