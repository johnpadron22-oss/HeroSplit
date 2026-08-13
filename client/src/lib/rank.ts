// XP → Rank system
// At ~450 XP/workout (18 sets × 25 XP), rough progression:
//   F → D  : 1–2 workouts
//   D → C  : 3–5 workouts
//   C → B  : 9–14 workouts
//   B → A  : 16–25 workouts
//   A → S  : 27–42 workouts
//   S → SS : 45–67 workouts
//   SS→ SSS: 78+ workouts total

export interface RankInfo {
  rank: string;
  label: string;
  min: number;
  max: number;
  color: string;         // hex for text / badge
  tailwindText: string;  // Tailwind text class
  tailwindBg: string;    // Tailwind bg class
  tailwindBorder: string;
  tailwindGlow: string;  // Tailwind shadow class
  tailwindBar: string;   // Tailwind bg for progress bar
}

export const RANKS: RankInfo[] = [
  {
    rank: "F",
    label: "Unranked",
    min: 0,
    max: 499,
    color: "#9ca3af",
    tailwindText: "text-gray-400",
    tailwindBg: "bg-gray-500/10",
    tailwindBorder: "border-gray-500/20",
    tailwindGlow: "shadow-gray-500/20",
    tailwindBar: "bg-gray-500",
  },
  {
    rank: "D",
    label: "Rookie",
    min: 500,
    max: 1499,
    color: "#818cf8",
    tailwindText: "text-indigo-400",
    tailwindBg: "bg-indigo-500/10",
    tailwindBorder: "border-indigo-500/20",
    tailwindGlow: "shadow-indigo-500/30",
    tailwindBar: "bg-indigo-500",
  },
  {
    rank: "C",
    label: "Challenger",
    min: 1500,
    max: 3499,
    color: "#60a5fa",
    tailwindText: "text-blue-400",
    tailwindBg: "bg-blue-500/10",
    tailwindBorder: "border-blue-500/20",
    tailwindGlow: "shadow-blue-500/30",
    tailwindBar: "bg-blue-500",
  },
  {
    rank: "B",
    label: "Warrior",
    min: 3500,
    max: 6999,
    color: "#34d399",
    tailwindText: "text-emerald-400",
    tailwindBg: "bg-emerald-500/10",
    tailwindBorder: "border-emerald-500/20",
    tailwindGlow: "shadow-emerald-500/40",
    tailwindBar: "bg-emerald-500",
  },
  {
    rank: "A",
    label: "Elite",
    min: 7000,
    max: 12999,
    color: "#facc15",
    tailwindText: "text-yellow-400",
    tailwindBg: "bg-yellow-500/10",
    tailwindBorder: "border-yellow-500/20",
    tailwindGlow: "shadow-yellow-500/40",
    tailwindBar: "bg-yellow-400",
  },
  {
    rank: "S",
    label: "Legend",
    min: 13000,
    max: 22999,
    color: "#fb923c",
    tailwindText: "text-orange-400",
    tailwindBg: "bg-orange-500/10",
    tailwindBorder: "border-orange-500/20",
    tailwindGlow: "shadow-orange-500/50",
    tailwindBar: "bg-orange-400",
  },
  {
    rank: "SS",
    label: "Mythic",
    min: 23000,
    max: 37999,
    color: "#f87171",
    tailwindText: "text-red-400",
    tailwindBg: "bg-red-500/10",
    tailwindBorder: "border-red-500/20",
    tailwindGlow: "shadow-red-500/50",
    tailwindBar: "bg-red-500",
  },
  {
    rank: "SSS",
    label: "Transcendent",
    min: 38000,
    max: Infinity,
    color: "#c084fc",
    tailwindText: "text-purple-400",
    tailwindBg: "bg-purple-500/10",
    tailwindBorder: "border-purple-500/20",
    tailwindGlow: "shadow-purple-500/60",
    tailwindBar: "bg-purple-500",
  },
];

export function getRankInfo(totalXP: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

/** Returns 0–1 progress within the current rank tier */
export function getRankProgress(totalXP: number): number {
  const info = getRankInfo(totalXP);
  if (info.max === Infinity) return 1;
  const range = info.max - info.min + 1;
  const within = totalXP - info.min;
  return Math.min(1, within / range);
}

/** XP needed to reach the next rank */
export function xpToNextRank(totalXP: number): number | null {
  const info = getRankInfo(totalXP);
  if (info.max === Infinity) return null;
  return info.max + 1 - totalXP;
}
