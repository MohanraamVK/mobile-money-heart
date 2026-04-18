import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ALL_THEMES, HOLIDAYS, type HolidayOverlayId, type ThemeId } from "@/lib/banking/themes";
import { WIDGET_CATALOG } from "@/lib/banking/widgets";
import type { WidgetId } from "@/lib/banking/types";
import { toast } from "sonner";

const WORD_LIMIT = 100;
const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

type DioneAction =
  | { type: "theme"; id: ThemeId }
  | { type: "holiday"; id: HolidayOverlayId }
  | { type: "edit" }
  | { type: "save" }
  | { type: "book"; topic: string }
  | { type: "open"; target: "offers" | "profile" | "lunar" }
  | { type: "lunarInfo" }
  | { type: "co2Info" }
  | { type: "findWidget"; id: WidgetId }
  | { type: "help" };

export interface DioneCallbacks {
  onSetTheme: (id: ThemeId) => void;
  onSetHoliday: (id: HolidayOverlayId) => void;
  onToggleEdit: () => void;
  onSaveLayout: () => void;
  onNavigate: (target: "offers" | "profile" | "lunar") => void;
  onFindWidget: (id: WidgetId, present: boolean) => void;
}

/**
 * Per-widget keyword aliases used by the intent parser. Matching is case-insensitive
 * substring against the user input. Keep entries lowercase. The widget title is
 * always implicitly searched too.
 */
const WIDGET_ALIASES: Record<WidgetId, string[]> = {
  subscriptionManager: ["subscription", "subscriptions", "netflix", "spotify", "recurring service"],
  recurringPayments: ["recurring payment", "rent", "bill", "bills", "utilities"],
  savingGoals: ["saving", "savings", "saving goal", "goal", "goals", "target"],
  fdRdInvestments: ["fd", "rd", "fixed deposit", "recurring deposit", "deposit"],
  expenseSharing: ["splitwise", "split", "share expense", "shared expense", "owe", "roommate"],
  cashFlowSplit: ["cash flow", "cashflow", "budget split", "needs wants", "50/30/20"],
  investmentGuide: ["investment guide", "invest tips", "investing guide", "stock tips"],
  moneyCalendar: ["calendar", "schedule", "due date", "pay day", "payday"],
  passiveIncome: ["passive", "passive income", "dividend", "rent income", "side hustle"],
  financialLimit: ["financial limit", "spending limit", "limit", "cap"],
  currencyExchange: ["currency", "exchange", "fx", "forex", "conversion"],
  spendingManager: ["spending", "spend manager", "expenses", "expense", "categorize"],
  childExpenseTracker: ["child", "kid", "kids", "children", "school"],
  insuranceCoverage: ["insurance", "policy", "coverage", "premium"],
  commonContacts: ["contact", "contacts", "payee", "payees", "send money"],
  lunarPoints: ["star points", "star point", "lunar points", "sp balance", "rewards", "points widget"],
  co2Tracker: ["co2", "co₂", "carbon", "footprint", "emission", "emissions"],
};


type Msg = {
  role: "bot" | "user";
  text: string;
  quick?: { label: string; action: DioneAction | "back" }[];
};

const ROOT_QUICKS: Msg["quick"] = [
  { label: "🎨 Change theme", action: "back" },
  { label: "✏️ Edit my layout", action: { type: "edit" } },
  { label: "💾 Save current layout", action: { type: "save" } },
  { label: "📅 Book an appointment", action: "back" },
  { label: "⭐ How do I earn Star Points?", action: { type: "lunarInfo" } },
  { label: "🌱 My CO₂ footprint", action: { type: "co2Info" } },
  { label: "🎁 See offers", action: { type: "open", target: "offers" } },
  { label: "👤 Open my profile", action: { type: "open", target: "profile" } },
];

const APPOINTMENT_TOPICS = [
  "Mortgage advisor",
  "Investment review",
  "Open new account",
  "Card / fraud help",
];

export function DioneAssistant({
  callbacks,
  currentTheme,
  activeWidgets,
}: {
  callbacks: DioneCallbacks;
  currentTheme: ThemeId;
  activeWidgets: WidgetId[];
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi, I'm Dione 🌙 — your Noctis Bank assistant. Type anything (under 100 words) like 'switch to sunset', 'show me my passive income', 'turn on snow' or 'how do I earn points'.",
      quick: ROOT_QUICKS,
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wordCount = countWords(input);
  const overLimit = wordCount > WORD_LIMIT;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const push = (m: Msg) => setMessages((prev) => [...prev, m]);

  const handleAction = (label: string, action: DioneAction | "back") => {
    push({ role: "user", text: label });

    if (action === "back") {
      if (label.includes("theme")) {
        push({
          role: "bot",
          text: "Pick a theme and I'll apply it instantly:",
          quick: ALL_THEMES.map((t) => ({
            label: `${t.id === currentTheme ? "✓ " : ""}${t.name}`,
            action: { type: "theme", id: t.id },
          })),
        });
      } else if (label.includes("appointment")) {
        push({
          role: "bot",
          text: "What's the appointment about? I'll book the next available slot.",
          quick: APPOINTMENT_TOPICS.map((topic) => ({
            label: topic,
            action: { type: "book", topic },
          })),
        });
      }
      return;
    }

    switch (action.type) {
      case "theme": {
        callbacks.onSetTheme(action.id);
        const name = ALL_THEMES.find((t) => t.id === action.id)?.name ?? action.id;
        push({
          role: "bot",
          text: `Done — switched to the **${name}** theme. Want anything else?`,
          quick: ROOT_QUICKS,
        });
        break;
      }
      case "holiday": {
        callbacks.onSetHoliday(action.id);
        const name = action.id === "none" ? "no holiday" : action.id;
        push({
          role: "bot",
          text: `Holiday animation set to **${name}**. Anything else?`,
          quick: ROOT_QUICKS,
        });
        break;
      }
      case "edit":
        callbacks.onToggleEdit();
        push({
          role: "bot",
          text: "Edit mode is on. Drag tiles to reorder, tap a size button to resize, tap × to remove, or use Add widget.",
          quick: ROOT_QUICKS,
        });
        break;
      case "save":
        callbacks.onSaveLayout();
        push({
          role: "bot",
          text: "Opening the save dialog — name your layout and it'll be added to your collection.",
          quick: ROOT_QUICKS,
        });
        break;
      case "book": {
        const slot = nextSlot();
        toast.success(`Booked: ${action.topic} on ${slot}`);
        push({
          role: "bot",
          text: `Booked your **${action.topic}** appointment for **${slot}**. You'll get a confirmation email — no queues, no waiting on hold. Anything else?`,
          quick: ROOT_QUICKS,
        });
        break;
      }
      case "open":
        callbacks.onNavigate(action.target);
        push({
          role: "bot",
          text: `Opening your ${action.target} page now.`,
          quick: ROOT_QUICKS,
        });
        break;
      case "lunarInfo":
        push({
          role: "bot",
          text:
            "**Star Points (SP)** reward healthier, greener money habits. Here's how to earn them:\n\n" +
            "• 🚶 **Walk** — every 1,000 steps = 10 SP\n" +
            "• 🌱 **Quests** — three monthly sustainability quests with progressive tiers (50–450 SP)\n" +
            "• 💛 **Donate** — to one of four charities and unlock a special badge (+150 SP each)\n\n" +
            "Spend points to unlock seasonal & holiday themes outside their window, or upload your own custom theme.",
          quick: [
            { label: "Open Star Points", action: { type: "open", target: "lunar" } },
            { label: "Back", action: "back" },
          ],
        });
        break;
      case "co2Info":
        push({
          role: "bot",
          text:
            "Your **CO₂ Footprint** widget estimates emissions from each spend category (food, transport, shopping, energy, travel) using kg-CO₂e-per-£ factors. Lower spend in high-factor categories = lower footprint.",
          quick: ROOT_QUICKS,
        });
        break;
      case "help":
        push({
          role: "bot",
          text: "I can: switch theme, toggle holiday animations, edit/save your layout, book appointments, explain Star Points & CO₂, open offers or profile. Just say what you'd like!",
          quick: ROOT_QUICKS,
        });
        break;
    }
  };

  const handleFreeText = () => {
    const text = input.trim();
    if (!text || overLimit) return;
    setInput("");
    push({ role: "user", text });

    const action = parseIntent(text);
    if (action) {
      // Route through handleAction for unified bot response (skip echoing the user msg).
      runAction(action);
      return;
    }

    push({
      role: "bot",
      text: "I'm not sure I caught that — here are things I can do:",
      quick: ROOT_QUICKS,
    });
  };

  /** Run an action without re-pushing the user message (already pushed by handleFreeText). */
  const runAction = (action: DioneAction) => {
    switch (action.type) {
      case "theme": {
        callbacks.onSetTheme(action.id);
        const name = ALL_THEMES.find((t) => t.id === action.id)?.name ?? action.id;
        push({ role: "bot", text: `Switched to the **${name}** theme ✨`, quick: ROOT_QUICKS });
        break;
      }
      case "holiday": {
        callbacks.onSetHoliday(action.id);
        push({
          role: "bot",
          text: action.id === "none"
            ? "Turned holiday animations off."
            : `Turned on **${action.id}** animations 🎉`,
          quick: ROOT_QUICKS,
        });
        break;
      }
      case "edit":
        callbacks.onToggleEdit();
        push({ role: "bot", text: "Edit mode is on — drag, resize, add or remove widgets.", quick: ROOT_QUICKS });
        break;
      case "save":
        callbacks.onSaveLayout();
        push({ role: "bot", text: "Opening the save dialog — name your layout!", quick: ROOT_QUICKS });
        break;
      case "open":
        callbacks.onNavigate(action.target);
        push({ role: "bot", text: `Opening **${action.target}** for you.`, quick: ROOT_QUICKS });
        break;
      case "book": {
        const slot = nextSlot();
        toast.success(`Booked: ${action.topic} on ${slot}`);
        push({ role: "bot", text: `Booked **${action.topic}** for **${slot}** ✅`, quick: ROOT_QUICKS });
        break;
      }
      case "lunarInfo":
        handleAction("How do I earn Star Points?", { type: "lunarInfo" });
        break;
      case "co2Info":
        handleAction("My CO₂ footprint", { type: "co2Info" });
        break;
      case "help":
        handleAction("Help", { type: "help" });
        break;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-2xl transition-transform hover:scale-105",
          open && "scale-95",
        )}
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        aria-label="Open Dione assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-30 flex h-[560px] max-h-[80vh] w-[min(calc(100vw-3rem),400px)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
          <header
            className="flex items-center gap-3 px-4 py-3 text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Dione</div>
              <div className="text-xs opacity-80">Your Noctis Bank assistant</div>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
                <div className="flex items-end gap-2">
                  {m.role === "bot" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-3 w-3" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      m.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-secondary text-secondary-foreground",
                    )}
                    dangerouslySetInnerHTML={{ __html: formatMd(m.text) }}
                  />
                </div>
                {m.quick && i === messages.length - 1 && (
                  <div className="ml-8 flex flex-wrap gap-1.5">
                    {m.quick.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => handleAction(q.label, q.action)}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <footer className="border-t border-border/60 bg-muted/30 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFreeText()}
                placeholder="Ask Dione anything…"
                className={cn(
                  "flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:border-primary",
                  overLimit ? "border-destructive" : "border-border",
                )}
              />
              <Button size="icon" onClick={handleFreeText} disabled={overLimit || !input.trim()} aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className={cn(
              "mt-1.5 text-right text-[11px]",
              overLimit ? "text-destructive font-medium" : "text-muted-foreground",
            )}>
              {wordCount}/{WORD_LIMIT} words {overLimit && "· too long"}
            </div>
          </footer>
        </div>
      )}
    </>
  );
}

/**
 * Lightweight intent parser. Scores phrases against the input and returns the
 * best match. Order matters: the *first* high-scoring rule wins.
 */
function parseIntent(text: string): DioneAction | null {
  const lc = text.toLowerCase();

  // 1) HOLIDAY ANIMATION TOGGLES — explicit wins
  if (/(turn|switch|enable|start|put on|add).*(snow|christmas)/.test(lc) || /^snow$/.test(lc)) {
    return { type: "holiday", id: "christmas" };
  }
  if (/(turn|switch|enable|start|put on|add).*(easter|egg)/.test(lc)) {
    return { type: "holiday", id: "easter" };
  }
  if (/(turn|switch|enable|start|put on|add).*(midsummer|flower|petal)/.test(lc)) {
    return { type: "holiday", id: "midsummer" };
  }
  if (/(turn off|disable|stop|remove|hide).*(snow|holiday|animation|flower|petal|egg)/.test(lc)) {
    return { type: "holiday", id: "none" };
  }
  if (/(no|none) (holiday|animation)/.test(lc)) {
    return { type: "holiday", id: "none" };
  }

  // 2) THEME — match by name
  const themeHit = ALL_THEMES.find((t) => {
    const name = t.name.toLowerCase();
    const id = t.id.toLowerCase();
    return new RegExp(`\\b${name}\\b`).test(lc) || new RegExp(`\\b${id}\\b`).test(lc);
  });
  if (themeHit) {
    if (/(theme|color|colour|background|look|style|switch|change|use|apply|set)/.test(lc)) {
      return { type: "theme", id: themeHit.id };
    }
  }
  // bare "change theme" with no specific theme → fallback to help-style theme list
  if (/(change|switch|set|pick|choose|new) (the )?(theme|color|colour|look|background|style)/.test(lc)) {
    return { type: "help" };
  }

  // 3) STAR POINTS / lunar
  if (/(star|lunar) ?points?|^points?\b|how.*(earn|get).*(point|sp|lp)|reward|sp balance/.test(lc)) {
    if (/(open|see|show|view|go to)/.test(lc)) return { type: "open", target: "lunar" };
    return { type: "lunarInfo" };
  }
  if (/\b(quest|step|donat|charit)/.test(lc)) {
    return { type: "lunarInfo" };
  }

  // 4) CO2
  if (/co2|co₂|carbon|footprint|emission|green|sustainab/.test(lc)) {
    return { type: "co2Info" };
  }

  // 5) LAYOUT / EDIT
  if (/(edit|customi[sz]e|rearrang|reorder|move|drag|resize)/.test(lc) && /(layout|widget|dashboard|home)/.test(lc)) {
    return { type: "edit" };
  }
  if (/^(edit|customi[sz]e|rearrange)\b/.test(lc)) return { type: "edit" };
  if (/(save|store|keep).*(layout|dashboard)/.test(lc) || lc === "save") {
    return { type: "save" };
  }

  // 6) APPOINTMENTS
  if (/(book|schedul|appointment|meeting|advisor|talk to|speak)/.test(lc)) {
    if (/mortgage/.test(lc)) return { type: "book", topic: "Mortgage advisor" };
    if (/invest/.test(lc)) return { type: "book", topic: "Investment review" };
    if (/account/.test(lc)) return { type: "book", topic: "Open new account" };
    if (/card|fraud|stolen|lost/.test(lc)) return { type: "book", topic: "Card / fraud help" };
    return { type: "book", topic: "Mortgage advisor" };
  }

  // 7) NAVIGATION
  if (/(offer|promo|deal|discount|cashback)/.test(lc)) return { type: "open", target: "offers" };
  if (/(profile|account info|my (info|details)|address|name|nationality|date of birth)/.test(lc)) {
    return { type: "open", target: "profile" };
  }

  // 8) HELP fallback
  if (/^(help|what can you do|hi|hello|hey)\b/.test(lc) || /what.*do/.test(lc)) {
    return { type: "help" };
  }

  // Last-ditch: if a holiday word alone, assume animation toggle on
  if (/^(christmas|easter|midsummer)$/.test(lc)) {
    return { type: "holiday", id: lc as HolidayOverlayId };
  }

  // Last-ditch: bare theme name
  if (themeHit) return { type: "theme", id: themeHit.id };

  return null;
}

// keeping HOLIDAYS import linkage even though parser uses regex
void HOLIDAYS;

function nextSlot() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(10, 30, 0, 0);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMd(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
