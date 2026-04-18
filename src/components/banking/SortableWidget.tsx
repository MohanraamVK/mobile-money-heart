import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { WidgetId } from "@/lib/banking/types";
import { WidgetCard } from "./WidgetCard";
import { WIDGET_CATALOG } from "@/lib/banking/widgets";
import { cn } from "@/lib/utils";

const SIZE_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "md:col-span-1",
  md: "md:col-span-1",
  lg: "md:col-span-2",
};

export function SortableWidget({
  id,
  editing,
  onRemove,
}: {
  id: WidgetId;
  editing: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !editing });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const meta = WIDGET_CATALOG[id];

  return (
    <div ref={setNodeRef} style={style} className={cn(SIZE_CLASS[meta.size])}>
      <WidgetCard
        id={id}
        onRemove={editing ? onRemove : undefined}
        dragHandleProps={
          editing
            ? { ...attributes, ...listeners, "aria-label": `Drag ${meta.title}` }
            : undefined
        }
        className={editing ? "ring-1 ring-dashed ring-primary/40" : undefined}
      />
      {editing && (
        <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <GripVertical className="h-3 w-3" />
          drag to reorder
        </div>
      )}
    </div>
  );
}
