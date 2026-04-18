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
import christmasImg from "@/assets/themes/christmas.jpg";
import easterImg from "@/assets/themes/easter.jpg";
import midsummerImg from "@/assets/themes/midsummer.jpg";

export type BaseThemeId = "default" | "midnight" | "sunset" | "forest" | "mono" | "ocean";
export type SeasonalThemeId = "spring" | "summer" | "autumn" | "winter";
export type HolidayThemeId = "christmas-theme" | "easter-theme" | "midsummer-theme";
export type ThemeId = BaseThemeId | SeasonalThemeId | HolidayThemeId | string; // string = custom-<uuid>

export type HolidayOverlayId = "none" | "christmas" | "easter" | "midsummer";

export interface ThemeMeta {
  id: BaseThemeId | SeasonalThemeId | HolidayThemeId;
  name: string;
  description: string;
  swatch: string;
  image: string;
  kind: "default" | "seasonal" | "holiday";
  /** A small emoji/icon shown inside widgets when this theme is active. */
  widgetIcon?: string;
}

export const DEFAULT_THEMES: ThemeMeta[] = [
  { id: "default", name: "Aurora", description: "Indigo & violet — the original Noctis look.", swatch: "linear-gradient(135deg, #4f46e5, #a855f7)", image: auroraImg, kind: "default" },
  { id: "midnight", name: "Midnight", description: "Deep navy with electric blue accents.", swatch: "linear-gradient(135deg, #0b1d3a, #2563eb)", image: midnightImg, kind: "default" },
  { id: "sunset", name: "Sunset", description: "Warm orange & pink, golden hour vibes.", swatch: "linear-gradient(135deg, #f97316, #ec4899)", image: sunsetImg, kind: "default" },
  { id: "forest", name: "Forest", description: "Earthy greens, grounded and calm.", swatch: "linear-gradient(135deg, #166534, #65a30d)", image: forestImg, kind: "default" },
  { id: "mono", name: "Monochrome", description: "Crisp black & white minimal.", swatch: "linear-gradient(135deg, #1f1f1f, #6b7280)", image: monoImg, kind: "default" },
  { id: "ocean", name: "Ocean", description: "Teal & cyan, fresh and breezy.", swatch: "linear-gradient(135deg, #0891b2, #14b8a6)", image: oceanImg, kind: "default" },
];

export const SEASONAL_THEMES: ThemeMeta[] = [
  { id: "spring", name: "Spring", description: "Cherry blossoms and pastel sunlight.", swatch: "linear-gradient(135deg, #f9a8d4, #86efac)", image: springImg, kind: "seasonal", widgetIcon: "🌸" },
  { id: "summer", name: "Summer", description: "Golden sand and turquoise sea.", swatch: "linear-gradient(135deg, #fde047, #22d3ee)", image: summerImg, kind: "seasonal", widgetIcon: "☀️" },
  { id: "autumn", name: "Autumn", description: "Cosy red and amber leaves.", swatch: "linear-gradient(135deg, #ea580c, #b45309)", image: autumnImg, kind: "seasonal", widgetIcon: "🍂" },
  { id: "winter", name: "Winter", description: "Snowy nordic stillness.", swatch: "linear-gradient(135deg, #bae6fd, #cbd5e1)", image: winterImg, kind: "seasonal", widgetIcon: "❄️" },
];

export const HOLIDAY_THEMES: ThemeMeta[] = [
  { id: "christmas-theme", name: "Christmas", description: "Crimson, evergreen and warm cabin lights.", swatch: "linear-gradient(135deg, #b91c1c, #16a34a)", image: christmasImg, kind: "holiday", widgetIcon: "🎄" },
  { id: "easter-theme", name: "Easter", description: "Pastel eggs, tulips and fresh greens.", swatch: "linear-gradient(135deg, #fbcfe8, #bef264)", image: easterImg, kind: "holiday", widgetIcon: "🥚" },
  { id: "midsummer-theme", name: "Midsummer", description: "Wildflowers and golden Nordic light.", swatch: "linear-gradient(135deg, #fde047, #60a5fa)", image: midsummerImg, kind: "holiday", widgetIcon: "🌼" },
];

export const ALL_THEMES: ThemeMeta[] = [...DEFAULT_THEMES, ...SEASONAL_THEMES, ...HOLIDAY_THEMES];

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

/** Map a holiday-theme id to its matching overlay-animation id (and vice versa). */
export const HOLIDAY_THEME_TO_OVERLAY: Record<HolidayThemeId, HolidayOverlayId> = {
  "christmas-theme": "christmas",
  "easter-theme": "easter",
  "midsummer-theme": "midsummer",
};
export const OVERLAY_TO_HOLIDAY_THEME: Record<Exclude<HolidayOverlayId, "none">, HolidayThemeId> = {
  christmas: "christmas-theme",
  easter: "easter-theme",
  midsummer: "midsummer-theme",
};

const THEME_KEY = "banking-theme-v1";
const HOLIDAY_KEY = "banking-holiday-v1";

export const THEME_COSTS = {
  seasonalOutOfWindow: 300,
  holidayThemeOutOfWindow: 350,
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
  // Holiday themes reuse default base palette but with a holiday-specific tint via CSS.
  const attr = isCustom ? "default" : id;
  document.documentElement.setAttribute("data-theme", attr);
}

export function findTheme(id: ThemeId): ThemeMeta | null {
  return ALL_THEMES.find((t) => t.id === id) ?? null;
}

export function findHoliday(id: HolidayOverlayId): HolidayMeta | null {
  if (id === "none") return null;
  return HOLIDAYS.find((h) => h.id === id) ?? null;
}
