import { motion } from "framer-motion";
import { Flame, Trophy, Dumbbell, Zap, Shield, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRankInfo, getRankProgress, xpToNextRank } from "@/lib/rank";
import type { UserProfile } from "@/hooks/use-workouts";

interface ProfileCardProps {
  profile: UserProfile;
  totalWorkouts: number;
  currentStreak: number;
}

// Map archetype slug → display name + emoji
const ARCHETYPE_DISPLAY: Record<string, { name: string; emoji: string }> = {
  // Hero archetypes
  "dark-vigilante":   { name: "Dark Vigilante", emoji: "🦇" },
  "super-soldier":    { name: "Super Soldier",  emoji: "🛡️" },
  "thunder-giant":    { name: "Thunder Giant",  emoji: "🔨" },
  "armored-genius":   { name: "Armored Genius", emoji: "🤖" },
  "one-tap-hero":     { name: "One-Tap Hero",   emoji: "✨" },
  "wall-crawler":     { name: "Wall-Crawler",   emoji: "🕷️" },
  // Villain archetypes
  "midnight-predator": { name: "Midnight Predator", emoji: "🐈‍⬛" },
  "berserker-frame":   { name: "Berserker Frame",   emoji: "🔥" },
  "void-sorcerer":     { name: "Void Sorcerer",     emoji: "🌀" },
  "precision-assassin":{ name: "Precision Assassin",emoji: "🗡️" },
  "pure-discipline":   { name: "Pure Discipline",   emoji: "⚫" },
  "gamma-juggernaut":  { name: "Gamma Juggernaut",  emoji: "💪" },
};

const LEVEL_DISPLAY: Record<string, string> = {
  beginner:     "Novice",
  intermediate: "Initiate",
  advanced:     "Veteran",
  veteran:      "Elite",
};

export function ProfileCard({ profile, totalWorkouts, currentStreak }: ProfileCardProps) {
  const totalXP    = profile.totalXP ?? 0;
  const rankInfo   = getRankInfo(totalXP);
  const progress   = getRankProgress(totalXP);
  const remaining  = xpToNextRank(totalXP);
  const isVillain  = profile.path === "villain";
  const archetype  = profile.archetype
    ? (ARCHETYPE_DISPLAY[profile.archetype] ?? { name: profile.archetype, emoji: "⚡" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border p-6",
        isVillain
          ? "border-purple-500/20 bg-gradient-to-br from-purple-950/60 via-background to-background"
          : "border-cyan-500/20 bg-gradient-to-br from-cyan-950/60 via-background to-background"
      )}
    >
      {/* Faint background glow */}
      <div className={cn(
        "absolute inset-0 opacity-[0.06] rounded-3xl",
        isVillain
          ? "bg-gradient-to-br from-purple-500 via-pink-500 to-transparent"
          : "bg-gradient-to-br from-cyan-400 via-blue-500 to-transparent"
      )} />

      <div className="relative z-10 space-y-5">
        {/* Top row — path badge + archetype */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {/* Path badge */}
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
              isVillain
                ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            )}>
              {isVillain
                ? <Skull className="w-3 h-3" />
                : <Shield className="w-3 h-3" />}
              {isVillain ? "Villain Arc" : "Hero Arc"}
            </div>

            {/* Alias */}
            <h2 className="text-2xl font-display font-black leading-tight">
              {profile.alias ?? "Unknown Hero"}
            </h2>

            {/* Archetype */}
            {archetype && (
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <span>{archetype.emoji}</span>
                <span>{archetype.name}</span>
              </div>
            )}
          </div>

          {/* Rank badge */}
          <div className={cn(
            "shrink-0 w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg",
            rankInfo.tailwindBg,
            rankInfo.tailwindBorder,
            `shadow-${rankInfo.tailwindGlow.replace("shadow-", "")}`
          )}>
            <div className={cn("text-3xl font-black font-display leading-none", rankInfo.tailwindText)}>
              {rankInfo.rank}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">
              {rankInfo.label}
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-bold text-yellow-400">{totalXP.toLocaleString()} XP</span>
            </div>
            <div className="text-muted-foreground">
              {remaining !== null
                ? <span>{remaining.toLocaleString()} XP to {getRankInfo(totalXP + (remaining ?? 0)).rank}</span>
                : <span className={rankInfo.tailwindText}>MAX RANK</span>}
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className={cn("h-full rounded-full", rankInfo.tailwindBar)}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Dumbbell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-display font-bold">{totalWorkouts}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Sessions</div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-xl font-display font-bold">{currentStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className={cn("text-xl font-display font-bold", rankInfo.tailwindText)}>
              {rankInfo.rank}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Rank</div>
          </div>
        </div>

        {/* Experience level tag */}
        {profile.experienceLevel && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Training level:</span>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full border",
              isVillain
                ? "bg-purple-500/10 border-purple-500/20 text-purple-300"
                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
            )}>
              {LEVEL_DISPLAY[profile.experienceLevel] ?? profile.experienceLevel}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
