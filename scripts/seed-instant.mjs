/**
 * One-time seed script — writes all workout programs to InstantDB.
 * Run: node scripts/seed-instant.mjs
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
  // ── BEGINNER / FREE ─────────────────────────────────────────────────────────
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
      exercises: [
        { name: "Knee Push-Up", sets: "3", reps: "8–12", rest: "60s" },
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
      exercises: [
        { name: "Dumbbell Goblet Squat", sets: "3", reps: "10", rest: "90s" },
        { name: "Dumbbell Chest Press (floor)", sets: "3", reps: "10", rest: "90s" },
        { name: "Dumbbell Romanian Deadlift", sets: "3", reps: "10", rest: "90s" },
        { name: "Dumbbell Bent-Over Row", sets: "3", reps: "10 each", rest: "90s" },
        { name: "Dumbbell Shoulder Press", sets: "3", reps: "10", rest: "90s" },
      ],
    },
  },

  // ── HERO / FREE ─────────────────────────────────────────────────────────────
  {
    slug: "one-punch",
    name: "The One Punch",
    description: "100 Pushups, 100 Situps, 100 Squats, 10km Run. Every single day. No excuses.",
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
    imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Scap Pull-Aparts", sets: "2", reps: "15", rest: "45s" },
        { name: "Quadrupedal Crawl", sets: "2", reps: "30s", rest: "45s" },
        { name: "Weighted Chin-Up", sets: "4", reps: "6–8", rest: "120s" },
        { name: "Climb-Up Practice", sets: "4", reps: "3–5", rest: "120s" },
        { name: "Front Lever Progression", sets: "3", reps: "5–8s hold", rest: "90s" },
        { name: "Hanging Leg Raise", sets: "3", reps: "10–12", rest: "60s" },
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
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Trap Bar Deadlift", sets: "5", reps: "3–5", rest: "150s" },
        { name: "Bulgarian Split Squat", sets: "4", reps: "6–8/leg", rest: "120s" },
        { name: "Calf Raise", sets: "4", reps: "12–15", rest: "60s" },
        { name: "Nordic Curl", sets: "3", reps: "5–8", rest: "90s" },
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
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Overhead Press", sets: "5", reps: "3–5", rest: "150s" },
        { name: "Push Press", sets: "4", reps: "5–6", rest: "120s" },
        { name: "Dumbbell Overhead Press", sets: "3", reps: "8–10", rest: "90s" },
        { name: "Landmine Press", sets: "3", reps: "10–12", rest: "75s" },
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
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Barbell Bench Press", sets: "4", reps: "6–8", rest: "120s" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "10–12", rest: "90s" },
        { name: "Cable Row", sets: "4", reps: "10", rest: "90s" },
        { name: "Lat Pulldown", sets: "3", reps: "10–12", rest: "75s" },
        { name: "Tricep Pushdown", sets: "3", reps: "12–15", rest: "60s" },
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
    imageUrl: "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&q=80&w=1000",
    program: {
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
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Back Squat", sets: "5", reps: "3–5", rest: "180s" },
        { name: "Conventional Deadlift", sets: "5", reps: "3–5", rest: "180s" },
        { name: "Front Squat", sets: "3", reps: "6–8", rest: "120s" },
        { name: "Good Morning", sets: "3", reps: "8–10", rest: "90s" },
        { name: "Leg Press", sets: "4", reps: "10–12", rest: "90s" },
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
    imageUrl: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&q=80&w=1000",
    program: {
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
    imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=1000",
    program: {
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
    imageUrl: "https://images.unsplash.com/photo-1544216717-3bbf52512659?auto=format&fit=crop&q=80&w=1000",
    program: {
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
    imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=1000",
    program: {
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
    imageUrl: "https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&q=80&w=1000",
    program: {
      exercises: [
        { name: "Deadlift", sets: "5", reps: "5", rest: "180s" },
        { name: "Overhead Press", sets: "5", reps: "5", rest: "150s" },
        { name: "Barbell Row", sets: "5", reps: "5", rest: "150s" },
        { name: "Back Squat", sets: "5", reps: "5", rest: "180s" },
        { name: "Bench Press", sets: "5", reps: "5", rest: "150s" },
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
    description: "Volume so extreme it feels like a hundred of you trained at once.",
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
    description: "Limitless technique demands limitless body control. Precision mobility and unshakeable balance.",
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
    description: "Superhuman brawling power. Pure physical domination through brutal compound pulling and pressing.",
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
    description: "Supreme shoulder, back, and grip strength for a warrior who wields three blades.",
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
    description: "Elastic, dynamic, and unstoppable. Full-body explosive plyometric domination.",
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
    description: "Humanity's strongest trains core and agility above all else. A body that never quits.",
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

async function seed() {
  console.log(`\n🦸 HeroSplit Workout Seeder`);
  console.log(`Seeding ${workouts.length} workouts into InstantDB...\n`);

  const result = await db.query({ workouts: {} });
  const existing = result.workouts ?? [];
  const existingSlugs = new Set(existing.map((w) => w.slug));

  let created = 0;
  let skipped = 0;

  for (const workout of workouts) {
    if (existingSlugs.has(workout.slug)) {
      console.log(`  ⏭  skip   ${workout.name}`);
      skipped++;
      continue;
    }
    await db.transact([tx.workouts[id()].update(workout)]);
    console.log(`  ✅ added  ${workout.name}`);
    created++;
  }

  const heroCount = workouts.filter(w => !w.isPro && w.type === "hero").length;
  const villainCount = workouts.filter(w => w.type === "villain").length;
  const animeCount = workouts.filter(w => w.type === "anime").length;

  console.log(`\n✨ Done!`);
  console.log(`   ${created} created, ${skipped} skipped`);
  console.log(`   ${heroCount} hero (free) | ${villainCount} villain (pro) | ${animeCount} anime (pro)`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
