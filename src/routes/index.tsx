import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Chatbot } from "@/components/banking/Chatbot";
import { Dashboard } from "@/components/banking/Dashboard";
import {
  loadState,
  resetAll,
  setActiveWidgets,
  setOnboarded,
} from "@/lib/banking/storage";
import type { BankingState, WidgetId } from "@/lib/banking/types";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Nova Bank — Customize your dashboard" },
      {
        name: "description",
        content:
          "A customizable online banking dashboard. Chat with our assistant to tailor widgets to your goals.",
      },
    ],
  }),
});

function Index() {
  const [state, setState] = useState<BankingState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) {
    return <div className="min-h-screen bg-background" />;
  }

  const handleComplete = (widgets: WidgetId[]) => {
    setActiveWidgets(widgets);
    setOnboarded(true);
    setState(loadState());
  };

  const handleReset = () => {
    resetAll();
    setState(loadState());
  };

  return (
    <>
      {state.onboarded ? (
        <Dashboard initial={state} onReset={handleReset} />
      ) : (
        <div
          className="flex min-h-screen items-center justify-center px-4 py-10"
          style={{ background: "var(--gradient-hero)" }}
        >
          <Chatbot profile={state.profile} onComplete={handleComplete} />
        </div>
      )}
      <Toaster richColors position="top-center" />
    </>
  );
}
