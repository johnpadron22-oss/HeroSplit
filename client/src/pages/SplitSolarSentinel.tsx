import { useEffect } from "react";
import { Link } from "wouter";

const EQUIPMENT = [
  "Barbell and plates (or dumbbells as substitute)",
  "Pull-up bar / cable machine",
  "Bench (flat or adjustable)",
];

const OVERVIEW = [
  { week: "Week 1–2", label: "Volume Foundation",   desc: "Push / Pull / Lower 3-day rotation. 4 sets × 10–12 reps. Build work capacity." },
  { week: "Week 3–4", label: "Strength Transition",  desc: "5 days per week. Intensity increases — heavier compound movements, controlled eccentrics." },
  { week: "Week 5–6", label: "Hypertrophy Peak",     desc: "Drop sets, supersets, and time-under-tension finishers to maximize muscle stimulus." },
];

const WHO_FOR = [
  "Intermediate to advanced trainees wanting hypertrophy-focused training",
  "Anyone running a Push/Pull/Legs structure for the first time",
  "Gym members with access to barbells and cable machines",
  "People transitioning from full-body to a more advanced split",
];

export default function SplitSolarSentinel() {
  useEffect(() => {
    document.title = "Solar Sentinel Program — Free Push/Pull/Lower Split | HeroSplit";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Solar Sentinel is a free 6-week Push/Pull/Lower workout program on HeroSplit. Build muscle and strength with this hypertrophy-focused gym split.");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-14">

        <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to HeroSplit
        </Link>

        <div className="space-y-4">
          <div className="text-6xl">☀️</div>
          <h1 className="text-4xl font-display font-black tracking-tight leading-tight">
            Solar Sentinel Program
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            A 6-week Push/Pull/Lower hypertrophy split designed for consistent muscle and strength gains. 4–5 sessions per week. Built for gym-goers who want structure, progressive overload, and real results.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Blueprint Series", "Push/Pull/Lower", "4–5×/week", "Free"].map((tag) => (
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
              { day: "Day 1",  label: "Push session — chest, shoulders, triceps" },
              { day: "Day 2",  label: "Pull session — back, biceps, rear delts" },
              { day: "Day 21", label: "Visible strength progress on major lifts" },
            ].map(({ day, label }) => (
              <div key={day} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="text-xs font-mono text-muted-foreground">{day}</div>
                <div className="text-sm font-medium leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="-mx-6 px-6 py-8 border-y border-cyan-500/20 bg-cyan-500/5 text-center space-y-3">
          <h2 className="text-xl font-display font-black">Start Solar Sentinel — Free</h2>
          <p className="text-sm text-muted-foreground">Track every session with XP, streaks, loot drops, and progressive overload logs.</p>
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
            <Link href="/splits/agile-climber" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              🧗 Agile Climber — Upper/Lower athletic split →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
