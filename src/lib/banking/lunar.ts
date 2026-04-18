import type { BankingState, CharityId, LunarState, QuestProgress, BadgeId } from "./types";
import { currentMonthKey } from "./seasons";

export const INITIAL_LUNAR: LunarState = {
  points: 0,
  quests: {},
  monthlyDonations: { monthKey: currentMonthKey(), totalAmount: 0, count: 0 },
  ownedThemes: [],
  ownedBadges: [],
  equippedBadge: null,
  badgesDisabled: false,
  customThemes: [],
  dismissedPopups: [],
  animationsEnabled: true,
};

// ===== Quests =====

export interface QuestTier {
  goal: string;
  reward: number;
}

export interface QuestDef {
  id: string;
  title: string;
  category: "spending" | "transit" | "saving";
  /** Progressively harder & more rewarding tiers. */
  tiers: QuestTier[];
}

export const QUESTS: QuestDef[] = [
  {
    id: "shopping-cap",
    title: "Conscious shopping",
    category: "spending",
    tiers: [
      { goal: "Spend less than 500 SEK on shopping this week", reward: 50 },
      { goal: "Spend less than 300 SEK on shopping this week", reward: 100 },
      { goal: "Spend less than 150 SEK on shopping this week", reward: 200 },
      { goal: "Spend nothing on non-essentials for 7 days", reward: 400 },
    ],
  },
  {
    id: "green-transit",
    title: "Greener commute",
    category: "transit",
    tiers: [
      { goal: "Use public transit 3 days this month", reward: 40 },
      { goal: "Use public transit or bike 8 days this month", reward: 90 },
      { goal: "Skip car trips for 15 days this month", reward: 180 },
      { goal: "Go fully car-free for the whole month", reward: 350 },
    ],
  },
  {
    id: "save-rate",
    title: "Save more, spend less",
    category: "saving",
    tiers: [
      { goal: "Save 5% of this month's income", reward: 60 },
      { goal: "Save 10% of this month's income", reward: 120 },
      { goal: "Save 20% of this month's income", reward: 240 },
      { goal: "Save 30% of this month's income", reward: 450 },
    ],
  },
];

// ===== Charities =====

export interface CharityDef {
  id: CharityId;
  name: string;
  description: string;
  amount: number;
  reward: number;
  badgeLabel: string;
  badgeEmoji: string;
  color: string;
}

export const CHARITIES: CharityDef[] = [
  {
    id: "breastCancer",
    name: "Breast Cancer Research",
    description: "Fund research and patient support for breast cancer.",
    amount: 50,
    reward: 150,
    badgeLabel: "Pink Ribbon",
    badgeEmoji: "🎀",
    color: "#ec4899",
  },
  {
    id: "ocean",
    name: "Cleaning the Oceans",
    description: "Remove plastic from the seas and protect marine life.",
    amount: 50,
    reward: 150,
    badgeLabel: "Blue Wave",
    badgeEmoji: "🌊",
    color: "#0891b2",
  },
  {
    id: "trees",
    name: "Plant More Trees",
    description: "Reforest depleted areas across the globe.",
    amount: 50,
    reward: 150,
    badgeLabel: "Green Leaf",
    badgeEmoji: "🌳",
    color: "#16a34a",
  },
  {
    id: "children",
    name: "Feed Hungry Children",
    description: "Provide meals to children in need worldwide.",
    amount: 50,
    reward: 150,
    badgeLabel: "Heart of Gold",
    badgeEmoji: "💛",
    color: "#f59e0b",
  },
];

// ===== Helpers (pure on a state copy) =====

export function ensureMonthlyReset(lunar: LunarState): LunarState {
  const month = currentMonthKey();
  const fresh: Record<string, QuestProgress> = { ...lunar.quests };
  let changed = false;
  for (const q of QUESTS) {
    const cur = fresh[q.id];
    if (!cur || cur.monthKey !== month) {
      // Keep tier (progression carries across months) but allow another claim this cycle.
      fresh[q.id] = { tier: cur?.tier ?? 0, monthKey: month, claimedThisCycle: false };
      changed = true;
    }
  }
  return changed ? { ...lunar, quests: fresh } : lunar;
}

export function questCurrentTier(progress: QuestProgress | undefined, def: QuestDef): { tier: QuestTier; index: number } | null {
  const idx = progress?.tier ?? 0;
  if (idx >= def.tiers.length) return null;
  return { tier: def.tiers[idx], index: idx };
}

export function addSteps(state: BankingState, delta: number): BankingState {
  const lunar = ensureMonthlyReset(state.lunar);
  const newSteps = lunar.steps + delta;
  const totalAwards = Math.floor(newSteps / STEPS_PER_AWARD);
  const claimedAwards = Math.floor(lunar.stepsClaimed / STEPS_PER_AWARD);
  const newAwards = Math.max(0, totalAwards - claimedAwards);
  return {
    ...state,
    lunar: {
      ...lunar,
      steps: newSteps,
      stepsClaimed: totalAwards * STEPS_PER_AWARD,
      points: lunar.points + newAwards * POINTS_PER_AWARD,
      lastStepClaimedAt: newAwards > 0 ? Date.now() : lunar.lastStepClaimedAt,
    },
  };
}

export function claimQuest(state: BankingState, questId: string): BankingState {
  const lunar = ensureMonthlyReset(state.lunar);
  const def = QUESTS.find((q) => q.id === questId);
  if (!def) return state;
  const progress = lunar.quests[questId] ?? { tier: 0, monthKey: currentMonthKey(), claimedThisCycle: false };
  if (progress.claimedThisCycle) return state;
  const current = questCurrentTier(progress, def);
  if (!current) return state;
  return {
    ...state,
    lunar: {
      ...lunar,
      points: lunar.points + current.tier.reward,
      quests: {
        ...lunar.quests,
        [questId]: { tier: progress.tier + 1, monthKey: progress.monthKey, claimedThisCycle: true },
      },
    },
  };
}

export function donateToCharity(state: BankingState, charityId: CharityId): BankingState {
  const def = CHARITIES.find((c) => c.id === charityId);
  if (!def) return state;
  const lunar = ensureMonthlyReset(state.lunar);
  const ownedBadges = lunar.ownedBadges.includes(charityId) ? lunar.ownedBadges : [...lunar.ownedBadges, charityId];
  return {
    ...state,
    lunar: {
      ...lunar,
      points: lunar.points + def.reward,
      ownedBadges,
      equippedBadge: lunar.equippedBadge ?? charityId,
    },
  };
}

export function spendPoints(state: BankingState, cost: number, themeId: string): { state: BankingState; ok: boolean } {
  if (state.lunar.points < cost) return { state, ok: false };
  if (state.lunar.ownedThemes.includes(themeId)) return { state, ok: true };
  return {
    state: {
      ...state,
      lunar: {
        ...state.lunar,
        points: state.lunar.points - cost,
        ownedThemes: [...state.lunar.ownedThemes, themeId],
      },
    },
    ok: true,
  };
}

export function setEquippedBadge(state: BankingState, badge: BadgeId | null): BankingState {
  return { ...state, lunar: { ...state.lunar, equippedBadge: badge } };
}

export function setBadgesDisabled(state: BankingState, disabled: boolean): BankingState {
  return { ...state, lunar: { ...state.lunar, badgesDisabled: disabled } };
}

export function setAnimationsEnabled(state: BankingState, enabled: boolean): BankingState {
  return { ...state, lunar: { ...state.lunar, animationsEnabled: enabled } };
}

export function dismissPopup(state: BankingState, key: string): BankingState {
  if (state.lunar.dismissedPopups.includes(key)) return state;
  return { ...state, lunar: { ...state.lunar, dismissedPopups: [...state.lunar.dismissedPopups, key] } };
}

export function addCustomTheme(state: BankingState, name: string, dataUrl: string): { state: BankingState; ok: boolean; id?: string } {
  const COST = 750;
  if (state.lunar.points < COST) return { state, ok: false };
  const id = `custom-${crypto.randomUUID()}`;
  const newState: BankingState = {
    ...state,
    lunar: {
      ...state.lunar,
      points: state.lunar.points - COST,
      customThemes: [...state.lunar.customThemes, { id, name, imageDataUrl: dataUrl, createdAt: Date.now() }],
      ownedThemes: [...state.lunar.ownedThemes, id],
    },
  };
  return { state: newState, ok: true, id };
}

export function removeCustomTheme(state: BankingState, id: string): BankingState {
  return {
    ...state,
    lunar: {
      ...state.lunar,
      customThemes: state.lunar.customThemes.filter((t) => t.id !== id),
      ownedThemes: state.lunar.ownedThemes.filter((t) => t !== id),
    },
  };
}

export function getLunarPointsExplanation(): { text: string; action: string; link: string } {
  return {
    text: "Star Points are earned by completing monthly financial quests, hitting savings milestones, and staying active. You can use them to unlock exclusive themes and badges.",
    action: "Learn more about Star Points",
    link: "/lunar"
  };
}

export const STEP_CONSTANTS = { STEPS_PER_AWARD, POINTS_PER_AWARD };
