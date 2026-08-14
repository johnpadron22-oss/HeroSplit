import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Flame, Trophy, Lock, Check, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Mock UI card shown in hero ────────────────────────────────────────────────
function AppMockup() {
  return (
    <div className="relative mx-auto w-full max-w-xs select-none pointer-events-none">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-purple-500/20 blur-3xl rounded-3xl" />

      {/* Phone shell */}
      <div className="relative rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="h-8 bg-zinc-900 flex items-center justify-between px-5">
          <span className="text-[10px] text-white/40 font-mono">9:41</span>
          <div className="flex gap-1">
            {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/30" />)}
          </div>
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* Profile row */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-lg">🦇</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">Shadow Knight</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">RANK B</div>
                <div className="text-[10px] text-white/40">Warrior</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-yellow-400">4,200 XP</div>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <Flame className="w-2.5 h-2.5 text-orange-400" />
                <span className="text-[10px] text-white/50">7 day streak</span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="space-y-1 px-1">
            <div className="flex justify-between text-[10px] text-white/40">
              <span>Rank B → A</span>
              <span>4,200 / 7,000</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" style={{ width: "60%" }} />
            </div>
          </div>

          {/* Workout cards */}
          {[
            { emoji: "🦇", name: "Dark Vigilante", tag: "Foundation", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
            { emoji: "⚡", name: "Thunder God", tag: "Blueprint", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", locked: false },
            { emoji: "☠️", name: "Void Sorcerer", tag: "Nemesis Pro", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", locked: true },
          ].map((w) => (
            <div key={w.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-xl">{w.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{w.name}</div>
                <div className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block mt-0.5 border", w.color)}>{w.tag}</div>
              </div>
              {w.locked
                ? <Lock className="w-3.5 h-3.5 text-white/20 shrink-0" />
                : <ArrowRight className="w-3.5 h-3.5 text-white/20 shrink-0" />}
            </div>
          ))}

          {/* Loot drop teaser */}
          <div className="mx-1 p-3 rounded-xl border-2 border-yellow-500/40 bg-yellow-500/10 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-yellow-300/60 mb-1">Loot Drop!</div>
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">Legendary</div>
            <div className="text-xs font-black text-white">Lightning Gauntlet</div>
            <div className="text-[10px] text-yellow-400 font-semibold">+50 STR</div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="h-12 border-t border-white/5 bg-zinc-900 flex items-center justify-around px-6">
          {["🏠", "⚔️", "📊", "👤"].map((icon, i) => (
            <div key={i} className={cn("text-base", i === 0 ? "opacity-100" : "opacity-30")}>{icon}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  const { loginWithGoogle } = useAuth();
  const [billingPlan, setBillingPlan] = useState<"annual" | "monthly">("annual");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Ambient glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/8 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[-15%] w-[45%] h-[45%] bg-purple-500/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-500/5 blur-[100px] rounded-full" />
      </div>

      {/* ══════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-display font-black tracking-tighter italic">
            <span className="text-hero">HERO</span>
            <span className="text-foreground">SPLIT</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#pricing" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Button
              size="sm"
              className="rounded-full px-5 bg-white text-black hover:bg-gray-200 font-semibold"
              onClick={loginWithGoogle}
            >
              Start Free
            </Button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-left"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">The Fitness RPG</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-display font-black tracking-tight leading-[1.05] mb-6">
              Train Like Your<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                Favorite Hero.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
              Anime-inspired workout programs with XP ranks, loot drops, and real progressive overload. From beginner to elite — all in one app.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="h-13 px-8 rounded-full text-base bg-white text-black hover:bg-gray-100 font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                onClick={loginWithGoogle}
              >
                Start for Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <a href="#pricing">
                <Button variant="ghost" size="lg" className="h-13 px-8 rounded-full text-base hover:bg-white/5 w-full sm:w-auto">
                  See Plans <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </a>
            </motion.div>

            {/* Mini stats */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-x-6 gap-y-2 mt-10">
              {[
                { value: "37", label: "Workouts" },
                { value: "3", label: "Training Tiers" },
                { value: "8", label: "XP Ranks" },
                { value: "Free", label: "To Start" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="text-xl font-display font-black text-white">{s.value}</span>
                  <span className="text-sm text-muted-foreground ml-1.5">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: app mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden md:block"
          >
            <AppMockup />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="border-t border-white/5 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">How it works</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-display font-black">Three steps to your first session</motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                emoji: "⚔️",
                title: "Choose Your Path",
                desc: "Sign up with Google in one tap. Pick Hero or Villain. Choose your archetype — Dark Vigilante, Thunder Giant, Void Sorcerer, and more.",
                color: "from-cyan-500/10 to-transparent border-cyan-500/20",
                accent: "text-cyan-400",
              },
              {
                step: "02",
                emoji: "🏋️",
                title: "Train & Earn XP",
                desc: "Log real weights, reps, and sets. Every completed set earns XP. Watch your rank climb from F → D → C → B → A → S → SS → SSS.",
                color: "from-purple-500/10 to-transparent border-purple-500/20",
                accent: "text-purple-400",
              },
              {
                step: "03",
                emoji: "🎁",
                title: "Level Up & Loot",
                desc: "Finish a workout and get a loot drop — Common, Rare, Epic, or Legendary. Build your streak. Progress through Foundation, Blueprint, Nemesis.",
                color: "from-yellow-500/10 to-transparent border-yellow-500/20",
                accent: "text-yellow-400",
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className={cn("p-7 rounded-2xl bg-gradient-to-b border", item.color)}
              >
                <div className={cn("text-xs font-black font-mono uppercase tracking-widest mb-4", item.accent)}>
                  Step {item.step}
                </div>
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-display font-black mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRAINING TIERS
      ══════════════════════════════════════════════ */}
      <section className="border-t border-white/5 py-24 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Progressive system</p>
            <h2 className="text-3xl md:text-4xl font-display font-black">Built to scale with you</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">Start where you are. Every tier uses <strong className="text-foreground">double progression</strong> — add reps, then add weight. No guesswork.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                tier: "Foundation",
                badge: "Free",
                badgeColor: "bg-green-500/20 text-green-300 border-green-500/30",
                borderColor: "border-green-500/20",
                accentColor: "text-green-400",
                sessions: "3× / week",
                time: "40–60 min",
                style: "Full Body A / B / C",
                level: "Beginner",
                perks: ["Machine-based lifts", "Stable movement patterns", "Build technique & confidence", "3 full-body programs"],
                emoji: "🛡️",
              },
              {
                tier: "Blueprint",
                badge: "Free",
                badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
                borderColor: "border-cyan-500/30",
                accentColor: "text-cyan-400",
                sessions: "4× / week",
                time: "55–75 min",
                style: "Upper / Lower Split",
                level: "Intermediate",
                perks: ["Free weights introduced", "Upper/lower split", "Hypertrophy focus", "4 structured programs"],
                emoji: "⚔️",
                featured: true,
              },
              {
                tier: "Nemesis",
                badge: "Pro",
                badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                borderColor: "border-purple-500/20",
                accentColor: "text-purple-400",
                sessions: "5–6× / week",
                time: "60–90 min",
                style: "Push / Pull / Legs",
                level: "Advanced",
                perks: ["Full PPL + hypertrophy days", "Intensity techniques", "Fatigue & deload planning", "5 elite programs"],
                emoji: "💀",
              },
            ].map((tier) => (
              <motion.div
                key={tier.tier}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className={cn(
                  "p-6 rounded-2xl border bg-card relative",
                  tier.borderColor,
                  tier.featured && "ring-1 ring-cyan-500/30"
                )}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="text-3xl mb-2">{tier.emoji}</div>
                    <div className={cn("text-lg font-display font-black", tier.accentColor)}>{tier.tier} Series</div>
                    <div className="text-xs text-muted-foreground">{tier.level}</div>
                  </div>
                  <div className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border", tier.badgeColor)}>
                    {tier.badge}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded-full">{tier.sessions}</span>
                  <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded-full">{tier.time}</span>
                  <span className="text-[11px] bg-white/5 border border-white/10 px-2 py-1 rounded-full">{tier.style}</span>
                </div>

                <ul className="space-y-2">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className={cn("w-3.5 h-3.5 shrink-0", tier.accentColor)} />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════ */}
      <section className="border-t border-white/5 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Everything included</p>
            <h2 className="text-3xl md:text-4xl font-display font-black">Not just a workout tracker</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                emoji: "🎖️",
                title: "XP Rank System",
                desc: "Earn 25 XP per completed set. Climb 8 ranks — F, D, C, B, A, S, SS, SSS. Your rank reflects your real-world consistency.",
                color: "border-yellow-500/20",
              },
              {
                emoji: "🎁",
                title: "Loot Drops",
                desc: "Finish a workout and receive a randomized loot drop — 4 rarities, hero and villain item pools. Common to Legendary.",
                color: "border-amber-500/20",
              },
              {
                emoji: "🔥",
                title: "Streak Tracking",
                desc: "Build consecutive-day streaks. Your longest streak is permanently recorded on your profile. Miss a day, the counter resets.",
                color: "border-orange-500/20",
              },
              {
                emoji: "📖",
                title: "Workout History",
                desc: "Every session is saved with actual weights, reps, and sets logged per exercise. Full double-progression reference built in.",
                color: "border-blue-500/20",
              },
              {
                emoji: "🦹",
                title: "12 Archetypes",
                desc: "Pick from 6 Hero archetypes (Dark Vigilante, Thunder Giant…) or 6 Villain archetypes (Void Sorcerer, Berserker…). Shape your identity.",
                color: "border-purple-500/20",
              },
              {
                emoji: "⛩️",
                title: "Anime Arcs",
                desc: "Pro unlocks 10 anime-themed programs — Dragon Ball, Naruto, JJK, One Piece, AOT, Demon Slayer. Train like the legends.",
                color: "border-red-500/20",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className={cn("p-6 rounded-2xl bg-white/[0.02] border hover:bg-white/[0.04] transition-colors", f.color)}
              >
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="font-display font-black text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════ */}
      <section id="pricing" className="border-t border-white/5 py-24 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-display font-black">Simple. No tricks.</h2>
            <p className="text-muted-foreground mt-3">Start free. Unlock everything for less than a protein bar a week.</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-1 mt-6 p-1 rounded-full bg-white/5 border border-white/10">
              {(["annual", "monthly"] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => setBillingPlan(plan)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                    billingPlan === plan
                      ? "bg-white text-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {plan === "annual" ? "Annual (save 33%)" : "Monthly"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="p-8 rounded-2xl border border-white/10 bg-card">
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Free</div>
                <div className="text-5xl font-display font-black mb-1">$0</div>
                <div className="text-sm text-muted-foreground">forever</div>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 rounded-full font-bold mb-8 border-white/20 hover:bg-white/5"
                onClick={loginWithGoogle}
              >
                Start Free
              </Button>
              <ul className="space-y-3">
                {[
                  "6 Hero workouts",
                  "Foundation Series (3 programs)",
                  "Blueprint Series (4 programs)",
                  "XP rank progression",
                  "Streak & session tracking",
                  "Loot drops",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-purple-300">Pro</div>
                  {billingPlan === "annual" && (
                    <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-1 rounded-full border border-purple-500/30">
                      <Zap className="w-2.5 h-2.5" /> BEST VALUE
                    </div>
                  )}
                </div>
                <div className="text-5xl font-display font-black mb-1">
                  {billingPlan === "annual" ? "$39.99" : "$4.99"}
                </div>
                <div className="text-sm text-muted-foreground mb-6">
                  {billingPlan === "annual" ? "per year · $3.33/mo" : "per month"}
                </div>
                <Button
                  size="lg"
                  className="w-full h-12 rounded-full font-bold mb-8 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30"
                  onClick={loginWithGoogle}
                >
                  Unlock Pro
                </Button>
                <ul className="space-y-3">
                  {[
                    "Everything in Free",
                    "6 Villain Tier workouts",
                    "10 Anime Arc programs (DBZ, Naruto, JJK…)",
                    "Nemesis Series: PPL + Hypertrophy",
                    "Full workout history with sets & weights",
                    "Cancel anytime via billing portal",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-purple-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Secured by Stripe · Cancel anytime · No hidden fees
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════ */}
      <section className="border-t border-white/5 py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={fadeUp} className="text-6xl mb-6">⚔️</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-black mb-4">
              Your next PR is waiting.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Join free. Pick your archetype. Log your first session in under 2 minutes.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button
                size="lg"
                className="h-14 px-10 rounded-full text-lg bg-white text-black hover:bg-gray-100 font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
                onClick={loginWithGoogle}
              >
                Start Training Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">Google Sign-In · No credit card required</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-display font-black italic">
            <span className="text-hero">HERO</span>
            <span className="text-foreground">SPLIT</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 HeroSplit. Built for those who train.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <button onClick={loginWithGoogle} className="hover:text-foreground transition-colors">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
