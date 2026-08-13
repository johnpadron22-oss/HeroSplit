/**
 * One-time seed script — writes all workout programs to InstantDB.
 * Run: node scripts/seed-instant.mjs
 *
 * Workout system based on HeroPhysique Workout System (3-tier):
 *   Beginner  → Full Body A/B/C (3x/week, 40-60 min, machines + dumbbells)
 *   Intermediate → Upper/Lower split (4x/week, 55-75 min)
 *   Advanced  → PPL + Hypertrophy (5-6x/week, 60-90 min)
 */

import { init, id, tx } from "@instantdb/admin";

const APP_ID = process.env.INSTANT_APP_ID ?? "2bcb316f-1e7d-4ade-9821-9422d2b885ea";
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error("Error: INSTANT_ADMIN_TOKEN env var is required.");
  console.error("Run: INSTANT_ADMIN_TOKEN=your_token node scripts/seed-instant.mjs");
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

const workouts = [
  // ── BEGINNER FOUNDATION SERIES (Free · Full Body · 3x/week) ─────────────────
  // Based on HeroPhysique tier 1: machines, dumbbells, stable movement patterns
  {
    slug: "foundation-full-body-a",
    name: "Foundation: Full Body A",
    description: "Monday's mission. Machines and cables make movement patterns click. Build confidence with compound pulls and presses before anything else.",
    type: "hero",
    difficulty: "Beginner",
    avatarEmoji: "🏗️",
    equipment: "Machine + Cables",
    isPro: false,
    series: "Foundation Series",
    program: {
      duration: "40-60",
      rpe: "6-8",
      warmup: "5–8 min light cardio (walk, bike, or elliptical) + dynamic joint circles",
      notes: "Double progression: hit the top of the rep range for all sets, then add weight next session.",
      schedule: "Monday",
      exercises: [
        { name: "Leg Press", sets: "3", reps: "8-12", rest: "90s", notes: "Feet shoulder-width, press through full range" },
        { name: "Machine Chest Press", sets: "3", reps: "8-12", rest: "90s", notes: "Slow on the way down, 2-second lowering" },
        { name: "Lat Pulldown", sets: "3", reps: "8-12", rest: "90s", notes: "Pull to upper chest, squeeze your lats" },
        { name: "Dumbbell Romanian Deadlift", sets: "2", reps: "10-12", rest: "90s", notes: "Hinge at hips, slight knee bend, feel the hamstring stretch" },
        { name: "Cable or Machine Lateral Raise", sets: "2", reps: "12-15", rest: "60s", notes: "Control the weight — no swinging" },
        { name: "Plank", sets: "3", reps: "20-40s hold", rest: "60s", notes: "Straight line from head to heels" },
      ],
    },
  },
  {
    slug: "foundation-full-body-b",
    name: "Foundation: Full Body B",
    description: "Wednesday's grind. Goblet squat teaches you how to squat correctly. Every rep here builds the movement library your future self needs.",
    type: "hero",
    difficulty: "Beginner",
    avatarEmoji: "🏗️",
    equipment: "Dumbbells + Cables",
    isPro: false,
    series: "Foundation Series",
    program: {
      duration: "40-60",
      rpe: "6-8",
      warmup: "5–8 min light cardio + hip circles, arm swings, leg swings",
      notes: "Leave 2–3 reps in reserve. You should be able to speak in short sentences during sets.",
      schedule: "Wednesday",
      exercises: [
        { name: "Goblet Squat", sets: "3", reps: "8-12", rest: "90s", notes: "Hold dumbbell at chest, keep chest tall and knees out" },
        { name: "Seated Cable Row", sets: "3", reps: "8-12", rest: "90s", notes: "Pull elbows back, squeeze shoulder blades together" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "8-12", rest: "90s", notes: "45° incline, lower to chest level" },
        { name: "Leg Curl", sets: "2", reps: "10-15", rest: "75s", notes: "Full range, squeeze at top" },
        { name: "Dumbbell Shoulder Press", sets: "2", reps: "8-12", rest: "75s", notes: "Neutral grip or palms forward, press overhead" },
        { name: "Dead Bug", sets: "3", reps: "8-12 per side", rest: "60s", notes: "Lower back stays flat to floor the entire time" },
      ],
    },
  },
  {
    slug: "foundation-full-body-c",
    name: "Foundation: Full Body C",
    description: "Friday's finish line. End the week strong. Hip thrust + farmer carry combo builds the power and grip that carries into every future workout.",
    type: "hero",
    difficulty: "Beginner",
    avatarEmoji: "🏗️",
    equipment: "Machine + Dumbbells",
    isPro: false,
    series: "Foundation Series",
    program: {
      duration: "40-60",
      rpe: "6-8",
      warmup: "5–8 min incline treadmill walk + bodyweight squats and hip circles",
      notes: "Focus on learning the movement. Weight is secondary to form right now.",
      schedule: "Friday",
      exercises: [
        { name: "Hack Squat or Split Squat", sets: "3", reps: "8-12", rest: "90s", notes: "Front knee tracks over toes, drive through the heel" },
        { name: "Assisted Pull-Up or Lat Pulldown", sets: "3", reps: "8-12", rest: "90s", notes: "Full range of motion, feel the stretch at the top" },
        { name: "Machine or Dumbbell Chest Press", sets: "3", reps: "8-12", rest: "90s", notes: "Controlled tempo, don't let weight crash down" },
        { name: "Hip Thrust or Glute Bridge", sets: "2", reps: "10-15", rest: "75s", notes: "Squeeze glutes hard at the top for 1 second" },
        { name: "Cable Curl", sets: "2", reps: "10-15", rest: "60s", notes: "No swinging — keep elbows at your sides" },
        { name: "Rope Triceps Pressdown", sets: "2", reps: "10-15", rest: "60s", notes: "Spread the rope apart at the bottom" },
        { name: "Farmer Carry", sets: "2", reps: "20-40 meters", rest: "90s", notes: "Shoulders back, walk tall, strong grip" },
      ],
    },
  },

  // ── ORIGINAL BEGINNER WORKOUTS (Bodyweight · Free) ──────────────────────────
  {
    slug: "first-steps",
    name: "First Steps",
    description: "Your very first workout. Simple movements, zero equipment. Build the habit before the muscle.",
    type: "hero",
    difficulty: "Beginner",
    avatarEmoji: "🌱",
    equipment: "Bodyweight",
    isPro: false,
    program: {
      duration: "30-45",
      rpe: "5-7",
      warmup: "5 min easy walking + arm circles",
      exercises: [
        { name: "Wall Push-Up", sets: "3", reps: "10", rest: "60s" },
        { name: "Bodyweight Squat", sets: "3", reps: "10", rest: "60s" },
        { name: "Plank Hold", sets: "3", reps: "20s hold", rest: "60s" },
        { name: "Glute Bridge", sets: "3", reps: "12", rest: "60s" },
        { name: "10 min Walk", reps: "1" },
      ],
    },
  },
  {
    slug: "zero-to-hero",
    name: "Zero to Hero",
    description: "No gym needed. Build a foundation of strength and movement from absolute zero.",
    type: "hero",
    difficulty: "Beginner",
    avatarEmoji: "⭐",
    equipment: "Bodyweight",
    isPro: false,
    program: {
      duration: "30-45",
      rpe: "5-7",
      warmup: "5 min easy walking + joint mobility",
      exercises: [
        { name: "Knee Push-Up", sets: "3", reps: "8-12", rest: "60s" },
        { name: "Assisted Squat", sets: "3", reps: "10", rest: "60s" },
        { name: "Dead Bug", sets: "3", reps: "6 each side", rest: "60s" },
        { name: "Superman Hold", sets: "3", reps: "10s hold", rest: "45s" },
        { name: "Jumping Jack", sets: "2", reps: "20", rest: "30s" },
      ],
    },
  },
  {
    slug: "rookie-gains",
    name: "Rookie Gains",
    description: "First time touching a dumbbell? This is where you start. Simple, safe, effective.",
    type: "hero",
    difficulty: "Beginner",
    avatarEmoji: "🏋️",
    equipment: "Dumbbells",
    isPro: false,
    program: {
      duration: "40-50",
      rpe: "6-8",
      warmup: "5 min walk + 2 light warm-up sets before first exercise",
      exercises: [
        { name: "Dumbbell Goblet Squat", sets: "3", reps: "10", rest: "90s" },
        { name: "Dumbbell Chest Press (floor)", sets: "3", reps: "10", rest: "90s" },
        { name: "Dumbbell Romanian Deadlift", sets: "3", reps: "10", rest: "90s" },
        { name: "Dumbbell Bent-Over Row", sets: "3", reps: "10 each", rest: "90s" },
        { name: "Dumbbell Shoulder Press", sets: "3", reps: "10", rest: "90s" },
      ],
    },
  },

  // ── INTERMEDIATE BLUEPRINT SERIES (Free · Upper/Lower Split · 4x/week) ───────
  // Based on HeroPhysique tier 2: introduces free weights, split training
  {
    slug: "blueprint-upper-a",
    name: "Blueprint: Upper Body A",
    description: "Monday strength focus. Barbell press and pull-ups are the spine of this session. Everything else builds the armor around them.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "📐",
    equipment: "Full Gym",
    isPro: false,
    series: "Blueprint Series",
    program: {
      duration: "55-75",
      rpe: "7-9",
      warmup: "5–8 min cardio + 2 prep sets before bench press",
      notes: "Double progression: add reps each session within the range. At the top of the range across all sets, add 5 lbs next session.",
      schedule: "Monday",
      exercises: [
        { name: "Barbell or Dumbbell Bench Press", sets: "3", reps: "6-10", rest: "120s", notes: "Control the descent, full range of motion" },
        { name: "Pull-Up or Lat Pulldown", sets: "3", reps: "6-10", rest: "120s", notes: "Squeeze at the bottom of each rep" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "8-12", rest: "90s", notes: "Keep chest up, don't let shoulders shrug" },
        { name: "Chest-Supported Row", sets: "3", reps: "8-12", rest: "90s", notes: "Chest on pad, elbows drive back" },
        { name: "Dumbbell Lateral Raise", sets: "3", reps: "12-20", rest: "60s", notes: "Slight forward lean, raise to shoulder height" },
        { name: "Cable Triceps Extension", sets: "2-3", reps: "10-15", rest: "60s", notes: "Keep elbows tucked, full extension" },
        { name: "Dumbbell Curl", sets: "2-3", reps: "10-15", rest: "60s", notes: "Supinate at the top" },
      ],
    },
  },
  {
    slug: "blueprint-lower-a",
    name: "Blueprint: Lower Body A",
    description: "Tuesday legs. Squat heavy, then build the posterior chain. Calves and core at the end. You won't skip this one.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "📐",
    equipment: "Full Gym",
    isPro: false,
    series: "Blueprint Series",
    program: {
      duration: "55-75",
      rpe: "7-9",
      warmup: "5–8 min bike or walk + 2 light squat warm-up sets",
      notes: "RPE 7-9 — you should feel challenged but maintain perfect form throughout.",
      schedule: "Tuesday",
      exercises: [
        { name: "Back Squat or Hack Squat", sets: "3", reps: "6-10", rest: "150s", notes: "Depth below parallel, knees track over toes" },
        { name: "Romanian Deadlift", sets: "3", reps: "8-10", rest: "120s", notes: "Hip hinge, keep bar close to legs" },
        { name: "Leg Press", sets: "3", reps: "10-15", rest: "90s", notes: "Full range, don't lock out knees at top" },
        { name: "Seated Leg Curl", sets: "3", reps: "10-15", rest: "75s", notes: "Slow and controlled, squeeze at peak contraction" },
        { name: "Standing Calf Raise", sets: "3", reps: "10-15", rest: "60s", notes: "Full range — stretch at bottom, pause at top" },
        { name: "Hanging Knee Raise", sets: "3", reps: "8-15", rest: "60s", notes: "Control the descent, no swinging" },
      ],
    },
  },
  {
    slug: "blueprint-upper-b",
    name: "Blueprint: Upper Body B",
    description: "Thursday push-pull. Overhead press leads, rows support. Volume accumulates where Monday left off.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "📐",
    equipment: "Full Gym",
    isPro: false,
    series: "Blueprint Series",
    program: {
      duration: "55-75",
      rpe: "7-9",
      warmup: "5–8 min cardio + band pull-aparts, shoulder circles",
      notes: "Use a variety of grips and angles to hit the muscle from multiple positions.",
      schedule: "Thursday",
      exercises: [
        { name: "Overhead Press", sets: "3", reps: "6-10", rest: "120s", notes: "Brace your core, press bar in a vertical line" },
        { name: "Barbell or Cable Row", sets: "3", reps: "6-10", rest: "120s", notes: "Elbows back, squeeze shoulder blades" },
        { name: "Weighted Dip or Machine Press", sets: "3", reps: "8-12", rest: "90s", notes: "Lean slightly forward for more chest involvement" },
        { name: "Neutral-Grip Pulldown", sets: "3", reps: "8-12", rest: "90s", notes: "Neutral grip targets the lats differently" },
        { name: "Rear Delt Fly", sets: "3", reps: "12-20", rest: "60s", notes: "Light weight, squeeze rear delts at top" },
        { name: "Incline Curl", sets: "2-3", reps: "10-15", rest: "60s", notes: "Full stretch at bottom, full flex at top" },
        { name: "Overhead Triceps Extension", sets: "2-3", reps: "10-15", rest: "60s", notes: "Elbows stay close, stretch the long head" },
      ],
    },
  },
  {
    slug: "blueprint-lower-b",
    name: "Blueprint: Lower Body B",
    description: "Friday power. Deadlift variation anchors this session. Bulgarian split squats build unilateral strength you can't fake.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "📐",
    equipment: "Full Gym",
    isPro: false,
    series: "Blueprint Series",
    program: {
      duration: "55-75",
      rpe: "7-9",
      warmup: "5–8 min cardio + hip flexor stretch, glute activation",
      notes: "This is the most demanding session of the week. Dial in the deadlift before adding weight.",
      schedule: "Friday",
      exercises: [
        { name: "Deadlift or Trap-Bar Deadlift", sets: "3", reps: "4-8", rest: "150s", notes: "Neutral spine, drive through the floor" },
        { name: "Bulgarian Split Squat", sets: "3", reps: "8-12 per leg", rest: "90s", notes: "Rear foot elevated, drive through front heel" },
        { name: "Hip Thrust", sets: "3", reps: "8-12", rest: "90s", notes: "Full hip extension, squeeze glutes at top" },
        { name: "Leg Extension", sets: "3", reps: "10-15", rest: "75s", notes: "Controlled, squeeze quad at the top" },
        { name: "Lying Leg Curl", sets: "3", reps: "10-15", rest: "75s", notes: "Control the return — don't let weight drop" },
        { name: "Seated Calf Raise", sets: "3", reps: "12-20", rest: "60s", notes: "Deeper stretch than standing calf raise" },
        { name: "Cable Rotation or Pallof Press", sets: "3", reps: "10-15 per side", rest: "60s", notes: "Resist rotation — core stays braced" },
      ],
    },
  },

  // ── ORIGINAL HERO WORKOUTS (Free) ───────────────────────────────────────────
  {
    slug: "one-punch",
    name: "The One Punch",
    description: "100 Pushups, 100 Situps, 100 Squats, 10km Run. Every single day. No excuses.",
    type: "hero",
    difficulty: "Elite Level",
    avatarEmoji: "✨",
    equipment: "Bodyweight",
    isPro: false,
    program: {
      duration: "90+",
      rpe: "10",
      warmup: "10 min easy run + dynamic stretching",
      exercises: [
        { name: "Pushups", reps: "100" },
        { name: "Situps", reps: "100" },
        { name: "Squats", reps: "100" },
        { name: "10km Run", reps: "1" },
      ],
    },
  },
  {
    slug: "wall-crawler-acrobat",
    name: "Wall-Crawler Acrobat",
    description: "Upper body pulling power and body control inspired by a hero who swings between skyscrapers.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🕷️",
    equipment: "Bodyweight",
    isPro: false,
    program: {
      duration: "50-65",
      rpe: "7-9",
      warmup: "5 min cardio + scap retractions, dead hangs",
      exercises: [
        { name: "Scap Pull-Aparts", sets: "2", reps: "15", rest: "45s" },
        { name: "Quadrupedal Crawl", sets: "2", reps: "30s", rest: "45s" },
        { name: "Weighted Chin-Up", sets: "4", reps: "6-8", rest: "120s" },
        { name: "Climb-Up Practice", sets: "4", reps: "3-5", rest: "120s" },
        { name: "Front Lever Progression", sets: "3", reps: "5-8s hold", rest: "90s" },
        { name: "Hanging Leg Raise", sets: "3", reps: "10-12", rest: "60s" },
      ],
    },
  },
  {
    slug: "speedforce-sprinter",
    name: "Speedforce Sprinter",
    description: "Lower body explosive power and acceleration for the hero who moves faster than lightning.",
    type: "hero",
    difficulty: "Elite Level",
    avatarEmoji: "⚡",
    equipment: "Full Gym",
    isPro: false,
    program: {
      duration: "60-75",
      rpe: "8-10",
      warmup: "10 min jog + A-skips, leg swings, dynamic hip openers",
      exercises: [
        { name: "Trap Bar Deadlift", sets: "5", reps: "3-5", rest: "150s" },
        { name: "Bulgarian Split Squat", sets: "4", reps: "6-8 per leg", rest: "120s" },
        { name: "Calf Raise", sets: "4", reps: "12-15", rest: "60s" },
        { name: "Nordic Curl", sets: "3", reps: "5-8", rest: "90s" },
        { name: "Sprint Interval", sets: "6", reps: "60m", rest: "90s" },
      ],
    },
  },
  {
    slug: "thunder-god",
    name: "Thunder God Press",
    description: "Overhead strength to match the might of a god. Built for those who lift like they command the storm.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🔨",
    equipment: "Full Gym",
    isPro: false,
    program: {
      duration: "50-65",
      rpe: "7-9",
      warmup: "5-8 min cardio + 2 prep sets on OHP",
      exercises: [
        { name: "Overhead Press", sets: "5", reps: "3-5", rest: "150s" },
        { name: "Push Press", sets: "4", reps: "5-6", rest: "120s" },
        { name: "Dumbbell Overhead Press", sets: "3", reps: "8-10", rest: "90s" },
        { name: "Landmine Press", sets: "3", reps: "10-12", rest: "75s" },
        { name: "Face Pull", sets: "3", reps: "15", rest: "60s" },
      ],
    },
  },
  {
    slug: "armored-genius",
    name: "Armored Genius Protocol",
    description: "Iron will meets iron weights. The full-body conditioning of a billionaire genius inside his armored suit.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "🤖",
    equipment: "Full Gym",
    isPro: false,
    program: {
      duration: "55-70",
      rpe: "7-9",
      warmup: "5-8 min cardio + 2 prep sets on bench",
      exercises: [
        { name: "Barbell Bench Press", sets: "4", reps: "6-8", rest: "120s" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Cable Row", sets: "4", reps: "10", rest: "90s" },
        { name: "Lat Pulldown", sets: "3", reps: "10-12", rest: "75s" },
        { name: "Tricep Pushdown", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Plank", sets: "3", reps: "45s hold", rest: "45s" },
      ],
    },
  },
  {
    slug: "super-soldier",
    name: "Super Soldier Program",
    description: "Military-grade conditioning from the soldier who never stopped. Full-body strength and endurance.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🛡️",
    equipment: "Full Gym",
    isPro: false,
    program: {
      duration: "60-80",
      rpe: "8-9",
      warmup: "10 min jog + dynamic stretching",
      exercises: [
        { name: "Back Squat", sets: "5", reps: "5", rest: "150s" },
        { name: "Pull-Up", sets: "5", reps: "10", rest: "90s" },
        { name: "Push-Up", sets: "5", reps: "20", rest: "60s" },
        { name: "Farmers Walk", sets: "3", reps: "50m", rest: "90s" },
        { name: "5km Run", reps: "1" },
      ],
    },
  },

  // ── VILLAIN / PRO ────────────────────────────────────────────────────────────
  {
    slug: "gamma-juggernaut",
    name: "Gamma Juggernaut",
    description: "Unstoppable power forged through gamma radiation. Squat and deadlift until the floor cracks.",
    type: "villain",
    difficulty: "Elite Level",
    avatarEmoji: "💪",
    equipment: "Full Gym",
    isPro: true,
    program: {
      duration: "70-90",
      rpe: "8-10",
      warmup: "10 min bike + 3 prep sets on squat",
      exercises: [
        { name: "Back Squat", sets: "5", reps: "3-5", rest: "180s" },
        { name: "Conventional Deadlift", sets: "5", reps: "3-5", rest: "180s" },
        { name: "Front Squat", sets: "3", reps: "6-8", rest: "120s" },
        { name: "Good Morning", sets: "3", reps: "8-10", rest: "90s" },
        { name: "Leg Press", sets: "4", reps: "10-12", rest: "90s" },
      ],
    },
  },
  {
    slug: "midnight-predator",
    name: "Midnight Predator",
    description: "Strike from the shadows. Low-volume, high-intensity power built for speed and lethality.",
    type: "villain",
    difficulty: "Elite Level",
    avatarEmoji: "🐈‍⬛",
    equipment: "Full Gym",
    isPro: true,
    program: {
      duration: "60-75",
      rpe: "8-10",
      warmup: "10 min jog + power skips, A-skips, leg swings",
      exercises: [
        { name: "Power Clean", sets: "5", reps: "3", rest: "150s" },
        { name: "Box Jump", sets: "4", reps: "5", rest: "90s" },
        { name: "Trap Bar Deadlift", sets: "4", reps: "5", rest: "150s" },
        { name: "Single-Leg Broad Jump", sets: "3", reps: "5 each", rest: "90s" },
        { name: "Sprint", sets: "6", reps: "40m", rest: "120s" },
      ],
    },
  },
  {
    slug: "berserker-frame",
    name: "Berserker Frame",
    description: "Controlled rage channeled into extreme volume. Your muscles don't get to rest. Neither do you.",
    type: "villain",
    difficulty: "Elite Level",
    avatarEmoji: "🔥",
    equipment: "Full Gym",
    isPro: true,
    program: {
      duration: "70-90",
      rpe: "8-9",
      warmup: "5-8 min cardio + dead hangs, band pull-aparts",
      exercises: [
        { name: "Barbell Row", sets: "6", reps: "8", rest: "90s" },
        { name: "Weighted Pull-Up", sets: "5", reps: "8", rest: "90s" },
        { name: "Chest-Supported Row", sets: "4", reps: "12", rest: "75s" },
        { name: "Hammer Curl", sets: "4", reps: "12", rest: "60s" },
        { name: "Dead Hang", sets: "3", reps: "30s hold", rest: "60s" },
        { name: "Barbell Shrug", sets: "4", reps: "15", rest: "60s" },
      ],
    },
  },
  {
    slug: "void-sorcerer",
    name: "Void Sorcerer Conditioning",
    description: "The body is merely a vessel. Sharpen it until mind and muscle operate as one devastating force.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "🌀",
    equipment: "Bodyweight",
    isPro: true,
    program: {
      duration: "50-65",
      rpe: "7-9",
      warmup: "5 min cardio + shoulder mobility, wrist circles",
      exercises: [
        { name: "Handstand Hold", sets: "4", reps: "20s hold", rest: "60s" },
        { name: "Dragon Flag", sets: "4", reps: "6", rest: "90s" },
        { name: "Planche Lean", sets: "3", reps: "15s hold", rest: "90s" },
        { name: "Hollow Body Rock", sets: "3", reps: "20", rest: "60s" },
        { name: "L-Sit", sets: "3", reps: "15s hold", rest: "60s" },
        { name: "Pike Push-Up", sets: "4", reps: "12", rest: "75s" },
      ],
    },
  },
  {
    slug: "precision-assassin",
    name: "Precision Assassin",
    description: "A killer's body is a weapon. Light, fast, and devastatingly strong. Every movement is intentional.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "🗡️",
    equipment: "Bodyweight",
    isPro: true,
    program: {
      duration: "50-65",
      rpe: "8-9",
      warmup: "5 min cardio + ankle mobility, hip openers",
      exercises: [
        { name: "Pistol Squat", sets: "4", reps: "8 each", rest: "75s" },
        { name: "Single-Arm Push-Up Progression", sets: "4", reps: "5 each", rest: "90s" },
        { name: "Archer Pull-Up", sets: "3", reps: "5 each", rest: "90s" },
        { name: "Shrimp Squat", sets: "3", reps: "6 each", rest: "75s" },
        { name: "Tuck Planche", sets: "3", reps: "10s hold", rest: "90s" },
        { name: "Agility Sprint Drill", sets: "5", reps: "20s", rest: "40s" },
      ],
    },
  },
  {
    slug: "pure-discipline",
    name: "Pure Discipline",
    description: "No music. No mirrors. No excuses. The most grueling full-body program for those who embrace suffering.",
    type: "villain",
    difficulty: "Elite Level",
    avatarEmoji: "⚫",
    equipment: "Full Gym",
    isPro: true,
    program: {
      duration: "70-90",
      rpe: "9-10",
      warmup: "10 min cardio + 2-3 prep sets on deadlift",
      exercises: [
        { name: "Deadlift", sets: "5", reps: "5", rest: "180s" },
        { name: "Overhead Press", sets: "5", reps: "5", rest: "150s" },
        { name: "Barbell Row", sets: "5", reps: "5", rest: "150s" },
        { name: "Back Squat", sets: "5", reps: "5", rest: "180s" },
        { name: "Bench Press", sets: "5", reps: "5", rest: "150s" },
      ],
    },
  },

  // ── ADVANCED NEMESIS SERIES (Pro · PPL + Hypertrophy · 5–6x/week) ───────────
  // Based on HeroPhysique tier 3: planned intensity, specialization, fatigue monitoring
  {
    slug: "nemesis-push-strength",
    name: "Nemesis: Push Strength",
    description: "Monday's armor gets built here. Bench press and overhead press at peak intensity. Every pressing muscle fires in sequence.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "💀",
    equipment: "Full Gym",
    isPro: true,
    series: "Nemesis Series",
    program: {
      duration: "60-90",
      rpe: "7-9",
      warmup: "5-8 min cardio + 2-3 prep sets on bench",
      notes: "Planned intensity — this is not a max effort day. Leave 1-2 reps in reserve on main lifts.",
      schedule: "Monday",
      exercises: [
        { name: "Bench Press", sets: "4", reps: "4-6", rest: "150s", notes: "Bar path: slight arc toward lower chest" },
        { name: "Overhead Press", sets: "3", reps: "5-8", rest: "120s", notes: "Brace hard, full lockout at top" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "8-10", rest: "90s", notes: "45° incline, controlled eccentric" },
        { name: "Weighted Dip or Machine Press", sets: "3", reps: "6-10", rest: "90s", notes: "Full range, chest gets a stretch at bottom" },
        { name: "Cable Lateral Raise", sets: "4", reps: "12-20", rest: "60s", notes: "Cables keep tension through the full range" },
        { name: "Triceps Extension", sets: "3", reps: "10-15", rest: "60s", notes: "Elbows fixed, squeeze at full extension" },
      ],
    },
  },
  {
    slug: "nemesis-pull-strength",
    name: "Nemesis: Pull Strength",
    description: "Tuesday. Weighted pull-ups and barbell rows at their heaviest. Loaded carries build the grip and grit to finish.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "💀",
    equipment: "Full Gym",
    isPro: true,
    series: "Nemesis Series",
    program: {
      duration: "60-90",
      rpe: "7-9",
      warmup: "5-8 min cardio + dead hangs, band pull-aparts",
      notes: "Focus on scapular control — every pull should start with shoulder blades setting first.",
      schedule: "Tuesday",
      exercises: [
        { name: "Weighted Pull-Up", sets: "4", reps: "4-8", rest: "150s", notes: "Add weight via belt or vest — full range" },
        { name: "Barbell Row or Chest-Supported Row", sets: "4", reps: "5-8", rest: "120s", notes: "Pull elbows back, pause at the top" },
        { name: "Lat Pulldown", sets: "3", reps: "8-12", rest: "90s", notes: "Slightly different angle from pull-up" },
        { name: "Rear Delt Row or Reverse Fly", sets: "3", reps: "12-20", rest: "60s", notes: "Light weight, high reps for rear delts" },
        { name: "Barbell or Dumbbell Curl", sets: "3", reps: "8-12", rest: "75s", notes: "Control the eccentric — 2-3 seconds down" },
        { name: "Loaded Carry", sets: "3", reps: "30-50 meters", rest: "90s", notes: "Walk tall, shoulder blades packed down" },
      ],
    },
  },
  {
    slug: "nemesis-legs-strength",
    name: "Nemesis: Legs Strength",
    description: "Wednesday. Back squat leads. Romanian deadlift follows. Bulgarian split squats finish what the compound lifts started.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "💀",
    equipment: "Full Gym",
    isPro: true,
    series: "Nemesis Series",
    program: {
      duration: "70-90",
      rpe: "8-9",
      warmup: "10 min bike + 3 prep sets on squat",
      notes: "This is the most demanding session. Log every weight — progress here drives everything else.",
      schedule: "Wednesday",
      exercises: [
        { name: "Back Squat or Safety-Bar Squat", sets: "4", reps: "4-6", rest: "180s", notes: "Brace before unracking, depth below parallel" },
        { name: "Romanian Deadlift", sets: "4", reps: "6-8", rest: "150s", notes: "Hinge pattern, feel hamstring stretch" },
        { name: "Bulgarian Split Squat", sets: "3", reps: "8-10 per leg", rest: "90s", notes: "Rear foot elevated, front heel drives" },
        { name: "Leg Press", sets: "3", reps: "10-15", rest: "90s", notes: "Higher volume after the heavy compound work" },
        { name: "Leg Curl", sets: "3", reps: "8-12", rest: "75s", notes: "Seated or lying, full range" },
        { name: "Calf Raise", sets: "4", reps: "10-15", rest: "60s", notes: "Pause at bottom stretch" },
        { name: "Ab Wheel Rollout", sets: "3", reps: "6-12", rest: "60s", notes: "Start from knees, hips neutral" },
      ],
    },
  },
  {
    slug: "nemesis-upper-hypertrophy",
    name: "Nemesis: Upper Hypertrophy",
    description: "Friday. Higher reps, higher pump. Incline press and cable fly carve the chest. Shoulder tri-set burns last.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "💀",
    equipment: "Full Gym",
    isPro: true,
    series: "Nemesis Series",
    program: {
      duration: "60-80",
      rpe: "7-8",
      warmup: "5-8 min cardio + 1 prep set per compound exercise",
      notes: "Hypertrophy focus — time under tension matters. Aim for 2-3 second lowering on every rep.",
      schedule: "Friday",
      exercises: [
        { name: "Incline Barbell or Dumbbell Press", sets: "4", reps: "8-12", rest: "90s", notes: "Upper chest emphasis, controlled lowering" },
        { name: "Seated Cable Row", sets: "4", reps: "8-12", rest: "90s", notes: "Constant tension — cables beat barbells here" },
        { name: "Machine Shoulder Press", sets: "3", reps: "8-12", rest: "75s", notes: "Stabilizer-free so you can focus on delts" },
        { name: "Neutral-Grip Pulldown", sets: "3", reps: "10-12", rest: "75s", notes: "Neutral grip for a different lat angle" },
        { name: "Cable Fly", sets: "3", reps: "12-15", rest: "60s", notes: "Full stretch at top, squeeze at cross" },
        { name: "Lateral Raise", sets: "4", reps: "15-25", rest: "45s", notes: "Drop set on last set for maximum burn" },
        { name: "Superset: Curl + Pressdown", sets: "3", reps: "10-15 each", rest: "60s", notes: "No rest between curl and pressdown" },
      ],
    },
  },
  {
    slug: "nemesis-lower-hypertrophy",
    name: "Nemesis: Lower Hypertrophy",
    description: "Saturday finisher. Front squats, hip thrusts, walking lunges. Legs get no mercy on the sixth day.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "💀",
    equipment: "Full Gym",
    isPro: true,
    series: "Nemesis Series",
    program: {
      duration: "60-80",
      rpe: "7-8",
      warmup: "10 min bike + glute activation, hip flexor stretch",
      notes: "Saturday — fatigue will be there. Dial back weight if needed and focus on contraction quality.",
      schedule: "Saturday",
      exercises: [
        { name: "Front Squat or Hack Squat", sets: "4", reps: "6-10", rest: "120s", notes: "More quad-dominant than back squat" },
        { name: "Hip Thrust", sets: "4", reps: "8-12", rest: "90s", notes: "Bar pad, drive through heels, lock out glutes" },
        { name: "Walking Lunge", sets: "3", reps: "10-14 per leg", rest: "90s", notes: "Keep torso upright, step long" },
        { name: "Leg Extension", sets: "3", reps: "12-20", rest: "60s", notes: "Peak contraction hold for 1 second" },
        { name: "Seated Leg Curl", sets: "3", reps: "12-20", rest: "60s", notes: "Full range, slow and deliberate" },
        { name: "Calf Raise", sets: "4", reps: "12-20", rest: "60s", notes: "Stretch fully at bottom each rep" },
        { name: "Cable Crunch", sets: "3", reps: "10-20", rest: "60s", notes: "Crunch toward your hips, not the floor" },
      ],
    },
  },

  // ── ANIME / PRO ──────────────────────────────────────────────────────────────
  {
    slug: "saiyan-warrior",
    name: "Kakarot's Path",
    description: "Pure explosive power forged through relentless Saiyan battle training.",
    type: "anime",
    difficulty: "Elite Level",
    avatarEmoji: "🐉",
    equipment: "Full Gym",
    series: "Dragon Ball Z",
    workoutStyle: "Strength",
    isPro: true,
    program: {
      duration: "70-90",
      rpe: "9-10",
      warmup: "10 min jog + dynamic power prep",
      exercises: [
        { name: "Barbell Back Squat", sets: "5", reps: "3", rest: "180s" },
        { name: "Power Clean", sets: "5", reps: "3", rest: "150s" },
        { name: "Weighted Jump Squat", sets: "4", reps: "8", rest: "90s" },
        { name: "Conventional Deadlift", sets: "5", reps: "3", rest: "180s" },
        { name: "Overhead Press", sets: "4", reps: "5", rest: "120s" },
        { name: "Sprint Intervals", sets: "6", reps: "100m", rest: "60s" },
      ],
    },
  },
  {
    slug: "saiyan-prince",
    name: "Vegeta's Pride",
    description: "Train with the fury of a Saiyan prince who refuses to lose. Every rep is a battle for supremacy.",
    type: "anime",
    difficulty: "Elite Level",
    avatarEmoji: "👑",
    equipment: "Full Gym",
    series: "Dragon Ball Z",
    workoutStyle: "Strength",
    isPro: true,
    program: {
      duration: "70-90",
      rpe: "9-10",
      warmup: "10 min jog + prep sets",
      exercises: [
        { name: "Sumo Deadlift", sets: "6", reps: "3", rest: "180s" },
        { name: "Front Squat", sets: "5", reps: "5", rest: "150s" },
        { name: "Barbell Bench Press", sets: "5", reps: "5", rest: "120s" },
        { name: "Weighted Dip", sets: "4", reps: "8", rest: "90s" },
        { name: "Weighted Pull-Up", sets: "4", reps: "10", rest: "90s" },
        { name: "Battle Rope", sets: "3", reps: "30s", rest: "60s" },
      ],
    },
  },
  {
    slug: "leaf-taijutsu",
    name: "Leaf Village Taijutsu",
    description: "Speed, endurance, and explosive body strikes perfected through thousands of hours of shinobi training.",
    type: "anime",
    difficulty: "Intermediate",
    avatarEmoji: "🍃",
    equipment: "Bodyweight",
    series: "Naruto",
    workoutStyle: "HIIT",
    isPro: true,
    program: {
      duration: "50-65",
      rpe: "7-9",
      warmup: "5-8 min jog + shadow boxing, dynamic stretching",
      exercises: [
        { name: "Box Jump", sets: "4", reps: "10", rest: "60s" },
        { name: "Burpees", sets: "5", reps: "15", rest: "45s" },
        { name: "Sprint Intervals", sets: "8", reps: "50m", rest: "30s" },
        { name: "Push-Up Variation Circuit", sets: "4", reps: "20", rest: "60s" },
        { name: "Jump Rope", sets: "5", reps: "1 min", rest: "30s" },
        { name: "Shadow Boxing", sets: "3", reps: "2 min", rest: "60s" },
      ],
    },
  },
  {
    slug: "shadow-clone-circuit",
    name: "Shadow Clone Circuit",
    description: "Volume so extreme it feels like a hundred of you trained at once.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "⚡",
    equipment: "Bodyweight",
    series: "Naruto",
    workoutStyle: "Calisthenics",
    isPro: true,
    program: {
      duration: "55-70",
      rpe: "8-9",
      warmup: "5-8 min cardio + shoulder mobility, wrist prep",
      exercises: [
        { name: "Weighted Pull-Up", sets: "5", reps: "12", rest: "90s" },
        { name: "Pistol Squat", sets: "4", reps: "8 each", rest: "75s" },
        { name: "Handstand Push-Up", sets: "3", reps: "6", rest: "120s" },
        { name: "L-Sit Hold", sets: "3", reps: "20s hold", rest: "60s" },
        { name: "Muscle-Up Progression", sets: "3", reps: "3", rest: "120s" },
        { name: "Ring Dip", sets: "4", reps: "10", rest: "75s" },
      ],
    },
  },
  {
    slug: "infinite-void",
    name: "Infinite Void",
    description: "Limitless technique demands limitless body control. Precision mobility and unshakeable balance.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "🌀",
    equipment: "Bodyweight",
    series: "Jujutsu Kaisen",
    workoutStyle: "Mobility",
    isPro: true,
    program: {
      duration: "50-65",
      rpe: "7-8",
      warmup: "5-8 min cardio + thoracic rotation, hip CARs",
      exercises: [
        { name: "Single-Leg Romanian Deadlift", sets: "4", reps: "8 each", rest: "75s" },
        { name: "Turkish Get-Up", sets: "3", reps: "5 each", rest: "90s" },
        { name: "Planche Lean", sets: "3", reps: "15s hold", rest: "90s" },
        { name: "Hollow Body Hold", sets: "3", reps: "30s hold", rest: "60s" },
        { name: "Windmill", sets: "3", reps: "8 each", rest: "60s" },
        { name: "Breathing Ladder", sets: "5", reps: "1 round", rest: "45s" },
      ],
    },
  },
  {
    slug: "black-flash-protocol",
    name: "Black Flash Protocol",
    description: "Superhuman brawling power. Pure physical domination through brutal compound pulling and pressing.",
    type: "anime",
    difficulty: "Elite Level",
    avatarEmoji: "💥",
    equipment: "Full Gym",
    series: "Jujutsu Kaisen",
    workoutStyle: "Strength",
    isPro: true,
    program: {
      duration: "65-80",
      rpe: "8-9",
      warmup: "5-8 min cardio + dead hangs, prep sets",
      exercises: [
        { name: "Trap Bar Deadlift", sets: "5", reps: "5", rest: "150s" },
        { name: "Weighted Chin-Up", sets: "4", reps: "6", rest: "120s" },
        { name: "Barbell Row", sets: "4", reps: "8", rest: "90s" },
        { name: "Dumbbell Incline Press", sets: "4", reps: "8", rest: "90s" },
        { name: "Face Pull", sets: "3", reps: "15", rest: "60s" },
        { name: "Farmers Walk", sets: "3", reps: "40m", rest: "90s" },
      ],
    },
  },
  {
    slug: "three-sword-conditioning",
    name: "Three Sword Conditioning",
    description: "Supreme shoulder, back, and grip strength for a warrior who wields three blades.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "⚔️",
    equipment: "Full Gym",
    series: "One Piece",
    workoutStyle: "Hypertrophy",
    isPro: true,
    program: {
      duration: "55-70",
      rpe: "7-8",
      warmup: "5-8 min cardio + band pull-aparts, shoulder CARs",
      exercises: [
        { name: "Arnold Press", sets: "4", reps: "10", rest: "90s" },
        { name: "Cable Face Pull", sets: "4", reps: "15", rest: "60s" },
        { name: "Lateral Raise", sets: "4", reps: "15", rest: "60s" },
        { name: "Weighted Chin-Up", sets: "4", reps: "8", rest: "90s" },
        { name: "Single-Arm Dumbbell Row", sets: "4", reps: "10 each", rest: "75s" },
        { name: "Wrist Curl Circuit", sets: "3", reps: "20", rest: "45s" },
      ],
    },
  },
  {
    slug: "gear-fourth-pump",
    name: "Gear Fourth Pump",
    description: "Elastic, dynamic, and unstoppable. Full-body explosive plyometric domination.",
    type: "anime",
    difficulty: "Intermediate",
    avatarEmoji: "🌊",
    equipment: "Bodyweight",
    series: "One Piece",
    workoutStyle: "Plyometrics",
    isPro: true,
    program: {
      duration: "50-65",
      rpe: "7-9",
      warmup: "5-8 min jog + dynamic leg swings, ankle mobility",
      exercises: [
        { name: "Broad Jump", sets: "4", reps: "8", rest: "60s" },
        { name: "Jumping Push-Up", sets: "4", reps: "12", rest: "60s" },
        { name: "Tuck Jump", sets: "4", reps: "15", rest: "45s" },
        { name: "Bodyweight Jump Squat", sets: "4", reps: "15", rest: "45s" },
        { name: "Clap Push-Up", sets: "3", reps: "10", rest: "75s" },
        { name: "Explosive Hip Thrust", sets: "3", reps: "12", rest: "60s" },
      ],
    },
  },
  {
    slug: "survey-corps-circuit",
    name: "Survey Corps Circuit",
    description: "Humanity's strongest trains core and agility above all else. A body that never quits.",
    type: "anime",
    difficulty: "Elite Level",
    avatarEmoji: "🗡️",
    equipment: "Bodyweight",
    series: "Attack on Titan",
    workoutStyle: "Functional",
    isPro: true,
    program: {
      duration: "60-75",
      rpe: "8-9",
      warmup: "10 min jog + agility ladder drills",
      exercises: [
        { name: "Dragon Flag", sets: "4", reps: "6", rest: "90s" },
        { name: "Hanging Windshield Wiper", sets: "4", reps: "8", rest: "75s" },
        { name: "Agility Ladder Drill", sets: "5", reps: "30s", rest: "30s" },
        { name: "L-Sit Pull-Up", sets: "4", reps: "5", rest: "90s" },
        { name: "Plank Reach", sets: "4", reps: "12 each", rest: "60s" },
        { name: "Box Drill Sprint", sets: "5", reps: "20s", rest: "30s" },
      ],
    },
  },
  {
    slug: "thunder-breathing",
    name: "Thunder Breathing Form",
    description: "Lightning-fast sword strikes demand reactive speed, explosive legs, and a mind that moves before the body.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "⚡",
    equipment: "Bodyweight",
    series: "Demon Slayer",
    workoutStyle: "Speed & Agility",
    isPro: true,
    program: {
      duration: "50-65",
      rpe: "8-9",
      warmup: "5-8 min jog + leg swings, ankle circles",
      exercises: [
        { name: "Reaction Ball Drill", sets: "3", reps: "30s", rest: "30s" },
        { name: "Speed Squat", sets: "4", reps: "20", rest: "45s" },
        { name: "Fast Feet Drill", sets: "4", reps: "15s", rest: "30s" },
        { name: "Jump Lunge", sets: "4", reps: "12 each", rest: "60s" },
        { name: "Sprint", sets: "8", reps: "30m", rest: "30s" },
        { name: "Plyometric Push-Up", sets: "3", reps: "12", rest: "60s" },
      ],
    },
  },
];

async function seed() {
  console.log(`\n🦸 HeroSplit Workout Seeder`);
  console.log(`Seeding ${workouts.length} workouts into InstantDB...\n`);

  const result = await db.query({ workouts: {} });
  const existing = result.workouts ?? [];
  const existingSlugs = new Set(existing.map((w) => w.slug));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const workout of workouts) {
    if (existingSlugs.has(workout.slug)) {
      // Update existing workouts with new fields (rpe, warmup, notes, duration)
      const existingWorkout = existing.find(w => w.slug === workout.slug);
      const existingProgram = existingWorkout?.program ?? {};
      const hasNewFields = workout.program?.rpe || workout.program?.warmup;
      const existingHasFields = existingProgram?.rpe || existingProgram?.warmup;

      if (hasNewFields && !existingHasFields) {
        await db.transact([tx.workouts[existingWorkout.id].update(workout)]);
        console.log(`  🔄 updated ${workout.name}`);
        updated++;
      } else {
        console.log(`  ⏭  skip   ${workout.name}`);
        skipped++;
      }
      continue;
    }
    await db.transact([tx.workouts[id()].update(workout)]);
    console.log(`  ✅ added  ${workout.name}`);
    created++;
  }

  const beginnerCount = workouts.filter(w => w.difficulty === "Beginner").length;
  const intermediateCount = workouts.filter(w => w.difficulty === "Intermediate").length;
  const advancedCount = workouts.filter(w => w.difficulty === "Advanced" || w.difficulty === "Elite Level").length;
  const heroCount = workouts.filter(w => !w.isPro && w.type === "hero").length;
  const villainCount = workouts.filter(w => w.type === "villain").length;
  const animeCount = workouts.filter(w => w.type === "anime").length;

  console.log(`\n✨ Done!`);
  console.log(`   ${created} created, ${updated} updated, ${skipped} skipped`);
  console.log(`\n   By difficulty:`);
  console.log(`   🌱 ${beginnerCount} beginner | 📐 ${intermediateCount} intermediate | 💪 ${advancedCount} advanced/elite`);
  console.log(`\n   By tier:`);
  console.log(`   ${heroCount} hero (free) | ${villainCount} villain (pro) | ${animeCount} anime (pro)`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
