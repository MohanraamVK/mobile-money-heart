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
  | "balance"
  | "transactions"
  | "quickTransfer"
  | "spending"
  | "savingsGoal"
  | "cards"
  | "budget"
  | "bills"
  | "currencyConverter"
  | "investments"
  | "studentLoans"
  | "travelWallet"
  | "jointAccount"
  | "crypto"
  | "retirement"
  | "rewards"
  | "billSplitter";

export interface WidgetMeta {
  id: WidgetId;
  title: string;
  description: string;
  category: "core" | "savings" | "lifestyle" | "investing";
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
