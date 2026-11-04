import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUserProgress } from '@/hooks/use-workouts';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useOnboardingStore, clear as clearOnboarding } from '@/features/onboarding/store';
import { QUIZ_STEPS, TOTAL_QUIZ_STEPS } from '@/features/onboarding/steps.config';
import { generatePlan } from '@/features/onboarding/planGenerator';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import type { PlanResult, Day } from '@/features/onboarding/types';

type Screen = 'welcome' | 'quiz' | 'building' | 'reveal' | 'account' | 'handoff';

const DAY_LABELS: Record<Day, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
  fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

const BUILD_ITEMS = [
  'Analyzing your goals…',
  'Matching exercises to your equipment…',
  'Avoiding moves that stress your knees…',
  'Calculating your calorie target…',
  'Generating your hero plan…',
];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { data: progress, isLoading: progressLoading } = useUserProgress();
  const queryClient = useQueryClient();
  const { answers, setAnswer, reset } = useOnboardingStore();

  const [screen, setScreen] = useState<Screen>('welcome');
  const [quizIndex, setQuizIndex] = useState(0);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [buildStep, setBuildStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // After Google OAuth, user lands back on /onboarding with auth
  useEffect(() => {
    if (authLoading || progressLoading) return;
    if (!user) return;

    const hasArchetype = !!progress?.profile?.archetype;
    if (hasArchetype) {
      navigate('/');
      return;
    }

    // Authenticated but no archetype → check if we have local answers to save
    const hasLocalAnswers = !!answers.archetype && !!answers.goal && !!answers.fitnessLevel;
    if (hasLocalAnswers) {
      void saveAndComplete();
    }
    // else fall through to show quiz from beginning
  }, [user, authLoading, progressLoading, progress]);

  async function saveAndComplete() {
    if (!user) return;
    setSaving(true);
    const p = generatePlan(answers);
    try {
      await supabase.from('user_profiles').update({
        archetype:        p.archetype,
        path:             'hero',
        alias:            user.email?.split('@')[0] ?? 'Hero',
        experience_level: answers.fitnessLevel ?? 'beginner',
      }).eq('user_id', user.id);
    } catch {
      // non-fatal
    }
    clearOnboarding();
    queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    setSaving(false);
    navigate('/');
  }

  // ── Build animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'building') return;
    if (buildStep >= BUILD_ITEMS.length) {
      const p = generatePlan(answers);
      setPlan(p);
      setTimeout(() => setScreen('reveal'), 300);
      return;
    }
    const t = setTimeout(() => setBuildStep((s) => s + 1), 700);
    return () => clearTimeout(t);
  }, [screen, buildStep, answers]);

  function goBack() {
    setDirection(-1);
    if (screen === 'quiz') {
      if (quizIndex === 0) {
        setScreen('welcome');
      } else {
        setQuizIndex((i) => i - 1);
      }
    } else if (screen === 'reveal') {
      setScreen('quiz');
      setQuizIndex(TOTAL_QUIZ_STEPS - 1);
    } else if (screen === 'account') {
      setScreen('reveal');
    }
  }

  function advanceQuiz() {
    setDirection(1);
    if (quizIndex < TOTAL_QUIZ_STEPS - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      setBuildStep(0);
      setScreen('building');
    }
  }

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  }

  if (authLoading || (user && progressLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (saving) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Saving your plan…</p>
      </div>
    );
  }

  const progressPct = screen === 'quiz'
    ? ((quizIndex) / TOTAL_QUIZ_STEPS) * 100
    : screen === 'building' || screen === 'reveal' || screen === 'account' || screen === 'handoff'
    ? 100 : 0;

  const showProgress = screen === 'quiz';
  const showBack = screen === 'quiz' || screen === 'reveal' || screen === 'account';

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -32 }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {(showBack || showProgress) && (
        <div className="flex items-center gap-3 px-6 pt-safe pt-4 pb-2 shrink-0">
          {showBack && (
            <button
              type="button"
              onClick={goBack}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {showProgress && (
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500 rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-safe">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── WELCOME ──────────────────────────────────────────────────── */}
          {screen === 'welcome' && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col min-h-[calc(100vh-5rem)] py-10 space-y-8"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="text-7xl">⚡</div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-display font-black leading-tight">
                    Train like the hero<br />you want to become
                  </h1>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                    Answer 14 quick questions and we'll build a personalized workout plan in under 2 minutes.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setDirection(1); setScreen('quiz'); setQuizIndex(0); }}
                  className="w-full h-14 rounded-2xl bg-cyan-500 text-black font-bold text-base hover:bg-cyan-400 active:scale-[0.98] transition-all shadow-lg shadow-cyan-900/30"
                >
                  Get started
                </button>
                {!user && (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full h-14 rounded-2xl border-2 border-white/15 bg-white/[0.03] text-sm font-semibold text-muted-foreground hover:border-white/25 hover:text-foreground transition-all"
                  >
                    I already have an account
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── QUIZ STEP ─────────────────────────────────────────────────── */}
          {screen === 'quiz' && (
            <motion.div
              key={`quiz-${quizIndex}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="py-6 space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-black leading-tight">
                  {QUIZ_STEPS[quizIndex].title}
                </h2>
                {QUIZ_STEPS[quizIndex].subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {QUIZ_STEPS[quizIndex].subtitle}
                  </p>
                )}
              </div>

              <OnboardingScreen
                step={QUIZ_STEPS[quizIndex]}
                answers={answers}
                onAnswer={setAnswer}
                onContinue={advanceQuiz}
                stepIndex={quizIndex}
                totalSteps={TOTAL_QUIZ_STEPS}
              />
            </motion.div>
          )}

          {/* ── BUILDING ─────────────────────────────────────────────────── */}
          {screen === 'building' && (
            <motion.div
              key="building"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col min-h-[calc(100vh-5rem)] py-10 items-center justify-center space-y-8"
            >
              <div className="text-5xl animate-pulse">⚡</div>
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-display font-black">Building your hero plan</h2>
                <p className="text-sm text-muted-foreground">Just a moment…</p>
              </div>
              <div className="w-full max-w-xs space-y-3">
                {BUILD_ITEMS.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: i < buildStep ? 1 : 0.2, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                        i < buildStep
                          ? 'border-cyan-500 bg-cyan-500'
                          : 'border-white/20',
                      )}
                    >
                      {i < buildStep && <Check className="w-3 h-3 text-black" />}
                    </div>
                    <span className={i < buildStep ? 'text-foreground' : 'text-muted-foreground'}>
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── REVEAL ───────────────────────────────────────────────────── */}
          {screen === 'reveal' && plan && (
            <motion.div
              key="reveal"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="py-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Your plan is ready
                </p>
                <div className="text-6xl">{plan.archetypeEmoji}</div>
                <h2 className="text-2xl font-display font-black">{plan.archetypeName}</h2>
                <p className="text-sm text-muted-foreground">{plan.goalLabel} · {plan.splitName}</p>
              </div>

              {/* Weekly calendar */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Your weekly schedule
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as Day[]).map((d) => {
                    const isTraining = plan.trainingDays.includes(d);
                    return (
                      <div
                        key={d}
                        className={cn(
                          'flex-1 min-w-[36px] h-10 rounded-xl flex items-center justify-center text-xs font-bold border-2 transition-all',
                          isTraining
                            ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                            : 'border-white/10 text-muted-foreground',
                        )}
                      >
                        {DAY_LABELS[d]}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {plan.daysPerWeek}× per week · ~{plan.calorieTarget.toLocaleString()} kcal target
                </p>
              </div>

              <div className="space-y-3 pb-4">
                <button
                  type="button"
                  onClick={() => { setDirection(1); setScreen('account'); }}
                  className="w-full h-14 rounded-2xl bg-cyan-500 text-black font-bold text-base hover:bg-cyan-400 active:scale-[0.98] transition-all shadow-lg shadow-cyan-900/30"
                >
                  Save your plan →
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Create a free account to save your plan and track progress
                </p>
              </div>
            </motion.div>
          )}

          {/* ── ACCOUNT ──────────────────────────────────────────────────── */}
          {screen === 'account' && (
            <motion.div
              key="account"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col min-h-[calc(100vh-5rem)] py-10 space-y-8"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-5xl">{plan?.archetypeEmoji ?? '⚡'}</div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black">Save your plan</h2>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Sign in to save your {plan?.archetypeName} plan and start your first workout.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pb-safe">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full h-14 rounded-2xl border-2 border-white/15 bg-white/[0.03] font-semibold text-sm flex items-center justify-center gap-3 hover:border-white/30 hover:bg-white/[0.06] transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
                <p className="text-center text-xs text-muted-foreground leading-relaxed">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="underline">Terms</a> and{' '}
                  <a href="/privacy" className="underline">Privacy Policy</a>.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── HANDOFF ──────────────────────────────────────────────────── */}
          {screen === 'handoff' && (
            <motion.div
              key="handoff"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col min-h-[calc(100vh-5rem)] py-10 items-center justify-center text-center space-y-8"
            >
              <div className="text-7xl">🏆</div>
              <div className="space-y-3">
                <h2 className="text-2xl font-display font-black">You're all set!</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Your hero plan is saved. Time to start your first workout.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full max-w-xs h-14 rounded-2xl bg-cyan-500 text-black font-bold text-base hover:bg-cyan-400 active:scale-[0.98] transition-all shadow-lg shadow-cyan-900/30"
              >
                Let's go →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
