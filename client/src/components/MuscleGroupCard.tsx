import { cn } from "@/lib/utils";
import { MuscleMap } from "@/components/MuscleMap";
import type { MuscleGroup, MuscleStatus } from "@/lib/muscles";
import { MUSCLE_LABELS } from "@/lib/muscles";

type Variant = "hero" | "villain";

interface MuscleGroupCardProps {
  muscle: MuscleGroup;
  status: MuscleStatus;
  /** Total sets from the program targeting this muscle (primary) */
  setCount?: number;
  /** Matches the workout theme — hero=cyan, villain=purple */
  variant?: Variant;
  className?: string;
}

// Primary uses the workout's theme color; secondary uses amber (same as series badges in WorkoutCard)
function getStatusConfig(variant: Variant = "hero") {
  const primaryColor = variant === "villain"
    ? { label: "text-purple-400", dot: "bg-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/5" }
    : { label: "text-cyan-400",   dot: "bg-cyan-400",   border: "border-cyan-500/20",   bg: "bg-cyan-500/5"   };
  return {
    primary: {
      label: "Primary",
      labelColor: primaryColor.label,
      dotColor:   primaryColor.dot,
      border:     primaryColor.border,
      bg:         primaryColor.bg,
    },
    secondary: {
      label: "Secondary",
      labelColor: "text-amber-400",
      dotColor:   "bg-amber-400",
      border:     "border-amber-500/20",
      bg:         "bg-amber-500/5",
    },
    inactive: {
      label: "Idle",
      labelColor: "text-muted-foreground",
      dotColor:   "bg-muted",
      border:     "border-white/5",
      bg:         "bg-white/[0.02]",
    },
  };
}

// Build a statusMap that only highlights the given muscle
function buildSingleMuscleStatus(
  muscle: MuscleGroup,
  status: MuscleStatus
): Partial<Record<MuscleGroup, MuscleStatus>> {
  return { [muscle]: status };
}

// Determine if a muscle is on the front or back
const BACK_MUSCLES: MuscleGroup[] = [
  "upper_back",
  "lats",
  "lower_back",
  "rear_delts",
  "hamstrings",
  "glutes",
];

export function MuscleGroupCard({
  muscle,
  status,
  setCount,
  variant = "hero",
  className,
}: MuscleGroupCardProps) {
  const STATUS_CONFIG = getStatusConfig(variant);
  const config = STATUS_CONFIG[status];
  const view = BACK_MUSCLES.includes(muscle) ? "back" : "front";
  const statusMap = buildSingleMuscleStatus(muscle, status);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl border bg-card",
        config.border,
        config.bg,
        className
      )}
    >
      {/* Mini body map */}
      <div className="shrink-0 w-12 h-20">
        <MuscleMap statusMap={statusMap} view={view} size="sm" variant={variant} className="!h-20" />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {MUSCLE_LABELS[muscle]}
        </div>
        <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit", config.bg, config.border, config.labelColor)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
          {config.label}
        </div>
        {setCount !== undefined && setCount > 0 && (
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {setCount} sets
          </div>
        )}
      </div>
    </div>
  );
}
