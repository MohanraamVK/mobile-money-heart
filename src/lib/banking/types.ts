export interface UserProfile {
  fullName: string;
  age: number;
  nationality: string;
  residence: string;
  dob: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  nationalId: string;
}

export type WidgetId =
  | "subscriptionManager"
  | "recurringPayments"
  | "savingGoals"
  | "fdRdInvestments"
  | "expenseSharing"
  | "cashFlowSplit"
  | "investmentGuide"
  | "moneyCalendar"
  | "passiveIncome"
  | "financialLimit"
  | "currencyExchange"
  | "spendingManager"
  | "childExpenseTracker"
  | "insuranceCoverage"
  | "commonContacts"
  | "lunarPoints"
  | "co2Tracker";

export interface WidgetMeta {
  id: WidgetId;
  title: string;
  description: string;
  category: "core" | "savings" | "lifestyle" | "investing" | "family" | "rewards" | "sustainability";
  size: "sm" | "md" | "lg";
}

/** Per-widget visual override the user can pick in edit mode. */
export type WidgetShape = "square" | "wide" | "tall" | "xl";

export interface SavedLayout {
  id: string;
  name: string;
  widgets: WidgetId[];
  shapes?: Partial<Record<WidgetId, WidgetShape>>;
  createdAt: number;
}

export type CharityId = "breastCancer" | "ocean" | "trees" | "children";
export type BadgeId = CharityId;

export interface QuestProgress {
  /** Completed tier index (0 = none completed). Determines current tier. */
  tier: number;
  /** ISO month (YYYY-MM) when progress was last reset. */
  monthKey: string;
  /** Whether the user has claimed the *current* (next) tier yet. */
  claimedThisCycle: boolean;
}

export interface CustomTheme {
  id: string;
  name: string;
  imageDataUrl: string;
  createdAt: number;
}

export interface LunarState {
  points: number;
  steps: number;
  lastStepClaimedAt: number;
  /** Total steps already converted to points (so we only award new chunks). */
  stepsClaimed: number;
  quests: Record<string, QuestProgress>;
  ownedThemes: string[]; // theme ids the user has paid for outside their natural window
  ownedBadges: BadgeId[];
  equippedBadge: BadgeId | null;
  badgesDisabled: boolean;
  customThemes: CustomTheme[];
  dismissedPopups: string[]; // e.g. "holiday-christmas-2026", "season-spring-2026"
  animationsEnabled: boolean;
}

export interface BankingState {
  profile: UserProfile;
  activeWidgets: WidgetId[];
  /** Per-widget visual size overrides for the *active* layout. */
  widgetShapes: Partial<Record<WidgetId, WidgetShape>>;
  layouts: SavedLayout[];
  onboarded: boolean;
  lunar: LunarState;
}
