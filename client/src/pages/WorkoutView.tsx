import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useWorkout, useCreateLog } from "@/hooks/use-workouts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ArrowLeft, Clock, Play, CheckCircle, Timer as TimerIcon, Trophy, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { format } from "date-fns";

export default function WorkoutView() {
  const [, params] = useRoute("/workout/:slug");
  const slug = params?.slug || "";
  const { data: workout, isLoading } = useWorkout(slug);
  const { mutate: createLog, isPending: isSaving } = useCreateLog();
  const { toast } = useToast();
  
  const [activeStep, setActiveStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isCompleted) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isCompleted]);

  // Handle Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle Not Found
  if (!workout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold">Workout not found</h1>
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  const program = workout.program as any;
  const exercises = program.exercises || [];
  const currentExercise = exercises[activeStep];
  const progress = ((activeStep) / exercises.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setIsCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: workout.type === 'villain' ? ['#a855f7', '#7e22ce'] : ['#22d3ee', '#0891b2']
    });

    createLog({
      workoutId: workout.id,
      workoutName: workout.name,
      duration: Math.ceil(elapsedTime / 60),
      date: format(new Date(), 'yyyy-MM-dd'),
      userId: "", // Handled by backend from session
    });
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 p-6 rounded-full bg-green-500/10 border border-green-500/20"
        >
          <Trophy className="w-16 h-16 text-green-500" />
        </motion.div>
        <h1 className="text-4xl font-display font-bold mb-4">Workout Complete!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          You crushed the <span className="text-foreground font-semibold">{workout.name}</span> workout in {formatTime(elapsedTime)}.
        </p>
        <div className="flex gap-4">
          <Link href="/">
            <Button size="lg" className="px-8">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="px-4 h-16 flex items-center border-b border-white/5 justify-between bg-card/50 backdrop-blur-sm fixed top-0 w-full z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="font-mono font-semibold tabular-nums text-lg flex items-center gap-2">
          <TimerIcon className={isStarted ? "w-4 h-4 text-green-500 animate-pulse" : "w-4 h-4 text-muted-foreground"} />
          {formatTime(elapsedTime)}
        </div>
        <div className="w-8" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-24 max-w-2xl mx-auto w-full px-4 flex flex-col justify-center min-h-screen">
        {!isStarted ? (
          <div className="text-center space-y-6">
            {workout.avatarEmoji && (
              <div className="text-6xl mb-6 animate-bounce-slow">
                {workout.avatarEmoji}
              </div>
            )}
            <div className="inline-block px-3 py-1 rounded-full border border-white/10 text-xs font-mono uppercase tracking-widest bg-white/5 mb-4">
              {workout.difficulty}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black leading-tight">
              {workout.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              {workout.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-8">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-2xl font-bold">{program.duration}m</div>
                <div className="text-xs text-muted-foreground uppercase">Duration</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-2xl font-bold">{exercises.length}</div>
                <div className="text-xs text-muted-foreground uppercase">Exercises</div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/10 hover:scale-105 transition-transform"
              onClick={() => setIsStarted(true)}
            >
              <Play className="w-5 h-5 mr-2 fill-current" /> Start Workout
            </Button>
          </div>
        ) : (
          <div className="space-y-8 py-8 w-full">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Current Exercise Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Background Number */}
                <div className="absolute -right-4 -bottom-10 text-[10rem] font-black text-white/5 select-none pointer-events-none">
                  {activeStep + 1}
                </div>

                <div className="relative z-10">
                  <div className="text-sm font-mono text-primary mb-2">
                    Exercise {activeStep + 1} of {exercises.length}
                  </div>
                  <h2 className="text-3xl font-bold font-display mb-4">
                    {currentExercise.name}
                  </h2>
                  <div className="flex gap-4 mb-8">
                    {currentExercise.reps && (
                      <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 font-bold text-xl">
                        {currentExercise.reps} <span className="text-xs font-normal text-muted-foreground ml-1">REPS</span>
                      </div>
                    )}
                    {currentExercise.sets && (
                      <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 font-bold text-xl">
                        {currentExercise.sets} <span className="text-xs font-normal text-muted-foreground ml-1">SETS</span>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentExercise.instructions || "Perform the movement with control. Keep core tight."}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Controls Footer */}
      {isStarted && (
        <footer className="fixed bottom-0 w-full p-4 border-t border-white/5 bg-background/80 backdrop-blur-md z-10">
          <div className="max-w-2xl mx-auto flex justify-between gap-4">
            <Button 
              variant="secondary" 
              size="lg"
              className="flex-1"
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
            >
              Previous
            </Button>
            
            {activeStep < exercises.length - 1 ? (
              <Button 
                size="lg"
                className="flex-[2]"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next Exercise <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                size="lg"
                className="flex-[2] bg-green-600 hover:bg-green-500 text-white"
                onClick={handleFinish}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <CheckCircle className="w-4 h-4 mr-2" />}
                Finish Workout
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
