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

export function resetAll() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
