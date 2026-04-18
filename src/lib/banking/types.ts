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
  | "commonContacts";

export interface WidgetMeta {
  id: WidgetId;
  title: string;
  description: string;
  category: "core" | "savings" | "lifestyle" | "investing" | "family";
  size: "sm" | "md" | "lg";
}

export interface SavedLayout {
  id: string;
  name: string;
  widgets: WidgetId[];
  createdAt: number;
}

export interface BankingState {
  profile: UserProfile;
  activeWidgets: WidgetId[];
  layouts: SavedLayout[];
  onboarded: boolean;
}
