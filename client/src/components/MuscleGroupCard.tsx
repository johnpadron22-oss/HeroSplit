import { cn } from "@/lib/utils";
import { MuscleMap } from "@/components/MuscleMap";
import type { MuscleGroup, MuscleStatus } from "@/lib/muscles";
import { MUSCLE_LABELS } from "@/lib/muscles";

interface MuscleGroupCardProps {
  muscle: MuscleGroup;
  status: MuscleStatus;
  /** Total sets from the program targeting this muscle (primary) */
  setCount?: number;
  className?: string;
}

const STATUS_CONFIG = {
  primary: {
    label: "Growing",
    labelColor: "text-green-400",
    dotColor: "bg-green-500",
    border: "border-green-500/20",
    bg: "bg-green-500/5",
  },
  secondary: {
    label: "Focusing",
    labelColor: "text-yellow-400",
    dotColor: "bg-yellow-500",
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
  },
  inactive: {
    label: "Idle",
    labelColor: "text-blue-400",
    dotColor: "bg-blue-500",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
  },
};

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
  className,
}: MuscleGroupCardProps) {
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
        <MuscleMap statusMap={statusMap} view={view} size="sm" className="!h-20" />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {MUSCLE_LABELS[muscle]}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
          <span className={cn("text-sm font-bold", config.labelColor)}>
            {config.label}
          </span>
        </div>
        {setCount !== undefined && setCount > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-black", config.dotColor)}>
              {setCount}
            </span>
            <span className="text-[10px] text-muted-foreground">Sets to {status === "primary" ? "Growth" : "Focus"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
