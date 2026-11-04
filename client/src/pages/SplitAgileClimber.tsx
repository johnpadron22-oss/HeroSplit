import { useEffect } from "react";
import { Link } from "wouter";

const EQUIPMENT = [
  "Dumbbells (adjustable or fixed)",
  "Pull-up bar (optional but recommended)",
  "Resistance bands (optional)",
];

const OVERVIEW = [
  { week: "Week 1–2", label: "Movement Foundations", desc: "Upper/lower split. Establish clean squat, hinge, push and pull patterns. 4 sets × 8–12 reps." },
  { week: "Week 3–4", label: "Strength & Athleticism", desc: "Add unilateral work, explosive jumps, and dynamic push-up variations." },
  { week: "Week 5–6", label: "Athletic Peak",          desc: "Circuit-style finishers, tempo squats, and max-velocity pulling work." },
];

const WHO_FOR = [
  "Intermediate trainees with some gym or home training experience",
  "Anyone focused on athletic performance alongside strength",
  "People who want an upper/lower split without a full gym",
  "Athletes improving mobility, speed, and functional power",
];

export default function SplitAgileClimber() {
  useEffect(() => {
    document.title = "Agile Climber Program — Free Upper/Lower Athletic Split | HeroSplit";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Agile Climber is a free 6-week upper/lower workout program on HeroSplit. Build athletic strength and mobility with dumbbells or bodyweight.");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-14">

        <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to HeroSplit
        </Link>

        <div className="space-y-4">
          <div className="text-6xl">🧗</div>
          <h1 className="text-4xl font-display font-black tracking-tight leading-tight">
            Agile Climber Program
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            A 6-week upper/lower split focused on athletic development. Build functional strength, mobility, and explosive power — with dumbbells or bodyweight. 4 sessions per week.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Blueprint Series", "Upper/Lower", "4×/week", "Free"].map((tag) => (
              <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-full border border-green-500/30 text-green-400 bg-green-500/10">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-display font-black">Program Overview</h2>
          <div className="space-y-3">
            {OVERVIEW.map((phase) => (
              <div key={phase.week} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-start gap-3">
                  <div className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5">{phase.week}</div>
                  <div>
                    <div className="font-bold text-sm">{phase.label}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">{phase.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-black">Equipment Needed</h2>
          <ul className="space-y-1.5">
            {EQUIPMENT.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-green-400">✓</span> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-black">Who It's For</h2>
          <ul className="space-y-1.5">
            {WHO_FOR.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-cyan-400 shrink-0 mt-0.5">→</span> {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-black">What to Expect</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { day: "Day 0",  label: "Sign up free — no credit card" },
              { day: "Day 1",  label: "Upper body session — push + pull combo" },
              { day: "Day 3",  label: "Lower body — squat, hinge, single-leg" },
              { day: "Day 14", label: "Noticeable improvements in movement quality" },
            ].map(({ day, label }) => (
              <div key={day} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="text-xs font-mono text-muted-foreground">{day}</div>
                <div className="text-sm font-medium leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="p-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 text-center space-y-3">
          <h2 className="text-xl font-display font-black">Start Agile Climber — Free</h2>
          <p className="text-sm text-muted-foreground">Create a free account and track every session with XP, streaks and loot drops.</p>
          <Link href="/landing">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors text-sm">
              Start for free →
            </span>
          </Link>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-display font-black text-muted-foreground">Other Free Programs</h2>
          <div className="flex flex-col gap-2">
            <Link href="/splits/night-acrobat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              🦅 Night Acrobat — Bodyweight calisthenics →
            </Link>
            <Link href="/splits/solar-sentinel" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ☀️ Solar Sentinel — Push/Pull/Lower hypertrophy →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
