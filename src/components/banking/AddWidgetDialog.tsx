import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WIDGET_CATALOG } from "@/lib/banking/widgets";
import type { WidgetId } from "@/lib/banking/types";

export function AddWidgetDialog({
  active,
  onAdd,
}: {
  active: WidgetId[];
  onAdd: (id: WidgetId) => void;
}) {
  const [open, setOpen] = useState(false);
  const available = (Object.keys(WIDGET_CATALOG) as WidgetId[]).filter(
    (id) => !active.includes(id),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a widget</DialogTitle>
          <DialogDescription>
            Pick from the widgets you don't have on your dashboard yet.
          </DialogDescription>
        </DialogHeader>
        {available.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            You've added every available widget. Nice!
          </div>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {available.map((id) => {
              const meta = WIDGET_CATALOG[id];
              return (
                <button
                  key={id}
                  onClick={() => {
                    onAdd(id);
                    setOpen(false);
                  }}
                  className="rounded-lg border border-border/60 p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className="text-sm font-medium">{meta.title}</div>
                  <div className="text-xs text-muted-foreground">{meta.description}</div>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
