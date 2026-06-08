import type { Language } from "@/data/copy";

export type BookingIntent = "training" | "workshop";

export type BookingSlot = {
  time: string;
  selectedDateTime: string;
  available: boolean;
};

export type BookingDay = {
  date: string;
  label: string;
  shortLabel: string;
  slots: BookingSlot[];
};

type GenerateBookingSlotsInput = {
  intent: BookingIntent;
  durationMinutes: number;
  timezone: string;
  fromDate?: Date;
  daysAhead?: number;
  lang?: Language;
};

const WEEKDAY_TIMES = ["09:30", "11:00", "14:30", "16:00"];
const SATURDAY_TIMES = ["10:00", "11:30"];

function localeFor(lang: Language) {
  if (lang === "EN") return "en-US";
  if (lang === "ES") return "es-ES";
  return "fr-FR";
}

function zonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function dateKeyInTimezone(date: Date, timezone: string) {
  const parts = zonedParts(date, timezone);
  return [
    String(parts.year).padStart(4, "0"),
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

function addDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount, 12));
  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function weekdayFor(dateKey: string) {
  return new Date(`${dateKey}T12:00:00.000Z`).getUTCDay();
}

function zonedDateTimeToUtc(dateKey: string, time: string, timezone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let result = wallClockAsUtc;

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const actual = zonedParts(new Date(result), timezone);
    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second
    );
    result -= actualAsUtc - wallClockAsUtc;
  }

  return new Date(result);
}

function deterministicHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function isSimulatedBusy(
  intent: BookingIntent,
  durationMinutes: number,
  date: string,
  time: string
) {
  return deterministicHash(`${intent}:${durationMinutes}:${date}:${time}`) % 9 === 0;
}

function formatDay(dateKey: string, lang: Language, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(localeFor(lang), {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T12:00:00.000Z`));
}

export function generateBookingSlots({
  intent,
  durationMinutes,
  timezone,
  fromDate = new Date(),
  daysAhead = 14,
  lang = "FR",
}: GenerateBookingSlotsInput): BookingDay[] {
  const startDate = dateKeyInTimezone(fromDate, timezone);
  const now = fromDate.getTime();
  const days: BookingDay[] = [];

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const date = addDays(startDate, offset);
    const weekday = weekdayFor(date);
    if (weekday === 0) continue;

    const times = weekday === 6 ? SATURDAY_TIMES : WEEKDAY_TIMES;
    const slots = times
      .map((time) => {
        const start = zonedDateTimeToUtc(date, time, timezone);
        return {
          time,
          selectedDateTime: start.toISOString(),
          available:
            start.getTime() > now &&
            !isSimulatedBusy(intent, durationMinutes, date, time),
        };
      })
      .filter((slot) => new Date(slot.selectedDateTime).getTime() > now);

    days.push({
      date,
      label: formatDay(date, lang, {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      shortLabel: formatDay(date, lang, {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      slots,
    });
  }

  return days;
}
