import { useEffect } from "react";
import { Link } from "wouter";

const EQUIPMENT = ["Bodyweight only — no equipment needed"];

const OVERVIEW = [
  { week: "Week 1–2", label: "Foundation Phase", desc: "Master the movement patterns: push-up progressions, squat technique, hinge mechanics." },
  { week: "Week 3–4", label: "Strength Phase",   desc: "Add volume and density: more sets, shorter rest, compound supersets." },
  { week: "Week 5–6", label: "Power Phase",      desc: "Explosive variations, tempo work, and max-rep challenges." },
];

const WHO_FOR = [
  "Complete beginners with zero gym experience",
  "Anyone who wants to train at home without buying equipment",
  "People returning from a long break looking to rebuild consistency",
  "Intermediate athletes wanting to improve bodyweight control",
];

export default function SplitNightAcrobat() {
  useEffect(() => {
    document.title = "Night Acrobat Program — Free Calisthenics Split | HeroSplit";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Night Acrobat is a 6-week bodyweight-only workout program, free on HeroSplit. Build strength and agility at home — no equipment required.");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-14">

        {/* Nav */}
        <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to HeroSplit
        </Link>

        {/* Hero */}
        <div className="space-y-4">
          <div className="text-6xl">🦅</div>
          <h1 className="text-4xl font-display font-black tracking-tight leading-tight">
            Night Acrobat Program
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            A 6-week calisthenics split built on bodyweight fundamentals. Train at home, build real strength, and develop the agility and body control of a skilled acrobat — no equipment, no gym required.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Foundation Series", "Bodyweight", "3–4×/week", "Free"].map((tag) => (
              <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-full border border-green-500/30 text-green-400 bg-green-500/10">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Program Overview */}
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

        {/* Equipment */}
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

        {/* Who it's for */}
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

        {/* What to expect */}
        <section className="space-y-3">
          <h2 className="text-xl font-display font-black">What to Expect</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { day: "Day 0", label: "Sign up free — no credit card" },
              { day: "Day 1", label: "Complete your first workout in 30 min" },
              { day: "Day 7", label: "Feel the difference in push-up strength" },
              { day: "Day 14", label: "Visible improvement in body control" },
            ].map(({ day, label }) => (
              <div key={day} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="text-xs font-mono text-muted-foreground">{day}</div>
                <div className="text-sm font-medium leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="p-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 text-center space-y-3">
          <h2 className="text-xl font-display font-black">Start Night Acrobat — Free</h2>
          <p className="text-sm text-muted-foreground">Create a free account to unlock this program and track every workout with XP, streaks and loot drops.</p>
          <Link href="/landing">
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors text-sm">
              Start for free →
            </span>
          </Link>
        </div>

        {/* Internal links */}
        <section className="space-y-3">
          <h2 className="text-base font-display font-black text-muted-foreground">Other Free Programs</h2>
          <div className="flex flex-col gap-2">
            <Link href="/splits/agile-climber" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              🧗 Agile Climber — Upper/Lower athletic split →
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
