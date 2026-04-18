import {
  Wallet,
  ArrowLeftRight,
  PieChart,
  Target,
  CreditCard,
  ListChecks,
  Receipt,
  Coins,
  TrendingUp,
  GraduationCap,
  Plane,
  Users,
  Bitcoin,
  Sprout,
  Gift,
  Split,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WidgetId } from "@/lib/banking/types";
import { WIDGET_CATALOG } from "@/lib/banking/widgets";

const ICONS: Record<WidgetId, LucideIcon> = {
  balance: Wallet,
  transactions: Activity,
  quickTransfer: ArrowLeftRight,
  spending: PieChart,
  savingsGoal: Target,
  cards: CreditCard,
  budget: ListChecks,
  bills: Receipt,
  currencyConverter: Coins,
  investments: TrendingUp,
  studentLoans: GraduationCap,
  travelWallet: Plane,
  jointAccount: Users,
  crypto: Bitcoin,
  retirement: Sprout,
  rewards: Gift,
  billSplitter: Split,
};

function MockContent({ id }: { id: WidgetId }) {
  switch (id) {
    case "balance":
      return (
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">£12,486.20</div>
          <div className="text-xs text-muted-foreground">+£420.30 this month</div>
        </div>
      );
    case "transactions":
      return (
        <ul className="space-y-2 text-sm">
          {[
            ["Tesco", "-£42.10"],
            ["Salary", "+£2,800"],
            ["Netflix", "-£10.99"],
          ].map(([n, a]) => (
            <li key={n} className="flex justify-between">
              <span className="text-muted-foreground">{n}</span>
              <span className={a.startsWith("+") ? "text-accent" : ""}>{a}</span>
            </li>
          ))}
        </ul>
      );
    case "quickTransfer":
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
    case "spending":
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
                <span className="text-muted-foreground">{v}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    case "savingsGoal":
      return (
        <div>
          <div className="mb-2 text-sm text-muted-foreground">Holiday Fund</div>
          <div className="text-2xl font-bold">£1,240 / £3,000</div>
          <div className="mt-2 h-2 rounded-full bg-secondary">
            <div className="h-full w-[41%] rounded-full bg-accent" />
          </div>
        </div>
      );
    case "cards":
      return (
        <div className="rounded-lg p-4 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <div className="text-xs opacity-80">Visa Debit</div>
          <div className="mt-2 font-mono">•••• 4412</div>
        </div>
      );
    case "budget":
      return (
        <div>
          <div className="text-sm text-muted-foreground">May budget</div>
          <div className="text-2xl font-bold">£1,820 left</div>
          <div className="mt-2 h-2 rounded-full bg-secondary">
            <div className="h-full w-[62%] rounded-full bg-primary" />
          </div>
        </div>
      );
    case "bills":
      return (
        <ul className="space-y-1 text-sm">
          <li className="flex justify-between"><span>Rent</span><span>May 28</span></li>
          <li className="flex justify-between"><span>Electricity</span><span>Jun 02</span></li>
          <li className="flex justify-between"><span>Internet</span><span>Jun 05</span></li>
        </ul>
      );
    case "currencyConverter":
      return <div className="text-sm">1 GBP ≈ <span className="font-semibold">1.27 USD</span></div>;
    case "investments":
      return (
        <div>
          <div className="text-2xl font-bold">£8,420</div>
          <div className="text-xs text-accent">▲ 2.4% today</div>
        </div>
      );
    case "studentLoans":
      return (
        <div>
          <div className="text-sm text-muted-foreground">Balance</div>
          <div className="text-2xl font-bold">£14,200</div>
        </div>
      );
    case "travelWallet":
      return (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>EUR</span><span>€420</span></div>
          <div className="flex justify-between"><span>USD</span><span>$210</span></div>
          <div className="flex justify-between"><span>JPY</span><span>¥18,400</span></div>
        </div>
      );
    case "jointAccount":
      return (
        <div>
          <div className="text-sm text-muted-foreground">Family pool</div>
          <div className="text-2xl font-bold">£3,210</div>
        </div>
      );
    case "crypto":
      return (
        <div>
          <div className="text-2xl font-bold">£1,128</div>
          <div className="text-xs text-destructive">▼ 1.2% today</div>
        </div>
      );
    case "retirement":
      return (
        <div>
          <div className="text-sm text-muted-foreground">On track</div>
          <div className="text-2xl font-bold">82%</div>
        </div>
      );
    case "rewards":
      return <div className="text-2xl font-bold">2,480 pts</div>;
    case "billSplitter":
      return <div className="text-sm text-muted-foreground">3 open splits</div>;
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
