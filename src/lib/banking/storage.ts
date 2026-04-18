import type { BankingState, SavedLayout, UserProfile, WidgetId } from "./types";
import { DEFAULT_WIDGETS, WIDGET_CATALOG } from "./widgets";

const KEY = "banking-state-v1";

export const MOCK_PROFILE: UserProfile = {
  fullName: "Alex Morgan",
  age: 28,
  nationality: "British",
  residence: "London, UK",
  dob: "1996-04-12",
  email: "alex.morgan@example.com",
  phone: "+44 7700 900123",
  gender: "other",
  nationalId: "SN-0028-4412",
};

const initialState: BankingState = {
  profile: MOCK_PROFILE,
  activeWidgets: DEFAULT_WIDGETS,
  layouts: [],
  onboarded: false,
};

const isValidWidget = (id: string): id is WidgetId => id in WIDGET_CATALOG;
const cleanWidgets = (ids: WidgetId[] | undefined): WidgetId[] =>
  (ids ?? []).filter(isValidWidget);

export function loadState(): BankingState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<BankingState>;
    const merged: BankingState = { ...initialState, ...parsed };
    merged.activeWidgets = cleanWidgets(merged.activeWidgets);
    if (merged.activeWidgets.length === 0) merged.activeWidgets = DEFAULT_WIDGETS;
    merged.layouts = (merged.layouts ?? []).map((l) => ({
      ...l,
      widgets: cleanWidgets(l.widgets),
    }));
    return merged;
  } catch {
    return initialState;
  }
}

export function saveState(state: BankingState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function setActiveWidgets(widgets: WidgetId[]) {
  const s = loadState();
  s.activeWidgets = widgets;
  saveState(s);
}

export function setOnboarded(value: boolean) {
  const s = loadState();
  s.onboarded = value;
  saveState(s);
}

export function saveLayout(name: string, widgets: WidgetId[]): SavedLayout {
  const s = loadState();
  const layout: SavedLayout = {
    id: crypto.randomUUID(),
    name,
    widgets,
    createdAt: Date.now(),
  };
  s.layouts = [layout, ...s.layouts];
  saveState(s);
  return layout;
}

export function deleteLayout(id: string) {
  const s = loadState();
  s.layouts = s.layouts.filter((l) => l.id !== id);
  saveState(s);
}

export function applyLayout(id: string) {
  const s = loadState();
  const layout = s.layouts.find((l) => l.id === id);
  if (!layout) return;
  s.activeWidgets = layout.widgets;
  saveState(s);
}

export function updateProfile(patch: Partial<UserProfile>) {
  const s = loadState();
  s.profile = { ...s.profile, ...patch };
  saveState(s);
  return s.profile;
}

export function importLayout(name: string, widgets: WidgetId[]): SavedLayout {
  return saveLayout(name, cleanWidgets(widgets));
}

export function encodeLayout(layout: SavedLayout): string {
  const payload = { v: 1, n: layout.name, w: layout.widgets };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function decodeLayout(code: string): { name: string; widgets: WidgetId[] } | null {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const parsed = JSON.parse(json) as { v: number; n: string; w: WidgetId[] };
    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.w)) return null;
    return { name: parsed.n || "Imported layout", widgets: cleanWidgets(parsed.w) };
  } catch {
    return null;
  }
}

export function resetAll() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
