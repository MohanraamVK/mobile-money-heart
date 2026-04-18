import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Maximize2, Minimize2, MoveHorizontal, MoveVertical } from "lucide-react";
import type { WidgetId, WidgetShape } from "@/lib/banking/types";
import { WidgetCard } from "./WidgetCard";
import { WIDGET_CATALOG } from "@/lib/banking/widgets";
import { cn } from "@/lib/utils";

/**
 * Map a logical "shape" to grid spans (cols × rows) and a min row height.
 * The dashboard grid uses 4 cols on lg screens with auto-rows of ~12rem.
 */
const SHAPE_CLASS: Record<WidgetShape, string> = {
  square: "md:col-span-1 md:row-span-1",
  wide:   "md:col-span-2 md:row-span-1",
  tall:   "md:col-span-1 md:row-span-2",
  xl:     "md:col-span-2 md:row-span-2",
};

const SIZE_TO_SHAPE: Record<"sm" | "md" | "lg", WidgetShape> = {
  sm: "square",
  md: "square",
  lg: "wide",
};

const SHAPE_ORDER: WidgetShape[] = ["square", "wide", "tall", "xl"];

export function SortableWidget({
  id,
  editing,
  shape,
  onRemove,
  onShapeChange,
}: {
  id: WidgetId;
  editing: boolean;
  shape?: WidgetShape;
  onRemove: () => void;
  onShapeChange: (next: WidgetShape) => void;
  themeAccent?: string;
  themeImage?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !editing });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const meta = WIDGET_CATALOG[id];
  const effectiveShape: WidgetShape = shape ?? SIZE_TO_SHAPE[meta.size];

  const cycle = () => {
    const idx = SHAPE_ORDER.indexOf(effectiveShape);
    onShapeChange(SHAPE_ORDER[(idx + 1) % SHAPE_ORDER.length]);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`widget-${id}`}
      data-widget-id={id}
      className={cn(SHAPE_CLASS[effectiveShape], "scroll-mt-24 rounded-2xl transition-shadow")}
    >
      <WidgetCard
        id={id}
        onRemove={editing ? onRemove : undefined}
        dragHandleProps={
          editing
            ? { ...attributes, ...listeners, "aria-label": `Drag ${meta.title}` }
            : undefined
        }
        className={editing ? "ring-1 ring-dashed ring-primary/40" : undefined}
        controls={
          editing ? (
            <div className="flex flex-wrap gap-1">
              {SHAPE_ORDER.map((s) => {
                const Icon = s === "square" ? Minimize2 : s === "wide" ? MoveHorizontal : s === "tall" ? MoveVertical : Maximize2;
                const active = effectiveShape === s;
                return (
                  <button
                    key={s}
                    onClick={() => onShapeChange(s)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] capitalize transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/60",
                    )}
                    aria-label={`Set ${s} size`}
                  >
                    <Icon className="h-3 w-3" />
                    {s}
                  </button>
                );
              })}
            </div>
          ) : undefined
        }
      />
      {editing && (
        <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <GripVertical className="h-3 w-3" />
          drag to reorder · tap a size to resize
        </div>
      )}
    </div>
  );
}
