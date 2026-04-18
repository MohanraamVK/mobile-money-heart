import { useEffect, useRef, useState } from "react";
import { Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserProfile, WidgetId } from "@/lib/banking/types";
import {
  DEFAULT_WIDGETS,
  inferPersona,
  type OnboardingAnswers,
  recommendWidgets,
} from "@/lib/banking/widgets";

type Choice = { label: string; value: string };
type Step = {
  id: string;
  question: (p: UserProfile) => string;
  choices: Choice[];
};

const STEPS: Step[] = [
  {
    id: "persona",
    question: (p) =>
      `Thanks ${p.fullName.split(" ")[0]}! Which best describes you right now? (We pre-selected one based on your age of ${p.age}.)`,
    choices: [
      { label: "Youth (18–25)", value: "youth" },
      { label: "Working adult (25+)", value: "workingAdult" },
      { label: "International student", value: "intlStudent" },
      { label: "Family / shared finances", value: "family" },
    ],
  },
  {
    id: "primaryGoal",
    question: () => "What matters most to you right now?",
    choices: [
      { label: "Saving more", value: "save" },
      { label: "Tracking spending", value: "spend" },
      { label: "Growing investments", value: "invest" },
      { label: "Sharing expenses", value: "share" },
    ],
  },
  {
    id: "travelOften",
    question: (p) =>
      `You're based in ${p.residence}. Do you deal with multiple currencies often?`,
    choices: [
      { label: "Yes, frequently", value: "yes" },
      { label: "Not really", value: "no" },
    ],
  },
  {
    id: "interestedInPassive",
    question: () => "Last one — would you like to track passive income (dividends, rent, crypto)?",
    choices: [
      { label: "Yes, show it", value: "yes" },
      { label: "Skip for now", value: "no" },
    ],
  },
];

type Msg =
  | { role: "bot"; text: string }
  | { role: "user"; text: string };

export function Chatbot({
  profile,
  onComplete,
}: {
  profile: UserProfile;
  onComplete: (widgets: WidgetId[]) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: `Hi ${profile.fullName.split(" ")[0]}, welcome to your new account.` },
    { role: "bot", text: "Would you like to customize your banking dashboard?" },
  ]);
  const [phase, setPhase] = useState<"intro" | "questions" | "done">("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const pushBot = (text: string, delay = 350) =>
    new Promise<void>((res) =>
      setTimeout(() => {
        setMessages((m) => [...m, { role: "bot", text }]);
        res();
      }, delay),
    );

  const handleIntro = async (yes: boolean) => {
    setMessages((m) => [...m, { role: "user", text: yes ? "Yes, customize it" : "No, use defaults" }]);
    if (!yes) {
      await pushBot("No problem — I'll set up a default dashboard for you.");
      setPhase("done");
      setTimeout(() => onComplete(DEFAULT_WIDGETS), 600);
      return;
    }
    setPhase("questions");
    await pushBot("Great — a few quick questions to tailor your dashboard.");
    await pushBot(STEPS[0].question(profile));
  };

  const handleAnswer = async (choice: Choice) => {
    const step = STEPS[stepIdx];
    setMessages((m) => [...m, { role: "user", text: choice.label }]);
    const next = { ...answers, [step.id]: choice.value } as Partial<OnboardingAnswers>;
    setAnswers(next);

    if (stepIdx + 1 < STEPS.length) {
      const nextStep = STEPS[stepIdx + 1];
      setStepIdx(stepIdx + 1);
      await pushBot(nextStep.question(profile));
    } else {
      setPhase("done");
      await pushBot("Perfect. Building your personalized dashboard now…");
      const widgets = recommendWidgets(profile, next as OnboardingAnswers);
      setTimeout(() => onComplete(widgets), 700);
    }
  };

  const currentStep = phase === "questions" ? STEPS[stepIdx] : null;

  return (
    <div className="flex h-[600px] max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
      <header
        className="flex items-center gap-3 px-6 py-4 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold">Onboarding Assistant</div>
          <div className="text-xs opacity-80">Let's set up your banking dashboard</div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex items-end gap-2",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            {m.role === "bot" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-secondary text-secondary-foreground",
              )}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="border-t border-border/60 bg-muted/30 p-4">
        {phase === "intro" && (
          <div className="flex gap-2">
            <Button onClick={() => handleIntro(true)} className="flex-1">Yes, customize</Button>
            <Button onClick={() => handleIntro(false)} variant="outline" className="flex-1">
              No, use defaults
            </Button>
          </div>
        )}
        {phase === "questions" && currentStep && (
          <div className="flex flex-wrap gap-2">
            {currentStep.choices.map((c) => (
              <Button
                key={c.value}
                onClick={() => handleAnswer(c)}
                variant="outline"
                size="sm"
                className="flex-1 min-w-[140px]"
              >
                {c.label}
              </Button>
            ))}
          </div>
        )}
        {phase === "done" && (
          <div className="text-center text-xs text-muted-foreground">Setting things up…</div>
        )}
      </footer>
    </div>
  );
}
