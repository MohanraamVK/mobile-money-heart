import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Leaf, Moon, Plus, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CHARITIES,
  QUESTS,
  claimQuest,
  donateToCharity,
  ensureMonthlyDonationsReset,
  ensureMonthlyReset,
  questCurrentTier,
  questsCompletedThisMonth,
  setBadgesDisabled,
  setEquippedBadge,
} from "@/lib/banking/lunar";
import { computeCO2 } from "@/lib/banking/co2";
import { loadState, saveState } from "@/lib/banking/storage";
import type { BankingState } from "@/lib/banking/types";

export const Route = createFileRoute("/lunar")({
  head: () => ({
    meta: [
      { title: "Star Points — Noctis Bank" },
      { name: "description", content: "Earn Star Points through sustainable spending, quests and donations to good causes." },
    ],
  }),
  component: LunarPage,
});

function LunarPage() {
  const [state, setState] = useState<BankingState | null>(null);

  useEffect(() => {
    const fresh = loadState();
    let lunar = ensureMonthlyReset(fresh.lunar);
    lunar = ensureMonthlyDonationsReset(lunar);
    const reset = { ...fresh, lunar };
    saveState(reset);
    setState(reset);
  }, []);

  if (!state) return <div className="min-h-screen bg-background" />;

  const apply = (next: BankingState) => { saveState(next); setState(next); };

  const claim = (id: string) => {
    const next = claimQuest(state, id);
    if (next === state) {
      toast.error("Already claimed this cycle");
      return;
    }
    apply(next);
    toast.success("Quest reward added!");
  };

  const donate = (id: typeof CHARITIES[number]["id"]) => {
    const def = CHARITIES.find((c) => c.id === id)!;
    const next = donateToCharity(state, id);
    apply(next);
    toast.success(`Donated ${def.amount} kr — +${def.reward} SP and ${def.badgeLabel} unlocked`);
  };

  const equip = (id: typeof CHARITIES[number]["id"] | null) => {
    apply(setEquippedBadge(state, id));
  };

  const toggleBadges = () => {
    apply(setBadgesDisabled(state, !state.lunar.badgesDisabled));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="text-sm font-semibold">Star Points</div>
          <div className="w-32" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6">
        <BalanceCard points={state.lunar.points} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="impact">My impact this month</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-6">
            <BadgesCard
              owned={state.lunar.ownedBadges}
              equipped={state.lunar.equippedBadge}
              disabled={state.lunar.badgesDisabled}
              onEquip={equip}
              onToggle={toggleBadges}
            />
            <QuestsSection state={state} onClaim={claim} />
            <CharitiesSection onDonate={donate} owned={state.lunar.ownedBadges} />
          </TabsContent>

          <TabsContent value="impact" className="mt-4">
            <ImpactTab state={state} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function BalanceCard({ points }: { points: number }) {
  return (
    <Card className="overflow-hidden border-border/60 p-0">
      <div
        className="flex items-center gap-5 p-6 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Moon className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <div className="text-sm uppercase tracking-wide opacity-80">Your balance</div>
          <div className="text-4xl font-bold">{points.toLocaleString()} SP</div>
          <div className="mt-1 text-sm opacity-90">
            Earn more with sustainable spending, completing quests and giving back.
          </div>
        </div>
      </div>
    </Card>
  );
}

function ImpactTab({ state }: { state: BankingState }) {
  const co2 = computeCO2();
  const co2Pct = Math.min(100, Math.round((co2.totalKg / co2.baselineKg) * 100));
  const donations = state.lunar.monthlyDonations;
  const questsDone = questsCompletedThisMonth(state.lunar);
  const totalQuests = QUESTS.length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-border/60 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Leaf className="h-4 w-4" />
          </span>
          <div className="text-sm font-semibold">Carbon footprint</div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <div className="text-3xl font-bold">{co2.totalKg}</div>
          <div className="text-xs text-muted-foreground">kg CO₂e this month</div>
        </div>
        <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
          ▼ {co2.trendPct}% vs last month · {co2Pct}% of UK average
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${co2Pct}%` }} />
        </div>
        <ul className="mt-3 space-y-1 text-xs">
          {co2.byCategory.slice(0, 3).map((c) => (
            <li key={c.id} className="flex items-center justify-between">
              <span className="text-muted-foreground">{c.icon} {c.label}</span>
              <span className="font-medium">{c.kg} kg</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border-border/60 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <Heart className="h-4 w-4" />
          </span>
          <div className="text-sm font-semibold">Donated to charity</div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <div className="text-3xl font-bold">{donations.totalAmount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">kr this month</div>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {donations.count} {donations.count === 1 ? "donation" : "donations"} made
        </div>
        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          {donations.count === 0
            ? "Make your first donation this month to unlock a badge and earn Star Points."
            : `Thanks for giving back! Each donation also unlocks a badge.`}
        </div>
      </Card>

      <Card className="border-border/60 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Trophy className="h-4 w-4" />
          </span>
          <div className="text-sm font-semibold">Sustainability quests</div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <div className="text-3xl font-bold">{questsDone}</div>
          <div className="text-xs text-muted-foreground">of {totalQuests} achieved</div>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Completed this month
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(questsDone / Math.max(1, totalQuests)) * 100}%` }}
          />
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Quests reset at the start of each month — claim them in the Overview tab.
        </div>
      </Card>
    </div>
  );
}

function QuestsSection({ state, onClaim }: { state: BankingState; onClaim: (id: string) => void }) {
  const lunar = state.lunar;
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Sustainability quests</h2>
        <span className="text-xs text-muted-foreground">· reset monthly</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {QUESTS.map((q) => {
          const progress = lunar.quests[q.id];
          const current = questCurrentTier(progress, q);
          const claimed = progress?.claimedThisCycle ?? false;
          return (
            <Card key={q.id} className="border-border/60 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {q.title} · Tier {(progress?.tier ?? 0) + (current ? 1 : 0)}/{q.tiers.length}
              </div>
              {current ? (
                <>
                  <div className="mt-2 text-sm font-medium">{current.tier.goal}</div>
                  <div className="mt-2 text-2xl font-bold text-primary">+{current.tier.reward} SP</div>
                </>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">All tiers complete — incredible!</div>
              )}
              <Button
                className="mt-4 w-full"
                size="sm"
                disabled={!current || claimed}
                onClick={() => onClaim(q.id)}
              >
                {claimed ? "Claimed this cycle" : current ? "Claim reward" : "Done"}
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function CharitiesSection({
  onDonate,
  owned,
}: {
  onDonate: (id: typeof CHARITIES[number]["id"]) => void;
  owned: typeof CHARITIES[number]["id"][];
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Donate to good causes</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Each donation gives you Star Points plus a special badge you can wear on your profile.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CHARITIES.map((c) => {
          const have = owned.includes(c.id);
          return (
            <Card key={c.id} className="border-border/60 p-5">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                  style={{ background: `${c.color}22`, color: c.color }}
                >
                  {c.badgeEmoji}
                </span>
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.amount} kr donation</div>
                </div>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{c.description}</p>
              <div className="mb-3 text-xs font-medium text-primary">+{c.reward} SP · {c.badgeLabel}</div>
              <Button size="sm" className="w-full gap-1.5" variant={have ? "outline" : "default"} onClick={() => onDonate(c.id)}>
                <Plus className="h-3.5 w-3.5" />
                {have ? "Donate again" : "Donate"}
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function BadgesCard({
  owned,
  equipped,
  disabled,
  onEquip,
  onToggle,
}: {
  owned: typeof CHARITIES[number]["id"][];
  equipped: typeof CHARITIES[number]["id"] | null;
  disabled: boolean;
  onEquip: (id: typeof CHARITIES[number]["id"] | null) => void;
  onToggle: () => void;
}) {
  return (
    <Card className="border-border/60 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-semibold">Your badges</div>
          <div className="text-xs text-muted-foreground">
            Earned by donating. Pick one to wear on your dashboard.
          </div>
        </div>
      </div>
      {owned.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
          No badges yet — donate below to unlock your first one.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onEquip(null)}
            className={`rounded-full border px-3 py-1 text-xs ${equipped === null ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}
          >
            None
          </button>
          {owned.map((id) => {
            const c = CHARITIES.find((x) => x.id === id)!;
            const active = equipped === id;
            return (
              <button
                key={id}
                onClick={() => onEquip(id)}
                className={`rounded-full border px-3 py-1 text-xs ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}
              >
                {c.badgeEmoji} {c.badgeLabel}
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
        <div className="text-xs">{disabled ? "Badges hidden everywhere" : "Badges visible on profile & dashboard"}</div>
        <Button size="sm" variant="outline" onClick={onToggle}>{disabled ? "Show" : "Hide"}</Button>
      </div>
    </Card>
  );
}
