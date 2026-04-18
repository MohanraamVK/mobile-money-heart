import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/lib/banking/types";

export function VerifyDetails({
  profile,
  onConfirm,
}: {
  profile: UserProfile;
  onConfirm: (updated: UserProfile) => void;
}) {
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;
    onConfirm({ ...profile, email: email.trim(), phone: phone.trim() });
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start justify-between gap-4 border-b border-border/40 py-2 last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );

  return (
    <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
      <header
        className="flex items-center gap-3 px-6 py-5 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <div className="text-lg font-semibold">Verify your details</div>
          <div className="text-xs opacity-80">Imported securely from BankID</div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
        <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Verified by BankID
          </div>
          <Row label="Full name" value={profile.fullName} />
          <Row label="Date of birth" value={profile.dob} />
          <Row label="Nationality" value={profile.nationality} />
          <Row label="Residence" value={profile.residence} />
          <Row label="National ID" value={profile.nationalId} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          {!emailValid && email.length > 0 && (
            <p className="text-xs text-destructive">Please enter a valid email.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7700 900000"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Confirm everything looks right. You can update other details later in your profile.
        </p>

        <Button type="submit" className="w-full" disabled={!emailValid}>
          Confirm and continue
        </Button>
      </form>
    </div>
  );
}
