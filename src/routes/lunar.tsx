import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Footprints, Heart, Moon, Plus, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CHARITIES,
  QUESTS,
  STEP_CONSTANTS,
  addSteps,
  claimQuest,
  donateToCharity,
  ensureMonthlyReset,
  questCurrentTier,
  setBadgesDisabled,
  setEquippedBadge,
} from "@/lib/banking/lunar";
import { loadState, saveState } from "@/lib/banking/storage";
import type { BankingState } from "@/lib/banking/types";

export const Route = createFileRoute("/lunar")({
  head: () => ({
    meta: [
      { title: "Lunar Points — Lunar Bank" },
      { name: "description", content: "Earn Lunar Points through healthy spending, walking and donations to good causes." },
    ],
  }),
  component: LunarPage,
});

function LunarPage() {
  const [state, setState] = useState<BankingState | null>(null);

  useEffect(() => {
    const fresh = loadState();
    const reset = { ...fresh, lunar: ensureMonthlyReset(fresh.lunar) };
    saveState(reset);
    setState(reset);
  }, []);

  if (!state) return <div className="min-h-screen bg-background" />;

  const apply = (next: BankingState) => { saveState(next); setState(next); };

  const logSteps = (n: number) => {
    const before = state.lunar.points;
    const next = addSteps(state, n);
    apply(next);
    const earned = next.lunar.points - before;
    if (earned > 0) toast.success(`+${earned} LP for ${n} steps`);
    else toast(`+${n} steps logged`);
  };

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
    toast.success(`Donated ${def.amount} kr — +${def.reward} LP and ${def.badgeLabel} unlocked`);
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
          <div className="text-sm font-semibold">Lunar Points</div>
          <div className="w-32" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6">
        <BalanceCard points={state.lunar.points} />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StepsCard steps={state.lunar.steps} onLog={logSteps} />
          <BadgesCard
            owned={state.lunar.ownedBadges}
            equipped={state.lunar.equippedBadge}
            disabled={state.lunar.badgesDisabled}
            onEquip={equip}
            onToggle={toggleBadges}
          />
        </section>

        <QuestsSection state={state} onClaim={claim} />
        <CharitiesSection onDonate={donate} owned={state.lunar.ownedBadges} />
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
          <div className="text-4xl font-bold">{points.toLocaleString()} LP</div>
          <div className="mt-1 text-sm opacity-90">
            Earn more with healthy spending, daily steps and giving back.
          </div>
        </div>
      </div>
    </Card>
  );
}

function StepsCard({ steps, onLog }: { steps: number; onLog: (n: number) => void }) {
  const into = steps % STEP_CONSTANTS.STEPS_PER_AWARD;
  const pct = (into / STEP_CONSTANTS.STEPS_PER_AWARD) * 100;
  return (
    <Card className="border-border/60 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Footprints className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-semibold">Step counter</div>
          <div className="text-xs text-muted-foreground">
            For every {STEP_CONSTANTS.STEPS_PER_AWARD.toLocaleString()} steps, you receive {STEP_CONSTANTS.POINTS_PER_AWARD} Lunar Points.
          </div>
        </div>
      </div>
      <div className="mb-1 flex items-end justify-between">
        <div className="text-3xl font-bold">{steps.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{into}/{STEP_CONSTANTS.STEPS_PER_AWARD} to next reward</div>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onLog(500)}>+500 steps</Button>
        <Button size="sm" variant="outline" onClick={() => onLog(1000)}>+1,000 steps</Button>
        <Button size="sm" variant="outline" onClick={() => onLog(5000)}>+5,000 steps</Button>
      </div>
    </Card>
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
                  <div className="mt-2 text-2xl font-bold text-primary">+{current.tier.reward} LP</div>
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
        Each donation gives you Lunar Points plus a special badge you can wear on your profile.
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
              <div className="mb-3 text-xs font-medium text-primary">+{c.reward} LP · {c.badgeLabel}</div>
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
