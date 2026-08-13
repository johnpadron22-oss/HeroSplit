import { useEffect, useRef, useState } from "react";
import { useRoute, Link } from "wouter";
import { useWorkout, useCreateLog } from "@/hooks/use-workouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle, ChevronRight, Dumbbell,
  Flame, Loader2, Play, SkipForward, Timer, Trophy, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { format } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  rest?: string;
}

interface CompletedSet {
  weight: string;
  reps: string;
}

type Phase = "preview" | "active" | "rest" | "done";

const REST_PRESETS = [45, 60, 90, 120, 180];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function parseSetCount(s?: string): number {
  if (!s) return 3;
  const n = parseInt(s, 10);
  return isNaN(n) ? 3 : n;
}

function parseDefaultRest(s?: string): number {
  if (!s) return 90;
  const n = parseInt(s, 10);
  return isNaN(n) ? 90 : n;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkoutView() {
  const [, params] = useRoute("/workout/:slug");
  const slug = params?.slug ?? "";
  const { data: workout, isLoading } = useWorkout(slug);
  const { mutate: createLog, isPending: isSaving } = useCreateLog();

  // Phase
  const [phase, setPhase] = useState<Phase>("preview");

  // Workout timer
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  // Exercise state
  const [exIndex, setExIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0); // current set (0-based)
  const [completedSets, setCompletedSets] = useState<Record<number, CompletedSet[]>>({});
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // Rest timer
  const [restRemaining, setRestRemaining] = useState(90);
  const [restDuration, setRestDuration] = useState(90);

  // XP
  const [xpEarned, setXpEarned] = useState(0);

  // ── Timers ──────────────────────────────────────────────────────────────────

  // Workout elapsed timer
  useEffect(() => {
    if (phase !== "active" && phase !== "rest") return;
    const id = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Rest countdown
  useEffect(() => {
    if (phase !== "rest") return;
    if (restRemaining <= 0) {
      setPhase("active");
      return;
    }
    const id = setInterval(() => {
      setRestRemaining((r) => {
        if (r <= 1) { clearInterval(id); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, restRemaining]);

  // ── Derived ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold">Workout not found</h1>
        <Link href="/"><Button variant="outline">Return Home</Button></Link>
      </div>
    );
  }

  const program = workout.program as { exercises: Exercise[]; duration?: number };
  const exercises: Exercise[] = program.exercises ?? [];
  const currentEx = exercises[exIndex];
  const totalSets = parseSetCount(currentEx?.sets);
  const setsForCurrent = completedSets[exIndex] ?? [];
  const progressPct = ((exIndex + setIndex / Math.max(totalSets, 1)) / exercises.length) * 100;
  const isVillain = workout.type === "villain" || workout.type === "anime";
  const accentClass = isVillain ? "text-purple-400" : "text-cyan-400";
  const btnClass = isVillain
    ? "bg-purple-600 hover:bg-purple-500 text-white"
    : "bg-cyan-600 hover:bg-cyan-500 text-black";

  // ── Actions ─────────────────────────────────────────────────────────────────

  const startWorkout = () => {
    setPhase("active");
    setExIndex(0);
    setSetIndex(0);
    setWeight("");
    setReps("");
  };

  const completeSet = () => {
    const set: CompletedSet = { weight: weight || "BW", reps: reps || currentEx.reps || "—" };
    setCompletedSets((prev) => ({
      ...prev,
      [exIndex]: [...(prev[exIndex] ?? []), set],
    }));
    setXpEarned((x) => x + 25);

    const nextSet = setIndex + 1;
    if (nextSet < totalSets) {
      // Start rest before next set
      const r = parseDefaultRest(currentEx.rest);
      setRestDuration(r);
      setRestRemaining(r);
      setSetIndex(nextSet);
      setWeight("");
      setReps(reps); // keep last reps as suggestion
      setPhase("rest");
    } else {
      // Move to next exercise
      advanceExercise();
    }
  };

  const advanceExercise = () => {
    const nextEx = exIndex + 1;
    if (nextEx >= exercises.length) {
      finishWorkout();
    } else {
      setExIndex(nextEx);
      setSetIndex(0);
      setWeight("");
      setReps("");
      // Short rest between exercises
      const r = parseDefaultRest(exercises[nextEx]?.rest) || 60;
      setRestDuration(r);
      setRestRemaining(r);
      setPhase("rest");
    }
  };

  const skipRest = () => {
    setRestRemaining(0);
    setPhase("active");
  };

  const finishWorkout = () => {
    setPhase("done");
    const totalXp = Object.values(completedSets).reduce((sum, sets) => sum + sets.length * 25, 0);
    setXpEarned(totalXp);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: isVillain ? ["#a855f7", "#7e22ce", "#ec4899"] : ["#22d3ee", "#0891b2", "#facc15"],
    });

    createLog({
      workoutId: workout.id,
      workoutName: workout.name,
      duration: Math.max(1, Math.ceil(elapsedRef.current / 60)),
      date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  // ── RENDER ───────────────────────────────────────────────────────────────────

  // ── Preview ─────────────────────────────────────────────────────────────────
  if (phase === "preview") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-4 h-14 flex items-center border-b border-white/5 fixed top-0 w-full z-10 bg-background/80 backdrop-blur-sm">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </header>

        <main className="flex-1 pt-14 max-w-2xl mx-auto w-full px-4 py-8 space-y-8">
          {/* Hero */}
          <div className="text-center space-y-3 pt-4">
            <div className="text-6xl">{workout.avatarEmoji ?? "💪"}</div>
            <div className={cn("text-xs font-mono uppercase tracking-widest", accentClass)}>
              {workout.difficulty}
            </div>
            <h1 className="text-3xl font-display font-black leading-tight">{workout.name}</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">{workout.description}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Exercises", value: exercises.length },
              { label: "Est. Time", value: `${program.duration ?? 30}m` },
              { label: "XP Available", value: `~${exercises.reduce((s, e) => s + parseSetCount(e.sets) * 25, 0)}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold font-display">{value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Exercise list */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Exercises</h2>
            {exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-white/5">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0", isVillain ? "bg-purple-500/10 text-purple-400" : "bg-cyan-500/10 text-cyan-400")}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{ex.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ex.sets ? `${ex.sets} sets` : ""}{ex.sets && ex.reps ? " × " : ""}{ex.reps ? ex.reps : ""}
                    {ex.rest ? ` · ${ex.rest} rest` : ""}
                  </div>
                </div>
                <Dumbbell className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className={cn("w-full h-14 text-lg font-bold rounded-2xl gap-2", btnClass)}
            onClick={startWorkout}
          >
            <Play className="w-5 h-5 fill-current" />
            Start Battle
          </Button>
        </main>
      </div>
    );
  }

  // ── Done ────────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const totalSetsCompleted = Object.values(completedSets).reduce((s, sets) => s + sets.length, 0);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center"
        >
          <Trophy className="w-12 h-12 text-yellow-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-display font-black">Battle Complete!</h1>
          <p className="text-muted-foreground">{workout.name}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 w-full max-w-sm"
        >
          {[
            { icon: <Timer className="w-4 h-4" />, label: "Time", value: formatTime(elapsed) },
            { icon: <Dumbbell className="w-4 h-4" />, label: "Sets", value: totalSetsCompleted },
            { icon: <Zap className="w-4 h-4 text-yellow-400" />, label: "XP", value: `+${xpEarned}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-card border border-white/5 rounded-2xl p-4 text-center">
              <div className="flex justify-center text-muted-foreground mb-1">{icon}</div>
              <div className="text-2xl font-display font-bold">{value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-sm space-y-3"
        >
          <div className="flex items-center gap-2 justify-center text-yellow-400 font-bold">
            <Flame className="w-5 h-5" />
            <span>+{xpEarned} XP Earned</span>
          </div>
          <Link href="/" className="block">
            <Button size="lg" className={cn("w-full h-12 font-bold", btnClass)}>
              Back to HeroSplit
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Rest Timer ───────────────────────────────────────────────────────────────
  if (phase === "rest") {
    const pct = restRemaining / restDuration;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-4 h-14 flex items-center justify-between border-b border-white/5 fixed top-0 w-full z-10 bg-background/80 backdrop-blur-sm">
          <div className="font-mono text-sm text-muted-foreground">{formatTime(elapsed)}</div>
          <div className="text-sm font-medium">Rest</div>
          <div className="w-16" />
        </header>

        <main className="flex-1 pt-14 flex flex-col items-center justify-center gap-10 px-6">
          {/* Circular countdown */}
          <div className="relative w-48 h-48">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
              <circle
                cx="50" cy="50" r="44" fill="none"
                stroke={isVillain ? "#a855f7" : "#22d3ee"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-display font-black tabular-nums">{restRemaining}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">seconds</div>
            </div>
          </div>

          {/* What's coming up */}
          <div className="text-center space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Next up</div>
            <div className="text-xl font-bold">{currentEx?.name}</div>
            <div className={cn("text-sm font-mono", accentClass)}>
              Set {setIndex + 1} of {totalSets}
            </div>
          </div>

          {/* Preset buttons */}
          <div className="flex gap-2">
            {REST_PRESETS.map((s) => (
              <button
                key={s}
                onClick={() => { setRestDuration(s); setRestRemaining(s); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-mono border transition-colors",
                  restDuration === s
                    ? isVillain ? "bg-purple-600 border-purple-500 text-white" : "bg-cyan-600 border-cyan-500 text-black"
                    : "border-white/10 text-muted-foreground hover:border-white/30"
                )}
              >
                {s < 60 ? `${s}s` : `${s / 60}m`}
              </button>
            ))}
          </div>

          <Button variant="outline" className="gap-2" onClick={skipRest}>
            <SkipForward className="w-4 h-4" />
            Skip Rest
          </Button>
        </main>
      </div>
    );
  }

  // ── Active Workout ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 h-14 flex items-center justify-between border-b border-white/5 fixed top-0 w-full z-10 bg-background/80 backdrop-blur-sm">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="font-mono tabular-nums text-sm flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-green-500 animate-pulse" />
          {formatTime(elapsed)}
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {exIndex + 1}/{exercises.length}
        </div>
      </header>

      {/* Progress bar */}
      <div className="fixed top-14 left-0 right-0 h-0.5 bg-white/5 z-10">
        <motion.div
          className={cn("h-full", isVillain ? "bg-purple-500" : "bg-cyan-500")}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <main className="flex-1 pt-16 pb-40 max-w-lg mx-auto w-full px-4 flex flex-col gap-6 justify-center">
        {/* Exercise card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${exIndex}-${setIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-white/5 rounded-3xl p-6 relative overflow-hidden"
          >
            {/* Big background number */}
            <div className="absolute -right-3 -bottom-8 text-[8rem] font-black text-white/[0.03] select-none pointer-events-none leading-none">
              {setIndex + 1}
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={cn("text-xs font-mono uppercase tracking-widest mb-1", accentClass)}>
                    Set {setIndex + 1} of {totalSets}
                  </div>
                  <h2 className="text-2xl font-display font-black leading-tight">
                    {currentEx.name}
                  </h2>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              {/* Target */}
              <div className="flex gap-2">
                {currentEx.reps && (
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-bold">
                    {currentEx.reps} <span className="text-muted-foreground font-normal text-xs">reps</span>
                  </div>
                )}
                {currentEx.rest && (
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-bold">
                    {currentEx.rest} <span className="text-muted-foreground font-normal text-xs">rest</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Weight + Reps inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Weight (lbs/kg)</label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="BW"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 text-center text-lg font-bold bg-card border-white/10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">Reps</label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder={currentEx?.reps ?? "—"}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="h-12 text-center text-lg font-bold bg-card border-white/10"
            />
          </div>
        </div>

        {/* Previous sets */}
        {setsForCurrent.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Previous Sets</div>
            <div className="space-y-1">
              {setsForCurrent.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-sm">
                  <span className="text-muted-foreground">Set {i + 1}</span>
                  <span className="font-mono font-semibold">
                    {s.weight} × {s.reps}
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer controls */}
      <footer className="fixed bottom-0 w-full px-4 py-4 border-t border-white/5 bg-background/90 backdrop-blur-md z-10">
        <div className="max-w-lg mx-auto flex gap-3">
          {/* Skip exercise */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-12 w-12"
            onClick={advanceExercise}
            title="Skip exercise"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Complete set */}
          <Button
            size="lg"
            className={cn("flex-1 h-12 font-bold text-base gap-2", btnClass)}
            onClick={completeSet}
          >
            <CheckCircle className="w-5 h-5" />
            {setIndex + 1 < totalSets
              ? `Complete Set ${setIndex + 1}`
              : exIndex + 1 < exercises.length
              ? "Finish & Next Exercise"
              : "Finish Workout"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
