import {
  Repeat,
  Receipt,
  Target,
  PiggyBank,
  Users,
  PieChart,
  Lightbulb,
  CalendarDays,
  TrendingUp,
  ShieldAlert,
  Coins,
  Wallet,
  Baby,
  ShieldCheck,
  Contact,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WidgetId } from "@/lib/banking/types";
import { WIDGET_CATALOG } from "@/lib/banking/widgets";

const ICONS: Record<WidgetId, LucideIcon> = {
  subscriptionManager: Repeat,
  recurringPayments: Receipt,
  savingGoals: Target,
  fdRdInvestments: PiggyBank,
  expenseSharing: Users,
  cashFlowSplit: PieChart,
  investmentGuide: Lightbulb,
  moneyCalendar: CalendarDays,
  passiveIncome: TrendingUp,
  financialLimit: ShieldAlert,
  currencyExchange: Coins,
  spendingManager: Wallet,
  childExpenseTracker: Baby,
  insuranceCoverage: ShieldCheck,
  commonContacts: Contact,
};

function MockContent({ id }: { id: WidgetId }) {
  switch (id) {
    case "subscriptionManager":
      return (
        <ul className="space-y-1.5 text-sm">
          <li className="flex justify-between"><span className="text-muted-foreground">Netflix</span><span>£10.99 · May 22</span></li>
          <li className="flex justify-between"><span className="text-muted-foreground">Spotify</span><span>£5.99 · May 28</span></li>
          <li className="flex justify-between"><span className="text-muted-foreground">iCloud+</span><span>£2.49 · Jun 02</span></li>
        </ul>
      );
    case "recurringPayments":
      return (
        <ul className="space-y-1.5 text-sm">
          <li className="flex justify-between"><span>Rent</span><span className="text-muted-foreground">£1,200 · 28th</span></li>
          <li className="flex justify-between"><span>Electricity</span><span className="text-muted-foreground">£68 · 2nd</span></li>
          <li className="flex justify-between"><span>Internet</span><span className="text-muted-foreground">£35 · 5th</span></li>
        </ul>
      );
    case "savingGoals":
      return (
        <div>
          <div className="mb-1 text-sm text-muted-foreground">Holiday Fund</div>
          <div className="text-2xl font-bold">£1,240 / £3,000</div>
          <div className="mt-2 h-2 rounded-full bg-secondary">
            <div className="h-full w-[41%] rounded-full bg-accent" />
          </div>
        </div>
      );
    case "fdRdInvestments":
      return (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Fixed Deposit</span><span className="font-semibold">£5,000 · 4.2%</span></div>
          <div className="flex justify-between"><span>Recurring Deposit</span><span className="font-semibold">£250/mo</span></div>
          <div className="flex justify-between"><span>Bonds</span><span className="font-semibold">£1,800</span></div>
        </div>
      );
    case "expenseSharing":
      return (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Jamie owes you</span><span className="text-accent font-semibold">£42.10</span></div>
          <div className="flex justify-between"><span>You owe Sam</span><span className="text-destructive font-semibold">£18.50</span></div>
          <div className="text-xs text-muted-foreground">3 open splits</div>
        </div>
      );
    case "cashFlowSplit":
      return (
        <div className="space-y-2">
          {[
            ["Needs", 50],
            ["Wants", 30],
            ["Savings", 15],
            ["Investments", 5],
          ].map(([n, v]) => (
            <div key={n as string}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{n}</span>
                <span className="text-muted-foreground">{v}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>
      );
    case "investmentGuide":
      return (
        <div className="space-y-1 text-sm">
          <div className="font-semibold">Tip of the day</div>
          <p className="text-xs text-muted-foreground">
            Index funds offer broad market exposure with low fees — a solid starting point.
          </p>
        </div>
      );
    case "moneyCalendar":
      return (
        <ul className="space-y-1 text-sm">
          <li className="flex justify-between"><span>💷 Pay day</span><span className="text-muted-foreground">May 25</span></li>
          <li className="flex justify-between"><span>🏠 Rent due</span><span className="text-muted-foreground">May 28</span></li>
          <li className="flex justify-between"><span>⚡ Electricity</span><span className="text-muted-foreground">Jun 02</span></li>
        </ul>
      );
    case "passiveIncome":
      return (
        <div>
          <div className="text-sm text-muted-foreground">This month</div>
          <div className="text-2xl font-bold">£312.40</div>
          <div className="text-xs text-accent">▲ 8% vs last month</div>
        </div>
      );
    case "financialLimit":
      return (
        <div>
          <div className="text-sm text-muted-foreground">Monthly cap</div>
          <div className="text-2xl font-bold">£1,820 / £2,500</div>
          <div className="mt-2 h-2 rounded-full bg-secondary">
            <div className="h-full w-[73%] rounded-full bg-primary" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">73% used · 12 days left</div>
        </div>
      );
    case "currencyExchange":
      return (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>1 GBP →</span><span className="font-semibold">1.27 USD</span></div>
          <div className="flex justify-between"><span>1 GBP →</span><span className="font-semibold">1.17 EUR</span></div>
          <div className="flex justify-between"><span>1 GBP →</span><span className="font-semibold">192 JPY</span></div>
        </div>
      );
    case "spendingManager":
      return (
        <div className="space-y-2">
          {[
            ["Food", 65],
            ["Transit", 32],
            ["Bills", 80],
          ].map(([n, v]) => (
            <div key={n as string}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{n}</span>
                <span className="text-muted-foreground">£{(v as number) * 4}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>
      );
    case "childExpenseTracker":
      return (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>School fees</span><span>£420</span></div>
          <div className="flex justify-between"><span>Healthcare</span><span>£85</span></div>
          <div className="flex justify-between"><span>Activities</span><span>£60</span></div>
        </div>
      );
    case "insuranceCoverage":
      return (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Health</span><span className="text-muted-foreground">Renews Aug</span></div>
          <div className="flex justify-between"><span>Home</span><span className="text-muted-foreground">Renews Nov</span></div>
          <div className="flex justify-between"><span>Life</span><span className="text-muted-foreground">Active</span></div>
        </div>
      );
    case "commonContacts":
      return (
        <div className="flex gap-2">
          {["JM", "AS", "RT", "+"].map((i) => (
            <div
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium"
            >
              {i}
            </div>
          ))}
        </div>
      );
  }
}

export function WidgetCard({
  id,
  className,
  onRemove,
  dragHandleProps,
}: {
  id: WidgetId;
  className?: string;
  onRemove?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const meta = WIDGET_CATALOG[id];
  const Icon = ICONS[id];
  return (
    <Card
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden border-border/60 p-5 transition-all hover:-translate-y-0.5",
        className,
      )}
      style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          {...dragHandleProps}
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            dragHandleProps && "cursor-grab active:cursor-grabbing",
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span>{meta.title}</span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            aria-label={`Remove ${meta.title}`}
          >
            Remove
          </button>
        )}
      </div>
      <div className="flex-1">
        <MockContent id={id} />
      </div>
    </Card>
  );
}
