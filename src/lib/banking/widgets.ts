import type { WidgetId, WidgetMeta, UserProfile } from "./types";

export const WIDGET_CATALOG: Record<WidgetId, WidgetMeta> = {
  subscriptionManager: {
    id: "subscriptionManager",
    title: "Subscription Manager",
    description: "Track active subscriptions, renewal dates and costs with alerts before charges.",
    category: "core",
    size: "md",
  },
  recurringPayments: {
    id: "recurringPayments",
    title: "Recurring Payments",
    description: "Manage fixed monthly expenses like rent, utilities and bills with reminders.",
    category: "core",
    size: "md",
  },
  savingGoals: {
    id: "savingGoals",
    title: "Saving Goals",
    description: "Set targets like travel or an emergency fund and track your progress.",
    category: "savings",
    size: "md",
  },
  fdRdInvestments: {
    id: "fdRdInvestments",
    title: "FDs, RDs & Investments",
    description: "Monitor fixed deposits, recurring deposits and other traditional investments.",
    category: "investing",
    size: "md",
  },
  expenseSharing: {
    id: "expenseSharing",
    title: "Expense Sharing",
    description: "Track shared expenses with friends or roommates and see who owes whom.",
    category: "lifestyle",
    size: "md",
  },
  cashFlowSplit: {
    id: "cashFlowSplit",
    title: "Monthly Cash Flow Split",
    description: "Break income into needs, wants, savings and investments for budgeting.",
    category: "core",
    size: "md",
  },
  investmentGuide: {
    id: "investmentGuide",
    title: "Investment Guide",
    description: "Recommendations, tips and basic guidance based on your profile.",
    category: "investing",
    size: "md",
  },
  moneyCalendar: {
    id: "moneyCalendar",
    title: "Money Calendar",
    description: "Upcoming bills, payment due dates, financial events and pay days.",
    category: "core",
    size: "md",
  },
  passiveIncome: {
    id: "passiveIncome",
    title: "Passive Income Tracker",
    description: "Income from dividends, rent, side hustles or crypto in one place.",
    category: "investing",
    size: "md",
  },
  financialLimit: {
    id: "financialLimit",
    title: "Financial Limit",
    description: "Set spending limits and get alerted when nearing or exceeding budgets.",
    category: "savings",
    size: "md",
  },
  currencyExchange: {
    id: "currencyExchange",
    title: "Currency Exchange",
    description: "Real-time exchange rates and multi-currency expense management.",
    category: "lifestyle",
    size: "sm",
  },
  spendingManager: {
    id: "spendingManager",
    title: "Financial Spending Manager",
    description: "Track and categorize all expenses to see your spending habits.",
    category: "core",
    size: "md",
  },
  childExpenseTracker: {
    id: "childExpenseTracker",
    title: "Child Expense Tracker",
    description: "Monitor spending on children: education, healthcare and activities.",
    category: "family",
    size: "md",
  },
  insuranceCoverage: {
    id: "insuranceCoverage",
    title: "Insurance Coverage",
    description: "Records of insurance policies, coverage details and renewal reminders.",
    category: "family",
    size: "md",
  },
  commonContacts: {
    id: "commonContacts",
    title: "Common Contacts",
    description: "Frequently used payment contacts for quick and easy transactions.",
    category: "core",
    size: "sm",
  },
};

// Sensible default if user skips customization
export const DEFAULT_WIDGETS: WidgetId[] = [
  "spendingManager",
  "recurringPayments",
  "cashFlowSplit",
  "savingGoals",
  "moneyCalendar",
  "commonContacts",
];

export interface OnboardingAnswers {
  persona: "youth" | "workingAdult" | "intlStudent" | "family" | "elderly";
  primaryGoal: "save" | "spend" | "invest" | "share";
  travelOften: "yes" | "no";
  interestedInPassive: "yes" | "no";
}

// Persona presets derived from the product brief
const PERSONA_WIDGETS: Record<OnboardingAnswers["persona"], WidgetId[]> = {
  workingAdult: [
    "subscriptionManager",
    "recurringPayments",
    "savingGoals",
    "fdRdInvestments",
    "expenseSharing",
    "cashFlowSplit",
    "investmentGuide",
    "moneyCalendar",
    "passiveIncome",
  ],
  youth: [
    "subscriptionManager",
    "recurringPayments",
    "expenseSharing",
    "cashFlowSplit",
    "moneyCalendar",
    "passiveIncome",
  ],
  intlStudent: [
    "subscriptionManager",
    "recurringPayments",
    "expenseSharing",
    "financialLimit",
    "currencyExchange",
    "cashFlowSplit",
    "moneyCalendar",
  ],
  family: [
    "spendingManager",
    "savingGoals",
    "childExpenseTracker",
    "insuranceCoverage",
    "passiveIncome",
    "recurringPayments",
    "moneyCalendar",
  ],
  elderly: [
    "commonContacts",
    "recurringPayments",
    "moneyCalendar",
    "insuranceCoverage",
    "spendingManager",
  ],
};

export function inferPersona(profile: UserProfile): OnboardingAnswers["persona"] {
  if (profile.age >= 65) return "elderly";
  if (profile.nationality && profile.residence && !profile.residence.toLowerCase().includes(profile.nationality.toLowerCase()) && profile.age < 30) {
    return "intlStudent";
  }
  if (profile.age < 25) return "youth";
  if (profile.age >= 35) return "family";
  return "workingAdult";
}

export function recommendWidgets(profile: UserProfile, a: OnboardingAnswers): WidgetId[] {
  const set = new Set<WidgetId>(PERSONA_WIDGETS[a.persona]);

  if (a.primaryGoal === "save") {
    set.add("savingGoals");
    set.add("financialLimit");
    set.add("cashFlowSplit");
  }
  if (a.primaryGoal === "spend") {
    set.add("spendingManager");
    set.add("subscriptionManager");
  }
  if (a.primaryGoal === "invest") {
    set.add("investmentGuide");
    set.add("fdRdInvestments");
    set.add("passiveIncome");
  }
  if (a.primaryGoal === "share") {
    set.add("expenseSharing");
    set.add("commonContacts");
  }

  if (a.travelOften === "yes") {
    set.add("currencyExchange");
  }
  if (a.interestedInPassive === "yes") {
    set.add("passiveIncome");
  }

  // Always-useful staples
  set.add("moneyCalendar");

  return Array.from(set);
}
