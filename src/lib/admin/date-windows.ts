const DEFAULT_REPORTING_TIMEZONE = "Africa/Casablanca";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getIntEnv(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getReportingTimeZone() {
  const timeZone = process.env.ADMIN_REPORTING_TIMEZONE || DEFAULT_REPORTING_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return timeZone;
  } catch {
    return DEFAULT_REPORTING_TIMEZONE;
  }
}

function getParts(date: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = Number(byType.hour);

  return {
    year: Number(byType.year),
    month: Number(byType.month),
    day: Number(byType.day),
    hour: hour === 24 ? 0 : hour,
    minute: Number(byType.minute),
    second: Number(byType.second),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return asUtc - date.getTime();
}

function zonedDateTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const firstOffset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  let result = new Date(utcGuess - firstOffset);
  const secondOffset = getTimeZoneOffsetMs(result, timeZone);

  if (secondOffset !== firstOffset) {
    result = new Date(utcGuess - secondOffset);
  }

  return result;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getUtcDateOnly(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getReportingWindows(now = new Date(), timeZone = getReportingTimeZone()) {
  const parts = getParts(now, timeZone);
  const todayStart = zonedDateTimeToUtc(timeZone, parts.year, parts.month, parts.day);
  const todayEnd = addDays(todayStart, 1);
  const dayOfWeek = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(now);
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(dayOfWeek);
  const daysSinceMonday = weekdayIndex === 0 ? 6 : Math.max(weekdayIndex - 1, 0);
  const weekStart = addDays(todayStart, -daysSinceMonday);
  const last7Start = addDays(todayStart, -6);
  const metricToday = getUtcDateOnly(now);

  return {
    timeZone,
    today: {
      start: todayStart,
      end: todayEnd,
    },
    currentWeek: {
      start: weekStart,
      end: todayEnd,
    },
    last7Days: {
      start: last7Start,
      end: todayEnd,
      metricStartDate: addDays(metricToday, -6),
      metricEndDate: addDays(metricToday, 1),
    },
  };
}

export function getLoginRateLimitConfig() {
  return {
    maxAttempts: getIntEnv("ADMIN_LOGIN_MAX_ATTEMPTS", 5),
    windowMs: getIntEnv("ADMIN_LOGIN_WINDOW_MINUTES", 15) * 60 * 1000,
    lockMs: getIntEnv("ADMIN_LOGIN_LOCK_MINUTES", 15) * 60 * 1000,
  };
}

export function getAnalyticsEventRateLimit() {
  return getIntEnv("ANALYTICS_EVENT_RATE_LIMIT_PER_MINUTE", 120);
}
