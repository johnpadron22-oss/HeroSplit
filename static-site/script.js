/* ============================================
   HeroSplit - Static Site Application
   ============================================ */

// ============================================
// localStorage Utility
// ============================================
const Store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`herosplit_${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(`herosplit_${key}`, JSON.stringify(value));
  },
  update(key, updater, fallback) {
    const current = Store.get(key, fallback);
    Store.set(key, updater(current));
  },
  remove(key) {
    localStorage.removeItem(`herosplit_${key}`);
  }
};

// ============================================
// Auth
// ============================================
const Auth = {
  getUser() { return Store.get('user', null); },
  login(username) {
    const user = { username, createdAt: new Date().toISOString() };
    Store.set('user', user);
    if (!Store.get('settings')) {
      Store.set('settings', { isPro: false, currentStreak: 0, longestStreak: 0, totalWorkouts: 0 });
    }
    return user;
  },
  logout() {
    Store.remove('user');
    navigate('/');
  }
};

// ============================================
// Progress / Logs
// ============================================
const Progress = {
  getSettings() {
    return Store.get('settings', { isPro: false, currentStreak: 0, longestStreak: 0, totalWorkouts: 0 });
  },
  setSettings(s) { Store.set('settings', s); },
  togglePro() {
    const s = Progress.getSettings();
    s.isPro = !s.isPro;
    Progress.setSettings(s);
    return s.isPro;
  },
  getLogs() { return Store.get('logs', []); },
  logWorkout(workoutName, durationSec) {
    const logs = Progress.getLogs();
    const today = new Date().toISOString().slice(0, 10);
    const durationMin = Math.max(1, Math.round(durationSec / 60));
    logs.unshift({ workoutName, date: today, duration: durationMin, completedAt: new Date().toISOString() });
    Store.set('logs', logs);

    const s = Progress.getSettings();
    s.totalWorkouts++;
    // Streak logic
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const hasYesterday = logs.some(l => l.date === yesterday);
    const hasToday = logs.filter(l => l.date === today).length > 1;
    if (!hasToday) {
      s.currentStreak = hasYesterday ? s.currentStreak + 1 : 1;
    }
    s.longestStreak = Math.max(s.longestStreak, s.currentStreak);
    Progress.setSettings(s);
  }
};

// ============================================
// Workout Data
// ============================================
const WORKOUTS = [
  {
    slug: "one-punch", name: "The One Punch", type: "hero",
    difficulty: "Elite Level", avatarEmoji: "✨", equipment: "Bodyweight", isPro: false,
    description: "The legendary training regimen that can make you invincible. Simple, brutal, effective.",
    program: {
      days: [{
        label: "Daily",
        focus: "Full Body",
        exercises: [
          { name: "Pushups", sets: "1", reps: "100", instructions: "Standard pushups. Break into sets as needed. No rest longer than 60 seconds." },
          { name: "Situps", sets: "1", reps: "100", instructions: "Full situps with feet unanchored. Maintain steady pace." },
          { name: "Squats", sets: "1", reps: "100", instructions: "Full depth air squats. Keep your chest up and core tight." },
          { name: "Run", sets: "1", reps: "10km", instructions: "Run at a steady pace. No walking. No matter how hard it gets, keep going." }
        ]
      }]
    }
  },
  {
    slug: "wall-crawler-acrobat", name: "Wall-Crawler Acrobat", type: "hero",
    difficulty: "Advanced", avatarEmoji: "🕷️", equipment: "Bodyweight", isPro: false,
    description: "Bodyweight mastery + explosive agility. Climb walls and stick landings like a true acrobat.",
    program: {
      days: [
        {
          label: "Back", focus: "Hypertrophy",
          notes: "Grip + vertical pull strength for climbing.",
          exercises: [
            { name: "Scap Pull-Aparts", sets: "2", reps: "15", instructions: "Warm-up: Controlled scapular retraction." },
            { name: "Quadrupedal Crawl", sets: "2", reps: "30s", instructions: "Warm-up: Low crawl keeping hips level." },
            { name: "Weighted Chin-Up", sets: "4", reps: "6-8", rest: "120s", instructions: "Primary: Full range, controlled descent." },
            { name: "Climb-Up Practice", sets: "4", reps: "3-5", rest: "120s", instructions: "Primary: Explosive pull to chest-over-bar." },
            { name: "Front Lever Progression", sets: "3", reps: "5-8s hold", rest: "90s", instructions: "Accessory: Use appropriate progression." },
            { name: "Hanging Leg Raise", sets: "3", reps: "10-12", rest: "60s", instructions: "Accessory: Controlled, no swinging." }
          ]
        },
        {
          label: "Legs", focus: "Conditioning",
          notes: "Single-leg power for parkour landings.",
          exercises: [
            { name: "Pistol Squat", sets: "4", reps: "5-8/leg", rest: "90s", instructions: "Primary: Full depth single leg squat." },
            { name: "Broad Jump", sets: "5", reps: "5", rest: "90s", instructions: "Primary: Maximum distance each rep." },
            { name: "Bulgarian Split Squat Jump", sets: "3", reps: "6/leg", rest: "75s", instructions: "Accessory: Explosive with rear foot elevated." },
            { name: "Wall Sit", sets: "3", reps: "45-60s", rest: "60s", instructions: "Accessory: Thighs parallel, back flat on wall." }
          ]
        },
        {
          label: "Upper", focus: "Hypertrophy",
          notes: "Gymnastic pushing + core tension.",
          exercises: [
            { name: "Handstand Push-Up", sets: "4", reps: "5-8", rest: "120s", instructions: "Primary: Wall-assisted or freestanding." },
            { name: "Ring Dip", sets: "4", reps: "8-10", rest: "90s", instructions: "Primary: Full lockout, rings turned out at top." },
            { name: "Pike Push-Up", sets: "3", reps: "10-12", rest: "75s", instructions: "Accessory: Elevated feet for more challenge." },
            { name: "Hollow Body Rock", sets: "3", reps: "30-45s", rest: "60s", instructions: "Accessory: Tight core, minimal rocking amplitude." }
          ]
        }
      ]
    }
  },
  {
    slug: "speedforce-sprinter", name: "Speedforce Sprinter", type: "hero",
    difficulty: "Elite Level", avatarEmoji: "⚡", equipment: "Full Gym", isPro: false,
    description: "Explosive acceleration + top-end speed. Train your body to move at lightning pace.",
    program: {
      days: [
        {
          label: "Speed", focus: "Conditioning",
          notes: "Max velocity + acceleration development.",
          exercises: [
            { name: "Flying 30m Sprint", sets: "6", reps: "1", rest: "180s", instructions: "Speed Work: Build up then hit max velocity for 30m." },
            { name: "Block Starts", sets: "5", reps: "20m", rest: "120s", instructions: "Speed Work: Explosive first-step acceleration." },
            { name: "Box Jump", sets: "4", reps: "5", rest: "90s", instructions: "Plyometrics: Maximum height, soft landing." },
            { name: "Bounding", sets: "4", reps: "30m", rest: "90s", instructions: "Plyometrics: Exaggerated running strides for distance." }
          ]
        },
        {
          label: "Legs", focus: "Strength",
          notes: "Posterior chain + single-leg power.",
          exercises: [
            { name: "Trap Bar Deadlift", sets: "5", reps: "3-5", rest: "150s", instructions: "Primary: Drive through the floor, full lockout." },
            { name: "Bulgarian Split Squat", sets: "4", reps: "6-8/leg", rest: "120s", instructions: "Primary: Rear foot elevated, deep knee bend." },
            { name: "Calf Raise", sets: "4", reps: "12-15", rest: "60s", instructions: "Accessory: Full stretch at bottom, pause at top." },
            { name: "Nordic Curl", sets: "3", reps: "5-8", rest: "90s", instructions: "Accessory: Slow eccentric, catch yourself at bottom." }
          ]
        },
        {
          label: "Engine", focus: "Conditioning",
          notes: "Speed endurance + technique work.",
          exercises: [
            { name: "150m Sprint", sets: "5", reps: "1", rest: "240s", instructions: "Intervals: 95% effort, full recovery between sets." },
            { name: "Tempo Run 200m", sets: "4", reps: "85% effort", rest: "120s", instructions: "Intervals: Controlled speed, focus on form." },
            { name: "A-Skip Drill", sets: "3", reps: "40m", instructions: "Finisher: High knees with rhythmic skipping." },
            { name: "High Knee Sprint", sets: "3", reps: "30m", instructions: "Finisher: Drive knees high, pump arms." }
          ]
        }
      ]
    }
  },
  {
    slug: "thunder-god", name: "Thunder God", type: "hero",
    difficulty: "Advanced", avatarEmoji: "🔨", equipment: "Full Gym", isPro: false,
    description: "Overhead power + battle conditioning. Wield the strength of a god.",
    program: {
      days: [
        {
          label: "Push", focus: "Strength",
          notes: "Maximal overhead strength.",
          exercises: [
            { name: "Overhead Press", sets: "5", reps: "3-5", rest: "150s", instructions: "Primary: Strict press, full lockout overhead." },
            { name: "Push Press", sets: "4", reps: "5-6", rest: "120s", instructions: "Primary: Use leg drive to press heavier loads." },
            { name: "Dumbbell Overhead Press", sets: "3", reps: "8-10", rest: "90s", instructions: "Accessory: Seated or standing, full range." },
            { name: "Landmine Press", sets: "3", reps: "10-12", rest: "75s", instructions: "Accessory: Single arm, press at an angle." }
          ]
        },
        {
          label: "Pull", focus: "Hypertrophy",
          notes: "Pulling volume + back thickness.",
          exercises: [
            { name: "Deadlift", sets: "4", reps: "5-6", rest: "150s", instructions: "Primary: Conventional stance, brace hard." },
            { name: "Weighted Pull-Up", sets: "4", reps: "6-8", rest: "120s", instructions: "Primary: Add weight via belt or dumbbell." },
            { name: "Cable Row", sets: "3", reps: "10-12", rest: "75s", instructions: "Accessory: Squeeze shoulder blades together." },
            { name: "Face Pull", sets: "3", reps: "15", rest: "60s", instructions: "Accessory: High pull to face, external rotation." }
          ]
        },
        {
          label: "Battle", focus: "Conditioning",
          notes: "Battle-ready work capacity.",
          exercises: [
            { name: "Tire Flip", sets: "5", reps: "5", instructions: "Medley: Drive hips into the tire, flip explosively." },
            { name: "Sledgehammer Slam", sets: "5", reps: "20", instructions: "Medley: Alternate sides, full overhead swing." },
            { name: "Atlas Stone Load", sets: "5", reps: "3", instructions: "Medley: Lap the stone, then drive to platform." }
          ]
        }
      ]
    }
  },
  {
    slug: "armored-genius", name: "Armored Genius", type: "hero",
    difficulty: "Intermediate", avatarEmoji: "🤖", equipment: "Full Gym", isPro: false,
    description: "Executive physique + functional fitness. Balanced training for the brilliant mind.",
    program: {
      days: [
        {
          label: "Chest", focus: "Hypertrophy",
          notes: "Classic bodybuilding chest work.",
          exercises: [
            { name: "Barbell Bench Press", sets: "4", reps: "6-8", rest: "120s", instructions: "Primary: Controlled descent, explosive press." },
            { name: "Incline DB Press", sets: "3", reps: "8-10", rest: "90s", instructions: "Primary: 30-45 degree incline." },
            { name: "Cable Fly", sets: "3", reps: "12-15", rest: "60s", instructions: "Accessory: Squeeze at peak contraction." },
            { name: "Push-Up", sets: "2", reps: "AMRAP", rest: "60s", instructions: "Accessory: As many reps as possible to finish." }
          ]
        },
        {
          label: "Back", focus: "Hypertrophy",
          notes: "Back thickness + width.",
          exercises: [
            { name: "Barbell Row", sets: "4", reps: "6-8", rest: "120s", instructions: "Primary: Bent over, pull to lower chest." },
            { name: "Pull-Up", sets: "4", reps: "8-10", rest: "90s", instructions: "Primary: Full dead hang to chin over bar." },
            { name: "Lat Pulldown", sets: "3", reps: "10-12", rest: "75s", instructions: "Accessory: Wide grip, pull to upper chest." },
            { name: "Rear Delt Fly", sets: "3", reps: "15", rest: "60s", instructions: "Accessory: Light weight, focus on the squeeze." }
          ]
        },
        {
          label: "Cardio", focus: "Conditioning",
          notes: "Maintain conditioning for busy schedule.",
          exercises: [
            { name: "Rowing Machine", sets: "1", reps: "20min steady", instructions: "Cardio: Maintain consistent pace, 500m splits." },
            { name: "Bike Sprints", sets: "8", reps: "30s / 90s rest", instructions: "Cardio: All-out 30s sprints, easy pedal recovery." }
          ]
        }
      ]
    }
  },
  {
    slug: "tactical-assassin", name: "Tactical Assassin", type: "hero",
    difficulty: "Advanced", avatarEmoji: "⚔️", equipment: "Full Gym", isPro: false,
    description: "Combat conditioning + tactical strength. Prepared for any mission.",
    program: {
      days: [
        {
          label: "Upper", focus: "Strength",
          notes: "Upper body strength for combat.",
          exercises: [
            { name: "Weighted Pull-Up", sets: "5", reps: "3-5", rest: "150s", instructions: "Primary: Heavy load, full range." },
            { name: "Barbell Overhead Press", sets: "4", reps: "5-6", rest: "120s", instructions: "Primary: Strict press, no leg drive." },
            { name: "Dumbbell Row", sets: "3", reps: "8-10", rest: "90s", instructions: "Accessory: One arm at a time, full stretch." },
            { name: "Dip", sets: "3", reps: "10-12", rest: "90s", instructions: "Accessory: Lean forward slightly for chest." }
          ]
        },
        {
          label: "Legs", focus: "Strength",
          notes: "Functional leg power.",
          exercises: [
            { name: "Front Squat", sets: "5", reps: "3-5", rest: "150s", instructions: "Primary: Elbows high, upright torso." },
            { name: "Romanian Deadlift", sets: "4", reps: "6-8", rest: "120s", instructions: "Primary: Hinge at hips, feel the hamstrings." },
            { name: "Reverse Lunge", sets: "3", reps: "8/leg", rest: "90s", instructions: "Accessory: Step back, control the descent." },
            { name: "Sled Push", sets: "4", reps: "30m", rest: "90s", instructions: "Accessory: Low handles, drive hard." }
          ]
        },
        {
          label: "Combat", focus: "Conditioning",
          notes: "Work capacity under fatigue.",
          exercises: [
            { name: "Burpee", sets: "5", reps: "10", instructions: "Circuit x5: Full burpee with jump at top." },
            { name: "Kettlebell Swing", sets: "5", reps: "15", instructions: "Circuit x5: Hip hinge, snap hips forward." },
            { name: "Box Jump", sets: "5", reps: "8", instructions: "Circuit x5: Explosive jump, step down." }
          ]
        }
      ]
    }
  },
  // ---- VILLAIN WORKOUTS (Pro Only) ----
  {
    slug: "gamma-juggernaut", name: "Gamma Juggernaut", type: "villain",
    difficulty: "Elite Level", avatarEmoji: "💪", equipment: "Full Gym", isPro: true,
    description: "Maximum strength + raw power. Become an unstoppable force of nature.",
    program: {
      days: [
        {
          label: "Legs", focus: "Strength",
          notes: "Absolute leg strength + posterior chain.",
          exercises: [
            { name: "Back Squat", sets: "5", reps: "3-5", rest: "180s", instructions: "Primary: Below parallel, brace core." },
            { name: "Conventional Deadlift", sets: "5", reps: "3-5", rest: "180s", instructions: "Primary: Pull slack from bar, hips and shoulders rise together." },
            { name: "Front Squat", sets: "3", reps: "6-8", rest: "120s", instructions: "Accessory: Elbows high, upright torso." },
            { name: "Good Morning", sets: "3", reps: "8-10", rest: "90s", instructions: "Accessory: Barbell on back, hinge at hips." }
          ]
        },
        {
          label: "Push", focus: "Strength",
          notes: "Max pressing power.",
          exercises: [
            { name: "Bench Press", sets: "5", reps: "3-5", rest: "150s", instructions: "Primary: Arch back, retract scapulae, leg drive." },
            { name: "Log Press", sets: "4", reps: "5-6", rest: "150s", instructions: "Primary: Clean to rack position, press overhead." },
            { name: "Close-Grip Bench", sets: "3", reps: "6-8", rest: "120s", instructions: "Accessory: Hands shoulder-width, tricep focus." },
            { name: "Weighted Dip", sets: "3", reps: "8-10", rest: "90s", instructions: "Accessory: Add weight via belt or dumbbell." }
          ]
        },
        {
          label: "Pull", focus: "Strength",
          notes: "Grip + back thickness.",
          exercises: [
            { name: "Barbell Row", sets: "5", reps: "5-6", rest: "120s", instructions: "Primary: Heavy rows, controlled form." },
            { name: "Farmer Carry", sets: "4", reps: "40-60m", rest: "90s", instructions: "Primary: Heavy dumbbells or farmer handles." },
            { name: "Pull-Up", sets: "4", reps: "AMRAP", rest: "120s", instructions: "Accessory: Dead hang to chin over bar." },
            { name: "Shrug", sets: "4", reps: "10-12", rest: "90s", instructions: "Accessory: Heavy, pause at top." }
          ]
        }
      ]
    }
  },
  {
    slug: "mercenary-regen", name: "Mercenary Regen", type: "villain",
    difficulty: "Advanced", avatarEmoji: "🗡️", equipment: "Full Gym", isPro: true,
    description: "High-volume chaos + metabolic mayhem. Pain is just information.",
    program: {
      days: [
        {
          label: "Chaos A", focus: "Conditioning",
          notes: "Unpredictable high-intensity work.",
          exercises: [
            { name: "Assault Bike", sets: "1", reps: "30 cal", instructions: "Chaos Circuit A: All-out effort." },
            { name: "Burpee Box Jump", sets: "1", reps: "20", instructions: "Chaos Circuit A: Burpee into box jump." },
            { name: "KB Swing", sets: "1", reps: "30", instructions: "Chaos Circuit A: Russian or American swing." },
            { name: "Row Machine", sets: "1", reps: "500m", instructions: "Chaos Circuit B: Sprint row." },
            { name: "Devil Press", sets: "1", reps: "15", instructions: "Chaos Circuit B: Burpee with dumbbell snatch." },
            { name: "Wall Ball", sets: "1", reps: "30", instructions: "Chaos Circuit B: Full squat, throw to target." }
          ]
        },
        {
          label: "Upper", focus: "Hypertrophy",
          notes: "Volume pushing + pulling.",
          exercises: [
            { name: "DB Bench Press", sets: "4", reps: "12-15", rest: "30s", instructions: "Superset: Go straight to DB Row after." },
            { name: "DB Row", sets: "4", reps: "12-15", rest: "90s", instructions: "Superset: Complete pair, then rest." },
            { name: "Push-Up", sets: "3", reps: "AMRAP", instructions: "Finisher: Maximum reps, no rest between push/pull." },
            { name: "Pull-Up", sets: "3", reps: "AMRAP", instructions: "Finisher: Maximum reps to failure." }
          ]
        },
        {
          label: "Engine", focus: "Conditioning",
          notes: "Sustained anaerobic output.",
          exercises: [
            { name: "Thruster", sets: "20", reps: "10", instructions: "EMOM 20min: Every minute on the minute." },
            { name: "Burpee", sets: "20", reps: "8", instructions: "EMOM 20min: Alternate minutes with thrusters." },
            { name: "Double Under", sets: "20", reps: "30", instructions: "EMOM 20min: If no rope, do tuck jumps." }
          ]
        }
      ]
    }
  },
  {
    slug: "chaos-agent", name: "Chaos Agent", type: "villain",
    difficulty: "Advanced", avatarEmoji: "🃏", equipment: "Minimal", isPro: true,
    description: "Mental toughness + endurance under stress. Embrace the chaos.",
    program: {
      days: [
        {
          label: "Chaos", focus: "Conditioning",
          notes: "Embrace chaos; adapt on the fly.",
          exercises: [
            { name: "Run 400m", sets: "5", reps: "1", rest: "90-180s random", instructions: "Unpredictable Intervals: Vary rest randomly." },
            { name: "Burpee", sets: "5", reps: "15-25 random", instructions: "Unpredictable Intervals: Roll a die for rep count." },
            { name: "Jump Rope", sets: "5", reps: "100-200 random", instructions: "Unpredictable Intervals: Different count each round." }
          ]
        },
        {
          label: "Grind", focus: "Conditioning",
          notes: "Sustained effort under discomfort.",
          exercises: [
            { name: "Kettlebell Swing", sets: "4", reps: "30", instructions: "Circuit x4: Hip hinge, bell to eye level." },
            { name: "Box Step-Up", sets: "4", reps: "20/leg", instructions: "Circuit x4: Alternate legs each rep." },
            { name: "Battle Rope", sets: "4", reps: "45s", instructions: "Circuit x4: Double wave pattern." }
          ]
        },
        {
          label: "Core", focus: "Conditioning",
          notes: "Mental fortitude through core fatigue.",
          exercises: [
            { name: "Ab Wheel Rollout", sets: "4", reps: "10-12", instructions: "Core Gauntlet: Full extension if possible." },
            { name: "Plank Hold", sets: "4", reps: "60-90s", instructions: "Core Gauntlet: Forearm plank, squeeze everything." },
            { name: "Russian Twist", sets: "4", reps: "30", instructions: "Core Gauntlet: Weighted if possible, feet elevated." }
          ]
        }
      ]
    }
  },
  {
    slug: "apex-predator", name: "Apex Predator", type: "villain",
    difficulty: "Elite Level", avatarEmoji: "👾", equipment: "Full Gym", isPro: true,
    description: "Explosive animalistic power + plyometrics. Hunt like a predator.",
    program: {
      days: [
        {
          label: "Legs", focus: "Strength",
          notes: "Explosive lower body power.",
          exercises: [
            { name: "Box Squat", sets: "5", reps: "3-5", rest: "150s", instructions: "Primary: Sit back on box, explode up." },
            { name: "Trap Bar Deadlift", sets: "5", reps: "3-5", rest: "150s", instructions: "Primary: Stand in center, drive through floor." },
            { name: "Depth Jump", sets: "4", reps: "5", rest: "120s", instructions: "Plyometric: Step off box, immediately jump max height." },
            { name: "Broad Jump", sets: "4", reps: "5", rest: "90s", instructions: "Plyometric: Swing arms, jump for distance." }
          ]
        },
        {
          label: "Upper", focus: "Hypertrophy",
          notes: "Upper body mass + power.",
          exercises: [
            { name: "Weighted Dip", sets: "4", reps: "6-8", rest: "120s", instructions: "Primary: Add weight, full depth." },
            { name: "Barbell Row", sets: "4", reps: "6-8", rest: "120s", instructions: "Primary: Explosive pull, controlled lower." },
            { name: "Close-Grip Bench", sets: "3", reps: "8-10", rest: "90s", instructions: "Accessory: Tricep emphasis." },
            { name: "Pull-Up", sets: "3", reps: "AMRAP", rest: "90s", instructions: "Accessory: Max reps each set." }
          ]
        },
        {
          label: "Animal", focus: "Conditioning",
          notes: "Movement quality + conditioning.",
          exercises: [
            { name: "Bear Crawl", sets: "4", reps: "30m", instructions: "Animal Flow Circuit: Keep hips low and level." },
            { name: "Crab Walk", sets: "4", reps: "30m", instructions: "Animal Flow Circuit: Belly up, hips high." },
            { name: "Frog Jump", sets: "4", reps: "20m", instructions: "Animal Flow Circuit: Deep squat, jump forward." }
          ]
        }
      ]
    }
  },
  {
    slug: "shadow-league-master", name: "Shadow League Master", type: "villain",
    difficulty: "Advanced", avatarEmoji: "🥋", equipment: "Bodyweight", isPro: true,
    description: "Martial conditioning + longevity training. Master of all disciplines.",
    program: {
      days: [
        {
          label: "Upper", focus: "Hypertrophy",
          notes: "Bodyweight pushing + pulling mastery.",
          exercises: [
            { name: "Push-Up Variation Circuit", sets: "4", reps: "15 each: wide/diamond/decline", instructions: "Primary: 3 variations back-to-back per set." },
            { name: "Pull-Up Variation Circuit", sets: "4", reps: "10 each: wide/neutral/chin", instructions: "Primary: 3 grip widths per set." },
            { name: "Pike Push-Up", sets: "3", reps: "12-15", instructions: "Accessory: Feet elevated for shoulder focus." },
            { name: "Inverted Row", sets: "3", reps: "12-15", instructions: "Accessory: Under a bar or rings." }
          ]
        },
        {
          label: "Legs", focus: "Strength",
          notes: "Single-leg strength + mobility.",
          exercises: [
            { name: "Pistol Squat", sets: "4", reps: "6-8/leg", rest: "90s", instructions: "Primary: Control the descent." },
            { name: "Single-Leg RDL", sets: "4", reps: "8-10/leg", rest: "90s", instructions: "Primary: Hinge on one leg, reach back." },
            { name: "Cossack Squat", sets: "3", reps: "10/leg", instructions: "Accessory: Deep lateral squat." },
            { name: "Calf Raise", sets: "3", reps: "15", instructions: "Accessory: Single leg or double, full range." }
          ]
        },
        {
          label: "Martial", focus: "Conditioning",
          notes: "Combat endurance + footwork.",
          exercises: [
            { name: "Heavy Bag Rounds", sets: "6", reps: "3min / 1min rest", instructions: "Martial Intervals: Mix punches, kicks, knees." },
            { name: "Shadow Boxing", sets: "3", reps: "2min", instructions: "Martial Intervals: Visualize opponent, work combos." },
            { name: "Jump Rope", sets: "1", reps: "10min steady", instructions: "Finisher: Stay light on feet, consistent rhythm." }
          ]
        }
      ]
    }
  }
];

// ============================================
// Router
// ============================================
let currentRoute = '';
let routeParams = {};

function navigate(path) {
  history.pushState(null, '', path);
  handleRoute();
}

function handleRoute() {
  const path = location.pathname || '/';
  const app = document.getElementById('app');

  // Match workout route
  const workoutMatch = path.match(/^\/workout\/(.+)$/);
  if (workoutMatch) {
    routeParams = { slug: workoutMatch[1] };
    currentRoute = 'workout';
  } else if (path === '/' || path === '/index.html') {
    currentRoute = Auth.getUser() ? 'home' : 'landing';
  } else {
    currentRoute = Auth.getUser() ? 'home' : 'landing';
  }

  render();
}

window.addEventListener('popstate', handleRoute);
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (a) { e.preventDefault(); navigate(a.getAttribute('href')); }
});

// ============================================
// Render Engine
// ============================================
function render() {
  const app = document.getElementById('app');
  switch (currentRoute) {
    case 'landing': app.innerHTML = renderLanding(); break;
    case 'home': app.innerHTML = renderHome(); break;
    case 'workout': app.innerHTML = renderWorkout(); break;
    default: app.innerHTML = renderLanding();
  }
  bindEvents();
}

// ============================================
// Landing Page
// ============================================
function renderLanding() {
  return `
    <div class="landing">
      <div class="landing-bg">
        <div class="landing-blob landing-blob-hero"></div>
        <div class="landing-blob landing-blob-villain"></div>
      </div>
      <header class="landing-header">
        <div class="logo"><span class="logo-hero">Hero</span><span class="logo-split">Split</span></div>
        <button class="btn btn-ghost" onclick="showAuthModal()">Sign In</button>
      </header>
      <div class="landing-content">
        <div class="landing-tagline">The #1 Anime-Inspired Workout App</div>
        <h1 class="landing-title">
          Train Like Your<br>Favorite <span class="gradient">Anime Hero</span>
        </h1>
        <p class="landing-subtitle">
          Character-inspired workout programs designed to push your limits.
          Track progress, build streaks, and unlock your potential.
        </p>
        <div class="landing-actions">
          <button class="btn btn-primary btn-lg" onclick="showAuthModal()">Start Training</button>
          <button class="btn btn-ghost btn-lg" onclick="showAuthModal()">View Workouts</button>
        </div>
      </div>
      <div class="landing-features">
        <div class="landing-feature">
          <span class="landing-feature-icon">🛡️</span>
          <h3>Hero Workouts</h3>
          <p>Beginner to advanced programs inspired by your favorite characters.</p>
        </div>
        <div class="landing-feature">
          <span class="landing-feature-icon">⚡</span>
          <h3>Villain Intensity</h3>
          <p>Pro-only brutal splits for those ready to embrace the dark side.</p>
        </div>
        <div class="landing-feature">
          <span class="landing-feature-icon">📈</span>
          <h3>Stat Tracking</h3>
          <p>Streaks, progress charts, and achievements to keep you motivated.</p>
        </div>
      </div>
    </div>
    <div id="auth-modal" class="modal-overlay hidden" onclick="if(event.target===this)closeAuthModal()">
      <div class="modal">
        <h2>Welcome, Hero</h2>
        <p>Enter your name to start your training journey.</p>
        <form class="modal-form" onsubmit="handleLogin(event)">
          <input class="modal-input" id="auth-input" type="text" placeholder="Your hero name..." maxlength="30" autofocus required />
          <button class="btn btn-hero btn-lg" type="submit" style="width:100%">Begin Training</button>
        </form>
        <div class="modal-footer">Your data is stored locally on this device.</div>
      </div>
    </div>`;
}

// ============================================
// Home Page
// ============================================
let activeTab = 'heroes';

function renderHome() {
  const user = Auth.getUser();
  const settings = Progress.getSettings();
  if (!user) { currentRoute = 'landing'; return renderLanding(); }

  const initial = user.username.charAt(0).toUpperCase();
  const heroWorkouts = WORKOUTS.filter(w => w.type === 'hero');
  const villainWorkouts = WORKOUTS.filter(w => w.type === 'villain');

  return `
    <header class="app-header">
      <div class="logo"><span class="logo-hero">Hero</span><span class="logo-split">Split</span></div>
      <div class="app-header-user">
        <span class="app-header-name">${escapeHtml(user.username)}</span>
        <div class="app-header-avatar">${initial}</div>
        <button class="btn btn-ghost btn-sm" onclick="Auth.logout()">Logout</button>
      </div>
    </header>
    <div class="container">
      <div class="tabs">
        <button class="tab ${activeTab === 'heroes' ? 'active' : ''}" onclick="switchTab('heroes')">🛡️ Heroes</button>
        <button class="tab ${activeTab === 'villains' ? 'active' : ''}" onclick="switchTab('villains')">👿 Villains</button>
        <button class="tab ${activeTab === 'progress' ? 'active' : ''}" onclick="switchTab('progress')">📊 Progress</button>
      </div>
      <div id="tab-content">
        ${activeTab === 'heroes' ? renderHeroesTab(heroWorkouts) : ''}
        ${activeTab === 'villains' ? renderVillainsTab(villainWorkouts, settings.isPro) : ''}
        ${activeTab === 'progress' ? renderProgressTab(settings) : ''}
      </div>
    </div>
    <div id="paywall-modal" class="modal-overlay hidden" onclick="if(event.target===this)closePaywall()">
      <div class="modal">
        <div class="paywall-header">
          <div class="paywall-icon">👑</div>
          <h2>Unlock Villain Mode</h2>
        </div>
        <ul class="paywall-features">
          <li>Access all Villain Tier workouts</li>
          <li>Advanced analytics & progress tracking</li>
          <li>God-level difficulty challenges</li>
          <li>Custom workout builder</li>
        </ul>
        <button class="btn btn-villain btn-lg" style="width:100%" onclick="handleTogglePro()">Get Pro Access - $4.99/mo</button>
        <div class="paywall-disclaimer">This is a demo. No actual payment will be processed.</div>
      </div>
    </div>`;
}

function renderHeroesTab(workouts) {
  return `
    <div class="section-header">
      <h2>Hero Workouts</h2>
      <p>Free character-inspired training programs</p>
    </div>
    <div class="workout-grid">
      ${workouts.map(w => renderWorkoutCard(w, false)).join('')}
    </div>`;
}

function renderVillainsTab(workouts, isPro) {
  return `
    ${!isPro ? `
      <div class="villain-promo">
        <div class="villain-promo-icon">👑</div>
        <h3>Villain Mode</h3>
        <p>Unlock brutal villain-tier workout programs designed to push you beyond your limits.</p>
        <button class="btn btn-villain btn-lg" onclick="showPaywall()">Unlock Pro Access</button>
      </div>` : `
      <div class="section-header">
        <h2 class="text-villain">Villain Workouts</h2>
        <p>Pro-only brutal training programs</p>
      </div>`}
    <div class="workout-grid">
      ${workouts.map(w => renderWorkoutCard(w, !isPro)).join('')}
    </div>`;
}

function renderWorkoutCard(workout, locked) {
  const isVillain = workout.type === 'villain';
  const accentClass = isVillain ? 'villain' : 'hero';
  const totalExercises = workout.program.days.reduce((sum, d) => sum + d.exercises.length, 0);
  const hasDays = workout.program.days.length > 1;

  return `
    <div class="workout-card ${isVillain ? 'villain-card' : ''}" ${locked ? '' : `onclick="navigate('/workout/${workout.slug}')"`}>
      <div class="card-avatar">${workout.avatarEmoji}</div>
      <div class="card-badges">
        <span class="badge badge-${accentClass}">${workout.difficulty}</span>
        <span class="badge">${workout.equipment}</span>
        ${locked ? '<span class="badge">🔒</span>' : ''}
      </div>
      <div class="card-title">${escapeHtml(workout.name)}</div>
      <div class="card-desc">${escapeHtml(workout.description)}</div>
      ${hasDays ? `
        <div class="day-selector">
          ${workout.program.days.map(d => `<span class="day-btn">${d.label}</span>`).join('')}
        </div>` : ''}
      <div class="card-meta">
        <span>⏱ ${hasDays ? workout.program.days.length + ' days' : '~45 min'}</span>
        <span>🏋️ ${totalExercises} exercises</span>
      </div>
      <div class="card-actions">
        ${locked
          ? `<button class="btn btn-villain" style="width:100%" onclick="event.stopPropagation();showPaywall()">🔒 Unlock Pro</button>`
          : `<button class="btn btn-${accentClass}" style="width:100%" onclick="event.stopPropagation();navigate('/workout/${workout.slug}')">Start Workout →</button>`}
      </div>
      ${locked ? '<div class="card-locked-overlay">🔒</div>' : ''}
    </div>`;
}

function renderProgressTab(settings) {
  const logs = Progress.getLogs();
  const last7 = getLast7DaysChart(logs);
  const recentLogs = logs.slice(0, 5);
  const uniqueDays = new Set(logs.map(l => l.date)).size;

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${settings.currentStreak}</div>
        <div class="stat-label">Current Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">${settings.longestStreak}</div>
        <div class="stat-label">Best Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💪</div>
        <div class="stat-value">${settings.totalWorkouts}</div>
        <div class="stat-label">Total Workouts</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-value">${uniqueDays}</div>
        <div class="stat-label">Active Days</div>
      </div>
    </div>
    <div class="chart-container">
      <div class="chart-title">Last 7 Days</div>
      <div class="chart-bars">
        ${last7.map(d => {
          const h = d.minutes ? Math.max(8, (d.minutes / Math.max(...last7.map(x => x.minutes), 1)) * 100) : 2;
          return `
            <div class="chart-bar-col">
              ${d.minutes ? `<div class="chart-bar-value">${d.minutes}m</div>` : ''}
              <div class="chart-bar" style="height:${h}%"></div>
              <div class="chart-bar-label">${d.label}</div>
            </div>`;
        }).join('')}
      </div>
    </div>
    <div class="recent-logs">
      <h3>Recent Workouts</h3>
      ${recentLogs.length === 0 ? '<div class="log-empty">No workouts yet. Start your first one!</div>' : ''}
      ${recentLogs.map(l => `
        <div class="log-item">
          <span class="log-item-name">${escapeHtml(l.workoutName)}</span>
          <div class="log-item-meta">
            <span>${l.duration}min</span>
            <span>${formatDate(l.completedAt)}</span>
          </div>
        </div>`).join('')}
    </div>
    ${settings.isPro ? `<div style="text-align:center;padding-bottom:40px"><button class="btn btn-ghost btn-sm" onclick="handleTogglePro()">Downgrade from Pro</button></div>` : ''}`;
}

// ============================================
// Workout View
// ============================================
let workoutState = { started: false, completed: false, currentExercise: 0, currentDay: 0, seconds: 0, timerInterval: null };

function renderWorkout() {
  const workout = WORKOUTS.find(w => w.slug === routeParams.slug);
  if (!workout) return `<div class="workout-view"><div class="workout-prestart"><h2>Workout not found</h2><button class="btn btn-hero" onclick="navigate('/')">Back Home</button></div></div>`;

  // Check pro lock
  const settings = Progress.getSettings();
  if (workout.isPro && !settings.isPro) {
    return `<div class="workout-view"><div class="workout-prestart">
      <div class="prestart-avatar">🔒</div>
      <h2 class="prestart-title text-villain">Pro Only</h2>
      <p class="prestart-desc">This workout requires Pro access. Unlock Villain Mode to access all villain-tier programs.</p>
      <button class="btn btn-hero" onclick="navigate('/')">Back Home</button>
    </div></div>`;
  }

  const day = workout.program.days[workoutState.currentDay];
  const exercises = day.exercises;
  const hasDays = workout.program.days.length > 1;
  const isVillain = workout.type === 'villain';

  if (workoutState.completed) {
    const mins = Math.floor(workoutState.seconds / 60);
    const secs = workoutState.seconds % 60;
    return `
      <div class="workout-view">
        <div class="workout-complete">
          <div class="complete-icon">🏆</div>
          <div class="complete-title">Workout Complete!</div>
          <div class="complete-time">Total time: ${mins}:${secs.toString().padStart(2, '0')}</div>
          <button class="btn btn-hero btn-lg" onclick="finishAndGoHome()" style="margin-top:16px">Back to Dashboard</button>
        </div>
        <div id="confetti-container" class="confetti-container"></div>
      </div>`;
  }

  if (!workoutState.started) {
    return `
      <div class="workout-view">
        <header class="workout-header">
          <button class="btn btn-ghost btn-sm" onclick="navigate('/')">← Back</button>
          <div></div><div></div>
        </header>
        <div class="workout-prestart">
          <div class="prestart-avatar">${workout.avatarEmoji}</div>
          <span class="badge badge-${isVillain ? 'villain' : 'hero'}">${workout.difficulty}</span>
          <h1 class="prestart-title">${escapeHtml(workout.name)}</h1>
          <p class="prestart-desc">${escapeHtml(workout.description)}</p>
          ${hasDays ? `
            <div class="day-selector">
              ${workout.program.days.map((d, i) => `
                <button class="day-btn ${workoutState.currentDay === i ? 'active' : ''}" onclick="selectDay(${i})">${d.label} — ${d.focus}</button>
              `).join('')}
            </div>` : ''}
          ${day.notes ? `<p class="text-muted" style="font-size:13px;font-style:italic">${day.notes}</p>` : ''}
          <div class="prestart-info">
            <div class="prestart-info-card">
              <div class="prestart-info-val">${exercises.length}</div>
              <div class="prestart-info-label">Exercises</div>
            </div>
            <div class="prestart-info-card">
              <div class="prestart-info-val">~${Math.max(15, exercises.length * 5)}</div>
              <div class="prestart-info-label">Minutes</div>
            </div>
          </div>
          <button class="btn btn-${isVillain ? 'villain' : 'hero'} btn-lg" onclick="startWorkout()" style="margin-top:8px">Start Workout</button>
        </div>
      </div>`;
  }

  // Active workout
  const ex = exercises[workoutState.currentExercise];
  const progress = ((workoutState.currentExercise + 1) / exercises.length) * 100;
  const mins = Math.floor(workoutState.seconds / 60);
  const secs = workoutState.seconds % 60;
  const isLast = workoutState.currentExercise === exercises.length - 1;
  const isFirst = workoutState.currentExercise === 0;

  return `
    <div class="workout-view">
      <header class="workout-header">
        <button class="btn btn-ghost btn-sm" onclick="confirmQuit()">← Quit</button>
        <div class="workout-timer">${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}</div>
        <div></div>
      </header>
      <div class="workout-progress-bar">
        <div class="workout-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="exercise-area">
        <div class="exercise-bg-number">${workoutState.currentExercise + 1}</div>
        <div class="exercise-counter">Exercise ${workoutState.currentExercise + 1} of ${exercises.length}</div>
        <div class="exercise-name">${escapeHtml(ex.name)}</div>
        <div class="exercise-details">
          ${ex.sets ? `<span class="badge badge-${isVillain ? 'villain' : 'hero'}">${ex.sets} sets</span>` : ''}
          ${ex.reps ? `<span class="badge badge-${isVillain ? 'villain' : 'hero'}">${ex.reps} reps</span>` : ''}
          ${ex.rest ? `<span class="badge">Rest: ${ex.rest}</span>` : ''}
        </div>
        ${ex.instructions ? `<div class="exercise-instructions">${escapeHtml(ex.instructions)}</div>` : ''}
      </div>
      <div class="workout-footer">
        <button class="btn btn-ghost" ${isFirst ? 'disabled style="opacity:0.3;pointer-events:none"' : ''} onclick="prevExercise()">← Previous</button>
        <div class="workout-footer-center">
          ${isLast
            ? `<button class="btn btn-green btn-lg" onclick="completeWorkout()">✓ Finish Workout</button>`
            : `<button class="btn btn-hero" onclick="nextExercise()">Next →</button>`}
        </div>
        <div style="min-width:100px"></div>
      </div>
    </div>`;
}

// ============================================
// Workout Actions
// ============================================
function selectDay(i) {
  workoutState.currentDay = i;
  workoutState.currentExercise = 0;
  render();
}

function startWorkout() {
  workoutState.started = true;
  workoutState.completed = false;
  workoutState.currentExercise = 0;
  workoutState.seconds = 0;
  workoutState.timerInterval = setInterval(() => {
    workoutState.seconds++;
    const timer = document.querySelector('.workout-timer');
    if (timer) {
      const m = Math.floor(workoutState.seconds / 60);
      const s = workoutState.seconds % 60;
      timer.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }, 1000);
  render();
}

function nextExercise() {
  const workout = WORKOUTS.find(w => w.slug === routeParams.slug);
  const day = workout.program.days[workoutState.currentDay];
  if (workoutState.currentExercise < day.exercises.length - 1) {
    workoutState.currentExercise++;
    render();
  }
}

function prevExercise() {
  if (workoutState.currentExercise > 0) {
    workoutState.currentExercise--;
    render();
  }
}

function completeWorkout() {
  clearInterval(workoutState.timerInterval);
  const workout = WORKOUTS.find(w => w.slug === routeParams.slug);
  Progress.logWorkout(workout.name, workoutState.seconds);
  workoutState.completed = true;
  render();
  spawnConfetti(workout.type === 'villain' ? 'villain' : 'hero');
  showToast(`${workout.name} completed!`, 'success');
}

function confirmQuit() {
  if (confirm('Quit this workout? Your progress won\'t be saved.')) {
    clearInterval(workoutState.timerInterval);
    workoutState = { started: false, completed: false, currentExercise: 0, currentDay: 0, seconds: 0, timerInterval: null };
    navigate('/');
  }
}

function finishAndGoHome() {
  workoutState = { started: false, completed: false, currentExercise: 0, currentDay: 0, seconds: 0, timerInterval: null };
  navigate('/');
}

// ============================================
// Confetti
// ============================================
function spawnConfetti(type) {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  const colors = type === 'villain'
    ? ['hsl(280,80%,60%)', 'hsl(280,60%,70%)', 'hsl(300,70%,55%)', 'hsl(260,80%,65%)']
    : ['hsl(190,90%,50%)', 'hsl(190,70%,60%)', 'hsl(200,80%,55%)', 'hsl(180,90%,45%)'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    piece.style.animationDelay = Math.random() * 0.8 + 's';
    piece.style.width = (6 + Math.random() * 6) + 'px';
    piece.style.height = (6 + Math.random() * 6) + 'px';
    container.appendChild(piece);
  }
  setTimeout(() => container.innerHTML = '', 4000);
}

// ============================================
// Auth Modal
// ============================================
function showAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('auth-input')?.focus(), 100);
}
function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}
function handleLogin(e) {
  e.preventDefault();
  const input = document.getElementById('auth-input');
  const username = input.value.trim();
  if (!username) return;
  Auth.login(username);
  currentRoute = 'home';
  activeTab = 'heroes';
  render();
  showToast(`Welcome, ${username}!`, 'success');
}

// ============================================
// Paywall
// ============================================
function showPaywall() { document.getElementById('paywall-modal').classList.remove('hidden'); }
function closePaywall() { document.getElementById('paywall-modal').classList.add('hidden'); }
function handleTogglePro() {
  const isPro = Progress.togglePro();
  closePaywall();
  render();
  showToast(isPro ? 'Villain Mode unlocked!' : 'Pro downgraded.', 'success');
}

// ============================================
// Tabs
// ============================================
function switchTab(tab) {
  activeTab = tab;
  render();
}

// ============================================
// Toast
// ============================================
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// Chart Helper
// ============================================
function getLast7DaysChart(logs) {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLogs = logs.filter(l => l.date === dateStr);
    const totalMin = dayLogs.reduce((s, l) => s + l.duration, 0);
    days.push({ label: dayNames[d.getDay()], date: dateStr, minutes: totalMin });
  }
  return days;
}

// ============================================
// Helpers
// ============================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function bindEvents() {
  // Focus management, etc. handled inline
}

// ============================================
// Init
// ============================================
handleRoute();
