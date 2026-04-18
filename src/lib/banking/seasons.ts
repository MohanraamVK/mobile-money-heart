// Date helpers for seasonal & holiday themes.
// All ranges are *inclusive* and based on Northern-Hemisphere / Nordic calendar.

export type HolidayId = "christmas" | "easter" | "midsummer";
export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export interface ActiveWindow {
  id: HolidayId | SeasonId;
  kind: "holiday" | "season";
  label: string;
  /** Year-scoped key for popup dedupe, e.g. "holiday-christmas-2026". */
  key: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const mkDate = (y: number, m: number, d: number) => new Date(y, m - 1, d);

// Easter Sunday (Anonymous Gregorian algorithm)
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return mkDate(year, month, day);
}

// Midsummer Eve in Sweden = Friday between June 19–25
function midsummerEve(year: number): Date {
  for (let d = 19; d <= 25; d++) {
    const dt = mkDate(year, 6, d);
    if (dt.getDay() === 5) return dt;
  }
  return mkDate(year, 6, 21);
}

function within(now: Date, start: Date, end: Date): boolean {
  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}

export function activeHoliday(now = new Date()): ActiveWindow | null {
  const y = now.getFullYear();

  // Christmas: Dec 1 – Jan 6
  const xmasStart = mkDate(y, 12, 1);
  const xmasEnd = mkDate(y + 1, 1, 6);
  const xmasStartPrev = mkDate(y - 1, 12, 1);
  const xmasEndThis = mkDate(y, 1, 6);
  if (within(now, xmasStart, xmasEnd) || within(now, xmasStartPrev, xmasEndThis)) {
    const yearForKey = now.getMonth() === 0 ? y - 1 : y;
    return { id: "christmas", kind: "holiday", label: "Christmas", key: `holiday-christmas-${yearForKey}` };
  }

  // Easter: 7 days before through 1 day after Easter Sunday
  const easter = easterSunday(y);
  const eStart = new Date(easter); eStart.setDate(easter.getDate() - 7);
  const eEnd = new Date(easter); eEnd.setDate(easter.getDate() + 1);
  if (within(now, eStart, eEnd)) {
    return { id: "easter", kind: "holiday", label: "Easter", key: `holiday-easter-${y}` };
  }

  // Midsummer: 3 days around Midsummer Eve (Sweden)
  const ms = midsummerEve(y);
  const msStart = new Date(ms); msStart.setDate(ms.getDate() - 1);
  const msEnd = new Date(ms); msEnd.setDate(ms.getDate() + 2);
  if (within(now, msStart, msEnd)) {
    return { id: "midsummer", kind: "holiday", label: "Midsummer", key: `holiday-midsummer-${y}` };
  }

  return null;
}

export function activeSeason(now = new Date()): ActiveWindow {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  let id: SeasonId;
  if (m >= 3 && m <= 5) id = "spring";
  else if (m >= 6 && m <= 8) id = "summer";
  else if (m >= 9 && m <= 11) id = "autumn";
  else id = "winter";
  const label = id[0].toUpperCase() + id.slice(1);
  return { id, kind: "season", label, key: `season-${id}-${y}` };
}

/** Format YYYY-MM for monthly quest resets. */
export function currentMonthKey(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}
