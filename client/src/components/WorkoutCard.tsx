import { motion } from "framer-motion";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Activity, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Workout } from "@/hooks/use-workouts";
import { cn } from "@/lib/utils";

interface WorkoutCardProps {
  workout: Workout;
  isLocked?: boolean;
  onUnlock?: () => void;
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "veteran";
}

const DIFFICULTY_ORDER = ["Beginner", "Intermediate", "Advanced", "Elite Level"];

function isTooAdvanced(difficulty: string, level?: string): boolean {
  if (!level || level === "advanced" || level === "veteran") return false;
  const diffIdx = DIFFICULTY_ORDER.indexOf(difficulty);
  if (level === "beginner") return diffIdx >= 2; // warn on Advanced+
  if (level === "intermediate") return diffIdx >= 3; // warn on Elite only
  return false;
}

export function WorkoutCard({ workout, isLocked = false, onUnlock, experienceLevel }: WorkoutCardProps) {
  const isVillain = workout.type === "villain" || workout.type === "anime";
  const showWarning = isTooAdvanced(workout.difficulty, experienceLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card shadow-lg transition-all flex flex-col",
        isVillain
          ? "border-purple-500/20 shadow-purple-900/10 hover:shadow-purple-900/20"
          : "border-cyan-500/20 shadow-cyan-900/10 hover:shadow-cyan-900/20"
      )}
    >
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-10",
        isVillain
          ? "bg-gradient-to-br from-purple-600 via-transparent to-transparent"
          : "bg-gradient-to-br from-cyan-600 via-transparent to-transparent"
      )} />

      <div className="relative p-6 flex flex-col flex-1">
        {/* Emoji */}
        {workout.avatarEmoji && (
          <div className="absolute top-4 right-4 text-4xl select-none opacity-80">
            {workout.avatarEmoji}
          </div>
        )}

        {/* Difficulty + equipment row */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pr-10">
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0",
            isVillain
              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          )}>
            {workout.difficulty}
          </div>
          {workout.equipment && (
            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-white/5 text-muted-foreground border border-white/10">
              {workout.equipment}
            </div>
          )}
          {isLocked && <Lock className="w-4 h-4 text-muted-foreground ml-auto" />}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold font-display mb-1 line-clamp-1">{workout.name}</h3>
        {workout.series && (
          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2 w-fit">
            {workout.series}
          </div>
        )}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {workout.description}
        </p>

        {/* Beginner warning */}
        {showWarning && (
          <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300/80 leading-snug">
              This workout is designed for experienced lifters. Consider starting with an Intermediate difficulty workout first.
            </p>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{(workout.program as any).duration || "30–45"} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>{(workout.program as any).exercises?.length ?? 5} exercises</span>
          </div>
        </div>

        {/* CTA */}
        {isLocked ? (
          <Button onClick={onUnlock} variant="secondary" className="w-full font-semibold">
            Unlock Pro
          </Button>
        ) : (
          <Link href={`/workout/${workout.slug}`} className="w-full">
            <Button
              className={cn(
                "w-full font-semibold transition-all",
                isVillain
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
                  : "bg-cyan-600 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-900/20"
              )}
            >
              Start Workout <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
