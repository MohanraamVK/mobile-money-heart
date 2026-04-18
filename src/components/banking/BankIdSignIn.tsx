import { useState } from "react";
import { Fingerprint, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BankIdSignIn({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [personalId, setPersonalId] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "verifying">("idle");

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (personalId.trim().length < 6) return;
    setStatus("connecting");
    setTimeout(() => {
      setStatus("verifying");
      setTimeout(() => onAuthenticated(), 1100);
    }, 900);
  };

  return (
    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
      <header
        className="flex items-center gap-3 px-6 py-5 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <div className="text-lg font-semibold">Sign in with BankID</div>
          <div className="text-xs opacity-80">Secure identity verification</div>
        </div>
      </header>

      <form onSubmit={handleConnect} className="space-y-5 px-6 py-6">
        <div className="space-y-2">
          <Label htmlFor="personalId">Personal ID number</Label>
          <Input
            id="personalId"
            inputMode="numeric"
            placeholder="YYYYMMDD-XXXX"
            value={personalId}
            onChange={(e) => setPersonalId(e.target.value)}
            disabled={status !== "idle"}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            We'll use BankID on your phone to confirm it's really you.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full gap-2"
          disabled={status !== "idle" || personalId.trim().length < 6}
        >
          {status === "idle" && (
            <>
              <Fingerprint className="h-4 w-4" />
              Connect with BankID
            </>
          )}
          {status === "connecting" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening BankID…
            </>
          )}
          {status === "verifying" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying identity…
            </>
          )}
        </Button>

        <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Demo mode</p>
          <p className="mt-1">
            No real BankID call is made. Enter any ID (6+ characters) and we'll simulate the
            handshake, then load your details for review.
          </p>
        </div>
      </form>

      <footer className="border-t border-border/60 bg-muted/30 px-6 py-3 text-center text-[11px] text-muted-foreground">
        Protected by 256-bit encryption · Noctis Bank
      </footer>
    </div>
  );
}
