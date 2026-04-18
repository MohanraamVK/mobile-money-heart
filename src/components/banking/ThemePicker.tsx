import { useMemo, useRef, useState } from "react";
import { Check, Lock, Palette, Sparkles, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_THEMES,
  HOLIDAYS,
  HOLIDAY_THEMES,
  HOLIDAY_THEME_TO_OVERLAY,
  SEASONAL_THEMES,
  THEME_COSTS,
  type HolidayOverlayId,
  type HolidayThemeId,
  type ThemeId,
} from "@/lib/banking/themes";
import { activeHoliday, activeSeason } from "@/lib/banking/seasons";
import { addCustomTheme, removeCustomTheme, spendPoints, setAnimationsEnabled } from "@/lib/banking/lunar";
import { loadState, persistLunar, saveState } from "@/lib/banking/storage";
import type { BankingState, CustomTheme } from "@/lib/banking/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  current: ThemeId;
  currentHoliday: HolidayOverlayId;
  state: BankingState;
  onStateChange: (s: BankingState) => void;
  onChangeTheme: (id: ThemeId) => void;
  onChangeHoliday: (id: HolidayOverlayId) => void;
  iconOnly?: boolean;
}

export function ThemePicker({
  current,
  currentHoliday,
  state,
  onStateChange,
  onChangeTheme,
  onChangeHoliday,
  iconOnly = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const activeH = useMemo(() => activeHoliday(), []);
  const activeS = useMemo(() => activeSeason(), []);

  const tryBuyTheme = (themeId: string, cost: number): boolean => {
    const fresh = loadState();
    const result = spendPoints(fresh, cost, themeId);
    if (!result.ok) {
      toast.error(`Not enough Star Points (need ${cost})`);
      return false;
    }
    saveState(result.state);
    onStateChange(result.state);
    toast.success(`Unlocked theme for ${cost} SP`);
    return true;
  };

  const selectSeasonal = (id: typeof SEASONAL_THEMES[number]["id"]) => {
    const inWindow = activeS.id === id;
    const owned = state.lunar.ownedThemes.includes(id);
    if (!inWindow && !owned) {
      if (!tryBuyTheme(id, THEME_COSTS.seasonalOutOfWindow)) return;
    }
    onChangeTheme(id);
    setOpen(false);
  };

  const selectHolidayTheme = (id: HolidayThemeId) => {
    const overlayId = HOLIDAY_THEME_TO_OVERLAY[id];
    const inWindow = activeH?.id === overlayId;
    const owned = state.lunar.ownedThemes.includes(id);
    if (!inWindow && !owned) {
      if (!tryBuyTheme(id, THEME_COSTS.holidayThemeOutOfWindow)) return;
    }
    onChangeTheme(id);
    setOpen(false);
  };

  const selectAnimation = (id: HolidayOverlayId) => {
    if (id === "none") {
      onChangeHoliday("none");
      setOpen(false);
      return;
    }
    const inWindow = activeH?.id === id;
    const owned = state.lunar.ownedThemes.includes(`holiday-${id}`);
    if (!inWindow && !owned) {
      if (!tryBuyTheme(`holiday-${id}`, THEME_COSTS.holidayOutOfWindow)) return;
    }
    onChangeHoliday(id);
    setOpen(false);
  };

  const toggleAnimations = (v: boolean) => {
    const next = setAnimationsEnabled(state, v);
    persistLunar(next.lunar);
    onStateChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={iconOnly ? "icon" : "sm"} className={iconOnly ? "" : "gap-1.5"} aria-label="Change theme">
          <Palette className="h-4 w-4" />
          {!iconOnly && "Theme"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Personalise your dashboard</DialogTitle>
          <DialogDescription>
            Pick a base theme, layer on a holiday animation, switch to a full holiday or seasonal look, or upload your own background.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="default">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="holiday">Holiday</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {/* DEFAULT */}
          <TabsContent value="default" className="mt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DEFAULT_THEMES.map((t) => (
                <ThemeTile
                  key={t.id}
                  name={t.name}
                  description={t.description}
                  swatch={t.swatch}
                  image={t.image}
                  active={current === t.id}
                  onClick={() => { onChangeTheme(t.id); setOpen(false); }}
                />
              ))}
            </div>
          </TabsContent>

          {/* ANIMATIONS (formerly Holidays) */}
          <TabsContent value="animations" className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
              <div>
                <Label className="text-sm">Show holiday animations</Label>
                <p className="text-xs text-muted-foreground">Snow, petals and other overlays — layered on your current theme.</p>
              </div>
              <Switch checked={state.lunar.animationsEnabled} onCheckedChange={toggleAnimations} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ThemeTile
                name="No animation"
                description="Just your base theme."
                swatch="linear-gradient(135deg, #6b7280, #d1d5db)"
                active={currentHoliday === "none"}
                onClick={() => selectAnimation("none")}
              />
              {HOLIDAYS.map((h) => {
                const inWindow = activeH?.id === h.id;
                const owned = state.lunar.ownedThemes.includes(`holiday-${h.id}`);
                const locked = !inWindow && !owned;
                return (
                  <ThemeTile
                    key={h.id}
                    name={h.name}
                    description={h.description}
                    swatch={h.swatch}
                    active={currentHoliday === h.id}
                    badge={inWindow ? "Free now" : undefined}
                    locked={locked}
                    cost={locked ? THEME_COSTS.holidayOutOfWindow : undefined}
                    onClick={() => selectAnimation(h.id)}
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* HOLIDAY THEMES (full theme + bg image, similar to seasonal) */}
          <TabsContent value="holiday" className="mt-4">
            <p className="mb-3 text-xs text-muted-foreground">
              Full holiday looks with matching colors and background art. Free during the holiday window — afterwards keep them with Star Points.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {HOLIDAY_THEMES.map((t) => {
                const overlayId = HOLIDAY_THEME_TO_OVERLAY[t.id as HolidayThemeId];
                const inWindow = activeH?.id === overlayId;
                const owned = state.lunar.ownedThemes.includes(t.id);
                const locked = !inWindow && !owned;
                return (
                  <ThemeTile
                    key={t.id}
                    name={t.name}
                    description={t.description}
                    swatch={t.swatch}
                    image={t.image}
                    active={current === t.id}
                    badge={inWindow ? "Free now" : undefined}
                    locked={locked}
                    cost={locked ? THEME_COSTS.holidayThemeOutOfWindow : undefined}
                    onClick={() => selectHolidayTheme(t.id as HolidayThemeId)}
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* SEASONAL */}
          <TabsContent value="seasonal" className="mt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SEASONAL_THEMES.map((t) => {
                const inWindow = activeS.id === t.id;
                const owned = state.lunar.ownedThemes.includes(t.id);
                const locked = !inWindow && !owned;
                return (
                  <ThemeTile
                    key={t.id}
                    name={t.name}
                    description={t.description}
                    swatch={t.swatch}
                    image={t.image}
                    active={current === t.id}
                    badge={inWindow ? "In season" : undefined}
                    locked={locked}
                    cost={locked ? THEME_COSTS.seasonalOutOfWindow : undefined}
                    onClick={() => selectSeasonal(t.id)}
                  />
                );
              })}
            </div>
          </TabsContent>

          {/* CUSTOM */}
          <TabsContent value="custom" className="mt-4 space-y-4">
            <CustomThemes
              state={state}
              current={current}
              onUse={(id) => { onChangeTheme(id); setOpen(false); }}
              onChange={onStateChange}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ThemeTile({
  name,
  description,
  swatch,
  image,
  active,
  badge,
  locked,
  cost,
  onClick,
}: {
  name: string;
  description: string;
  swatch: string;
  image?: string;
  active: boolean;
  badge?: string;
  locked?: boolean;
  cost?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-4 text-left transition-all",
        active ? "border-primary ring-2 ring-primary/30" : "border-border/60 hover:border-primary/60",
      )}
    >
      <div
        className="relative mb-3 h-20 w-full overflow-hidden rounded-lg"
        style={{ background: swatch }}
      >
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            width={1280}
            height={768}
            className="h-full w-full object-cover"
          />
        )}
        {badge && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            {badge}
          </span>
        )}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Lock className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{name}</div>
          <div className="line-clamp-2 text-xs text-muted-foreground">{description}</div>
          {cost !== undefined && (
            <div className="mt-1 text-[11px] font-medium text-primary">⭐ {cost} SP to unlock</div>
          )}
        </div>
        {active && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    </button>
  );
}

function CustomThemes({
  state,
  current,
  onUse,
  onChange,
}: {
  state: BankingState;
  current: ThemeId;
  onUse: (id: string) => void;
  onChange: (s: BankingState) => void;
}) {
  const [name, setName] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    if (file.size > 2_500_000) {
      toast.error("Please pick an image under 2.5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!dataUrl || !name.trim()) return;
    const result = addCustomTheme(state, name.trim(), dataUrl);
    if (!result.ok) {
      toast.error(`Custom themes cost ${THEME_COSTS.custom} SP — keep earning!`);
      return;
    }
    saveState(result.state);
    onChange(result.state);
    setName("");
    setDataUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Custom theme created");
  };

  const remove = (theme: CustomTheme) => {
    const next = removeCustomTheme(state, theme.id);
    saveState(next);
    onChange(next);
  };

  return (
    <>
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          Upload your own background ({THEME_COSTS.custom} SP)
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          You have {state.lunar.points} SP. Custom themes are premium — earn more from quests, donations or steps.
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input placeholder="Theme name" value={name} onChange={(e) => setName(e.target.value)} />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-1.5">
            <Upload className="h-4 w-4" /> {dataUrl ? "Change image" : "Pick image"}
          </Button>
        </div>
        {dataUrl && (
          <div className="mt-3 flex items-center gap-3">
            <img src={dataUrl} alt="" className="h-16 w-28 rounded-md object-cover" />
            <Button onClick={submit} disabled={!name.trim()}>Create for {THEME_COSTS.custom} SP</Button>
          </div>
        )}
      </div>

      {state.lunar.customThemes.length === 0 ? (
        <div className="rounded-lg border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
          No custom themes yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.lunar.customThemes.map((t) => (
            <div key={t.id} className={cn(
              "group relative overflow-hidden rounded-xl border p-4",
              current === t.id ? "border-primary ring-2 ring-primary/30" : "border-border/60",
            )}>
              <img src={t.imageDataUrl} alt={t.name} className="mb-3 h-20 w-full rounded-lg object-cover" />
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold truncate">{t.name}</div>
                <button
                  onClick={() => remove(t)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Delete custom theme"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                size="sm"
                variant={current === t.id ? "default" : "outline"}
                className="mt-2 w-full"
                onClick={() => onUse(t.id)}
              >
                {current === t.id ? "Active" : "Use theme"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** Helper that returns the data URL string of a custom theme, if active. */
export function getCustomThemeImage(state: BankingState, themeId: string): string | undefined {
  return state.lunar.customThemes.find((t) => t.id === themeId)?.imageDataUrl;
}
