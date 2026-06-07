type GoogleCalendarLinkInput = {
  title: string;
  startDateTime: string | Date;
  durationMinutes: number;
  details?: string;
  location?: string;
};

function toGoogleDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function createGoogleCalendarUrl({
  title,
  startDateTime,
  durationMinutes,
  details,
  location,
}: GoogleCalendarLinkInput) {
  const start = startDateTime instanceof Date ? new Date(startDateTime) : new Date(startDateTime);
  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid startDateTime");
  }

  const end = new Date(start.getTime() + Math.max(1, durationMinutes) * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
  });

  if (details) params.set("details", details);
  if (location) params.set("location", location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
