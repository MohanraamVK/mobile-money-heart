import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ALL_THEMES, HOLIDAYS, type ThemeId } from "@/lib/banking/themes";
import { toast } from "sonner";

const WORD_LIMIT = 100;
const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

type DioneAction =
  | { type: "theme"; id: ThemeId }
  | { type: "edit" }
  | { type: "save" }
  | { type: "book"; topic: string }
  | { type: "open"; target: "offers" | "profile" | "lunar" }
  | { type: "lunarInfo" };

export interface DioneCallbacks {
  onSetTheme: (id: ThemeId) => void;
  onToggleEdit: () => void;
  onSaveLayout: () => void;
  onNavigate: (target: "offers" | "profile" | "lunar") => void;
}

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
  { label: "🌙 How do I earn Lunar Points?", action: { type: "lunarInfo" } },
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
}: {
  callbacks: DioneCallbacks;
  currentTheme: ThemeId;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi, I'm Dione 🌙 — your Lunar Bank assistant. I can change your theme, tweak your dashboard, book appointments, explain Lunar Points and more. What would you like to do?",
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
      case "edit":
        callbacks.onToggleEdit();
        push({
          role: "bot",
          text: "Edit mode is on. Drag tiles to reorder, tap × to remove, or use Add widget. Tell me when you're done!",
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
            "**Lunar Points** reward healthier, greener money habits. Here's how to earn them:\n\n" +
            "• 🚶 **Walk** — every 1,000 steps = 10 LP\n" +
            "• 🌱 **Quests** — three monthly sustainability quests with progressive tiers (50–450 LP)\n" +
            "• 💛 **Donate** — to one of four charities and unlock a special badge (+150 LP each)\n\n" +
            "Spend points to unlock seasonal & holiday themes outside their window, or upload your own custom theme.",
          quick: [
            { label: "Open Lunar Points", action: { type: "open", target: "lunar" } },
            { label: "Back", action: "back" },
          ],
        });
        break;
    }
  };

  const handleFreeText = () => {
    const text = input.trim();
    if (!text || overLimit) return;
    setInput("");
    push({ role: "user", text });

    const lc = text.toLowerCase();
    const themeHit = ALL_THEMES.find((t) => lc.includes(t.id) || lc.includes(t.name.toLowerCase()));
    if (themeHit && (lc.includes("theme") || lc.includes("color"))) {
      handleAction(themeHit.name, { type: "theme", id: themeHit.id });
      return;
    }
    const holidayHit = HOLIDAYS.find((h) => lc.includes(h.id));
    if (holidayHit && (lc.includes("holiday") || lc.includes("snow") || lc.includes("flower"))) {
      handleAction("Change theme", "back");
      return;
    }
    if (lc.includes("lunar") || lc.includes("point") || lc.includes("step") || lc.includes("quest") || lc.includes("donat")) {
      handleAction("How do I earn Lunar Points?", { type: "lunarInfo" });
      return;
    }
    if (lc.includes("edit") || lc.includes("rearrang") || lc.includes("move")) {
      handleAction("Edit my layout", { type: "edit" });
      return;
    }
    if (lc.includes("save")) {
      handleAction("Save current layout", { type: "save" });
      return;
    }
    if (lc.includes("appointment") || lc.includes("book") || lc.includes("meeting")) {
      handleAction("📅 Book an appointment", "back");
      return;
    }
    if (lc.includes("offer") || lc.includes("promo") || lc.includes("deal")) {
      handleAction("See offers", { type: "open", target: "offers" });
      return;
    }
    if (lc.includes("profile") || lc.includes("account info")) {
      handleAction("Open my profile", { type: "open", target: "profile" });
      return;
    }
    push({
      role: "bot",
      text: "I can help with themes, layout edits, saving layouts, booking appointments, Lunar Points, offers and your profile. Pick one below 👇",
      quick: ROOT_QUICKS,
    });
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
              <div className="text-xs opacity-80">Your Lunar Bank assistant</div>
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
