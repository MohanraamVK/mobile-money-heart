// Theme system: each theme overrides core CSS variables on document root.
// Applied via <html data-theme="..."> and stored in localStorage.

export type ThemeId = "default" | "midnight" | "sunset" | "forest" | "mono" | "ocean";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  description: string;
  swatch: string; // CSS gradient preview
}

export const THEMES: ThemeMeta[] = [
  {
    id: "default",
    name: "Aurora",
    description: "Indigo & violet — the original Lunar look.",
    swatch: "linear-gradient(135deg, #4f46e5, #a855f7)",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy with electric blue accents.",
    swatch: "linear-gradient(135deg, #0b1d3a, #2563eb)",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange & pink, golden hour vibes.",
    swatch: "linear-gradient(135deg, #f97316, #ec4899)",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Earthy greens, grounded and calm.",
    swatch: "linear-gradient(135deg, #166534, #65a30d)",
  },
  {
    id: "mono",
    name: "Monochrome",
    description: "Crisp black & white minimal.",
    swatch: "linear-gradient(135deg, #1f1f1f, #6b7280)",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Teal & cyan, fresh and breezy.",
    swatch: "linear-gradient(135deg, #0891b2, #14b8a6)",
  },
];

const THEME_KEY = "banking-theme-v1";

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "default";
  const v = window.localStorage.getItem(THEME_KEY);
  return (THEMES.find((t) => t.id === v)?.id ?? "default") as ThemeId;
}

export function setStoredTheme(id: ThemeId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, id);
  applyTheme(id);
}

export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
}
