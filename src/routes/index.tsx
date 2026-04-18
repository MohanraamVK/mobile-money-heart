import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { BankIdSignIn } from "@/components/banking/BankIdSignIn";
import { VerifyDetails } from "@/components/banking/VerifyDetails";
import { Chatbot } from "@/components/banking/Chatbot";
import { Dashboard } from "@/components/banking/Dashboard";
import {
  loadState,
  resetAll,
  setActiveWidgets,
  setOnboarded,
  updateProfile,
} from "@/lib/banking/storage";
import type { BankingState, UserProfile, WidgetId } from "@/lib/banking/types";

type SignupPhase = "bankid" | "verify" | "chatbot";

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
  const [signupPhase, setSignupPhase] = useState<SignupPhase>("bankid");

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
    setSignupPhase("bankid");
    setState(loadState());
  };

  const handleVerified = (updated: UserProfile) => {
    updateProfile(updated);
    setState(loadState());
    setSignupPhase("chatbot");
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
          {signupPhase === "bankid" && (
            <BankIdSignIn onAuthenticated={() => setSignupPhase("verify")} />
          )}
          {signupPhase === "verify" && (
            <VerifyDetails profile={state.profile} onConfirm={handleVerified} />
          )}
          {signupPhase === "chatbot" && (
            <Chatbot profile={state.profile} onComplete={handleComplete} />
          )}
        </div>
      )}
      <Toaster richColors position="top-center" />
    </>
  );
}
