import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, Lock, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useUpgradePro } from "@/hooks/use-workouts";
import type { UserProfile } from "@/hooks/use-workouts";

// ── Quiz Data ─────────────────────────────────────────────────────────────────

const GOALS = [
  { id: "muscle",   emoji: "💪", label: "Build muscle",    description: "Pack on size, get stronger" },
  { id: "fat",      emoji: "🔥", label: "Lose fat",        description: "Burn calories, stay lean" },
  { id: "athletic", emoji: "⚡", label: "Get athletic",    description: "Speed, power, endurance" },
  { id: "active",   emoji: "🌟", label: "Just stay active", description: "Feel good, stay consistent" },
];

const EQUIPMENT = [
  { id: "bodyweight", emoji: "🏠", label: "Home (bodyweight)",  description: "No equipment needed" },
  { id: "dumbbells",  emoji: "🏋️", label: "Dumbbells",          description: "Some home equipment" },
  { id: "gym",        emoji: "🏟️", label: "Full gym",           description: "Barbells, cables, machines" },
];

const DAYS = [
  { id: 3, label: "3 days",   description: "Mon / Wed / Fri" },
  { id: 4, label: "4 days",   description: "Mon / Tue / Thu / Fri" },
  { id: 5, label: "5 days",   description: "Mon–Fri" },
  { id: 6, label: "6 days",   description: "Mon–Sat" },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner"     as const, emoji: "🌱", label: "New to this",      description: "Just starting out or returning after a long break." },
  { id: "intermediate" as const, emoji: "💪", label: "Getting started",   description: "Some gym time. Comfortable with basic movements." },
  { id: "advanced"     as const, emoji: "🔥", label: "Consistent lifter", description: "Training regularly for 1+ years. Know most exercises." },
  { id: "veteran"      as const, emoji: "⚡", label: "Veteran",           description: "3+ years of serious training. High volume, complex lifts." },
];

// ── Plan Recommendation Logic ─────────────────────────────────────────────────

type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "veteran";
type GoalId      = "muscle" | "fat" | "athletic" | "active";
type EquipmentId = "bodyweight" | "dumbbells" | "gym";

interface PlanRecommendation {
  slug:        string;
  name:        string;
  description: string;
  emoji:       string;
  series:      string;
  daysPerWeek: string;
  focus:       string;
  isPro:       boolean;
  tags:        string[];
}

function recommendPlan(
  goal: GoalId,
  experience: ExperienceLevel,
  equipment: EquipmentId,
  days: number
): PlanRecommendation {
  const isBeginnerOrInter = experience === "beginner" || experience === "intermediate";
  const isAdvanced        = experience === "advanced" || experience === "veteran";

  // Beginners → free programs
  if (experience === "beginner") {
    if (equipment === "bodyweight" || days <= 3) {
      return {
        slug: "night-acrobat",
        name: "Night Acrobat",
        description: "Calisthenics-based bodyweight training that builds agility and strength without any equipment.",
        emoji: "🦅",
        series: "Foundation Series",
        daysPerWeek: "3–4×/week",
        focus: "Bodyweight · Agility · Strength",
        isPro: false,
        tags: ["Beginner-friendly", "No equipment", "Free"],
      };
    }
    return {
      slug: "night-detective",
      name: "Night Detective",
      description: "Full-body investigator-style conditioning. Builds base strength and endurance with dumbbells or bodyweight.",
      emoji: "🔍",
      series: "Foundation Series",
      daysPerWeek: "3×/week",
      focus: "Full body · Conditioning · Endurance",
      isPro: false,
      tags: ["Beginner-friendly", "Full body", "Free"],
    };
  }

  if (experience === "intermediate") {
    if (goal === "athletic" || equipment === "bodyweight") {
      return {
        slug: "agile-climber",
        name: "Agile Climber",
        description: "Upper/lower split with an emphasis on athletic development, mobility, and functional strength.",
        emoji: "🧗",
        series: "Blueprint Series",
        daysPerWeek: "4×/week",
        focus: "Upper/Lower · Athletic · Mobility",
        isPro: false,
        tags: ["Upper/Lower split", "Athletic", "Free"],
      };
    }
    return {
      slug: "solar-sentinel",
      name: "Solar Sentinel",
      description: "Classic push/pull/lower structure for consistent hypertrophy gains and functional strength.",
      emoji: "☀️",
      series: "Blueprint Series",
      daysPerWeek: "4–5×/week",
      focus: "Hypertrophy · Strength · Consistency",
      isPro: false,
      tags: ["Push/Pull/Lower", "Hypertrophy", "Free"],
    };
  }

  // Advanced/veteran → recommend paid program
  const proPrograms: PlanRecommendation[] = [
    {
      slug: "iron-sovereign",
      name: "Iron Sovereign",
      description: "Elite 6-day Push/Pull/Legs program engineered for maximum hypertrophy and raw strength.",
      emoji: "⚔️",
      series: "Nemesis Series",
      daysPerWeek: days >= 6 ? "6×/week" : "5×/week",
      focus: "PPL · Hypertrophy · Max strength",
      isPro: true,
      tags: ["Nemesis Series", "Advanced", "Pro"],
    },
    {
      slug: "shadow-sovereign",
      name: "Shadow Sovereign",
      description: "High-intensity villain-path training. Brutal volume, explosive power, and iron discipline.",
      emoji: "🌑",
      series: "Villain Tier",
      daysPerWeek: "5×/week",
      focus: "Volume · Explosiveness · Dominance",
      isPro: true,
      tags: ["Villain Tier", "High volume", "Pro"],
    },
  ];
  const pick = goal === "muscle" || goal === "fat" ? proPrograms[0] : proPrograms[1];

  if (isBeginnerOrInter && isAdvanced) {
    // typescript narrowing — won't reach here
  }
  return pick;
}

// ── Free 4 for Paywall display ────────────────────────────────────────────────

const FREE_SPLITS = [
  { name: "Night Acrobat",   emoji: "🦅", series: "Foundation", focus: "Bodyweight · Agility" },
  { name: "Night Detective",  emoji: "🔍", series: "Foundation", focus: "Full body · Conditioning" },
  { name: "Agile Climber",   emoji: "🧗", series: "Blueprint",  focus: "Upper/Lower · Athletic" },
  { name: "Solar Sentinel",  emoji: "☀️", series: "Blueprint",  focus: "Push/Pull/Lower · Hypertrophy" },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  profile: UserProfile;
  defaultAlias: string;
  onComplete: (experienceLevel: ExperienceLevel) => void;
}

type Step = "promise" | "goal" | "equipment" | "days" | "experience" | "plan" | "paywall";

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep]           = useState<Step>("promise");
  const [goal, setGoal]           = useState<GoalId | null>(null);
  const [equipment, setEquipment] = useState<EquipmentId | null>(null);
  const [days, setDays]           = useState<number | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [saving, setSaving]       = useState(false);
  const queryClient = useQueryClient();
  const { upgrade, isPending: upgradePending } = useUpgradePro();

  const plan: PlanRecommendation | null =
    goal && equipment && days && experience
      ? recommendPlan(goal, experience, equipment, days)
      : null;

  const saveAndFinish = async (lvl: ExperienceLevel) => {
    setSaving(true);
    const archetypeMap: Record<GoalId, string> = {
      muscle:   "strength-builder",
      fat:      "endurance-runner",
      athletic: "agile-climber",
      active:   "dark-vigilante",
    };
    await supabase.from("user_profiles").update({
      experience_level: lvl,
      archetype:        goal ? archetypeMap[goal] : "dark-vigilante",
    }).is("experience_level", null);
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    onComplete(lvl);
  };

  const handlePlanContinue = () => {
    if (!plan) return;
    if (plan.isPro) {
      setStep("paywall");
    } else {
      if (experience) saveAndFinish(experience);
    }
  };

  return (
    <Dialog open modal>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden border-white/10 bg-background"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">

          {/* ── PROMISE ─────────────────────────────────────────────────────── */}
          {step === "promise" && (
            <motion.div
              key="promise"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="p-8 space-y-6 text-center"
            >
              <div className="text-6xl">⚡</div>
              <div className="space-y-3">
                <h2 className="text-3xl font-display font-black tracking-tight leading-tight">
                  Train like a hero.<br />
                  <span className="text-muted-foreground">4 days. No gym required.</span>
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  We'll build a personalized plan based on your goal, schedule and equipment. Takes 60 seconds.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full h-12 font-bold gap-2 text-base"
                onClick={() => setStep("goal")}
              >
                Build my plan <ChevronRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-muted-foreground">Free to start · No credit card</p>
            </motion.div>
          )}

          {/* ── GOAL ────────────────────────────────────────────────────────── */}
          {step === "goal" && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-5"
            >
              <StepHeader
                step={1}
                total={4}
                title="What's your main goal?"
                subtitle="We'll pick the right program intensity for you."
              />
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <OptionButton
                    key={g.id}
                    emoji={g.emoji}
                    label={g.label}
                    description={g.description}
                    onClick={() => { setGoal(g.id as GoalId); setStep("equipment"); }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── EQUIPMENT ───────────────────────────────────────────────────── */}
          {step === "equipment" && (
            <motion.div
              key="equipment"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-5"
            >
              <StepHeader
                step={2}
                total={4}
                title="What equipment do you have?"
                subtitle="We only suggest programs that fit your setup."
                onBack={() => setStep("goal")}
              />
              <div className="space-y-2">
                {EQUIPMENT.map((e) => (
                  <OptionButton
                    key={e.id}
                    emoji={e.emoji}
                    label={e.label}
                    description={e.description}
                    onClick={() => { setEquipment(e.id as EquipmentId); setStep("days"); }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── DAYS ────────────────────────────────────────────────────────── */}
          {step === "days" && (
            <motion.div
              key="days"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-5"
            >
              <StepHeader
                step={3}
                total={4}
                title="How many days per week?"
                subtitle="Pick what you can realistically commit to."
                onBack={() => setStep("equipment")}
              />
              <div className="grid grid-cols-2 gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setDays(d.id); setStep("experience"); }}
                    className="text-left p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
                  >
                    <div className="font-bold text-lg">{d.label}</div>
                    <div className="text-xs text-muted-foreground">{d.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── EXPERIENCE ──────────────────────────────────────────────────── */}
          {step === "experience" && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-5"
            >
              <StepHeader
                step={4}
                total={4}
                title="Your training experience?"
                subtitle="Honest answer = better program match."
                onBack={() => setStep("days")}
              />
              <div className="space-y-2">
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <OptionButton
                    key={lvl.id}
                    emoji={lvl.emoji}
                    label={lvl.label}
                    description={lvl.description}
                    onClick={() => { setExperience(lvl.id); setStep("plan"); }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── PLAN REVEAL ─────────────────────────────────────────────────── */}
          {step === "plan" && plan && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 space-y-5"
            >
              <div className="text-center space-y-1">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Your Plan
                </div>
                <div className="text-5xl">{plan.emoji}</div>
                <h2 className="text-2xl font-display font-black mt-2">{plan.name}</h2>
                <div className="text-xs font-mono text-muted-foreground">{plan.series} · {plan.daysPerWeek}</div>
              </div>

              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {plan.description}
              </p>

              <div className="flex flex-wrap gap-1.5 justify-center">
                {plan.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "text-[10px] font-mono px-2.5 py-1 rounded-full border",
                      plan.isPro
                        ? "border-purple-500/30 text-purple-400 bg-purple-500/10"
                        : "border-green-500/30 text-green-400 bg-green-500/10"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {plan.isPro && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>This program requires Pro. You can still start with 4 free programs.</span>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  className="w-full h-11 font-bold gap-2"
                  onClick={handlePlanContinue}
                  disabled={saving}
                >
                  {plan.isPro ? (
                    <><Crown className="w-4 h-4" /> Unlock with Pro</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Start this program</>
                  )}
                </Button>
                {plan.isPro && (
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => experience && saveAndFinish(experience)}
                    disabled={saving}
                  >
                    Continue with free programs instead
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── PAYWALL ─────────────────────────────────────────────────────── */}
          {step === "paywall" && (
            <motion.div
              key="paywall"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="p-6 space-y-4"
            >
              <div className="text-center space-y-1">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
                  <Crown className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-display font-black">Unlock Pro</h2>
                <p className="text-xs text-muted-foreground">Get {plan?.name ?? "your program"} + 35 more elite programs</p>
              </div>

              {/* Free 4 unlocked immediately */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Unlocked free — right now</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {FREE_SPLITS.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
                      <span className="text-base">{s.emoji}</span>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground">{s.series}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-2">
                <ProPlanCard
                  label="Annual"
                  price="$39.99"
                  sub="per year · save 33%"
                  badge="BEST VALUE"
                  onSelect={() => { if (experience) saveAndFinish(experience).then(() => upgrade("annual")); }}
                  isPending={upgradePending}
                />
                <ProPlanCard
                  label="Monthly"
                  price="$4.99"
                  sub="per month"
                  onSelect={() => { if (experience) saveAndFinish(experience).then(() => upgrade("monthly")); }}
                  isPending={upgradePending}
                />
              </div>

              <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                Auto-renews until cancelled. Cancel anytime from your profile. Prices in USD + tax.
                Processed by Stripe. See <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy</a>.
              </p>

              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground"
                onClick={() => experience && saveAndFinish(experience)}
                disabled={saving}
              >
                Continue with free programs for now
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepHeader({
  step, total, title, subtitle, onBack,
}: { step: number; total: number; title: string; subtitle: string; onBack?: () => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-1">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        ) : <span />}
        <span className="text-xs font-mono text-muted-foreground">{step}/{total}</span>
      </div>
      <div className="w-full h-1 rounded-full bg-white/5">
        <div
          className="h-1 rounded-full bg-white/40 transition-all"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
      <div className="pt-2">
        <h2 className="text-xl font-display font-black">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function OptionButton({
  emoji, label, description, onClick,
}: { emoji: string; label: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group text-left"
    >
      <span className="text-3xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm leading-tight">{label}</div>
        <div className="text-xs text-muted-foreground leading-snug">{description}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </button>
  );
}

function ProPlanCard({
  label, price, sub, badge, onSelect, isPending,
}: { label: string; price: string; sub: string; badge?: string; onSelect: () => void; isPending: boolean }) {
  return (
    <button
      onClick={onSelect}
      disabled={isPending}
      className={cn(
        "relative p-3 rounded-xl border-2 text-left transition-all hover:border-purple-400 hover:bg-purple-500/10",
        badge ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/[0.02]"
      )}
    >
      {badge && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <div className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            {badge}
          </div>
        </div>
      )}
      <div className="text-sm font-bold mt-1">{label}</div>
      <div className="text-xl font-display font-black">{price}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </button>
  );
}
