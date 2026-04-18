import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, QrCode, Save, ScanLine, Trash2, Pencil } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  decodeLayout,
  deleteLayout,
  encodeLayout,
  importLayout,
  loadState,
  updateProfile,
} from "@/lib/banking/storage";
import type { BankingState, SavedLayout, UserProfile } from "@/lib/banking/types";
import { WIDGET_CATALOG } from "@/lib/banking/widgets";
import { CHARITIES } from "@/lib/banking/lunar";
import { QrScannerDialog } from "@/components/banking/QrScannerDialog";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Lunar Bank" },
      { name: "description", content: "Update your details and manage your saved dashboard layouts." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [state, setState] = useState<BankingState | null>(null);
  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [shareLayout, setShareLayout] = useState<SavedLayout | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    const s = loadState();
    setState(s);
    setDraft(s.profile);
  }, []);

  if (!state || !draft) return <div className="min-h-screen bg-background" />;

  const save = () => {
    updateProfile(draft);
    setState(loadState());
    setEditing(false);
    toast.success("Profile updated");
  };

  const handleDelete = (id: string) => {
    deleteLayout(id);
    setState(loadState());
    toast.success("Layout deleted");
  };

  const handleScanResult = (text: string) => {
    const decoded = decodeLayout(text);
    if (!decoded) {
      toast.error("That code doesn't look right");
      return;
    }
    importLayout(decoded.name, decoded.widgets);
    setState(loadState());
    toast.success(`Imported "${decoded.name}"`);
  };

  const equippedBadge = state.lunar.badgesDisabled
    ? null
    : CHARITIES.find((c) => c.id === state.lunar.equippedBadge);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="text-sm font-semibold">Profile</div>
          <div className="w-32" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-6">
        {/* Personal info */}
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {draft.fullName.charAt(0)}
                {equippedBadge && (
                  <span
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card text-base shadow ring-2 ring-card"
                    title={equippedBadge.badgeLabel}
                  >
                    {equippedBadge.badgeEmoji}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold">{draft.fullName}</h1>
                <p className="text-sm text-muted-foreground">{draft.email}</p>
                {equippedBadge && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Wearing: <span className="font-medium" style={{ color: equippedBadge.color }}>{equippedBadge.badgeLabel}</span>
                  </p>
                )}
              </div>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setDraft(state.profile); setEditing(false); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={save} className="gap-1.5">
                  <Save className="h-4 w-4" /> Save
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" value={draft.fullName} editing={editing}
              onChange={(v) => setDraft({ ...draft, fullName: v })} />
            <Field label="Email" value={draft.email} editing={editing}
              onChange={(v) => setDraft({ ...draft, email: v })} />
            <Field label="Phone" value={draft.phone} editing={editing}
              onChange={(v) => setDraft({ ...draft, phone: v })} />
            <Field label="Date of birth" value={draft.dob} editing={editing} type="date"
              onChange={(v) => setDraft({ ...draft, dob: v })} />
            <Field label="Nationality" value={draft.nationality} editing={editing}
              onChange={(v) => setDraft({ ...draft, nationality: v })} />
            <Field label="Residence" value={draft.residence} editing={editing}
              onChange={(v) => setDraft({ ...draft, residence: v })} />
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Gender</Label>
              {editing ? (
                <Select value={draft.gender} onValueChange={(v) => setDraft({ ...draft, gender: v as UserProfile["gender"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other / prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm capitalize">{draft.gender}</div>
              )}
            </div>
            <Field label="National ID" value={draft.nationalId} editing={editing}
              onChange={(v) => setDraft({ ...draft, nationalId: v })} />
          </div>
        </section>

        {/* Saved layouts */}
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Saved dashboard layouts</h2>
              <p className="text-sm text-muted-foreground">
                Share with friends via QR or scan someone else's QR to import their layout.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setScannerOpen(true)}>
              <ScanLine className="h-4 w-4" /> Scan QR to import
            </Button>
          </div>

          {state.layouts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
              No saved layouts yet. Save one from your dashboard's Edit mode.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {state.layouts.map((l) => (
                <div key={l.id} className="rounded-xl border border-border/60 bg-background p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{l.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.widgets.length} widgets · {new Date(l.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete layout"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {l.widgets.slice(0, 4).map((w) => (
                      <span key={w} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                        {WIDGET_CATALOG[w]?.title.split(" ")[0]}
                      </span>
                    ))}
                    {l.widgets.length > 4 && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        +{l.widgets.length - 4}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => setShareLayout(l)}
                  >
                    <QrCode className="h-4 w-4" /> Share via QR
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* QR share dialog */}
      <Dialog open={!!shareLayout} onOpenChange={(o) => !o && setShareLayout(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{shareLayout?.name}"</DialogTitle>
            <DialogDescription>
              Have the other person open Profile → Scan QR and point their camera at this code.
            </DialogDescription>
          </DialogHeader>
          {shareLayout && <ShareView layout={shareLayout} />}
        </DialogContent>
      </Dialog>

      <QrScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleScanResult} />
    </div>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {editing ? (
        <Input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="text-sm">{value || "—"}</div>
      )}
    </div>
  );
}

function ShareView({ layout }: { layout: SavedLayout }) {
  const code = useMemo(() => encodeLayout(layout), [layout]);
  return (
    <div className="space-y-4">
      <div className="flex justify-center rounded-xl bg-white p-6">
        <QRCodeSVG value={code} size={200} level="M" />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Layout code</Label>
        <Textarea value={code} readOnly rows={3} className="mt-1.5 font-mono text-xs" />
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          navigator.clipboard.writeText(code);
          toast.success("Copied to clipboard");
        }}
      >
        Copy code
      </Button>
    </div>
  );
}
