import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { Bell, LogOut, Pencil, Check, Layers, Trash2, Gift, User, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  saveState,
  setActiveWidgets,
} from "@/lib/banking/storage";
import {
  applyTheme,
  getStoredHoliday,
  getStoredTheme,
  setStoredHoliday,
  setStoredTheme,
  type HolidayOverlayId,
  type ThemeId,
} from "@/lib/banking/themes";
import { CHARITIES } from "@/lib/banking/lunar";
import { getNewOffersCount } from "@/lib/banking/offers";
import { SortableWidget } from "./SortableWidget";
import { AddWidgetDialog } from "./AddWidgetDialog";
import { SaveLayoutDialog } from "./SaveLayoutDialog";
import { ThemePicker, getCustomThemeImage } from "./ThemePicker";
import { DioneAssistant } from "./DioneAssistant";
import { ThemeBackground } from "./ThemeBackground";
import { SeasonalPopup } from "./SeasonalPopup";

export function Dashboard({
  initial,
  onReset,
}: {
  initial: BankingState;
  onReset: () => void;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState<BankingState>(initial);
  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("default");
  const [holiday, setHoliday] = useState<HolidayOverlayId>("none");
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    const t = getStoredTheme();
    setTheme(t);
    applyTheme(t);
    setHoliday(getStoredHoliday());
  }, []);

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    setStoredTheme(id);
    toast.success("Theme updated");
  };

  const handleHolidayChange = (id: HolidayOverlayId) => {
    setHoliday(id);
    setStoredHoliday(id);
    if (id !== "none") toast.success("Holiday animation enabled");
  };

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

  const newOffers = getNewOffersCount(state.profile);
  const customImage = getCustomThemeImage(state, theme);
  const equippedBadge = state.lunar.badgesDisabled
    ? null
    : CHARITIES.find((c) => c.id === state.lunar.equippedBadge);

  return (
    <div className="relative min-h-screen bg-background">
      <ThemeBackground
        themeId={theme}
        customThemeImage={customImage}
        holiday={holiday}
        lunar={state.lunar}
      />

      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <span className="text-sm font-bold">L</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold leading-tight">
                  Lunar Bank
                  {equippedBadge && (
                    <span title={equippedBadge.badgeLabel} className="text-base leading-none">
                      {equippedBadge.badgeEmoji}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Hi {state.profile.fullName.split(" ")[0]}!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Saved layouts">
                    <Layers className="h-4 w-4" />
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
                <Button size="icon" onClick={() => setEditing(false)} aria-label="Done editing">
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="icon" variant="outline" onClick={() => setEditing(true)} aria-label="Edit dashboard">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}

              <Button
                size="icon"
                variant="outline"
                className="relative"
                onClick={() => navigate({ to: "/offers" })}
                aria-label="Offers and promotions"
              >
                <Gift className="h-4 w-4" />
                {newOffers > 0 && (
                  <Badge className="absolute -right-1.5 -top-1.5 h-4 min-w-4 justify-center rounded-full bg-destructive p-0 px-1 text-[10px] text-destructive-foreground hover:bg-destructive">
                    {newOffers}
                  </Badge>
                )}
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={() => navigate({ to: "/lunar" })}
                aria-label="Lunar Points"
                title="Lunar Points"
              >
                <Moon className="h-4 w-4" />
              </Button>

              <Button size="icon" variant="ghost" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate({ to: "/profile" })}
                aria-label="Your profile"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={onReset} aria-label="Reset onboarding">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {editing && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <div>
                <div className="text-sm font-medium">
                  Would you like to make any changes to your dashboard?
                </div>
                <div className="text-xs text-muted-foreground">
                  Drag widgets to reorder, remove the ones you don't need, add new ones, or change your theme.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ThemePicker
                  current={theme}
                  currentHoliday={holiday}
                  state={state}
                  onStateChange={(s) => setState(s)}
                  onChangeTheme={handleThemeChange}
                  onChangeHoliday={handleHolidayChange}
                />
                <AddWidgetDialog active={state.activeWidgets} onAdd={handleAdd} />
                <SaveLayoutDialog
                  onSave={handleSaveLayout}
                  open={saveOpen}
                  onOpenChange={setSaveOpen}
                />
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

      <SeasonalPopup
        state={state}
        onChange={(s) => { saveState(s); setState(s); }}
        onApplyHoliday={(id) => handleHolidayChange(id)}
        onApplyTheme={(id) => handleThemeChange(id)}
      />

      <DioneAssistant
        currentTheme={theme}
        callbacks={{
          onSetTheme: handleThemeChange,
          onToggleEdit: () => setEditing(true),
          onSaveLayout: () => {
            setEditing(true);
            setTimeout(() => setSaveOpen(true), 150);
          },
          onNavigate: (target) =>
            navigate({ to: target === "offers" ? "/offers" : target === "lunar" ? "/lunar" : "/profile" }),
        }}
      />
    </div>
  );
}
