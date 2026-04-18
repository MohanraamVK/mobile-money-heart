import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { activeHoliday, activeSeason } from "@/lib/banking/seasons";
import { dismissPopup } from "@/lib/banking/lunar";
import { persistLunar } from "@/lib/banking/storage";
import type { BankingState } from "@/lib/banking/types";

interface Props {
  state: BankingState;
  onChange: (s: BankingState) => void;
  onApplyHoliday: (id: "christmas" | "easter" | "midsummer") => void;
  onApplyTheme: (id: "spring" | "summer" | "autumn" | "winter") => void;
}

export function SeasonalPopup({ state, onChange, onApplyHoliday, onApplyTheme }: Props) {
  const [show, setShow] = useState<{
    title: string;
    body: string;
    cta: string;
    key: string;
    onCta: () => void;
  } | null>(null);

  useEffect(() => {
    const holiday = activeHoliday();
    const season = activeSeason();
    const dismissed = state.lunar.dismissedPopups;

    if (holiday && !dismissed.includes(holiday.key)) {
      setShow({
        title: `It's ${holiday.label}! 🎉`,
        body: `A free ${holiday.label} animation is available right now — overlay it on your current theme.`,
        cta: `Try ${holiday.label}`,
        key: holiday.key,
        onCta: () => onApplyHoliday(holiday.id as "christmas" | "easter" | "midsummer"),
      });
      return;
    }
    if (!dismissed.includes(season.key)) {
      setShow({
        title: `${season.label} is here 🌿`,
        body: `Your free ${season.label} theme is unlocked while the season lasts.`,
        cta: `Switch to ${season.label}`,
        key: season.key,
        onCta: () => onApplyTheme(season.id as "spring" | "summer" | "autumn" | "winter"),
      });
    }
  }, [state.lunar.dismissedPopups, onApplyHoliday, onApplyTheme]);

  if (!show) return null;

  const dismiss = () => {
    const next = dismissPopup(state, show.key);
    persistLunar(next.lunar);
    onChange(next);
    setShow(null);
  };

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4">
      <div
        className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl"
        style={{ boxShadow: "var(--shadow-glow)" }}
      >
        <div
          className="flex items-start gap-3 p-4 text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">{show.title}</div>
            <div className="mt-0.5 text-sm opacity-90">{show.body}</div>
          </div>
          <button onClick={dismiss} className="text-white/80 hover:text-white" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-end gap-2 p-3">
          <Button variant="ghost" size="sm" onClick={dismiss}>Maybe later</Button>
          <Button size="sm" onClick={() => { show.onCta(); dismiss(); }}>{show.cta}</Button>
        </div>
      </div>
    </div>
  );
}
