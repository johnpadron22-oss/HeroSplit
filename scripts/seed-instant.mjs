/**
 * One-time seed script — writes all workout programs to InstantDB.
 * Run once: node scripts/seed-instant.mjs
 *
 * Requires: INSTANT_APP_ID and INSTANT_ADMIN_TOKEN env vars
 * (or edit the constants below directly)
 */

import { init, id, tx } from "@instantdb/admin";

const APP_ID = process.env.INSTANT_APP_ID ?? "2bcb316f-1e7d-4ade-9821-9422d2b885ea";
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN ?? "db9d1446-2f4b-451a-8887-5dcb41839d7a";

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

// ── Workout Data ──────────────────────────────────────────────────────────────

const workouts = [
  // ── Hero / Free ──────────────────────────────────────────────────────────
  {
    slug: "one-punch",
    name: "The One Punch",
    description: "100 Pushups, 100 Situps, 100 Squats, and a 10km Run.",
    type: "hero",
    difficulty: "Elite Level",
    avatarEmoji: "✨",
    equipment: "Bodyweight",
    isPro: false,
    imageUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Pushups", reps: "100" },
        { name: "Situps", reps: "100" },
        { name: "Squats", reps: "100" },
        { name: "Run", reps: "10km" },
      ],
    },
  },
  {
    slug: "wall-crawler-acrobat",
    name: "Wall-Crawler Acrobat (Inspired)",
    description: "A legendary workout program inspired by the character's unique abilities.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🕷️",
    equipment: "Bodyweight",
    isPro: false,
    imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Scap Pull-Aparts", sets: "2", reps: "15" },
        { name: "Quadrupedal Crawl", sets: "2", reps: "30s" },
        { name: "Weighted Chin-Up", sets: "4", reps: "6–8", rest: "120s" },
        { name: "Climb-Up Practice", sets: "4", reps: "3–5", rest: "120s" },
        { name: "Front Lever Progression", sets: "3", reps: "5–8s hold", rest: "90s" },
        { name: "Hanging Leg Raise", sets: "3", reps: "10–12", rest: "60s" },
      ],
    },
  },
  {
    slug: "speedforce-sprinter",
    name: "Speedforce Sprinter (Inspired)",
    description: "A legendary workout program inspired by the character's unique abilities.",
    type: "hero",
    difficulty: "Elite Level",
    avatarEmoji: "⚡",
    equipment: "Full Gym",
    isPro: false,
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Trap Bar Deadlift", sets: "5", reps: "3–5", rest: "150s" },
        { name: "Bulgarian Split Squat", sets: "4", reps: "6–8/leg", rest: "120s" },
        { name: "Calf Raise", sets: "4", reps: "12–15", rest: "60s" },
        { name: "Nordic Curl", sets: "3", reps: "5–8", rest: "90s" },
      ],
    },
  },
  {
    slug: "thunder-god",
    name: "Thunder God (Inspired)",
    description: "A legendary workout program inspired by the character's unique abilities.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🔨",
    equipment: "Full Gym",
    isPro: false,
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Overhead Press", sets: "5", reps: "3–5", rest: "150s" },
        { name: "Push Press", sets: "4", reps: "5–6", rest: "120s" },
        { name: "Dumbbell Overhead Press", sets: "3", reps: "8–10", rest: "90s" },
        { name: "Landmine Press", sets: "3", reps: "10–12", rest: "75s" },
      ],
    },
  },

  // ── Villain / Pro ─────────────────────────────────────────────────────────
  {
    slug: "gamma-juggernaut",
    name: "Gamma Juggernaut (Inspired)",
    description: "A legendary workout program inspired by the character's unique abilities.",
    type: "villain",
    difficulty: "Elite Level",
    avatarEmoji: "💪",
    equipment: "Full Gym",
    isPro: true,
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Back Squat", sets: "5", reps: "3–5", rest: "180s" },
        { name: "Conventional Deadlift", sets: "5", reps: "3–5", rest: "180s" },
        { name: "Front Squat", sets: "3", reps: "6–8", rest: "120s" },
        { name: "Good Morning", sets: "3", reps: "8–10", rest: "90s" },
      ],
    },
  },

  // ── Anime / Pro ───────────────────────────────────────────────────────────
  {
    slug: "saiyan-warrior",
    name: "Kakarot's Path",
    description: "Pure explosive power forged through relentless Saiyan battle training. Compound lifts taken to the absolute limit.",
    type: "anime",
    difficulty: "Elite Level",
    avatarEmoji: "🐉",
    equipment: "Full Gym",
    series: "Dragon Ball Z",
    workoutStyle: "Strength",
    isPro: true,
    program: {
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
    avatarEmoji: "🔥",
    equipment: "Bodyweight",
    series: "Naruto",
    workoutStyle: "HIIT",
    isPro: true,
    program: {
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
    description: "Volume so extreme it feels like a hundred of you trained at once. Elite shinobi calisthenics mastery.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "⚡",
    equipment: "Bodyweight",
    series: "Naruto",
    workoutStyle: "Calisthenics",
    isPro: true,
    program: {
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
    description: "Limitless technique demands limitless body control. Precision mobility and unshakeable balance training.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "🌀",
    equipment: "Bodyweight",
    series: "Jujutsu Kaisen",
    workoutStyle: "Mobility",
    isPro: true,
    program: {
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
    description: "Superhuman brawling power activated. Pure physical domination built through brutal compound pulling and pressing.",
    type: "anime",
    difficulty: "Elite Level",
    avatarEmoji: "💥",
    equipment: "Full Gym",
    series: "Jujutsu Kaisen",
    workoutStyle: "Strength",
    isPro: true,
    program: {
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
    description: "Wielding three blades demands supreme shoulder, back, and grip strength. Upper body forged to legendary status.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "⚔️",
    equipment: "Full Gym",
    series: "One Piece",
    workoutStyle: "Hypertrophy",
    isPro: true,
    program: {
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
    description: "Rubber-body power — elastic, dynamic, and unstoppable. Full-body explosive plyometric domination.",
    type: "anime",
    difficulty: "Intermediate",
    avatarEmoji: "🌊",
    equipment: "Bodyweight",
    series: "One Piece",
    workoutStyle: "Plyometrics",
    isPro: true,
    program: {
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
    description: "Humanity's strongest trains core and agility above all else. 3D maneuver gear demands a body that never quits.",
    type: "anime",
    difficulty: "Elite Level",
    avatarEmoji: "🗡️",
    equipment: "Bodyweight",
    series: "Attack on Titan",
    workoutStyle: "Functional",
    isPro: true,
    program: {
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

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding ${workouts.length} workouts into InstantDB...`);

  // Check for existing workouts to avoid duplicates
  const { data } = await db.query({ workouts: {} });
  const existingSlugs = new Set((data?.workouts ?? []).map((w) => w.slug));

  let created = 0;
  for (const workout of workouts) {
    if (existingSlugs.has(workout.slug)) {
      console.log(`  skip  ${workout.slug} (already exists)`);
      continue;
    }
    await db.transact([tx.workouts[id()].update(workout)]);
    console.log(`  added ${workout.slug}`);
    created++;
  }

  console.log(`\nDone. ${created} workouts created, ${workouts.length - created} skipped.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
