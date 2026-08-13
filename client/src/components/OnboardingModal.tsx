import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";
import type { UserProfile } from "@/hooks/use-workouts";

// ── Archetype Data ────────────────────────────────────────────────────────────

const HERO_ARCHETYPES = [
  {
    id: "dark-vigilante",
    name: "Dark Vigilante",
    emoji: "🦇",
    tagline: "Master of shadows. Strength forged in darkness.",
    stats: ["Strength", "Stealth", "Endurance"],
    color: "from-slate-900 to-blue-950",
    accent: "text-blue-400",
    border: "border-blue-500/30",
  },
  {
    id: "super-soldier",
    name: "Super Soldier",
    emoji: "🛡️",
    tagline: "Military-grade. Never stop. Never quit.",
    stats: ["Endurance", "Strength", "Discipline"],
    color: "from-slate-900 to-cyan-950",
    accent: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  {
    id: "thunder-giant",
    name: "Thunder Giant",
    emoji: "🔨",
    tagline: "Overhead power worthy of a god.",
    stats: ["Power", "Overhead", "Raw Force"],
    color: "from-slate-900 to-yellow-950",
    accent: "text-yellow-400",
    border: "border-yellow-500/30",
  },
  {
    id: "armored-genius",
    name: "Armored Genius",
    emoji: "🤖",
    tagline: "Billionaire. Genius. Unstoppable machine.",
    stats: ["Functional", "Intelligence", "Full Body"],
    color: "from-slate-900 to-red-950",
    accent: "text-red-400",
    border: "border-red-500/30",
  },
  {
    id: "one-tap-hero",
    name: "One-Tap Hero",
    emoji: "✨",
    tagline: "100 reps. Every day. No excuses. No limits.",
    stats: ["Volume", "Consistency", "Mental Toughness"],
    color: "from-slate-900 to-emerald-950",
    accent: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  {
    id: "wall-crawler",
    name: "Wall-Crawler",
    emoji: "🕷️",
    tagline: "Agility and body control beyond human limits.",
    stats: ["Agility", "Calisthenics", "Grip"],
    color: "from-slate-900 to-red-950",
    accent: "text-red-300",
    border: "border-red-400/30",
  },
];

const VILLAIN_ARCHETYPES = [
  {
    id: "midnight-predator",
    name: "Midnight Predator",
    emoji: "🐈‍⬛",
    tagline: "Strike from the shadows. Power without mercy.",
    stats: ["Speed", "Explosiveness", "Lethality"],
    color: "from-slate-950 to-purple-950",
    accent: "text-purple-400",
    border: "border-purple-500/30",
  },
  {
    id: "berserker-frame",
    name: "Berserker Frame",
    emoji: "🔥",
    tagline: "Controlled rage. Extreme volume. No limits.",
    stats: ["Volume", "Raw Strength", "Aggression"],
    color: "from-slate-950 to-orange-950",
    accent: "text-orange-400",
    border: "border-orange-500/30",
  },
  {
    id: "void-sorcerer",
    name: "Void Sorcerer",
    emoji: "🌀",
    tagline: "Master your body. Defy physics. Ascend.",
    stats: ["Calisthenics", "Control", "Mastery"],
    color: "from-slate-950 to-indigo-950",
    accent: "text-indigo-400",
    border: "border-indigo-500/30",
  },
  {
    id: "precision-assassin",
    name: "Precision Assassin",
    emoji: "🗡️",
    tagline: "Every movement is intentional. Every rep lethal.",
    stats: ["Speed", "Precision", "Agility"],
    color: "from-slate-950 to-zinc-900",
    accent: "text-zinc-300",
    border: "border-zinc-500/30",
  },
  {
    id: "pure-discipline",
    name: "Pure Discipline",
    emoji: "⚫",
    tagline: "No music. No mirrors. Just you and the iron.",
    stats: ["Discipline", "Strength", "Mental Fortitude"],
    color: "from-slate-950 to-gray-900",
    accent: "text-gray-300",
    border: "border-gray-500/30",
  },
  {
    id: "gamma-juggernaut",
    name: "Gamma Juggernaut",
    emoji: "💪",
    tagline: "Unstoppable. Unflinching. Pure destructive power.",
    stats: ["Max Strength", "Size", "Dominance"],
    color: "from-slate-950 to-green-950",
    accent: "text-green-400",
    border: "border-green-500/30",
  },
];

// ── Experience Levels ─────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS = [
  {
    id: "beginner" as const,
    emoji: "🌱",
    label: "New to this",
    description: "Just starting out. Never really trained before or returning after a long break.",
    badge: "Beginner",
    badgeColor: "border-green-500/30 text-green-400 bg-green-500/10",
  },
  {
    id: "intermediate" as const,
    emoji: "💪",
    label: "Getting started",
    description: "Some gym experience. Comfortable with basic movements like squats and push-ups.",
    badge: "Intermediate",
    badgeColor: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  },
  {
    id: "advanced" as const,
    emoji: "🔥",
    label: "Consistent lifter",
    description: "Training regularly for 1+ years. Know most exercises and how to program.",
    badge: "Advanced",
    badgeColor: "border-orange-500/30 text-orange-400 bg-orange-500/10",
  },
  {
    id: "veteran" as const,
    emoji: "⚡",
    label: "Veteran",
    description: "3+ years of serious training. Comfortable with complex lifts and high volume.",
    badge: "Veteran",
    badgeColor: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  profile: UserProfile;
  defaultAlias: string;
}

type Step = "path" | "experience" | "archetype" | "alias" | "reveal";

export function OnboardingModal({ profile, defaultAlias }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>("path");
  const [path, setPath] = useState<"hero" | "villain" | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced" | "veteran" | null>(null);
  const [archetypeIndex, setArchetypeIndex] = useState(0);
  const [alias, setAlias] = useState(defaultAlias);
  const [saving, setSaving] = useState(false);

  const archetypes = path === "hero" ? HERO_ARCHETYPES : VILLAIN_ARCHETYPES;
  const chosen = archetypes[archetypeIndex];

  const handlePathSelect = (p: "hero" | "villain") => {
    setPath(p);
    setStep("experience");
  };

  const handleExperienceSelect = (level: typeof EXPERIENCE_LEVELS[0]["id"]) => {
    setExperienceLevel(level);
    setArchetypeIndex(0);
    setStep("archetype");
  };

  const handleConfirmArchetype = () => setStep("alias");

  const handleSave = async () => {
    if (!path || !chosen || !alias.trim()) return;
    setSaving(true);
    await db.transact([
      db.tx.userProfiles[profile.id].update({
        path,
        archetype: chosen.id,
        alias: alias.trim(),
        ...(experienceLevel ? { experienceLevel } : {}),
      }),
    ]);
    setSaving(false);
    setStep("reveal");
  };

  return (
    <Dialog open modal>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden border-white/10 bg-background"
        // hide default close button — user must complete onboarding
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">

          {/* ── STEP 1: PATH ───────────────────────────────────────────────── */}
          {step === "path" && (
            <motion.div
              key="path"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="text-4xl mb-2">⚔️</div>
                <h2 className="text-2xl font-display font-black tracking-tight">
                  Choose Your Path
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your path defines your training identity forever.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Hero */}
                <button
                  onClick={() => handlePathSelect("hero")}
                  className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/60 to-slate-950 p-6 text-left transition-all hover:border-cyan-400/60 hover:scale-[1.02] active:scale-100"
                >
                  <div className="text-4xl mb-3">🌟</div>
                  <div className="font-display font-black text-xl text-cyan-400">HERO</div>
                  <div className="text-xs text-cyan-200/60 mt-1">
                    Protect. Inspire. Rise.
                  </div>
                  <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/5 transition-colors" />
                </button>

                {/* Villain */}
                <button
                  onClick={() => handlePathSelect("villain")}
                  className="group relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/60 to-slate-950 p-6 text-left transition-all hover:border-purple-400/60 hover:scale-[1.02] active:scale-100"
                >
                  <div className="text-4xl mb-3">💀</div>
                  <div className="font-display font-black text-xl text-purple-400">VILLAIN</div>
                  <div className="text-xs text-purple-200/60 mt-1">
                    Dominate. Conquer. Rule.
                  </div>
                  <div className="absolute inset-0 bg-purple-400/0 group-hover:bg-purple-400/5 transition-colors" />
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Both paths give you access to the same workouts.
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: EXPERIENCE ─────────────────────────────────────────── */}
          {step === "experience" && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-5"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep("path")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-display font-black">Your Experience Level</h2>
                  <p className="text-xs text-muted-foreground">
                    We'll tailor workout recommendations to match you.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleExperienceSelect(level.id)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
                  >
                    <span className="text-3xl">{level.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm">{level.label}</span>
                        <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full border", level.badgeColor)}>
                          {level.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {level.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: ARCHETYPE ──────────────────────────────────────────── */}
          {step === "archetype" && chosen && (
            <motion.div
              key="archetype"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep("experience")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-display font-black">Pick Your Archetype</h2>
                  <p className="text-xs text-muted-foreground">
                    {archetypeIndex + 1} of {archetypes.length}
                  </p>
                </div>
              </div>

              {/* Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={chosen.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "relative rounded-2xl border p-6 bg-gradient-to-b",
                    chosen.color,
                    chosen.border
                  )}
                >
                  <div className="text-6xl mb-4">{chosen.emoji}</div>
                  <div className={cn("text-2xl font-display font-black mb-1", chosen.accent)}>
                    {chosen.name}
                  </div>
                  <div className="text-sm text-white/70 mb-4 italic">
                    "{chosen.tagline}"
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {chosen.stats.map((stat) => (
                      <span
                        key={stat}
                        className={cn(
                          "text-xs font-mono px-2 py-0.5 rounded-full border",
                          chosen.border,
                          chosen.accent
                        )}
                      >
                        {stat}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setArchetypeIndex((i) => (i - 1 + archetypes.length) % archetypes.length)}
                  className="shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Dots */}
                <div className="flex-1 flex justify-center gap-1.5">
                  {archetypes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setArchetypeIndex(i)}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        i === archetypeIndex
                          ? "w-4 bg-white"
                          : "bg-white/30"
                      )}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setArchetypeIndex((i) => (i + 1) % archetypes.length)}
                  className="shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button
                className="w-full font-bold"
                onClick={handleConfirmArchetype}
              >
                Choose {chosen.name}
              </Button>
            </motion.div>
          )}

          {/* ── STEP 3: ALIAS ──────────────────────────────────────────────── */}
          {step === "alias" && chosen && (
            <motion.div
              key="alias"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep("archetype")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-display font-black">What's Your Name?</h2>
              </div>

              <div className="text-center py-2">
                <div className="text-5xl mb-2">{chosen.emoji}</div>
                <div className={cn("font-display font-black text-lg", chosen.accent)}>
                  {chosen.name}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">
                  Your alias — this is how you'll appear in the app
                </label>
                <Input
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Enter your name or alias..."
                  maxLength={24}
                  className="text-center font-semibold text-lg h-12"
                  onKeyDown={(e) => e.key === "Enter" && alias.trim() && handleSave()}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  {alias.length}/24
                </p>
              </div>

              <Button
                className="w-full font-bold h-12"
                onClick={handleSave}
                disabled={!alias.trim() || saving}
              >
                {saving ? "Saving..." : "Begin My Journey →"}
              </Button>
            </motion.div>
          )}

          {/* ── STEP 4: REVEAL ─────────────────────────────────────────────── */}
          {step === "reveal" && chosen && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="p-8 space-y-6 text-center"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-mono text-muted-foreground uppercase tracking-widest"
              >
                Identity Confirmed
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                className={cn(
                  "mx-auto w-32 h-32 rounded-3xl border-2 flex items-center justify-center text-7xl bg-gradient-to-b",
                  chosen.color,
                  chosen.border
                )}
              >
                {chosen.emoji}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-1"
              >
                <div className="text-2xl font-display font-black">{alias}</div>
                <div className={cn("font-semibold text-sm", chosen.accent)}>
                  {chosen.name}
                </div>
                <div className="text-xs text-muted-foreground italic">
                  "{chosen.tagline}"
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  className="w-full font-bold h-12 gap-2"
                  onClick={() => {
                    // Modal will close because profile now has archetype set
                    // Just force a page reload to pick up the new state
                    window.location.reload();
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Enter HeroSplit
                </Button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
