#!/usr/bin/env node
/**
 * HeroSplit Workout Seeder (Supabase)
 *
 * Inserts or updates all 40 character workout programs in the Supabase
 * `workouts` table. Uses the service role key (bypasses RLS).
 *
 * Run:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/seed-supabase.mjs
 *
 * Options:
 *   --dry-run   Print what would be seeded without writing
 *
 * Access tiers:
 *   FREE  (isPro: false) — Night Acrobat, Agile Climber, Night Detective, Solar Sentinel
 *   PRO   (isPro: true)  — all remaining 36 programs
 *
 * NOTE: The app-name column (name) must NEVER contain real franchise names,
 * actor names, trademarked logos, or costume colour + symbol combos.
 * Only generic physique/training descriptors and the in-app names are used.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN      = process.argv.includes("--dry-run");

if (!SUPABASE_URL) { console.error("❌ SUPABASE_URL is required"); process.exit(1); }
if (!SERVICE_KEY)  { console.error("❌ SUPABASE_SERVICE_ROLE_KEY is required"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function toRow(w) {
  return {
    slug:          w.slug,
    name:          w.name,
    description:   w.description,
    type:          w.type,
    difficulty:    w.difficulty,
    program:       w.program,
    image_url:     w.imageUrl ?? null,
    avatar_emoji:  w.avatarEmoji ?? null,
    equipment:     w.equipment ?? null,
    series:        w.series ?? null,
    workout_style: w.workoutStyle ?? null,
    is_pro:        Boolean(w.isPro),
  };
}

const workouts = [

  // ═══════════════════════════════════════════════════════════════════════════
  // FREE TIER — 4 programs
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "night-acrobat",
    name: "Night Acrobat",
    description: "Athletic V-taper built for agility and aerial control. Prioritizes back width, shoulder caps, and explosive hip power. 4-day Upper/Lower split with weighted calisthenics.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "🪶",
    equipment: "Barbell · Dumbbells · Pull-up Bar · Cable Machine · Dip Station",
    isPro: false,
    series: "Comics Hero",
    workoutStyle: "Upper/Lower 4-Day",
    program: {
      duration: "55-70",
      rpe: "7-8",
      warmup: "5 min jump rope or dynamic mobility — arm circles, hip circles, leg swings",
      notes: "Week 1-2: master the movement. Week 3-4: add load. Train 4 days: Upper A / Lower A / rest / Upper B / Lower B / rest / rest.",
      schedule: "Upper A — Monday",
      exercises: [
        { name: "Incline Dumbbell Press", sets: "3", reps: "8-12", rest: "90s", notes: "30–45° incline, slow eccentric" },
        { name: "Weighted Pull-up", sets: "3", reps: "6-10", rest: "90s", notes: "Full hang to chin over bar; add weight via belt when bodyweight is easy" },
        { name: "Cable Lateral Raise", sets: "3", reps: "12-15", rest: "60s", notes: "Single arm, cross-body cable — constant tension" },
        { name: "Face Pull", sets: "3", reps: "15-20", rest: "60s", notes: "Rope at forehead height; external-rotate at end of range" },
        { name: "Weighted Dip", sets: "3", reps: "8-12", rest: "90s", notes: "Slight forward lean for chest emphasis; load via dip belt" },
        { name: "Seated Cable Row", sets: "3", reps: "10-12", rest: "90s", notes: "Neutral grip, chest up — pull to lower chest" },
        { name: "Tricep Pushdown", sets: "2", reps: "12-15", rest: "60s", notes: "Rope or straight bar, elbow stays pinned" },
        { name: "Hammer Curl", sets: "2", reps: "12-15", rest: "60s", notes: "Neutral grip, no momentum" },
      ],
    },
  },

  {
    slug: "agile-climber",
    name: "Agile Climber",
    description: "Lean, functional physique built for bodyweight mastery and reactive strength. Emphasizes back thickness, chest, and a chiselled core. 5-day Push/Pull/Legs/Core/Skills split.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "🕸️",
    equipment: "Pull-up Bar · Dip Station · Cables · Dumbbells · Rings (optional)",
    isPro: false,
    series: "Comics Hero",
    workoutStyle: "Push/Pull/Legs 5-Day",
    program: {
      duration: "50-65",
      rpe: "7-9",
      warmup: "10 scapular pull-up hangs · 10 band pull-aparts · arm swings",
      notes: "Push to failure on the last set of each exercise. 5-day split: Push / Pull / Legs / Core + Skills / Rest / repeat.",
      schedule: "Push — Day 1",
      exercises: [
        { name: "Weighted Push-up", sets: "4", reps: "10-15", rest: "90s", notes: "Plate on back; keep elbows at 45° from torso" },
        { name: "Incline Dumbbell Flye", sets: "3", reps: "12-15", rest: "60s", notes: "Open the chest; squeeze at top" },
        { name: "Pike Push-up", sets: "3", reps: "10-12", rest: "60s", notes: "Progress toward handstand push-up; elbows flare slightly" },
        { name: "Dip", sets: "3", reps: "10-15", rest: "90s", notes: "Bodyweight to start; add weight when you reach 15 clean reps" },
        { name: "Cable Chest Flye", sets: "3", reps: "12-15", rest: "60s", notes: "High to low cable; slight forward lean" },
        { name: "Tricep Overhead Extension", sets: "2", reps: "12-15", rest: "60s", notes: "Long-head emphasis — arms vertical overhead" },
        { name: "Hanging Knee Raise", sets: "3", reps: "15-20", rest: "60s", notes: "Control the swing; progress to leg raise" },
      ],
    },
  },

  {
    slug: "night-detective",
    name: "Night Detective",
    description: "Peak human physique — 210 lb of combat-ready muscle at sub-10% body fat. Built on a 7-day Push/Pull/Legs/Mobility/Push/Pull+Calisthenics cycle. Shoulders, traps, forearms, and quads as stand-out features.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🦇",
    equipment: "Barbell · Full Cable Stack · Pull-up Bar · Dip Station · EZ Bar",
    isPro: false,
    series: "Comics Hero",
    workoutStyle: "Push/Pull/Legs 7-Day",
    program: {
      duration: "60-75",
      rpe: "7-9",
      warmup: "Band pull-aparts × 15 · thoracic rotations × 10 each side · wrist circles",
      notes: "7-day cycle: Push / Pull / Heavy Legs / Mobility + Core / Push / Pull + Calisthenics / Rest. Leave 1–2 reps in reserve on big lifts; go to failure on isolation work.",
      schedule: "Day 1 — Push",
      exercises: [
        { name: "Bench Press", sets: "4", reps: "5-8", rest: "2min", notes: "Drive feet into floor; arch controlled — strength focus" },
        { name: "Overhead Press", sets: "3", reps: "6-10", rest: "90s", notes: "Bar from rack; brace hard before each rep" },
        { name: "Close-Grip Bench Press", sets: "3", reps: "8-12", rest: "90s", notes: "Tricep emphasis; tuck elbows slightly" },
        { name: "Cable Lateral Raise", sets: "3", reps: "12-15", rest: "60s", notes: "Cross-body cable for constant tension throughout range" },
        { name: "Skull Crusher", sets: "3", reps: "10-12", rest: "60s", notes: "EZ bar to forehead; elbows vertical" },
        { name: "Cable Overhead Extension", sets: "2", reps: "12-15", rest: "60s", notes: "Long-head stretch; arms overhead, pull rope behind head" },
      ],
    },
  },

  {
    slug: "solar-sentinel",
    name: "Solar Sentinel",
    description: "Big, broad, and powerful. The look: thick chest, cannonball shoulders, wide lats, peaked biceps, and visible abs at 235 lb. 3x/week full-body power-hypertrophy blend anyone can run.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "☀️",
    equipment: "Barbell · Dumbbells · Cable Stack · Pull-up Bar",
    isPro: false,
    series: "Comics Hero",
    workoutStyle: "Full-Body 3-Day",
    program: {
      duration: "55-70",
      rpe: "7-8",
      warmup: "5 min row or bike · shoulder CARS × 5 each side · band pull-aparts × 15",
      notes: "3 days/week (Mon / Wed / Fri). Strong-point priority: chest, shoulders, biceps, abs, triceps. Add weight when you hit the top rep range for all sets.",
      schedule: "Day A — Mon / Fri",
      exercises: [
        { name: "Incline Barbell Bench Press", sets: "4", reps: "6-10", rest: "2min", notes: "Upper chest emphasis — slight arch, drive through" },
        { name: "Seated Dumbbell Overhead Press", sets: "3", reps: "8-12", rest: "90s", notes: "Full range; don't lock elbows at top" },
        { name: "Wide-Grip Pull-up", sets: "3", reps: "8-12", rest: "90s", notes: "Build the wingspan; add weight via belt when 12 is easy" },
        { name: "Cable Flye (High to Low)", sets: "3", reps: "12-15", rest: "60s", notes: "Stretch at full extension — chest works hardest here" },
        { name: "Dumbbell Lateral Raise", sets: "3", reps: "12-15", rest: "60s", notes: "Side delt width; no shrugging" },
        { name: "Barbell Curl", sets: "3", reps: "10-12", rest: "60s", notes: "Full supination at top — peak contraction" },
        { name: "Weighted Crunch", sets: "3", reps: "15-20", rest: "45s", notes: "Plate on chest; squeeze and hold 1 sec at top" },
        { name: "Tricep Rope Pushdown", sets: "2", reps: "12-15", rest: "60s", notes: "Flare the rope at bottom for full contraction" },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRO TIER — 36 programs
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "hooded-brawler",
    name: "Hooded Brawler",
    description: "Muscular anti-hero build — wide back, thick traps, and powerful arms over a lean-athletic base. Tactical aggression in every movement. 5-day Push/Pull/Legs/Upper/Lower split.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "🎯",
    equipment: "Barbell · Full Cable Stack · Dumbbells · Pull-up Bar",
    isPro: true,
    series: "Comics Villain",
    workoutStyle: "Push/Pull/Legs 5-Day",
    program: {
      duration: "60-75",
      rpe: "8-9",
      warmup: "10 band pull-aparts · 10 face pulls · shoulder rotation mobility",
      notes: "5-day cycle: Push / Pull / Legs / Upper / Lower. Train to failure on the last set of isolation work. Back width and trap thickness are the calling card — never skip pull variations.",
      schedule: "Day 1 — Push",
      exercises: [
        { name: "Barbell Bench Press", sets: "4", reps: "5-8", rest: "2min", notes: "Power rep — controlled down, explosive up" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "8-12", rest: "90s", notes: "30° incline, squeeze at top" },
        { name: "Machine Shoulder Press", sets: "3", reps: "10-12", rest: "90s", notes: "Strict form — no leg drive" },
        { name: "Cable Lateral Raise", sets: "3", reps: "12-15", rest: "60s" },
        { name: "JM Press", sets: "3", reps: "8-10", rest: "90s", notes: "Tricep mass builder — elbows slightly forward" },
        { name: "Cable Pushdown (Rope)", sets: "3", reps: "12-15", rest: "60s", notes: "Flare at the bottom" },
      ],
    },
  },

  {
    slug: "banished-prince",
    name: "Banished Prince",
    description: "Warrior-athlete build forged through discipline and fire. Functional V-taper with explosive hip power and iron conditioning. 4-day Upper/Lower split, martial-arts conditioning finisher.",
    type: "anime",
    difficulty: "Intermediate",
    avatarEmoji: "🔥",
    equipment: "Barbell · Dumbbells · Pull-up Bar · Kettlebell · Jump Rope",
    isPro: true,
    series: "Anime & Animation",
    workoutStyle: "Upper/Lower 4-Day + Conditioning",
    program: {
      duration: "55-70",
      rpe: "7-8",
      warmup: "3 min jump rope · hip circles · thoracic rotation",
      notes: "4 days/week + 2 conditioning sessions. Finish every session with 10 min conditioning (jump rope, shadowboxing, or rowing). Control and discipline on every rep — no ego lifting.",
      schedule: "Upper A",
      exercises: [
        { name: "Weighted Pull-up", sets: "4", reps: "6-10", rest: "90s", notes: "Full hang; belt-load when bodyweight is too easy" },
        { name: "Incline Barbell Press", sets: "3", reps: "8-12", rest: "90s" },
        { name: "Dumbbell Row", sets: "3", reps: "10-12", rest: "90s", notes: "Brace on bench; pull to hip" },
        { name: "Seated Dumbbell OHP", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Face Pull", sets: "3", reps: "15-20", rest: "60s", notes: "External rotation at end range — shoulder health" },
        { name: "Plank w/ Shoulder Tap", sets: "3", reps: "20 taps", rest: "60s" },
        { name: "Jump Rope (finisher)", sets: "1", reps: "5 min", rest: "—", notes: "Steady pace — warrior conditioning" },
      ],
    },
  },

  {
    slug: "tactical-agent",
    name: "Tactical Agent",
    description: "Special-operations physique — low body fat, functional strength, and elite endurance. Built with military-style compound circuits and tactical conditioning. 4-day full-body program.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🔫",
    equipment: "Barbell · Dumbbells · Pull-up Bar · Kettlebell · Sandbag (optional)",
    isPro: true,
    series: "Game & Film",
    workoutStyle: "Military Full-Body 4-Day",
    program: {
      duration: "60-75",
      rpe: "8-9",
      warmup: "400m jog · 10 air squats · 10 push-ups · 10 pull-up hang",
      notes: "Short rest between exercises — this is functional fitness, not bodybuilding. Aim for smooth, controlled movement under fatigue. Conditioning always finishes the session.",
      schedule: "Day A — Strength",
      exercises: [
        { name: "Barbell Back Squat", sets: "4", reps: "5-6", rest: "2min", notes: "Controlled descent, explosive ascent" },
        { name: "Pull-up", sets: "4", reps: "8-12", rest: "90s", notes: "Dead hang start; chest to bar" },
        { name: "Dumbbell Bench Press", sets: "3", reps: "8-12", rest: "90s" },
        { name: "Kettlebell Swing", sets: "3", reps: "15-20", rest: "60s", notes: "Hip hinge — NOT a squat" },
        { name: "Farmer's Carry", sets: "3", reps: "40m walk", rest: "90s", notes: "Heavy dumbbells, tall posture, tight core" },
        { name: "Push-up (weighted)", sets: "3", reps: "15-20", rest: "60s", notes: "Plate on back for added resistance" },
        { name: "Hanging Leg Raise", sets: "3", reps: "12-15", rest: "60s" },
      ],
    },
  },

  {
    slug: "hooded-archer",
    name: "Hooded Archer",
    description: "Lean, functional athlete's body with dominant posterior chain and iron grip. V-taper built through pulling volume, rotational core work, and conditioning. 4-day split.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "🏹",
    equipment: "Barbell · Pull-up Bar · Cable Stack · Dumbbells · Resistance Bands",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Upper/Lower 4-Day",
    program: {
      duration: "55-65",
      rpe: "7-8",
      warmup: "Band pull-aparts × 15 · face pulls × 15 · arm circles",
      notes: "Pulling dominates this program. 2:1 pull-to-push volume ratio for shoulder health and back width. Add grip training on off days.",
      schedule: "Upper Pull — Day 1",
      exercises: [
        { name: "Weighted Pull-up", sets: "4", reps: "6-10", rest: "90s", notes: "Full range of motion; neutral or pronated grip" },
        { name: "Pendlay Row", sets: "3", reps: "6-8", rest: "2min", notes: "Bar from dead stop each rep — builds real thickness" },
        { name: "Cable Row (wide grip)", sets: "3", reps: "10-12", rest: "90s", notes: "Squeeze between shoulder blades at peak contraction" },
        { name: "Face Pull", sets: "3", reps: "15-20", rest: "60s", notes: "Rope at eye level; pull apart and rotate" },
        { name: "Hammer Curl", sets: "3", reps: "12-15", rest: "60s", notes: "Brachioradialis + brachialis for grip-dominant look" },
        { name: "Dead Hang", sets: "3", reps: "30-45s", rest: "60s", notes: "Improve grip endurance — essential for this archetype" },
        { name: "Pallof Press", sets: "3", reps: "12 each side", rest: "60s", notes: "Anti-rotation core stability" },
      ],
    },
  },

  {
    slug: "sensory-fighter",
    name: "Sensory Fighter",
    description: "Dense, athletic muscle at low body fat — lean face and visible conditioning define the look. Strength + combat conditioning in 4 days. Push/Pull/Legs + sparring-style finisher.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "👊",
    equipment: "Smith Machine · Cables · Dumbbells · Pull-up Bar · Speed Bag (optional)",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Push/Pull/Legs 4-Day",
    program: {
      duration: "60-75",
      rpe: "8-9",
      warmup: "5 min jump rope · 10 push-ups · scapular circles",
      notes: "Train to failure on the last set of each exercise. Add 15 min conditioning (jump rope, shadowboxing, heavy bag) at session end. No full Daredevil split exists in popular references — use Batman/Nightwing-style push/pull template to fill gap.",
      schedule: "Push Day",
      exercises: [
        { name: "Incline Smith Machine Press", sets: "3", reps: "8-12", rest: "90s", notes: "Smith allows strict control for the upper chest" },
        { name: "Machine Shoulder Press", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Pec Deck Flye", sets: "3", reps: "12-15", rest: "60s", notes: "Peak contraction — squeeze hard at the close" },
        { name: "Cable Lateral Raise", sets: "3", reps: "12-15", rest: "60s", notes: "Single-arm, cross-body cable" },
        { name: "Cable Pushdown (straight bar)", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Cable Overhead Extension", sets: "3", reps: "12-15", rest: "60s", notes: "Long-head dominant — arms behind head" },
        { name: "Jump Rope (finisher)", sets: "1", reps: "10 min", rest: "—", notes: "Alternating pace — 30s fast, 30s steady" },
      ],
    },
  },

  {
    slug: "cursed-hunter",
    name: "Cursed Hunter",
    description: "Superhuman strength packed into a lean, explosive frame. Dominant grip, powerful posterior chain, and explosive upper body. Pure functional strength — no fluff. 4-day program.",
    type: "anime",
    difficulty: "Elite",
    avatarEmoji: "⚡",
    equipment: "Barbell · Pull-up Bar · Dumbbells · Kettlebell · Trap Bar (optional)",
    isPro: true,
    series: "Anime Villain",
    workoutStyle: "Strength 4-Day",
    program: {
      duration: "60-75",
      rpe: "8-9",
      warmup: "Romanian DL × 10 bodyweight · hang scapular protraction × 10 · hip circles",
      notes: "Strength first, aesthetics follow. Explosive concentric on every rep. Grip training mandatory — use straps only for absolute max-effort sets.",
      schedule: "Lower Power — Day 1",
      exercises: [
        { name: "Trap Bar Deadlift", sets: "5", reps: "3-5", rest: "3min", notes: "Drive the floor away; explosively lock out" },
        { name: "Bulgarian Split Squat", sets: "3", reps: "6-8 each", rest: "2min", notes: "Rear foot elevated; forceful push through heel" },
        { name: "Romanian Deadlift", sets: "3", reps: "8-10", rest: "90s", notes: "Hamstring stretch at bottom — no lower-back rounding" },
        { name: "Standing Calf Raise", sets: "4", reps: "15-20", rest: "60s" },
        { name: "Farmers Carry", sets: "4", reps: "30m", rest: "90s", notes: "Max-weight dumbbells or hex plates" },
        { name: "Hanging Toes-to-Bar", sets: "3", reps: "10-15", rest: "60s" },
      ],
    },
  },

  {
    slug: "underground-fighter",
    name: "Underground Fighter",
    description: "Raw animal strength — massive neck, traps, and forearms with a brutally thick midsection. Built to survive and overpower. Brawler-strength program: 5-day high-volume assault.",
    type: "anime",
    difficulty: "Elite",
    avatarEmoji: "💪",
    equipment: "Barbell · Dumbbells · Pull-up Bar · Neck Harness · Grip Tools",
    isPro: true,
    series: "Anime Hero",
    workoutStyle: "High-Volume Brawler 5-Day",
    program: {
      duration: "75-90",
      rpe: "9-10",
      warmup: "Neck rotations · band face pull × 20 · wrist circles × 30s",
      notes: "High volume, high intensity. This is extreme programming — ensure your recovery, sleep, and nutrition are elite-level. Neck training is mandatory for this archetype.",
      schedule: "Upper Strength — Day 1",
      exercises: [
        { name: "Barbell Row (Overhand)", sets: "5", reps: "5-8", rest: "2min", notes: "Explosively pull to navel; lower with control" },
        { name: "Weighted Pull-up", sets: "4", reps: "6-10", rest: "2min" },
        { name: "T-Bar Row", sets: "4", reps: "8-12", rest: "90s", notes: "Chest supported or bent-over; maximum back width" },
        { name: "Barbell Shrug", sets: "4", reps: "12-15", rest: "90s", notes: "Heavy; hold 1 sec at top — build the mountain traps" },
        { name: "Neck Harness (front & back)", sets: "3", reps: "15-20 each direction", rest: "60s", notes: "Light resistance; protect cervical spine" },
        { name: "Wrist Roller / Plate Pinch", sets: "3", reps: "60s hold", rest: "60s", notes: "Forearm endurance and crushing grip" },
      ],
    },
  },

  {
    slug: "shadow-hunter",
    name: "Shadow Hunter",
    description: "Sleek, lethal physique — lean muscle, powerful legs, and explosive athleticism. Speed and grace over sheer mass. Athletic warrior program: 4-day Upper/Lower + speed work.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "🌑",
    equipment: "Barbell · Dumbbells · Pull-up Bar · Box (plyometrics) · Cable Stack",
    isPro: true,
    series: "Anime Hero",
    workoutStyle: "Upper/Lower 4-Day + Speed",
    program: {
      duration: "55-70",
      rpe: "7-9",
      warmup: "Leg swings × 10 each · hip flexor activation · 5 box jumps",
      notes: "Speed and explosiveness are trained before heavy grinding. Plyometric work always comes first. Quality reps over sloppy high volume.",
      schedule: "Lower Power — Day 1",
      exercises: [
        { name: "Box Jump", sets: "4", reps: "5", rest: "90s", notes: "Max height; reset fully between reps" },
        { name: "Back Squat", sets: "4", reps: "4-6", rest: "2min", notes: "Explosive concentric; build raw leg power" },
        { name: "Romanian Deadlift", sets: "3", reps: "8-10", rest: "90s" },
        { name: "Bulgarian Split Squat", sets: "3", reps: "8-10 each", rest: "90s", notes: "Single-leg strength for explosive kick power" },
        { name: "Jump Lunge", sets: "3", reps: "10 each leg", rest: "60s", notes: "Explosive, land softly — knee tracks over toe" },
        { name: "Standing Calf Raise", sets: "4", reps: "15-20", rest: "60s" },
        { name: "Hanging Leg Raise", sets: "3", reps: "15", rest: "60s" },
      ],
    },
  },

  {
    slug: "everyday-hero",
    name: "Everyday Hero",
    description: "Deceptively powerful physique achieved through relentless, high-rep conditioning. Full-body endurance and muscular balance. The legendary 100-rep protocol, now structured for progressive overload.",
    type: "anime",
    difficulty: "Intermediate",
    avatarEmoji: "🥊",
    equipment: "Bodyweight · Pull-up Bar · Jump Rope · Optional light weights",
    isPro: true,
    series: "Anime Hero",
    workoutStyle: "Conditioning Daily",
    program: {
      duration: "30-45",
      rpe: "8-10",
      warmup: "3 min light jog or jump rope · arm swings",
      notes: "The protocol: 100 push-ups, 100 sit-ups, 100 squats, 10 km run — every single day. This version progresses the push-up and squat variants for hypertrophy on top of the base protocol. Do not skip rest and recovery — overtraining is the enemy.",
      schedule: "Daily Protocol",
      exercises: [
        { name: "Push-up", sets: "10", reps: "10", rest: "30s", notes: "Build to 100 total; use elevated push-up if needed" },
        { name: "Sit-up", sets: "10", reps: "10", rest: "30s", notes: "Full sit-up, not crunch; build to 100 total" },
        { name: "Air Squat", sets: "10", reps: "10", rest: "30s", notes: "Full depth; build to 100 total" },
        { name: "Run", sets: "1", reps: "5-10 km", rest: "—", notes: "Steady pace; build distance weekly" },
        { name: "Weighted Push-up (progressive)", sets: "3", reps: "10-15", rest: "60s", notes: "Added after base protocol — add a plate for overload" },
        { name: "Pistol Squat (progression)", sets: "3", reps: "5-10 each", rest: "90s", notes: "Use TRX or door for support; build unilateral strength" },
      ],
    },
  },

  {
    slug: "rabbit-brawler",
    name: "Rabbit Brawler",
    description: "Explosive lower-body powerhouse with lean upper body — powerful glutes, quads, and devastating kicks. Plyometric-heavy program with combat conditioning. 4-day split.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "🐰",
    equipment: "Barbell · Dumbbells · Box · Cable Stack · Pull-up Bar",
    isPro: true,
    series: "Anime Hero",
    workoutStyle: "Lower Dominant 4-Day",
    program: {
      duration: "55-70",
      rpe: "8-9",
      warmup: "Hip flexor stretch · glute bridges × 20 · jump rope 3 min",
      notes: "Lower body is the priority — train legs twice per week with high intensity. Upper work supports without overshadowing. Plyometric training precedes all lifting.",
      schedule: "Legs + Plyos — Day 1",
      exercises: [
        { name: "Depth Jump", sets: "4", reps: "5", rest: "2min", notes: "Step off box, land and immediately jump for max height" },
        { name: "Back Squat", sets: "4", reps: "4-6", rest: "2min", notes: "Heavy; prioritize quad recruitment" },
        { name: "Hip Thrust", sets: "4", reps: "10-12", rest: "90s", notes: "Barbell; full hip extension at top, squeeze glutes hard" },
        { name: "Walking Lunge", sets: "3", reps: "12 each leg", rest: "90s", notes: "Dumbbell loaded; long stride for glute emphasis" },
        { name: "Box Jump (max height)", sets: "4", reps: "5", rest: "90s", notes: "Reset between reps — max effort every time" },
        { name: "Calf Raise (standing)", sets: "4", reps: "15-20", rest: "60s" },
        { name: "Hanging Leg Raise", sets: "3", reps: "15-20", rest: "60s" },
      ],
    },
  },

  {
    slug: "rogue-brawler",
    name: "Rogue Brawler",
    description: "Combat monster — exceptional strength-to-weight ratio, explosive power, and predatory conditioning. Martial arts physique with maximum functional output. 5-day mixed program.",
    type: "anime",
    difficulty: "Elite",
    avatarEmoji: "🌪️",
    equipment: "Barbell · Pull-up Bar · Dumbbells · Heavy Bag · Jump Rope",
    isPro: true,
    series: "Anime Villain",
    workoutStyle: "Combat Strength 5-Day",
    program: {
      duration: "60-75",
      rpe: "9-10",
      warmup: "10 min shadowboxing or heavy bag work · hip and shoulder mobility",
      notes: "Train like you fight — explosive, relentless, tactical. Every session ends with 15 min of combat conditioning (heavy bag, sprints, or rope work).",
      schedule: "Strength Day — Day 1",
      exercises: [
        { name: "Power Clean", sets: "4", reps: "4-6", rest: "2min", notes: "Full hip extension, pull high, catch in front rack" },
        { name: "Back Squat", sets: "4", reps: "5-6", rest: "2min" },
        { name: "Weighted Pull-up", sets: "4", reps: "6-8", rest: "90s" },
        { name: "Dumbbell Bench Press", sets: "3", reps: "8-10", rest: "90s" },
        { name: "Kettlebell Swing", sets: "4", reps: "15-20", rest: "60s", notes: "Hip snap — not a squat" },
        { name: "Heavy Bag (finisher)", sets: "5", reps: "2 min rounds", rest: "60s", notes: "Full intensity — combinations, not just jabs" },
      ],
    },
  },

  {
    slug: "alien-warlord",
    name: "Alien Warlord",
    description: "Elite mass and crushing raw strength — the ultimate dominant physique. Thick chest, barn-door back, and powerful legs. Power-hypertrophy program: 5-day split, heavy compounds.",
    type: "villain",
    difficulty: "Elite",
    avatarEmoji: "👑",
    equipment: "Barbell · Full Cable Stack · Dumbbells · Dip Station",
    isPro: true,
    series: "Comics Villain",
    workoutStyle: "Power-Hypertrophy 5-Day",
    program: {
      duration: "70-85",
      rpe: "8-9",
      warmup: "Foam roll thoracic spine · rotator cuff band work · 2 warm-up sets per exercise",
      notes: "5-day: Chest/Tri / Back/Bi / Legs / Shoulders / Arms+Core. Add weight when you hit the top of the rep range across all working sets. Caloric surplus is mandatory.",
      schedule: "Chest + Triceps — Day 1",
      exercises: [
        { name: "Flat Barbell Bench Press", sets: "5", reps: "4-6", rest: "2-3min", notes: "Strength focus — power through sticking point" },
        { name: "Incline Dumbbell Press", sets: "4", reps: "8-12", rest: "90s" },
        { name: "Cable Crossover (low to high)", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Dip (weighted)", sets: "4", reps: "8-12", rest: "90s", notes: "Upright torso for tricep emphasis" },
        { name: "Skull Crusher", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Cable Pushdown (rope)", sets: "3", reps: "12-15", rest: "60s" },
      ],
    },
  },

  {
    slug: "storm-bringer",
    name: "Storm Bringer",
    description: "Godlike size and strength — massive shoulders, thick arms, and a powerful barrel chest. Built for awe-inspiring mass. 4-day power-size split with heavy overhead pressing priority.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "⚡",
    equipment: "Barbell · Full Cable Stack · Dumbbells · Dip Station",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Power-Size 4-Day",
    program: {
      duration: "65-80",
      rpe: "8-9",
      warmup: "Band pull-aparts × 20 · rotator band stretch · 2 warm-up sets OHP",
      notes: "Overhead pressing is king for this archetype. Prioritize shoulder size and thickness. Caloric surplus for size gains — this is a mass-building program.",
      schedule: "Shoulders + Arms — Day 1",
      exercises: [
        { name: "Barbell Overhead Press", sets: "5", reps: "4-6", rest: "3min", notes: "Strict form; drive through the sticking point" },
        { name: "Dumbbell Lateral Raise", sets: "4", reps: "12-15", rest: "60s", notes: "Side delt width — crucial for the god-tier look" },
        { name: "Arnold Press", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Rear Delt Dumbbell Fly", sets: "3", reps: "15-20", rest: "60s", notes: "Bent over or on incline bench" },
        { name: "EZ Bar Curl", sets: "4", reps: "10-12", rest: "90s" },
        { name: "Overhead Tricep Extension (cable)", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Barbell Shrug", sets: "3", reps: "12-15", rest: "60s", notes: "Heavy; hold 2 sec at top" },
      ],
    },
  },

  {
    slug: "armored-inventor",
    name: "Armored Inventor",
    description: "Lean, athletic build with functional upper-body strength. Visible musculature, V-taper aesthetics, and surprising power. 4-day Push/Pull/Legs/Full-Body program.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "🔩",
    equipment: "Barbell · Dumbbells · Cable Stack · Pull-up Bar",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Push/Pull/Legs 4-Day",
    program: {
      duration: "55-70",
      rpe: "7-8",
      warmup: "5 min bike or row · band pull-aparts × 15 · wrist mobility",
      notes: "Build the functional chassis first. Balanced physique — nothing overpowers the frame. 4-day split: Push / Pull / Legs / Full-body.",
      schedule: "Push Day",
      exercises: [
        { name: "Incline Barbell Bench Press", sets: "4", reps: "6-10", rest: "90s" },
        { name: "Seated Dumbbell OHP", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Cable Lateral Raise", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Dip", sets: "3", reps: "10-15", rest: "90s", notes: "Add weight via belt when bodyweight is easy" },
        { name: "Pec Deck Flye", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Tricep Pushdown (rope)", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Ab Wheel Rollout", sets: "3", reps: "10-15", rest: "60s", notes: "Keep hips level; don't let lower back collapse" },
      ],
    },
  },

  {
    slug: "vampire-lord",
    name: "Vampire Lord",
    description: "Imposing villain physique — tall, menacing, dramatically wide back, and powerful arms. Dominant aesthetics through extreme V-taper and dark authority. 5-day classic bodybuilding split.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "🧛",
    equipment: "Full Cable Stack · Barbell · Dumbbells · Pull-up Bar",
    isPro: true,
    series: "Anime Villain",
    workoutStyle: "Classic Bodybuilding 5-Day",
    program: {
      duration: "65-80",
      rpe: "8-9",
      warmup: "Lat activation band pull-downs × 15 · scapular depression holds",
      notes: "5-day: Back + Bi / Chest + Tri / Legs / Shoulders / Arms. Back width is the signature — prioritize every pull variation. Slow, controlled reps for maximum muscle damage.",
      schedule: "Back + Biceps — Day 1",
      exercises: [
        { name: "Wide-Grip Pull-up", sets: "4", reps: "8-12", rest: "90s", notes: "Full hang; chest to bar; add weight when 12 is easy" },
        { name: "Lat Pulldown (wide grip)", sets: "4", reps: "10-12", rest: "90s", notes: "Drive elbows to hips; squeeze lats" },
        { name: "T-Bar Row", sets: "4", reps: "8-12", rest: "90s", notes: "Chest supported or bent-over; thickness builder" },
        { name: "Straight-Arm Pulldown", sets: "3", reps: "12-15", rest: "60s", notes: "Isolates lats; arms stay straight throughout" },
        { name: "Incline Dumbbell Curl", sets: "3", reps: "10-12", rest: "60s", notes: "Arms hang back to stretch the long head" },
        { name: "Concentration Curl", sets: "3", reps: "12-15", rest: "60s", notes: "Peak contraction — squeeze hard at top" },
      ],
    },
  },

  {
    slug: "jungle-king",
    name: "Jungle King",
    description: "Royal warrior physique — powerful, lean, and technically flawless. Dominant V-taper with strong legs and exceptional conditioning. 4-day athlete split with martial arts conditioning.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🐾",
    equipment: "Barbell · Pull-up Bar · Dumbbells · Cable Stack · Plyometric Box",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Athlete 4-Day",
    program: {
      duration: "60-75",
      rpe: "8-9",
      warmup: "Hip mobility sequence · thoracic rotations · 5 box jumps",
      notes: "Functional athletic strength over pure size. Legs and back are the priority. Finish sessions with 15 min conditioning — sprints, box jumps, or combat drills.",
      schedule: "Lower Body — Day 1",
      exercises: [
        { name: "Power Clean", sets: "4", reps: "4-5", rest: "2min", notes: "Develop explosive power — the hallmark of warrior athletes" },
        { name: "Front Squat", sets: "4", reps: "5-8", rest: "2min", notes: "Upright torso; deep squat for full quad activation" },
        { name: "Romanian Deadlift", sets: "3", reps: "8-10", rest: "90s" },
        { name: "Walking Lunge", sets: "3", reps: "12 each leg", rest: "90s", notes: "Barbell on back or dumbbells — build unilateral strength" },
        { name: "Box Jump (max height)", sets: "4", reps: "5", rest: "90s" },
        { name: "Standing Calf Raise", sets: "4", reps: "15-20", rest: "60s" },
        { name: "Sprint Intervals", sets: "6", reps: "30s all-out", rest: "90s", notes: "Conditioning finisher — warrior endurance" },
      ],
    },
  },

  {
    slug: "golden-challenger",
    name: "Golden Challenger",
    description: "Combat-dominant physique — shredded, powerful, and psychologically imposing. Built for strength AND aesthetics. Athletic muscle with combat conditioning overlay. 5-day program.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "🥇",
    equipment: "Barbell · Full Cable Stack · Dumbbells · Pull-up Bar · Heavy Bag",
    isPro: true,
    series: "Comics Villain",
    workoutStyle: "Combat Hypertrophy 5-Day",
    program: {
      duration: "65-80",
      rpe: "8-9",
      warmup: "5 min shadowboxing · band pull-aparts × 20 · hip mobility",
      notes: "This archetype demands both aesthetics and functional combat power. No single body part is a weak link. 5-day: Push / Pull / Legs / Combat + Upper / Conditioning.",
      schedule: "Pull Day",
      exercises: [
        { name: "Weighted Pull-up", sets: "4", reps: "6-10", rest: "90s" },
        { name: "Barbell Row", sets: "4", reps: "6-8", rest: "2min", notes: "Overhand grip; pull explosively to navel" },
        { name: "Cable Row (neutral grip)", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Face Pull", sets: "3", reps: "15-20", rest: "60s" },
        { name: "EZ Bar Curl", sets: "3", reps: "10-12", rest: "60s" },
        { name: "Incline Dumbbell Curl", sets: "3", reps: "12-15", rest: "60s", notes: "Stretch-dominant curl for peak development" },
        { name: "Heavy Bag (finisher)", sets: "4", reps: "3 min rounds", rest: "60s", notes: "Offensive combinations — develop combat conditioning" },
      ],
    },
  },

  {
    slug: "lethal-brute",
    name: "Lethal Brute",
    description: "Massive, terrifying physique — symbiotic size and predatory conditioning. Dominant chest, wide back, and imposing mass throughout. Heavy-volume mass-building program.",
    type: "villain",
    difficulty: "Elite",
    avatarEmoji: "🕷️",
    equipment: "Barbell · Full Cable Stack · Dumbbells · Dip Station",
    isPro: true,
    series: "Comics Villain",
    workoutStyle: "Mass Building 5-Day",
    program: {
      duration: "70-90",
      rpe: "9-10",
      warmup: "Foam roll chest and lats · rotator band work · 3 warm-up sets bench",
      notes: "Maximum size program. Caloric surplus essential. 5-day: Chest / Back / Legs / Shoulders / Arms. Focus on progressive overload — add weight or reps every session.",
      schedule: "Chest — Day 1",
      exercises: [
        { name: "Flat Barbell Bench Press", sets: "5", reps: "4-8", rest: "3min", notes: "Absolute strength — touch and press every rep" },
        { name: "Incline Dumbbell Press", sets: "4", reps: "8-12", rest: "90s" },
        { name: "Weighted Dip", sets: "4", reps: "8-12", rest: "90s", notes: "Heavy loading via dip belt; forward lean for chest" },
        { name: "Cable Crossover (high to low)", sets: "3", reps: "12-15", rest: "60s", notes: "Full chest sweep — squeeze at center" },
        { name: "Dumbbell Pullover", sets: "3", reps: "12-15", rest: "60s", notes: "Stretch the chest and lats simultaneously" },
        { name: "Pec Deck", sets: "3", reps: "15-20", rest: "60s", notes: "Squeeze and hold at peak; finish the chest completely" },
      ],
    },
  },

  {
    slug: "proud-prince",
    name: "Proud Prince",
    description: "Elite warrior physique built on relentless pride and absolute training discipline. Massive upper body, thick traps, explosive power. 5-day high-volume power-hypertrophy program.",
    type: "anime",
    difficulty: "Elite",
    avatarEmoji: "👸",
    equipment: "Barbell · Full Cable Stack · Dumbbells · Pull-up Bar",
    isPro: true,
    series: "Anime Anti-Hero",
    workoutStyle: "Power-Hypertrophy 5-Day",
    program: {
      duration: "70-85",
      rpe: "9-10",
      warmup: "Band pull-aparts × 20 · rear delt warm-up × 15 · 2 warm-up sets barbell",
      notes: "Elite-level intensity. Train with pride on every rep — no half-measures. 5-day: Back + Traps / Chest / Legs / Shoulders / Arms + Core. Progressive overload every session.",
      schedule: "Back + Traps — Day 1",
      exercises: [
        { name: "Barbell Row", sets: "5", reps: "5-8", rest: "2min", notes: "Massive pulling strength — core of the program" },
        { name: "Weighted Pull-up", sets: "4", reps: "6-10", rest: "90s" },
        { name: "T-Bar Row", sets: "4", reps: "8-12", rest: "90s", notes: "Chest supported for strict form" },
        { name: "Barbell Shrug", sets: "5", reps: "10-15", rest: "90s", notes: "Heavy; 2 sec hold at top — build the mountain traps" },
        { name: "Cable Row (neutral grip)", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Lat Pulldown (wide)", sets: "3", reps: "12-15", rest: "60s", notes: "Back width — the V drops from these" },
      ],
    },
  },

  {
    slug: "cursed-king",
    name: "Cursed King",
    description: "Supernatural calisthenics mastery — lean, powerful, and technically terrifying. Bodyweight control at its absolute peak. 4-day weighted calisthenics program with skill progressions.",
    type: "anime",
    difficulty: "Elite",
    avatarEmoji: "👁️",
    equipment: "Pull-up Bar · Dip Station · Rings · Parallettes · Weight Vest",
    isPro: true,
    series: "Anime Villain",
    workoutStyle: "Weighted Calisthenics 4-Day",
    program: {
      duration: "60-75",
      rpe: "9-10",
      warmup: "10 band pull-aparts · 10 scapular pull-ups · shoulder CARS × 5 each",
      notes: "4-day: Upper Push / Upper Pull / Lower / Skills. Skill training is non-negotiable — the goal is absolute body mastery. Use weight vest for added difficulty once form is perfect.",
      schedule: "Upper Push (Calisthenics)",
      exercises: [
        { name: "Weighted Muscle-up", sets: "4", reps: "4-6", rest: "2min", notes: "Weight vest; explosive pull through transition" },
        { name: "Archer Push-up", sets: "4", reps: "6-8 each side", rest: "90s", notes: "Full range; transition through a perfect push-up" },
        { name: "Ring Dip", sets: "4", reps: "8-12", rest: "90s", notes: "Lock out at top; control the descent" },
        { name: "Pike Push-up", sets: "3", reps: "10-15", rest: "60s", notes: "Progress toward handstand push-up" },
        { name: "L-sit Hold (bars or rings)", sets: "4", reps: "15-30s", rest: "60s", notes: "Absolute core strength — depress the scapulae hard" },
        { name: "Front Lever Progression", sets: "3", reps: "5-10s hold", rest: "90s", notes: "Tuck / advanced tuck / one-leg / full" },
      ],
    },
  },

  {
    slug: "legendary-warlord",
    name: "Legendary Warlord",
    description: "Imposing war-god physique — overwhelming size, supreme power, and battlefield conditioning. Dominant in every dimension. Heavy 5-day mass-and-strength program.",
    type: "anime",
    difficulty: "Elite",
    avatarEmoji: "⚔️",
    equipment: "Barbell · Full Cable Stack · Dumbbells · Dip Station",
    isPro: true,
    series: "Anime Villain",
    workoutStyle: "Mass & Strength 5-Day",
    program: {
      duration: "70-90",
      rpe: "9-10",
      warmup: "2 warm-up sets every major lift · hip mobility · thoracic rotation",
      notes: "Pure intimidation through mass and power. 5-day: Chest/Tri / Back/Bi / Legs / Shoulders / Arms. No fluff — every set builds. Caloric surplus mandatory.",
      schedule: "Back + Biceps — Day 2",
      exercises: [
        { name: "Deadlift", sets: "5", reps: "3-5", rest: "3min", notes: "Absolute strength — the war-god's foundation" },
        { name: "Weighted Pull-up", sets: "4", reps: "6-10", rest: "2min" },
        { name: "Barbell Row", sets: "4", reps: "6-8", rest: "2min" },
        { name: "Lat Pulldown", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Cable Row", sets: "3", reps: "10-12", rest: "90s" },
        { name: "EZ Bar Curl", sets: "4", reps: "10-12", rest: "90s" },
        { name: "Hammer Curl", sets: "3", reps: "12-15", rest: "60s" },
      ],
    },
  },

  {
    slug: "nine-tails-ninja",
    name: "Nine-Tails Ninja",
    description: "Endurance-dominant warrior physique — lean, resilient, and capable of enormous training volume. High-rep functional program built for never-quit output. 5-day split.",
    type: "anime",
    difficulty: "Intermediate",
    avatarEmoji: "🍥",
    equipment: "Pull-up Bar · Barbell · Dumbbells · Jump Rope",
    isPro: true,
    series: "Anime Hero",
    workoutStyle: "Functional Endurance 5-Day",
    program: {
      duration: "55-70",
      rpe: "7-8",
      warmup: "Jump rope 5 min · hip circles · band activation",
      notes: "High rep counts, moderate weight. Build the body that never gives up. 5-day: Upper / Lower / Full-body conditioning / Upper / Lower. 3+ conditioning sessions per week.",
      schedule: "Upper — Day 1",
      exercises: [
        { name: "Pull-up", sets: "5", reps: "10-15", rest: "90s", notes: "High rep — endurance over max strength" },
        { name: "Push-up (weighted)", sets: "5", reps: "15-20", rest: "90s", notes: "Plate on back; build the endurance base" },
        { name: "Dumbbell Row", sets: "4", reps: "12-15", rest: "60s" },
        { name: "Pike Push-up", sets: "4", reps: "12-15", rest: "60s" },
        { name: "Face Pull", sets: "3", reps: "20-25", rest: "60s" },
        { name: "Jump Rope Intervals", sets: "5", reps: "1 min fast / 30s rest", rest: "30s", notes: "Cardiovascular endurance foundation" },
        { name: "Plank", sets: "3", reps: "60s hold", rest: "45s" },
      ],
    },
  },

  {
    slug: "rubber-pirate",
    name: "Rubber Pirate",
    description: "Compact, explosive physique with extraordinary flexibility and endurance. Unique combination of rubber-band mobility and sledgehammer power. High-volume conditioning program.",
    type: "anime",
    difficulty: "Intermediate",
    avatarEmoji: "🍖",
    equipment: "Pull-up Bar · Dumbbells · Jump Rope · Resistance Bands",
    isPro: true,
    series: "Anime Hero",
    workoutStyle: "Power Conditioning 4-Day",
    program: {
      duration: "50-65",
      rpe: "7-9",
      warmup: "Full-body dynamic stretch · jump rope 3 min · arm swings and leg kicks",
      notes: "Combine strength training with flexibility and conditioning. Mobility work is mandatory — train through full range of motion always.",
      schedule: "Upper Power — Day 1",
      exercises: [
        { name: "Explosive Push-up", sets: "4", reps: "10-15", rest: "60s", notes: "Hands leave the floor; clap at top for advanced" },
        { name: "Dumbbell Row", sets: "4", reps: "12-15", rest: "60s" },
        { name: "Jump Squat", sets: "4", reps: "15-20", rest: "60s", notes: "Maximum height; land softly and reset" },
        { name: "Pull-up", sets: "4", reps: "8-12", rest: "90s" },
        { name: "Band Pull-Apart", sets: "3", reps: "20-25", rest: "45s", notes: "Shoulder health and rear delt activation" },
        { name: "Hollow Body Hold", sets: "3", reps: "30-45s", rest: "60s", notes: "Lower back pressed to floor; arms by ears" },
        { name: "Jump Rope (finisher)", sets: "1", reps: "10 min", rest: "—", notes: "Steady cardio conditioning at moderate pace" },
      ],
    },
  },

  {
    slug: "speedster",
    name: "Speedster",
    description: "Speed-dominant physique — explosive lower body, functional conditioning, and lean athletic build. Plyometric speed-strength protocol with short-rest conditioning. 4-day program.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "💨",
    equipment: "Barbell · Plyometric Box · Dumbbells · Sprint Track or Treadmill",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Speed-Strength 4-Day",
    program: {
      duration: "50-65",
      rpe: "8-10",
      warmup: "5 min dynamic warm-up: leg swings, high knees, butt kicks, ankle circles",
      notes: "Speed and power first — always. Rest fully between plyometric sets. Sprint training is mandatory. 4-day: Speed + Lower / Upper Strength / Speed + Lower / Upper Strength.",
      schedule: "Speed + Lower — Day 1",
      exercises: [
        { name: "Sprint Intervals", sets: "8", reps: "40m sprint", rest: "2min", notes: "Max effort every rep; rest completely between sprints" },
        { name: "Box Jump", sets: "5", reps: "5", rest: "90s", notes: "Max height; step down — don't jump down" },
        { name: "Jump Squat", sets: "4", reps: "6", rest: "2min", notes: "Light bar (20-30% 1RM); maximum acceleration" },
        { name: "Plyometric Split Lunge", sets: "4", reps: "6 each leg", rest: "90s", notes: "Explosive switch; soft landing — absorb force" },
        { name: "Broad Jump", sets: "4", reps: "5", rest: "90s", notes: "Horizontal power; reset between reps" },
        { name: "Standing Calf Raise (explosive)", sets: "4", reps: "15-20", rest: "60s", notes: "Fast contraction; build the athletic ankle spring" },
      ],
    },
  },

  {
    slug: "regenerating-mercenary",
    name: "Regenerating Mercenary",
    description: "Irreverent anti-hero with a surprisingly shredded physique. Full-body conditioning, high work capacity, and balanced strength. 4-day functional chaos program.",
    type: "villain",
    difficulty: "Intermediate",
    avatarEmoji: "💀",
    equipment: "Barbell · Dumbbells · Pull-up Bar · Sled (optional) · Kettlebell",
    isPro: true,
    series: "Comics Villain",
    workoutStyle: "Full-Body Conditioning 4-Day",
    program: {
      duration: "45-60",
      rpe: "7-9",
      warmup: "Jumping jacks × 30 · 5 burpees · wrist and shoulder circles",
      notes: "High-effort, never-quit training style. Short rest periods for conditioning overlay. 4-day: Full-body A / Full-body B / Conditioning / Rest. Mix it up — monotony is the enemy.",
      schedule: "Full-Body A",
      exercises: [
        { name: "Barbell Back Squat", sets: "4", reps: "6-10", rest: "90s" },
        { name: "Push-up (weighted)", sets: "4", reps: "15-20", rest: "60s" },
        { name: "Dumbbell Row", sets: "4", reps: "12-15 each", rest: "60s" },
        { name: "Kettlebell Swing", sets: "4", reps: "20", rest: "60s", notes: "Hip snap; this is power, not a squat" },
        { name: "Pull-up", sets: "3", reps: "max reps", rest: "90s", notes: "Go to failure" },
        { name: "Burpee", sets: "3", reps: "15", rest: "60s", notes: "Conditioning finisher" },
        { name: "Plank", sets: "3", reps: "45-60s", rest: "45s" },
      ],
    },
  },

  {
    slug: "mad-giant",
    name: "Mad Giant",
    description: "Colossus-level strength and imposing mass. Built to crush — massive deadlifts, heavy squats, and superhuman pressing. 4-day power-building program for maximum size and strength.",
    type: "villain",
    difficulty: "Elite",
    avatarEmoji: "💜",
    equipment: "Barbell · Dumbbells · Full Cable Stack · Dip Station",
    isPro: true,
    series: "Comics Villain",
    workoutStyle: "Power-Building 4-Day",
    program: {
      duration: "70-90",
      rpe: "9-10",
      warmup: "10 min mobility: thoracic, hip, shoulder · 3 warm-up sets every major lift",
      notes: "4-day: Upper Strength / Lower Strength / Upper Hypertrophy / Lower Hypertrophy. Progressive overload is the only rule. Rest as long as needed between heavy sets.",
      schedule: "Upper Strength — Day 1",
      exercises: [
        { name: "Barbell Bench Press", sets: "5", reps: "3-5", rest: "3-5min", notes: "Absolute strength — your performance on this exercise defines progress" },
        { name: "Weighted Pull-up", sets: "5", reps: "4-6", rest: "3min" },
        { name: "Barbell Overhead Press", sets: "4", reps: "4-6", rest: "3min" },
        { name: "Barbell Row", sets: "4", reps: "5-8", rest: "2-3min", notes: "Overhand grip; pull to navel" },
        { name: "Weighted Dip", sets: "3", reps: "6-10", rest: "2min" },
        { name: "Farmer's Carry", sets: "4", reps: "40m", rest: "2min", notes: "Maximum weight; build the grip and armor" },
      ],
    },
  },

  {
    slug: "ocean-king",
    name: "Ocean King",
    description: "Powerfully athletic physique — broad, muscular, and built for aquatic dominance. Trident-worthy shoulders, powerful legs, and impressive overall mass. 4-day athlete program.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🔱",
    equipment: "Barbell · Dumbbells · Full Cable Stack · Pull-up Bar",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Athlete 4-Day",
    program: {
      duration: "60-75",
      rpe: "8-9",
      warmup: "Shoulder circles · hip mobility · 2 warm-up sets OHP",
      notes: "4-day: Shoulders/Back / Chest/Tri / Legs / Full-body + conditioning. Shoulders are the visual priority — wide, capped, and powerful.",
      schedule: "Shoulders + Back — Day 1",
      exercises: [
        { name: "Barbell Overhead Press", sets: "5", reps: "5-8", rest: "2min", notes: "Dominant shoulder builder — the trident shoulder look" },
        { name: "Dumbbell Lateral Raise", sets: "4", reps: "12-15", rest: "60s", notes: "Lead with the elbow; build the cap" },
        { name: "Wide-Grip Pull-up", sets: "4", reps: "8-12", rest: "90s" },
        { name: "Face Pull", sets: "3", reps: "20-25", rest: "60s", notes: "Rear delt + rotator health — essential for overhead pressing" },
        { name: "Cable Lateral Raise", sets: "3", reps: "15-20", rest: "60s" },
        { name: "Rear Delt Dumbbell Fly", sets: "3", reps: "15-20", rest: "60s" },
        { name: "Barbell Shrug", sets: "3", reps: "12-15", rest: "60s", notes: "Traps for the king's silhouette" },
      ],
    },
  },

  {
    slug: "retired-assassin",
    name: "Retired Assassin",
    description: "Compact, deadly functional physique — lean muscle, tactical strength, and extraordinary conditioning. Built around combat efficiency and relentless precision. 4-day program.",
    type: "villain",
    difficulty: "Advanced",
    avatarEmoji: "🖊️",
    equipment: "Barbell · Dumbbells · Pull-up Bar · Kettlebell · Heavy Bag",
    isPro: true,
    series: "Game & Film",
    workoutStyle: "Tactical Strength 4-Day",
    program: {
      duration: "55-70",
      rpe: "8-9",
      warmup: "10 min dynamic mobility · 10 pull-up hangs · wrist preparation",
      notes: "Efficient, precise training — nothing wasted. 4-day: Upper Push / Lower / Upper Pull / Full-body conditioning. Finish every session with martial arts conditioning.",
      schedule: "Upper Pull — Day 3",
      exercises: [
        { name: "Weighted Pull-up", sets: "5", reps: "5-8", rest: "2min", notes: "Precision movement — full hang, controlled ascent" },
        { name: "Barbell Row", sets: "4", reps: "6-8", rest: "2min" },
        { name: "Face Pull", sets: "3", reps: "15-20", rest: "60s" },
        { name: "Incline Dumbbell Curl", sets: "3", reps: "10-12", rest: "60s" },
        { name: "Hammer Curl", sets: "3", reps: "12-15", rest: "60s", notes: "Forearm + brachialis — tactical grip strength" },
        { name: "Dead Hang", sets: "3", reps: "45-60s", rest: "60s", notes: "Grip endurance — never let go" },
        { name: "Heavy Bag Combinations (finisher)", sets: "5", reps: "2 min rounds", rest: "60s" },
      ],
    },
  },

  {
    slug: "spartan-warrior",
    name: "Spartan Warrior",
    description: "Brutalist strength — raw power, battle-hardened conditioning, and terrifying work capacity. Built on ancient warrior principles updated for modern iron. 4-day program.",
    type: "villain",
    difficulty: "Elite",
    avatarEmoji: "🛡️",
    equipment: "Barbell · Pull-up Bar · Dip Station · Kettlebell · Chains (optional)",
    isPro: true,
    series: "Game & Film",
    workoutStyle: "Warrior Strength 4-Day",
    program: {
      duration: "65-80",
      rpe: "9-10",
      warmup: "Hip mobility deep stretch · shoulder CARS × 5 each side · 2 warm-up sets deadlift",
      notes: "Brutal strength. No comfort. 4-day: Full Strength / Upper / Full Strength / Conditioning + Legs. Embrace the grind — this is where men become warriors.",
      schedule: "Full Strength — Day 1",
      exercises: [
        { name: "Deadlift", sets: "5", reps: "3-5", rest: "4min", notes: "The warrior's test — rip the floor apart" },
        { name: "Barbell Back Squat", sets: "5", reps: "4-6", rest: "3min" },
        { name: "Overhead Press", sets: "4", reps: "5-8", rest: "2min" },
        { name: "Weighted Pull-up", sets: "4", reps: "6-8", rest: "2min" },
        { name: "Farmer's Carry", sets: "4", reps: "50m", rest: "2min", notes: "Maximum weight — strengthen the warrior frame" },
        { name: "Sled Push", sets: "4", reps: "30m", rest: "2min", notes: "Substitute: prowler sled, sled with plates, or sled drag" },
      ],
    },
  },

  {
    slug: "elite-scout",
    name: "Elite Scout",
    description: "Lean, powerful warrior physique built for aerial combat and sustained output. Exceptional grip, back strength, and functional endurance. 4-day strength + grip + endurance program.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "⚔️",
    equipment: "Pull-up Bar · Barbell · Dumbbells · Kettlebell · Rings",
    isPro: true,
    series: "Anime Hero",
    workoutStyle: "Strength + Endurance 4-Day",
    program: {
      duration: "55-70",
      rpe: "8-9",
      warmup: "10 dead hangs · 10 scapular pull-ups · hip flexor mobility",
      notes: "4-day: Pull + Grip / Push + Core / Lower Power / Full-body Endurance. Grip training is mandatory — dead hangs and loaded carries every session. Never skip the conditioning finisher.",
      schedule: "Pull + Grip — Day 1",
      exercises: [
        { name: "Weighted Pull-up", sets: "5", reps: "5-8", rest: "2min", notes: "Full dead hang to chin over bar; add weight via belt" },
        { name: "Inverted Row", sets: "4", reps: "12-15", rest: "90s", notes: "Chest to bar; body parallel to floor" },
        { name: "Face Pull", sets: "3", reps: "20", rest: "60s" },
        { name: "Dead Hang", sets: "4", reps: "60s", rest: "90s", notes: "Grip endurance — the core of the elite scout" },
        { name: "Farmer's Carry", sets: "4", reps: "40m", rest: "90s", notes: "Heavy dumbbells; grip fails last" },
        { name: "Box Jump", sets: "4", reps: "5", rest: "90s", notes: "Explosive lower-body power for rapid movement" },
        { name: "Kettlebell Swing", sets: "3", reps: "20", rest: "60s", notes: "Endurance finisher — hip hinge power" },
      ],
    },
  },

  {
    slug: "blindfolded-sorcerer",
    name: "Blindfolded Sorcerer",
    description: "Back width, peaked arms, and strong core — the visual signature of elite power. 4-day Upper/Lower split with volume emphasis. Athletic V-taper through cable and calisthenics.",
    type: "anime",
    difficulty: "Advanced",
    avatarEmoji: "🙈",
    equipment: "Full Cable Stack · Pull-up Bar · Barbell · Dumbbells",
    isPro: true,
    series: "Anime Hero",
    workoutStyle: "Upper/Lower 4-Day",
    program: {
      duration: "60-75",
      rpe: "7-9",
      warmup: "Lat activation pull-down × 10 · arm circles · band pull-aparts × 15",
      notes: "4-day: Upper A / Lower A / Upper B / Lower B. Pull volume exceeds push. Rest 1–2 reps short of failure on big lifts; go to failure on isolation work.",
      schedule: "Upper A",
      exercises: [
        { name: "Weighted Pull-up", sets: "4", reps: "5-8", rest: "2min", notes: "Back width is the signature — full range, every rep" },
        { name: "Cable Row (neutral grip)", sets: "4", reps: "10-12", rest: "90s", notes: "Pull to lower chest; squeeze shoulder blades" },
        { name: "Face Pull", sets: "3", reps: "15-20", rest: "60s" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "8-12", rest: "90s" },
        { name: "Dumbbell OHP", sets: "3", reps: "10-12", rest: "90s" },
        { name: "Cable Pushdown (rope)", sets: "3", reps: "12-15", rest: "60s" },
        { name: "EZ Bar Curl", sets: "3", reps: "10-12", rest: "60s" },
        { name: "Cable Lateral Raise", sets: "3", reps: "12-15", rest: "60s", notes: "Constant tension through full range" },
      ],
    },
  },

  {
    slug: "shield-soldier",
    name: "Shield Soldier",
    description: "Peak patriot physique — heroic chest, cannonball shoulders, and a powerful back. The front frame and back width define this look. 3-day power-building with muscle prioritization.",
    type: "hero",
    difficulty: "Intermediate",
    avatarEmoji: "🛡️",
    equipment: "Barbell · Dumbbells · Cable Stack · Pull-up Bar",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Full-Body 3-Day",
    program: {
      duration: "55-70",
      rpe: "7-8",
      warmup: "Band pull-aparts × 20 · shoulder circles · 5 push-ups to warm up chest",
      notes: "3-day (Mon/Wed/Fri): Build the Front Frame / Back + Pulling / Legs + Base. Muscle prioritization over general training — target specific muscles for the heroic look.",
      schedule: "Build the Front Frame — Day 1",
      exercises: [
        { name: "Barbell Bench Press", sets: "4", reps: "6-10", rest: "2min", notes: "Chest focus — the front frame's anchor" },
        { name: "Cable Flye (mid-height)", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Dumbbell OHP", sets: "4", reps: "8-12", rest: "90s", notes: "Side deltoid priority for shoulder width" },
        { name: "Cable Lateral Raise", sets: "3", reps: "12-15", rest: "60s", notes: "Build the front + side delt cap" },
        { name: "Incline Dumbbell Press", sets: "3", reps: "10-12", rest: "90s", notes: "Upper chest fullness for heroic silhouette" },
        { name: "Tricep Rope Pushdown", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Plank", sets: "3", reps: "45-60s", rest: "45s", notes: "Shield soldier's iron core" },
      ],
    },
  },

  {
    slug: "feral-brawler",
    name: "Feral Brawler",
    description: "Dense, compact muscle mass with dominant shoulders, chest, biceps, and quads. Built like a wrecking ball — short, stocky, and extremely powerful. High-volume dense-muscle program.",
    type: "hero",
    difficulty: "Advanced",
    avatarEmoji: "🐺",
    equipment: "Barbell · Dumbbells · Cable Stack · Pull-up Bar",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Dense Muscle 5-Day",
    program: {
      duration: "65-80",
      rpe: "8-9",
      warmup: "Shoulder CARS · foam roll lats · 2 warm-up sets each major lift",
      notes: "5-day: Chest + Tri / Back + Bi / Legs / Shoulders + Trap / Arms + Core. Dense, compact muscle — volume over aesthetics. Forearms and grip are a priority for this archetype.",
      schedule: "Chest + Triceps — Day 1",
      exercises: [
        { name: "Flat Barbell Bench Press", sets: "5", reps: "5-8", rest: "2min", notes: "Dense chest strength — wide, powerful pecs" },
        { name: "Incline Dumbbell Press", sets: "4", reps: "8-12", rest: "90s" },
        { name: "Dip (weighted)", sets: "4", reps: "8-12", rest: "90s", notes: "Upright for triceps; lean forward for chest" },
        { name: "Cable Crossover", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Skull Crusher", sets: "4", reps: "10-12", rest: "90s" },
        { name: "Cable Pushdown (bar)", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Wrist Roller", sets: "3", reps: "3 full rolls", rest: "60s", notes: "Forearm endurance — the feral brawler's grip" },
      ],
    },
  },

  {
    slug: "masked-titan",
    name: "Masked Titan",
    description: "Overwhelming mass from chest through traps to quads — the physique of absolute physical dominance. Massive front yoke, armored back, and an iron base. 3-day heavy split.",
    type: "villain",
    difficulty: "Elite",
    avatarEmoji: "🎭",
    equipment: "Barbell · Dumbbells · Full Cable Stack · Dip Station",
    isPro: true,
    series: "Comics Villain",
    workoutStyle: "Powerbuilding 3-Day",
    program: {
      duration: "65-80",
      rpe: "9-10",
      warmup: "Foam roll chest and traps · 2-3 progressive warm-up sets each movement",
      notes: "3-day heavy split: Front Yoke / Thicken the Armor / Build the Base. 0.8–1g protein per lb bodyweight. Caloric surplus for growth. Core work after Days 1 and 2.",
      schedule: "Day 1 — Front Yoke",
      exercises: [
        { name: "Barbell Bench Press", sets: "5", reps: "4-6", rest: "3min", notes: "Massive chest — the front yoke's anchor" },
        { name: "Incline Barbell Press", sets: "4", reps: "6-8", rest: "2min" },
        { name: "Dumbbell OHP", sets: "4", reps: "8-10", rest: "90s" },
        { name: "Barbell Shrug", sets: "4", reps: "12-15", rest: "90s", notes: "Heavy; hold 2 sec at top" },
        { name: "Barbell Curl", sets: "4", reps: "10-12", rest: "90s" },
        { name: "Tricep Dip (weighted)", sets: "3", reps: "8-12", rest: "90s" },
        { name: "Cable Crunch", sets: "3", reps: "15-20", rest: "60s" },
      ],
    },
  },

  {
    slug: "energy-warrior",
    name: "Energy Warrior",
    description: "The pinnacle physique — explosive power, elite musculature, and relentless training volume. Full-body high-volume program with power development and conditioning overlay.",
    type: "anime",
    difficulty: "Elite",
    avatarEmoji: "⭐",
    equipment: "Barbell · Full Cable Stack · Dumbbells · Pull-up Bar · Plyometric Equipment",
    isPro: true,
    series: "Anime Hero",
    workoutStyle: "High-Volume Power 6-Day",
    program: {
      duration: "70-90",
      rpe: "9-10",
      warmup: "Full dynamic warm-up 10 min: jumps, swings, rotations · 2-3 progressive warm-up sets",
      notes: "Elite-level 6-day program: Chest + Shoulders / Back + Traps / Legs Power / Arms + Core / Upper Strength / Lower Conditioning. Requires elite recovery — sleep 8+ hours, eat in surplus. Maximum output every session.",
      schedule: "Chest + Shoulders — Day 1",
      exercises: [
        { name: "Barbell Bench Press", sets: "5", reps: "5-8", rest: "2min" },
        { name: "Incline Dumbbell Press", sets: "4", reps: "8-12", rest: "90s" },
        { name: "Barbell Overhead Press", sets: "5", reps: "5-8", rest: "2min", notes: "Strict — no leg drive" },
        { name: "Dumbbell Lateral Raise", sets: "4", reps: "12-15", rest: "60s", notes: "Control; lead with elbow" },
        { name: "Cable Flye (low to high)", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Cable Lateral Raise (single arm)", sets: "3", reps: "15-20", rest: "60s" },
        { name: "Face Pull", sets: "3", reps: "20", rest: "60s" },
      ],
    },
  },

  {
    slug: "gamma-hero",
    name: "Gamma Hero",
    description: "Extreme mass — the largest, most powerful physique in any training program. Absolute size with unmatched raw strength. Heavy-volume bodybuilding program built for maximum growth.",
    type: "hero",
    difficulty: "Elite",
    avatarEmoji: "💚",
    equipment: "Barbell · Full Cable Stack · Dumbbells · Dip Station · Leg Press Machine",
    isPro: true,
    series: "Comics Hero",
    workoutStyle: "Maximum Mass 5-Day",
    program: {
      duration: "75-95",
      rpe: "9-10",
      warmup: "10 min full warm-up · 3-4 progressive warm-up sets every major lift",
      notes: "5-day: Chest + Tri / Back + Bi / Legs / Shoulders / Arms. The largest physique in the catalog demands the most calories — serious caloric surplus required. Progressive overload is the only law.",
      schedule: "Chest + Triceps — Day 1",
      exercises: [
        { name: "Flat Barbell Bench Press", sets: "6", reps: "4-6", rest: "3min", notes: "Maximum chest strength — the cornerstone" },
        { name: "Incline Barbell Press", sets: "4", reps: "6-10", rest: "2min" },
        { name: "Weighted Dip", sets: "4", reps: "8-12", rest: "2min", notes: "Heavy — load for serious tricep and lower chest mass" },
        { name: "Dumbbell Pullover", sets: "3", reps: "12-15", rest: "90s", notes: "Expands the rib cage and hits the chest-lat tie-in" },
        { name: "Cable Crossover", sets: "3", reps: "15-20", rest: "60s" },
        { name: "Skull Crusher (EZ bar)", sets: "4", reps: "10-12", rest: "90s" },
        { name: "Cable Overhead Extension", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Tricep Pushdown (bar)", sets: "3", reps: "15-20", rest: "60s", notes: "Pump finisher — arms fully exhausted at session end" },
      ],
    },
  },

];

// ── Seed logic ─────────────────────────────────────────────────────────────────

async function main() {
  const rows = workouts.map(toRow);

  if (DRY_RUN) {
    const free = rows.filter(r => !r.is_pro);
    const pro  = rows.filter(r => r.is_pro);
    console.log(`\n📋 DRY RUN — ${rows.length} workouts (${free.length} free, ${pro.length} pro)\n`);
    console.log("FREE:");
    free.forEach(r => console.log(`  ✅ ${r.slug} — ${r.name}`));
    console.log("\nPRO:");
    pro.forEach(r  => console.log(`  🔒 ${r.slug} — ${r.name}`));
    return;
  }

  console.log(`\n🚀 Seeding ${rows.length} workouts to Supabase…\n`);

  const BATCH = 10;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("workouts")
      .upsert(batch, { onConflict: "slug" });

    if (error) {
      console.error(`❌ Batch ${Math.floor(i / BATCH) + 1} failed:`, error.message);
      process.exit(1);
    }

    batch.forEach(r =>
      console.log(`  ${r.is_pro ? "🔒" : "✅"} ${r.slug} — ${r.name}`)
    );
  }

  // Remove any old generic workouts that no longer belong
  const oldSlugs = [
    "foundation-full-body-a", "foundation-full-body-b", "foundation-full-body-c",
    "blueprint-upper-a", "blueprint-upper-b", "blueprint-lower-a", "blueprint-lower-b",
    "nemesis-push-strength", "nemesis-pull-strength", "nemesis-legs-strength",
    "nemesis-upper-hypertrophy", "nemesis-lower-hypertrophy",
    "one-punch", "wall-crawler-acrobat", "speedforce-sprinter", "thunder-god",
    "armored-genius", "super-soldier",
    "gamma-juggernaut", "midnight-predator", "berserker-frame", "void-sorcerer",
    "precision-assassin", "pure-discipline",
    "saiyan-warrior", "saiyan-prince", "leaf-taijutsu", "shadow-clone-circuit",
    "infinite-void", "black-flash-protocol", "three-sword-conditioning",
    "gear-fourth-pump", "survey-corps-circuit", "thunder-breathing",
  ];

  const currentSlugs = new Set(rows.map(r => r.slug));
  const toDelete = oldSlugs.filter(s => !currentSlugs.has(s));

  if (toDelete.length > 0) {
    console.log(`\n🗑️  Removing ${toDelete.length} legacy workouts…`);
    const { error } = await supabase.from("workouts").delete().in("slug", toDelete);
    if (error) {
      console.warn("⚠️  Could not remove legacy workouts:", error.message);
    } else {
      toDelete.forEach(s => console.log(`  🗑️  ${s}`));
    }
  }

  console.log(`\n✅ Done — ${rows.length} character programs seeded.\n`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
