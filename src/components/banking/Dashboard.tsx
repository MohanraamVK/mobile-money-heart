import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Bell, LogOut, Pencil, Check, Layers, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { BankingState, WidgetId } from "@/lib/banking/types";
import {
  applyLayout,
  deleteLayout,
  loadState,
  saveLayout,
  setActiveWidgets,
} from "@/lib/banking/storage";
import { SortableWidget } from "./SortableWidget";
import { AddWidgetDialog } from "./AddWidgetDialog";
import { SaveLayoutDialog } from "./SaveLayoutDialog";

export function Dashboard({
  initial,
  onReset,
}: {
  initial: BankingState;
  onReset: () => void;
}) {
  const [state, setState] = useState<BankingState>(initial);
  const [editing, setEditing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const update = (widgets: WidgetId[]) => {
    setActiveWidgets(widgets);
    setState((s) => ({ ...s, activeWidgets: widgets }));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = state.activeWidgets.indexOf(active.id as WidgetId);
    const newIdx = state.activeWidgets.indexOf(over.id as WidgetId);
    if (oldIdx < 0 || newIdx < 0) return;
    update(arrayMove(state.activeWidgets, oldIdx, newIdx));
  };

  const handleAdd = (id: WidgetId) => {
    update([...state.activeWidgets, id]);
    toast.success("Widget added");
  };

  const handleRemove = (id: WidgetId) => {
    update(state.activeWidgets.filter((w) => w !== id));
  };

  const handleSaveLayout = (name: string) => {
    saveLayout(name, state.activeWidgets);
    setState(loadState());
    toast.success(`Saved layout "${name}"`);
  };

  const handleApplyLayout = (id: string) => {
    applyLayout(id);
    const fresh = loadState();
    setState(fresh);
    const layout = fresh.layouts.find((l) => l.id === id);
    if (layout) toast.success(`Switched to "${layout.name}"`);
  };

  const handleDeleteLayout = (id: string) => {
    deleteLayout(id);
    setState(loadState());
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <span className="text-sm font-bold">N</span>
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Nova Bank</div>
              <div className="text-xs text-muted-foreground">Hi, {state.profile.fullName.split(" ")[0]}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Layers className="h-4 w-4" /> Layouts
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Saved layouts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {state.layouts.length === 0 ? (
                  <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No saved layouts yet
                  </div>
                ) : (
                  state.layouts.map((l) => (
                    <DropdownMenuItem
                      key={l.id}
                      className="flex items-center justify-between gap-2"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <button
                        onClick={() => handleApplyLayout(l.id)}
                        className="flex-1 truncate text-left text-sm"
                      >
                        {l.name}
                      </button>
                      <button
                        onClick={() => handleDeleteLayout(l.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete layout"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {editing ? (
              <Button size="sm" onClick={() => setEditing(false)} className="gap-1.5">
                <Check className="h-4 w-4" /> Done
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            )}

            <Button size="icon" variant="ghost" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onReset} aria-label="Reset onboarding">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {editing && (
          <div
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
          >
            <div>
              <div className="text-sm font-medium">Would you like to make any changes to your dashboard?</div>
              <div className="text-xs text-muted-foreground">
                Drag widgets to reorder, remove the ones you don't need, or add new ones.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AddWidgetDialog active={state.activeWidgets} onAdd={handleAdd} />
              <SaveLayoutDialog onSave={handleSaveLayout} />
            </div>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={state.activeWidgets} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {state.activeWidgets.map((id) => (
                <SortableWidget
                  key={id}
                  id={id}
                  editing={editing}
                  onRemove={() => handleRemove(id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {state.activeWidgets.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/80 p-10 text-center text-sm text-muted-foreground">
            Your dashboard is empty. Click <strong>Edit</strong> to add widgets.
          </div>
        )}
      </main>
    </div>
  );
}
