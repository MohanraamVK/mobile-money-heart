// Theme system: each base theme overrides core CSS variables.
// Holiday & seasonal "themes" are *additive* overlay animations layered on top.

import auroraImg from "@/assets/themes/aurora.jpg";
import midnightImg from "@/assets/themes/midnight.jpg";
import sunsetImg from "@/assets/themes/sunset.jpg";
import forestImg from "@/assets/themes/forest.jpg";
import monoImg from "@/assets/themes/mono.jpg";
import oceanImg from "@/assets/themes/ocean.jpg";
import springImg from "@/assets/themes/spring.jpg";
import summerImg from "@/assets/themes/summer.jpg";
import autumnImg from "@/assets/themes/autumn.jpg";
import winterImg from "@/assets/themes/winter.jpg";

export type BaseThemeId = "default" | "midnight" | "sunset" | "forest" | "mono" | "ocean";
export type SeasonalThemeId = "spring" | "summer" | "autumn" | "winter";
export type ThemeId = BaseThemeId | SeasonalThemeId | string; // string = custom-<uuid>

export type HolidayOverlayId = "none" | "christmas" | "easter" | "midsummer";

export interface ThemeMeta {
  id: BaseThemeId | SeasonalThemeId;
  name: string;
  description: string;
  swatch: string;
  image: string;
  kind: "default" | "seasonal";
}

export const DEFAULT_THEMES: ThemeMeta[] = [
  { id: "default", name: "Aurora", description: "Indigo & violet — the original Lunar look.", swatch: "linear-gradient(135deg, #4f46e5, #a855f7)", image: auroraImg, kind: "default" },
  { id: "midnight", name: "Midnight", description: "Deep navy with electric blue accents.", swatch: "linear-gradient(135deg, #0b1d3a, #2563eb)", image: midnightImg, kind: "default" },
  { id: "sunset", name: "Sunset", description: "Warm orange & pink, golden hour vibes.", swatch: "linear-gradient(135deg, #f97316, #ec4899)", image: sunsetImg, kind: "default" },
  { id: "forest", name: "Forest", description: "Earthy greens, grounded and calm.", swatch: "linear-gradient(135deg, #166534, #65a30d)", image: forestImg, kind: "default" },
  { id: "mono", name: "Monochrome", description: "Crisp black & white minimal.", swatch: "linear-gradient(135deg, #1f1f1f, #6b7280)", image: monoImg, kind: "default" },
  { id: "ocean", name: "Ocean", description: "Teal & cyan, fresh and breezy.", swatch: "linear-gradient(135deg, #0891b2, #14b8a6)", image: oceanImg, kind: "default" },
];

export const SEASONAL_THEMES: ThemeMeta[] = [
  { id: "spring", name: "Spring", description: "Cherry blossoms and pastel sunlight.", swatch: "linear-gradient(135deg, #f9a8d4, #86efac)", image: springImg, kind: "seasonal" },
  { id: "summer", name: "Summer", description: "Golden sand and turquoise sea.", swatch: "linear-gradient(135deg, #fde047, #22d3ee)", image: summerImg, kind: "seasonal" },
  { id: "autumn", name: "Autumn", description: "Cosy red and amber leaves.", swatch: "linear-gradient(135deg, #ea580c, #b45309)", image: autumnImg, kind: "seasonal" },
  { id: "winter", name: "Winter", description: "Snowy nordic stillness.", swatch: "linear-gradient(135deg, #bae6fd, #cbd5e1)", image: winterImg, kind: "seasonal" },
];

export const ALL_THEMES: ThemeMeta[] = [...DEFAULT_THEMES, ...SEASONAL_THEMES];

export interface HolidayMeta {
  id: HolidayOverlayId;
  name: string;
  description: string;
  swatch: string;
}

export const HOLIDAYS: HolidayMeta[] = [
  { id: "christmas", name: "Christmas", description: "Gentle falling snow over your dashboard.", swatch: "linear-gradient(135deg, #b91c1c, #16a34a)" },
  { id: "easter", name: "Easter", description: "Pastel eggs drifting down.", swatch: "linear-gradient(135deg, #fbcfe8, #bef264)" },
  { id: "midsummer", name: "Midsummer", description: "Daisies, cornflowers, lavender & chamomile.", swatch: "linear-gradient(135deg, #fde047, #60a5fa)" },
];

const THEME_KEY = "banking-theme-v1";
const HOLIDAY_KEY = "banking-holiday-v1";

export const THEME_COSTS = {
  seasonalOutOfWindow: 300,
  holidayOutOfWindow: 250,
  custom: 750,
};

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "default";
  const v = window.localStorage.getItem(THEME_KEY);
  if (!v) return "default";
  return v as ThemeId;
}

export function setStoredTheme(id: ThemeId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, id);
  applyTheme(id);
}

export function getStoredHoliday(): HolidayOverlayId {
  if (typeof window === "undefined") return "none";
  return (window.localStorage.getItem(HOLIDAY_KEY) as HolidayOverlayId) || "none";
}

export function setStoredHoliday(id: HolidayOverlayId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HOLIDAY_KEY, id);
}

export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  const isCustom = id.startsWith("custom-");
  // Custom themes inherit the base "default" CSS variables, only override the bg image.
  document.documentElement.setAttribute("data-theme", isCustom ? "default" : id);
}

export function findTheme(id: ThemeId): ThemeMeta | null {
  return ALL_THEMES.find((t) => t.id === id) ?? null;
}

export function findHoliday(id: HolidayOverlayId): HolidayMeta | null {
  if (id === "none") return null;
  return HOLIDAYS.find((h) => h.id === id) ?? null;
}
