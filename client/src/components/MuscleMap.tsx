import { cn } from "@/lib/utils";
import type { MuscleGroup, MuscleStatus, MuscleTrainingTier } from "@/lib/muscles";

// ── Color maps ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<MuscleStatus | "none", string> = {
  primary:   "#22c55e", // green-500
  secondary: "#eab308", // yellow-500
  inactive:  "#1e293b", // slate-800 very dark
  none:      "#0f172a", // slate-900 nearly invisible
};

const TIER_COLORS: Record<MuscleTrainingTier, string> = {
  gold:      "#f59e0b", // amber-500
  bronze:    "#c2622d", // orange-700
  wood:      "#713f12", // yellow-900
  untrained: "#1e293b", // slate-800
};

// ── Types ────────────────────────────────────────────────────────────────────

type MuscleColorMap = Partial<Record<MuscleGroup, string>>;

interface MuscleMapProps {
  /** Pass either statusMap (for workout preview/completion) or tierMap (for stats) */
  statusMap?: Partial<Record<MuscleGroup, MuscleStatus>>;
  tierMap?: Partial<Record<MuscleGroup, MuscleTrainingTier>>;
  view?: "front" | "back" | "both";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildColorMap(
  statusMap?: Partial<Record<MuscleGroup, MuscleStatus>>,
  tierMap?: Partial<Record<MuscleGroup, MuscleTrainingTier>>
): MuscleColorMap {
  const out: MuscleColorMap = {};
  if (statusMap) {
    for (const [k, v] of Object.entries(statusMap)) {
      out[k as MuscleGroup] = STATUS_COLORS[v as MuscleStatus] ?? STATUS_COLORS.inactive;
    }
  } else if (tierMap) {
    for (const [k, v] of Object.entries(tierMap)) {
      out[k as MuscleGroup] = TIER_COLORS[v as MuscleTrainingTier] ?? TIER_COLORS.untrained;
    }
  }
  return out;
}

function col(colors: MuscleColorMap, muscle: MuscleGroup): string {
  return colors[muscle] ?? (Object.keys(colors).length > 0 ? STATUS_COLORS.inactive : "#1e293b");
}

// ── SVG Figures ───────────────────────────────────────────────────────────────

const BODY_FILL = "#1e293b";
const BODY_STROKE = "#334155";

function FrontFigure({ colors }: { colors: MuscleColorMap }) {
  return (
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body silhouette */}
      {/* Head */}
      <circle cx="50" cy="14" r="12" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      {/* Neck */}
      <rect x="46" y="25" width="8" height="7" rx="2" fill={BODY_FILL} />
      {/* Torso */}
      <path
        d="M20,32 L80,32 Q88,34 86,42 L82,72 Q82,84 80,96 L74,108 L50,112 L26,108 L20,96 Q18,84 18,72 L14,42 Q12,34 20,32 Z"
        fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8"
      />
      {/* Left upper arm */}
      <rect x="6" y="32" width="14" height="44" rx="6" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      {/* Right upper arm */}
      <rect x="80" y="32" width="14" height="44" rx="6" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      {/* Left forearm */}
      <rect x="4" y="76" width="12" height="36" rx="5" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      {/* Right forearm */}
      <rect x="84" y="76" width="12" height="36" rx="5" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      {/* Left hand */}
      <ellipse cx="10" cy="116" rx="6" ry="5" fill={BODY_FILL} />
      {/* Right hand */}
      <ellipse cx="90" cy="116" rx="6" ry="5" fill={BODY_FILL} />
      {/* Hips connector */}
      <rect x="22" y="108" width="56" height="10" rx="3" fill={BODY_FILL} />
      {/* Left thigh */}
      <rect x="22" y="116" width="24" height="54" rx="9" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      {/* Right thigh */}
      <rect x="54" y="116" width="24" height="54" rx="9" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      {/* Left lower leg */}
      <rect x="24" y="168" width="19" height="46" rx="7" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      {/* Right lower leg */}
      <rect x="57" y="168" width="19" height="46" rx="7" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />

      {/* ── Muscle overlays (front) ────────────────────────────────────────── */}

      {/* Chest left */}
      <ellipse cx="36" cy="54" rx="13" ry="10" fill={col(colors, "chest")} opacity="0.85" />
      {/* Chest right */}
      <ellipse cx="64" cy="54" rx="13" ry="10" fill={col(colors, "chest")} opacity="0.85" />

      {/* Front Delts left */}
      <ellipse cx="14" cy="42" rx="8" ry="7" fill={col(colors, "front_delts")} opacity="0.85" />
      {/* Front Delts right */}
      <ellipse cx="86" cy="42" rx="8" ry="7" fill={col(colors, "front_delts")} opacity="0.85" />

      {/* Side Delts left */}
      <ellipse cx="8" cy="35" rx="5" ry="4" fill={col(colors, "side_delts")} opacity="0.85" />
      {/* Side Delts right */}
      <ellipse cx="92" cy="35" rx="5" ry="4" fill={col(colors, "side_delts")} opacity="0.85" />

      {/* Biceps left */}
      <ellipse cx="11" cy="58" rx="5.5" ry="11" fill={col(colors, "biceps")} opacity="0.85" />
      {/* Biceps right */}
      <ellipse cx="89" cy="58" rx="5.5" ry="11" fill={col(colors, "biceps")} opacity="0.85" />

      {/* Triceps left (visible from front, outer) */}
      <ellipse cx="7" cy="56" rx="3" ry="8" fill={col(colors, "triceps")} opacity="0.7" />
      {/* Triceps right */}
      <ellipse cx="93" cy="56" rx="3" ry="8" fill={col(colors, "triceps")} opacity="0.7" />

      {/* Abs — 3 pairs */}
      <ellipse cx="44" cy="72" rx="7" ry="6" fill={col(colors, "abs")} opacity="0.85" />
      <ellipse cx="56" cy="72" rx="7" ry="6" fill={col(colors, "abs")} opacity="0.85" />
      <ellipse cx="44" cy="84" rx="7" ry="6" fill={col(colors, "abs")} opacity="0.85" />
      <ellipse cx="56" cy="84" rx="7" ry="6" fill={col(colors, "abs")} opacity="0.85" />
      <ellipse cx="44" cy="96" rx="7" ry="5.5" fill={col(colors, "abs")} opacity="0.85" />
      <ellipse cx="56" cy="96" rx="7" ry="5.5" fill={col(colors, "abs")} opacity="0.85" />

      {/* Obliques left */}
      <ellipse cx="24" cy="84" rx="6" ry="12" fill={col(colors, "obliques")} opacity="0.85" />
      {/* Obliques right */}
      <ellipse cx="76" cy="84" rx="6" ry="12" fill={col(colors, "obliques")} opacity="0.85" />

      {/* Quads left */}
      <ellipse cx="34" cy="138" rx="12" ry="22" fill={col(colors, "quads")} opacity="0.85" />
      {/* Quads right */}
      <ellipse cx="66" cy="138" rx="12" ry="22" fill={col(colors, "quads")} opacity="0.85" />

      {/* Calves left */}
      <ellipse cx="33" cy="183" rx="9" ry="14" fill={col(colors, "calves")} opacity="0.85" />
      {/* Calves right */}
      <ellipse cx="67" cy="183" rx="9" ry="14" fill={col(colors, "calves")} opacity="0.85" />
    </svg>
  );
}

function BackFigure({ colors }: { colors: MuscleColorMap }) {
  return (
    <svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body silhouette */}
      <circle cx="50" cy="14" r="12" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      <rect x="46" y="25" width="8" height="7" rx="2" fill={BODY_FILL} />
      <path
        d="M20,32 L80,32 Q88,34 86,42 L82,72 Q82,84 80,96 L74,108 L50,112 L26,108 L20,96 Q18,84 18,72 L14,42 Q12,34 20,32 Z"
        fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8"
      />
      <rect x="6" y="32" width="14" height="44" rx="6" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      <rect x="80" y="32" width="14" height="44" rx="6" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      <rect x="4" y="76" width="12" height="36" rx="5" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      <rect x="84" y="76" width="12" height="36" rx="5" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      <ellipse cx="10" cy="116" rx="6" ry="5" fill={BODY_FILL} />
      <ellipse cx="90" cy="116" rx="6" ry="5" fill={BODY_FILL} />
      <rect x="22" y="108" width="56" height="10" rx="3" fill={BODY_FILL} />
      <rect x="22" y="116" width="24" height="54" rx="9" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      <rect x="54" y="116" width="24" height="54" rx="9" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      <rect x="24" y="168" width="19" height="46" rx="7" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />
      <rect x="57" y="168" width="19" height="46" rx="7" fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth="0.8" />

      {/* ── Muscle overlays (back) ─────────────────────────────────────────── */}

      {/* Upper Back / Traps */}
      <ellipse cx="50" cy="46" rx="22" ry="11" fill={col(colors, "upper_back")} opacity="0.85" />

      {/* Rear Delts left */}
      <ellipse cx="14" cy="38" rx="8" ry="7" fill={col(colors, "rear_delts")} opacity="0.85" />
      {/* Rear Delts right */}
      <ellipse cx="86" cy="38" rx="8" ry="7" fill={col(colors, "rear_delts")} opacity="0.85" />

      {/* Lats left */}
      <path d="M20,58 Q14,74 18,90 L30,90 Q28,74 26,58 Z" fill={col(colors, "lats")} opacity="0.85" />
      {/* Lats right */}
      <path d="M80,58 Q86,74 82,90 L70,90 Q72,74 74,58 Z" fill={col(colors, "lats")} opacity="0.85" />

      {/* Triceps left */}
      <ellipse cx="10" cy="56" rx="5.5" ry="11" fill={col(colors, "triceps")} opacity="0.85" />
      {/* Triceps right */}
      <ellipse cx="90" cy="56" rx="5.5" ry="11" fill={col(colors, "triceps")} opacity="0.85" />

      {/* Rear Delts / Side (visible from back) */}
      <ellipse cx="8" cy="34" rx="4" ry="3.5" fill={col(colors, "side_delts")} opacity="0.7" />
      <ellipse cx="92" cy="34" rx="4" ry="3.5" fill={col(colors, "side_delts")} opacity="0.7" />

      {/* Lower Back */}
      <ellipse cx="50" cy="88" rx="14" ry="9" fill={col(colors, "lower_back")} opacity="0.85" />

      {/* Glutes left */}
      <ellipse cx="36" cy="118" rx="14" ry="10" fill={col(colors, "glutes")} opacity="0.85" />
      {/* Glutes right */}
      <ellipse cx="64" cy="118" rx="14" ry="10" fill={col(colors, "glutes")} opacity="0.85" />

      {/* Hamstrings left */}
      <ellipse cx="34" cy="142" rx="12" ry="22" fill={col(colors, "hamstrings")} opacity="0.85" />
      {/* Hamstrings right */}
      <ellipse cx="66" cy="142" rx="12" ry="22" fill={col(colors, "hamstrings")} opacity="0.85" />

      {/* Calves left */}
      <ellipse cx="33" cy="183" rx="9" ry="13" fill={col(colors, "calves")} opacity="0.85" />
      {/* Calves right */}
      <ellipse cx="67" cy="183" rx="9" ry="13" fill={col(colors, "calves")} opacity="0.85" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const SIZE_CLASSES = {
  sm: "h-36",
  md: "h-52",
  lg: "h-72",
};

export function MuscleMap({
  statusMap,
  tierMap,
  view = "both",
  size = "md",
  className,
}: MuscleMapProps) {
  const colors = buildColorMap(statusMap, tierMap);
  const heightClass = SIZE_CLASSES[size];

  if (view === "front") {
    return (
      <div className={cn(heightClass, "flex justify-center", className)}>
        <div className="h-full aspect-[100/220]">
          <FrontFigure colors={colors} />
        </div>
      </div>
    );
  }

  if (view === "back") {
    return (
      <div className={cn(heightClass, "flex justify-center", className)}>
        <div className="h-full aspect-[100/220]">
          <BackFigure colors={colors} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex justify-center gap-4", className)}>
      <div className={cn(heightClass, "aspect-[100/220]")}>
        <FrontFigure colors={colors} />
      </div>
      <div className={cn(heightClass, "aspect-[100/220]")}>
        <BackFigure colors={colors} />
      </div>
    </div>
  );
}
