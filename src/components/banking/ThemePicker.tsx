import { useState } from "react";
import { Check, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { THEMES, type ThemeId } from "@/lib/banking/themes";
import { cn } from "@/lib/utils";

export function ThemePicker({
  current,
  onChange,
  triggerVariant = "outline",
  iconOnly = false,
}: {
  current: ThemeId;
  onChange: (id: ThemeId) => void;
  triggerVariant?: "outline" | "default" | "ghost";
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={iconOnly ? "icon" : "sm"}
          className={iconOnly ? "" : "gap-1.5"}
          aria-label="Change theme"
        >
          <Palette className="h-4 w-4" />
          {!iconOnly && "Theme"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a theme</DialogTitle>
          <DialogDescription>
            Change the colors and gradients across your whole dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 py-2 sm:grid-cols-2">
          {THEMES.map((t) => {
            const active = current === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border p-4 text-left transition-all",
                  active
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border/60 hover:border-primary/60",
                )}
              >
                <div
                  className="mb-3 h-14 w-full rounded-lg"
                  style={{ background: t.swatch }}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                  {active && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
