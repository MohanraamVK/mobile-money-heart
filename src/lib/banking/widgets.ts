import type { WidgetId, WidgetMeta, UserProfile } from "./types";

export const WIDGET_CATALOG: Record<WidgetId, WidgetMeta> = {
  balance: { id: "balance", title: "Account Balance", description: "Total balance across accounts", category: "core", size: "lg" },
  transactions: { id: "transactions", title: "Recent Transactions", description: "Latest activity on your accounts", category: "core", size: "lg" },
  quickTransfer: { id: "quickTransfer", title: "Quick Transfer", description: "Send money to saved contacts", category: "core", size: "md" },
  spending: { id: "spending", title: "Spending by Category", description: "Where your money goes this month", category: "core", size: "md" },
  savingsGoal: { id: "savingsGoal", title: "Savings Goal", description: "Track progress to your goal", category: "savings", size: "md" },
  cards: { id: "cards", title: "My Cards", description: "Manage debit and credit cards", category: "core", size: "md" },
  budget: { id: "budget", title: "Monthly Budget", description: "Stay on top of your budget", category: "savings", size: "md" },
  bills: { id: "bills", title: "Upcoming Bills", description: "Bills due in the next 30 days", category: "core", size: "md" },
  currencyConverter: { id: "currencyConverter", title: "Currency Converter", description: "Live FX rates", category: "lifestyle", size: "sm" },
  investments: { id: "investments", title: "Investments", description: "Portfolio at a glance", category: "investing", size: "md" },
  studentLoans: { id: "studentLoans", title: "Student Loans", description: "Loan balance and payoff plan", category: "lifestyle", size: "md" },
  travelWallet: { id: "travelWallet", title: "Travel Wallet", description: "Multi-currency travel funds", category: "lifestyle", size: "md" },
  jointAccount: { id: "jointAccount", title: "Family Account", description: "Shared spending with family", category: "lifestyle", size: "md" },
  crypto: { id: "crypto", title: "Crypto Holdings", description: "Crypto portfolio tracker", category: "investing", size: "md" },
  retirement: { id: "retirement", title: "Retirement Planner", description: "On-track for retirement", category: "investing", size: "md" },
  rewards: { id: "rewards", title: "Rewards & Points", description: "Cashback and rewards summary", category: "lifestyle", size: "sm" },
  billSplitter: { id: "billSplitter", title: "Bill Splitter", description: "Split bills with friends", category: "lifestyle", size: "sm" },
};

export const DEFAULT_WIDGETS: WidgetId[] = [
  "balance",
  "transactions",
  "quickTransfer",
  "spending",
  "cards",
  "bills",
];

export interface OnboardingAnswers {
  primaryGoal: "save" | "spend" | "invest" | "travel";
  travelOften: "yes" | "no";
  hasDependents: "yes" | "no";
  interestedInCrypto: "yes" | "no";
}

export function recommendWidgets(profile: UserProfile, a: OnboardingAnswers): WidgetId[] {
  const set = new Set<WidgetId>(["balance", "transactions", "quickTransfer", "cards"]);

  if (a.primaryGoal === "save") {
    set.add("savingsGoal");
    set.add("budget");
    set.add("spending");
  }
  if (a.primaryGoal === "spend") {
    set.add("spending");
    set.add("rewards");
    set.add("bills");
  }
  if (a.primaryGoal === "invest") {
    set.add("investments");
    if (profile.age >= 30) set.add("retirement");
  }
  if (a.primaryGoal === "travel") {
    set.add("travelWallet");
    set.add("currencyConverter");
  }

  if (a.travelOften === "yes") {
    set.add("travelWallet");
    set.add("currencyConverter");
  }
  if (a.hasDependents === "yes") {
    set.add("jointAccount");
    set.add("billSplitter");
  }
  if (a.interestedInCrypto === "yes") {
    set.add("crypto");
  }

  // Age-based defaults
  if (profile.age < 26) set.add("studentLoans");
  if (profile.age >= 45) set.add("retirement");

  set.add("bills");
  return Array.from(set);
}
