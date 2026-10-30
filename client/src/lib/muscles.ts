// Muscle group types and exercise-to-muscle mapping utilities

export type MuscleGroup =
  | "chest"
  | "front_delts"
  | "side_delts"
  | "rear_delts"
  | "biceps"
  | "triceps"
  | "upper_back"
  | "lats"
  | "lower_back"
  | "abs"
  | "obliques"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves";

export type MuscleStatus = "primary" | "secondary" | "inactive";

// For stats page — based on training frequency
export type MuscleTrainingTier = "gold" | "bronze" | "wood" | "untrained";

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  front_delts: "Front Delts",
  side_delts: "Side Delts",
  rear_delts: "Rear Delts",
  biceps: "Biceps",
  triceps: "Triceps",
  upper_back: "Upper Back",
  lats: "Lats",
  lower_back: "Lower Back",
  abs: "Abs",
  obliques: "Obliques",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
};

interface MuscleMapping {
  keywords: string[];
  primary: MuscleGroup[];
  secondary: MuscleGroup[];
}

const EXERCISE_MAPPINGS: MuscleMapping[] = [
  { keywords: ["bench press", "chest press", "machine press"], primary: ["chest"], secondary: ["front_delts", "triceps"] },
  { keywords: ["incline dumbbell", "incline bench", "incline press", "incline"], primary: ["chest", "front_delts"], secondary: ["triceps"] },
  { keywords: ["decline", "cable fly", "cable cross", "pec deck", "chest fly", "dumbbell fly", "dumbbell flye", "cable chest"], primary: ["chest"], secondary: [] },
  { keywords: ["push-up", "push up", "pushup"], primary: ["chest"], secondary: ["front_delts", "triceps"] },
  { keywords: ["dip"], primary: ["chest", "triceps"], secondary: ["front_delts"] },
  { keywords: ["overhead press", "military press", "shoulder press", "seated press", "arnold", "ohp"], primary: ["front_delts", "side_delts"], secondary: ["triceps"] },
  { keywords: ["lateral raise", "cable lateral", "upright row"], primary: ["side_delts"], secondary: [] },
  { keywords: ["front raise"], primary: ["front_delts"], secondary: [] },
  { keywords: ["face pull"], primary: ["rear_delts", "upper_back"], secondary: [] },
  { keywords: ["reverse fly", "reverse flye", "rear delt", "band pull-apart", "band pull apart"], primary: ["rear_delts"], secondary: [] },
  { keywords: ["curl", "hammer curl", "preacher", "concentration curl", "ez bar", "spider curl", "zottman"], primary: ["biceps"], secondary: [] },
  { keywords: ["chin-up", "chin up", "chinup"], primary: ["lats", "biceps"], secondary: ["upper_back"] },
  { keywords: ["pull-up", "pull up", "pullup", "weighted pull"], primary: ["lats", "upper_back"], secondary: ["biceps", "rear_delts"] },
  { keywords: ["lat pulldown", "cable pulldown"], primary: ["lats"], secondary: ["biceps", "upper_back"] },
  { keywords: ["straight arm"], primary: ["lats"], secondary: [] },
  { keywords: ["barbell row", "dumbbell row", "cable row", "seated row", "chest-supported row", "pendlay row", "t-bar row", "meadows row", "machine row"], primary: ["upper_back", "lats"], secondary: ["biceps", "rear_delts"] },
  { keywords: ["shrug", "trap bar"], primary: ["upper_back"], secondary: [] },
  { keywords: ["deadlift"], primary: ["lower_back", "hamstrings", "glutes"], secondary: ["upper_back", "quads"] },
  { keywords: ["rdl", "romanian", "stiff-leg", "stiff leg"], primary: ["hamstrings", "glutes"], secondary: ["lower_back"] },
  { keywords: ["good morning"], primary: ["lower_back", "hamstrings"], secondary: ["glutes"] },
  { keywords: ["hyperextension", "back extension"], primary: ["lower_back", "glutes"], secondary: ["hamstrings"] },
  { keywords: ["squat", "goblet", "hack squat", "leg press"], primary: ["quads", "glutes"], secondary: ["hamstrings", "lower_back"] },
  { keywords: ["lunge", "bulgarian split", "split squat", "reverse lunge", "walking lunge"], primary: ["quads", "glutes"], secondary: ["hamstrings"] },
  { keywords: ["step-up", "step up"], primary: ["quads", "glutes"], secondary: [] },
  { keywords: ["leg extension", "quad extension"], primary: ["quads"], secondary: [] },
  { keywords: ["leg curl", "hamstring curl", "seated curl", "lying curl"], primary: ["hamstrings"], secondary: [] },
  { keywords: ["hip thrust", "glute bridge", "bridge", "hip hinge"], primary: ["glutes"], secondary: ["hamstrings"] },
  { keywords: ["calf raise", "calf press", "donkey calf", "seated calf"], primary: ["calves"], secondary: [] },
  { keywords: ["tricep pushdown", "rope pushdown", "cable pushdown", "skull crusher", "close grip bench", "overhead extension", "tricep extension", "tricep dip", "jm press"], primary: ["triceps"], secondary: [] },
  { keywords: ["plank", "ab crunch", "crunch", "situp", "sit-up", "cable crunch", "leg raise", "hanging leg", "hollow body", "ab wheel", "decline crunch"], primary: ["abs"], secondary: [] },
  { keywords: ["russian twist", "wood chop", "side bend", "pallof"], primary: ["obliques"], secondary: ["abs"] },
  { keywords: ["nordic curl", "nordic hamstring"], primary: ["hamstrings"], secondary: ["glutes"] },
  { keywords: ["sumo deadlift", "sumo"], primary: ["glutes", "quads"], secondary: ["hamstrings", "lower_back"] },
  { keywords: ["power clean", "hang clean", "clean"], primary: ["glutes", "hamstrings", "upper_back"], secondary: ["quads", "front_delts"] },
  { keywords: ["jump", "box jump", "plyometric"], primary: ["quads", "calves"], secondary: ["glutes", "hamstrings"] },
];

export function getExerciseMuscles(exerciseName: string): {
  primary: MuscleGroup[];
  secondary: MuscleGroup[];
} {
  const lower = exerciseName.toLowerCase();
  for (const mapping of EXERCISE_MAPPINGS) {
    if (mapping.keywords.some((k) => lower.includes(k))) {
      return { primary: mapping.primary, secondary: mapping.secondary };
    }
  }
  return { primary: [], secondary: [] };
}

export function getProgramMuscles(
  exercises: Array<{ name: string }>
): Partial<Record<MuscleGroup, MuscleStatus>> {
  const result: Partial<Record<MuscleGroup, MuscleStatus>> = {};

  for (const ex of exercises) {
    const { primary, secondary } = getExerciseMuscles(ex.name);
    for (const m of primary) {
      if (result[m] !== "primary") result[m] = "primary";
    }
    for (const m of secondary) {
      if (!result[m]) result[m] = "secondary";
    }
  }

  return result;
}

export function getMuscleTrainingCounts(
  logs: Array<{
    setsData?: Array<{ name: string; sets: Array<unknown> }>;
  }>
): Record<MuscleGroup, number> {
  const counts: Record<MuscleGroup, number> = {
    chest: 0, front_delts: 0, side_delts: 0, rear_delts: 0,
    biceps: 0, triceps: 0, upper_back: 0, lats: 0, lower_back: 0,
    abs: 0, obliques: 0, quads: 0, hamstrings: 0, glutes: 0, calves: 0,
  };

  for (const log of logs) {
    if (!log.setsData) continue;
    const sessionMuscles = new Set<MuscleGroup>();
    for (const ex of log.setsData) {
      const { primary, secondary } = getExerciseMuscles(ex.name);
      [...primary, ...secondary].forEach((m) => sessionMuscles.add(m));
    }
    sessionMuscles.forEach((m) => { counts[m]++; });
  }

  return counts;
}

export function countToTier(count: number): MuscleTrainingTier {
  if (count === 0) return "untrained";
  if (count === 1) return "wood";
  if (count <= 4) return "bronze";
  return "gold";
}
