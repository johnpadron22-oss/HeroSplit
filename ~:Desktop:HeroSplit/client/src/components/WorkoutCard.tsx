import { motion } from "framer-motion";
import { Link } from "wouter";
import { Lock, Clock, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Workout } from "@shared/schema";
import { cn } from "@/lib/utils";

interface WorkoutCardProps {
  workout: Workout;
  isLocked?: boolean;
  onUnlock?: () => void;
}

export function WorkoutCard({ workout, isLocked = false, onUnlock }: WorkoutCardProps) {
  const isVillain = workout.type === 'villain';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card shadow-lg transition-all",
        isVillain 
          ? "border-purple-500/20 shadow-purple-900/10 hover:shadow-purple-900/20" 
          : "border-cyan-500/20 shadow-cyan-900/10 hover:shadow-cyan-900/20"
      )}
    >
      {/* Background Gradient & Image Placeholder */}
      <div className={cn(
        "absolute inset-0 opacity-10 transition-opacity duration-500 group-hover:opacity-20",
        isVillain 
          ? "bg-gradient-to-br from-purple-600 via-transparent to-transparent" 
          : "bg-gradient-to-br from-cyan-600 via-transparent to-transparent"
      )} />

      <div className="relative p-6 flex flex-col h-full">
        {/* Avatar Emoji */}
        {workout.avatarEmoji && (
          <div className="absolute top-4 right-4 text-4xl select-none opacity-80 group-hover:opacity-100 transition-opacity">
            {workout.avatarEmoji}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
            isVillain 
              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          )}>
            {workout.difficulty}
          </div>
          {workout.equipment && (
            <div className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-white/5 text-muted-foreground border border-white/10 ml-2">
              {workout.equipment}
            </div>
          )}
          <div className="flex-1" />
          {isLocked && <Lock className="w-5 h-5 text-muted-foreground mr-1" />}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold font-display mb-2 line-clamp-1">{workout.name}</h3>
        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow">
          {workout.description}
        </p>

        {/* Footer Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{(workout.program as any).duration || '30-45'} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>{(workout.program as any).exercises?.length || 5} exercises</span>
          </div>
        </div>

        {/* Action */}
        {isLocked ? (
          <Button 
            onClick={onUnlock} 
            variant="secondary"
            className="w-full font-semibold group-hover:bg-secondary/80"
          >
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
