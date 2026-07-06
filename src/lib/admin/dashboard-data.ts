import { prisma } from "@/lib/prisma";
import { getReportingWindows } from "@/lib/admin/date-windows";

export async function getAdminDashboardData(now = new Date()) {
  const windows = getReportingWindows(now);

  const [
    databaseOk,
    failedLeads,
    callbacksToday,
    leadsToday,
    leads7Days,
    metrics7Days,
    recentLeads,
    dailyStats,
    liveLandings,
    activeWhatsappChannels,
    activeTrackingProfiles,
  ] = await Promise.all([
    prisma.$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false),
    prisma.leadSubmission.count({ where: { status: "FAILED" } }),
    prisma.leadSubmission.count({
      where: {
        selectedAt: { gte: windows.today.start, lt: windows.today.end },
        status: { not: "ARCHIVED" },
      },
    }),
    prisma.leadSubmission.count({
      where: {
        createdAt: { gte: windows.today.start, lt: windows.today.end },
      },
    }),
    prisma.leadSubmission.count({
      where: {
        createdAt: { gte: windows.last7Days.start, lt: windows.last7Days.end },
      },
    }),
    prisma.landingMetricDaily.aggregate({
      where: {
        date: {
          gte: windows.last7Days.metricStartDate,
          lt: windows.last7Days.metricEndDate,
        },
      },
      _sum: {
        views: true,
        whatsappClicks: true,
        stickyClicks: true,
        formStarts: true,
        formSubmits: true,
        bookingClicks: true,
        leads: true,
      },
    }),
    prisma.leadSubmission.findMany({
      where: {
        OR: [
          { status: { in: ["CAPTURED", "FAILED"] } },
          {
            selectedAt: { gte: windows.today.start, lt: windows.today.end },
            status: { not: "ARCHIVED" },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        firstName: true,
        contact: true,
        status: true,
        selectedDayLabel: true,
        selectedTime: true,
        timezone: true,
        createdAt: true,
        needType: true,
        intent: true,
        growthDestination: { select: { cityName: true } },
        destination: true,
      },
    }),
    prisma.landingMetricDaily.groupBy({
      by: ["landingPageId"],
      where: {
        date: {
          gte: windows.last7Days.metricStartDate,
          lt: windows.last7Days.metricEndDate,
        },
      },
      _sum: {
        views: true,
        whatsappClicks: true,
        stickyClicks: true,
        formSubmits: true,
        leads: true,
      },
    }),
    prisma.landingPage.findMany({
      where: { status: "LIVE" },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        locale: true,
        status: true,
        heroTitle: true,
        readinessScore: true,
        noindex: true,
        whatsappChannelId: true,
        trackingProfileId: true,
        destination: { select: { cityName: true } },
        whatsappChannel: { select: { status: true } },
        trackingProfile: { select: { status: true } },
      },
    }),
    prisma.whatsappChannel.count({ where: { status: { in: ["ACTIVE", "CONNECTED_GHL"] } } }),
    prisma.trackingProfile.count({ where: { status: "ACTIVE" } }),
  ]);

  const landingById = new Map(liveLandings.map((landing) => [landing.id, landing]));

  const pagesWithStats = dailyStats
    .map((stat) => {
      const landing = landingById.get(stat.landingPageId);
      const views = stat._sum.views ?? 0;
      const whatsappClicks = (stat._sum.whatsappClicks ?? 0) + (stat._sum.stickyClicks ?? 0);
      const leads = stat._sum.leads ?? 0;
      return {
        landingPageId: stat.landingPageId,
        landing,
        views,
        whatsappClicks,
        formSubmits: stat._sum.formSubmits ?? 0,
        leads,
        whatsappRate: views > 0 ? whatsappClicks / views : 0,
      };
    })
    .filter((item) => item.landing);

  const totalViews = metrics7Days._sum.views ?? 0;
  const totalWhatsappClicks =
    (metrics7Days._sum.whatsappClicks ?? 0) + (metrics7Days._sum.stickyClicks ?? 0);
  const totalFormSubmits = metrics7Days._sum.formSubmits ?? 0;
  const livePages = liveLandings.length;
  const averageReadiness =
    livePages > 0
      ? liveLandings.reduce((sum, landing) => sum + landing.readinessScore, 0) / livePages
      : 0;
  const lowReadinessList = liveLandings
    .filter((landing) => landing.readinessScore < 80)
    .sort((a, b) => a.readinessScore - b.readinessScore);
  const liveNoindexList = liveLandings.filter((landing) => landing.noindex);
  const pagesWithViewsNoLead = [...pagesWithStats]
    .filter((item) => item.views > 0 && item.leads === 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
  const liveMissingWhatsapp = liveLandings.filter(
    (landing) =>
      !landing.whatsappChannelId ||
      !landing.whatsappChannel ||
      !["ACTIVE", "CONNECTED_GHL"].includes(landing.whatsappChannel.status)
  ).length;
  const liveMissingTracking = liveLandings.filter(
    (landing) => !landing.trackingProfileId || landing.trackingProfile?.status !== "ACTIVE"
  ).length;

  return {
    windows,
    urgency: {
      failedLeads,
      callbacksToday,
      lowReadinessPages: lowReadinessList.length,
      liveNoindexPages: liveNoindexList.length,
      liveMissingWhatsapp,
      liveMissingTracking,
      missingWhatsappOrTracking: liveMissingWhatsapp + liveMissingTracking,
    },
    kpis: {
      leadsToday,
      leads7Days,
      views7Days: totalViews,
      whatsappClicks7Days: totalWhatsappClicks,
      formSubmits7Days: totalFormSubmits,
      whatsappConversionRate: totalViews > 0 ? totalWhatsappClicks / totalViews : 0,
      formConversionRate: totalViews > 0 ? totalFormSubmits / totalViews : 0,
      livePages,
      averageReadiness,
    },
    recentLeads,
    lowReadinessList: lowReadinessList.slice(0, 8),
    liveNoindexList: liveNoindexList.slice(0, 8),
    pagesWithViewsNoLead,
    system: {
      databaseOk,
      ghlTokenConfigured: Boolean(process.env.GHL_PRIVATE_INTEGRATION_TOKEN),
      ghlLocationConfigured: Boolean(process.env.GHL_LOCATION_ID),
      activeWhatsappChannels,
      activeTrackingProfiles,
      liveMissingWhatsapp,
      liveMissingTracking,
    },
  };
}
