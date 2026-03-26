/* ============================================
   HeroSplit v2 — Full Gamified Static App
   ============================================ */

// ============================================
// localStorage Utility
// ============================================
const Store = {
  get(key, fallback = null) {
    try { const r = localStorage.getItem(`hs_${key}`); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(`hs_${key}`, JSON.stringify(val)); },
  update(key, fn, fallback) { Store.set(key, fn(Store.get(key, fallback))); },
  remove(key) { localStorage.removeItem(`hs_${key}`); }
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
      Store.set('settings', { isPro: false, xp: 0, level: 1, currentStreak: 0, longestStreak: 0, totalWorkouts: 0 });
    }
    return user;
  },
  logout() { Store.remove('user'); navigate('/'); }
};

// ============================================
// XP & Leveling
// ============================================
const XP = {
  thresholds: [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000, 26000, 30500, 35500, 41000, 47000, 54000, 62000, 71000, 81000, 92000, 104000],
  levelForXP(xp) {
    for (let i = this.thresholds.length - 1; i >= 0; i--) {
      if (xp >= this.thresholds[i]) return i + 1;
    }
    return 1;
  },
  xpForLevel(level) { return this.thresholds[Math.min(level - 1, this.thresholds.length - 1)] || 0; },
  xpForNextLevel(level) { return this.thresholds[Math.min(level, this.thresholds.length - 1)] || this.thresholds[this.thresholds.length - 1]; },
  progressInLevel(xp, level) {
    const cur = this.xpForLevel(level);
    const next = this.xpForNextLevel(level);
    if (next === cur) return 1;
    return (xp - cur) / (next - cur);
  },
  award(amount) {
    const s = Progress.getSettings();
    const oldLevel = s.level;
    s.xp += amount;
    s.level = this.levelForXP(s.xp);
    Progress.setSettings(s);
    if (s.level > oldLevel) {
      showToast(`LEVEL UP! You're now Level ${s.level}!`, 'xp');
    }
    return amount;
  }
};

// ============================================
// Achievements
// ============================================
const ACHIEVEMENTS = [
  { id: 'first-blood', name: 'First Blood', icon: '⚔️', desc: 'Complete your first workout' },
  { id: 'pack-leader', name: 'Pack Leader', icon: '🃏', desc: 'Collect all 5 free characters' },
  { id: 'week-warrior', name: 'Week Warrior', icon: '🔥', desc: '7-day workout streak' },
  { id: 'iron-will', name: 'Iron Will', icon: '🛡️', desc: '30-day workout streak' },
  { id: 'century', name: 'Century Club', icon: '💯', desc: '100 total workouts' },
  { id: 'speed-demon', name: 'Speed Demon', icon: '⚡', desc: 'Finish a workout in under 10 min' },
  { id: 'marathon', name: 'Marathon', icon: '🏃', desc: 'Workout over 60 minutes' },
  { id: 'volume-king', name: 'Volume King', icon: '👑', desc: 'Log 1,000 total reps' },
  { id: 'villain-arc', name: 'Villain Arc', icon: '👿', desc: 'Unlock Pro mode' },
  { id: 'level-10', name: 'Ascended', icon: '🌟', desc: 'Reach Level 10' },
  { id: 'five-workouts', name: 'Warming Up', icon: '🏋️', desc: 'Complete 5 workouts' },
  { id: 'level-5', name: 'Rising Hero', icon: '📈', desc: 'Reach Level 5' },
];

const Achievements = {
  getUnlocked() { return Store.get('achievements', []); },
  isUnlocked(id) { return this.getUnlocked().includes(id); },
  unlock(id) {
    if (this.isUnlocked(id)) return false;
    const a = this.getUnlocked();
    a.push(id);
    Store.set('achievements', a);
    const def = ACHIEVEMENTS.find(x => x.id === id);
    if (def) {
      showToast(`${def.icon} Achievement: ${def.name}!`, 'achievement');
      XP.award(50);
    }
    return true;
  },
  checkAll() {
    const s = Progress.getSettings();
    const logs = Progress.getLogs();
    const roster = Roster.getAll();
    if (logs.length >= 1) this.unlock('first-blood');
    if (logs.length >= 5) this.unlock('five-workouts');
    if (logs.length >= 100) this.unlock('century');
    if (s.currentStreak >= 7) this.unlock('week-warrior');
    if (s.currentStreak >= 30) this.unlock('iron-will');
    if (s.isPro) this.unlock('villain-arc');
    if (s.level >= 5) this.unlock('level-5');
    if (s.level >= 10) this.unlock('level-10');
    if (roster.length >= 5) this.unlock('pack-leader');
    const exLogs = Store.get('exercise_logs', {});
    let totalReps = 0;
    for (const key of Object.keys(exLogs)) {
      for (const set of exLogs[key]) { totalReps += (parseInt(set.reps) || 0); }
    }
    if (totalReps >= 1000) this.unlock('volume-king');
  }
};

// ============================================
// Roster (Character Collection)
// ============================================
const Roster = {
  getAll() { return Store.get('roster', []); },
  has(slug) { return this.getAll().includes(slug); },
  add(slug) {
    const r = this.getAll();
    if (!r.includes(slug)) { r.push(slug); Store.set('roster', r); }
  },
  count() { return this.getAll().length; },
  maxFree: 5,
  isOnboarded() { return Store.get('onboarded', false); },
  setOnboarded() { Store.set('onboarded', true); }
};

// ============================================
// Progress / Logs
// ============================================
const Progress = {
  getSettings() { return Store.get('settings', { isPro: false, xp: 0, level: 1, currentStreak: 0, longestStreak: 0, totalWorkouts: 0 }); },
  setSettings(s) { Store.set('settings', s); },
  togglePro() { const s = this.getSettings(); s.isPro = !s.isPro; this.setSettings(s); Achievements.checkAll(); return s.isPro; },
  getLogs() { return Store.get('logs', []); },
  logWorkout(workoutName, durationSec, setsCompleted) {
    const logs = this.getLogs();
    const today = new Date().toISOString().slice(0, 10);
    const durationMin = Math.max(1, Math.round(durationSec / 60));
    logs.unshift({ workoutName, date: today, duration: durationMin, setsCompleted: setsCompleted || 0, completedAt: new Date().toISOString() });
    Store.set('logs', logs);

    const s = this.getSettings();
    s.totalWorkouts++;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const hasYesterday = logs.some(l => l.date === yesterday);
    const hadTodayBefore = logs.filter(l => l.date === today).length > 1;
    if (!hadTodayBefore) { s.currentStreak = hasYesterday ? s.currentStreak + 1 : 1; }
    s.longestStreak = Math.max(s.longestStreak, s.currentStreak);
    this.setSettings(s);

    const xpEarned = 100 + (setsCompleted * 10) + (s.currentStreak * 5);
    XP.award(xpEarned);

    if (durationSec < 600) Achievements.unlock('speed-demon');
    if (durationSec > 3600) Achievements.unlock('marathon');
    Achievements.checkAll();

    return xpEarned;
  },
  getExerciseLogs(key) { const all = Store.get('exercise_logs', {}); return all[key] || []; },
  saveExerciseLog(key, sets) { const all = Store.get('exercise_logs', {}); all[key] = sets; Store.set('exercise_logs', all); }
};

// ============================================
// Workout Data
// ============================================
const WORKOUTS = [
  {
    slug: "one-punch", name: "The One Punch", type: "hero",
    difficulty: "Elite Level", avatarEmoji: "\u2728", equipment: "Bodyweight", isPro: false,
    archetype: "Power", tagline: "Simple. Brutal. Effective.",
    stats: { str: 10, spd: 7, end: 10 },
    description: "The legendary training regimen that can make you invincible.",
    program: { days: [{ label: "Daily", focus: "Full Body", exercises: [
      { name: "Pushups", sets: "1", reps: "100", instructions: "Standard pushups. Break into sets as needed." },
      { name: "Situps", sets: "1", reps: "100", instructions: "Full situps, feet unanchored." },
      { name: "Squats", sets: "1", reps: "100", instructions: "Full depth air squats." },
      { name: "Run", sets: "1", reps: "10km", instructions: "Steady pace. No walking." }
    ]}]}
  },
  {
    slug: "wall-crawler-acrobat", name: "Wall-Crawler Acrobat", type: "hero",
    difficulty: "Advanced", avatarEmoji: "\ud83d\udd77\ufe0f", equipment: "Bodyweight", isPro: false,
    archetype: "Agile", tagline: "Bodyweight mastery + explosive agility.",
    stats: { str: 7, spd: 9, end: 8 },
    description: "Climb walls and stick landings like a true acrobat.",
    program: { days: [
      { label: "Back", focus: "Hypertrophy", notes: "Grip + vertical pull strength for climbing.", exercises: [
        { name: "Scap Pull-Aparts", sets: "2", reps: "15", instructions: "Warm-up: Controlled scapular retraction." },
        { name: "Quadrupedal Crawl", sets: "2", reps: "30s", instructions: "Warm-up: Low crawl keeping hips level." },
        { name: "Weighted Chin-Up", sets: "4", reps: "6-8", rest: "120s", instructions: "Full range, controlled descent." },
        { name: "Climb-Up Practice", sets: "4", reps: "3-5", rest: "120s", instructions: "Explosive pull to chest-over-bar." },
        { name: "Front Lever Progression", sets: "3", reps: "5-8s hold", rest: "90s", instructions: "Use appropriate progression." },
        { name: "Hanging Leg Raise", sets: "3", reps: "10-12", rest: "60s", instructions: "Controlled, no swinging." }
      ]},
      { label: "Legs", focus: "Conditioning", notes: "Single-leg power for parkour landings.", exercises: [
        { name: "Pistol Squat", sets: "4", reps: "5-8/leg", rest: "90s", instructions: "Full depth single leg squat." },
        { name: "Broad Jump", sets: "5", reps: "5", rest: "90s", instructions: "Maximum distance each rep." },
        { name: "Bulgarian Split Squat Jump", sets: "3", reps: "6/leg", rest: "75s", instructions: "Explosive with rear foot elevated." },
        { name: "Wall Sit", sets: "3", reps: "45-60s", rest: "60s", instructions: "Thighs parallel, back flat." }
      ]},
      { label: "Upper", focus: "Hypertrophy", notes: "Gymnastic pushing + core tension.", exercises: [
        { name: "Handstand Push-Up", sets: "4", reps: "5-8", rest: "120s", instructions: "Wall-assisted or freestanding." },
        { name: "Ring Dip", sets: "4", reps: "8-10", rest: "90s", instructions: "Full lockout, rings turned out." },
        { name: "Pike Push-Up", sets: "3", reps: "10-12", rest: "75s", instructions: "Elevated feet for challenge." },
        { name: "Hollow Body Rock", sets: "3", reps: "30-45s", rest: "60s", instructions: "Tight core, minimal amplitude." }
      ]}
    ]}
  },
  {
    slug: "speedforce-sprinter", name: "Speedforce Sprinter", type: "hero",
    difficulty: "Elite Level", avatarEmoji: "\u26a1", equipment: "Full Gym", isPro: false,
    archetype: "Speed", tagline: "Explosive acceleration + top-end speed.",
    stats: { str: 6, spd: 10, end: 8 },
    description: "Train your body to move at lightning pace.",
    program: { days: [
      { label: "Speed", focus: "Conditioning", notes: "Max velocity + acceleration.", exercises: [
        { name: "Flying 30m Sprint", sets: "6", reps: "1", rest: "180s", instructions: "Build up then hit max velocity." },
        { name: "Block Starts", sets: "5", reps: "20m", rest: "120s", instructions: "Explosive first-step acceleration." },
        { name: "Box Jump", sets: "4", reps: "5", rest: "90s", instructions: "Maximum height, soft landing." },
        { name: "Bounding", sets: "4", reps: "30m", rest: "90s", instructions: "Exaggerated running strides." }
      ]},
      { label: "Legs", focus: "Strength", notes: "Posterior chain + single-leg power.", exercises: [
        { name: "Trap Bar Deadlift", sets: "5", reps: "3-5", rest: "150s", instructions: "Drive through floor, full lockout." },
        { name: "Bulgarian Split Squat", sets: "4", reps: "6-8/leg", rest: "120s", instructions: "Rear foot elevated, deep bend." },
        { name: "Calf Raise", sets: "4", reps: "12-15", rest: "60s", instructions: "Full stretch, pause at top." },
        { name: "Nordic Curl", sets: "3", reps: "5-8", rest: "90s", instructions: "Slow eccentric, catch at bottom." }
      ]},
      { label: "Engine", focus: "Conditioning", notes: "Speed endurance + technique.", exercises: [
        { name: "150m Sprint", sets: "5", reps: "1", rest: "240s", instructions: "95% effort, full recovery." },
        { name: "Tempo Run 200m", sets: "4", reps: "85% effort", rest: "120s", instructions: "Controlled speed, focus on form." },
        { name: "A-Skip Drill", sets: "3", reps: "40m", instructions: "High knees with rhythmic skip." },
        { name: "High Knee Sprint", sets: "3", reps: "30m", instructions: "Drive knees high, pump arms." }
      ]}
    ]}
  },
  {
    slug: "thunder-god", name: "Thunder God", type: "hero",
    difficulty: "Advanced", avatarEmoji: "\ud83d\udd28", equipment: "Full Gym", isPro: false,
    archetype: "Power", tagline: "Overhead power + battle conditioning.",
    stats: { str: 9, spd: 7, end: 8 },
    description: "Wield the strength of a god.",
    program: { days: [
      { label: "Push", focus: "Strength", notes: "Maximal overhead strength.", exercises: [
        { name: "Overhead Press", sets: "5", reps: "3-5", rest: "150s", instructions: "Strict press, full lockout." },
        { name: "Push Press", sets: "4", reps: "5-6", rest: "120s", instructions: "Use leg drive for heavier loads." },
        { name: "DB Overhead Press", sets: "3", reps: "8-10", rest: "90s", instructions: "Seated or standing, full range." },
        { name: "Landmine Press", sets: "3", reps: "10-12", rest: "75s", instructions: "Single arm, press at angle." }
      ]},
      { label: "Pull", focus: "Hypertrophy", notes: "Pulling volume + back thickness.", exercises: [
        { name: "Deadlift", sets: "4", reps: "5-6", rest: "150s", instructions: "Conventional stance, brace hard." },
        { name: "Weighted Pull-Up", sets: "4", reps: "6-8", rest: "120s", instructions: "Add weight via belt." },
        { name: "Cable Row", sets: "3", reps: "10-12", rest: "75s", instructions: "Squeeze shoulder blades." },
        { name: "Face Pull", sets: "3", reps: "15", rest: "60s", instructions: "High pull, external rotation." }
      ]},
      { label: "Battle", focus: "Conditioning", notes: "Battle-ready work capacity.", exercises: [
        { name: "Tire Flip", sets: "5", reps: "5", instructions: "Drive hips into tire, flip." },
        { name: "Sledgehammer Slam", sets: "5", reps: "20", instructions: "Alternate sides, full swing." },
        { name: "Atlas Stone Load", sets: "5", reps: "3", instructions: "Lap stone, drive to platform." }
      ]}
    ]}
  },
  {
    slug: "armored-genius", name: "Armored Genius", type: "hero",
    difficulty: "Intermediate", avatarEmoji: "\ud83e\udd16", equipment: "Full Gym", isPro: false,
    archetype: "Balanced", tagline: "Executive physique + functional fitness.",
    stats: { str: 7, spd: 7, end: 8 },
    description: "Balanced training for the brilliant mind.",
    program: { days: [
      { label: "Chest", focus: "Hypertrophy", notes: "Classic chest work.", exercises: [
        { name: "Barbell Bench Press", sets: "4", reps: "6-8", rest: "120s", instructions: "Controlled descent, explosive press." },
        { name: "Incline DB Press", sets: "3", reps: "8-10", rest: "90s", instructions: "30-45 degree incline." },
        { name: "Cable Fly", sets: "3", reps: "12-15", rest: "60s", instructions: "Squeeze at peak contraction." },
        { name: "Push-Up", sets: "2", reps: "AMRAP", rest: "60s", instructions: "As many reps as possible." }
      ]},
      { label: "Back", focus: "Hypertrophy", notes: "Back thickness + width.", exercises: [
        { name: "Barbell Row", sets: "4", reps: "6-8", rest: "120s", instructions: "Bent over, pull to lower chest." },
        { name: "Pull-Up", sets: "4", reps: "8-10", rest: "90s", instructions: "Full dead hang to chin over bar." },
        { name: "Lat Pulldown", sets: "3", reps: "10-12", rest: "75s", instructions: "Wide grip, pull to upper chest." },
        { name: "Rear Delt Fly", sets: "3", reps: "15", rest: "60s", instructions: "Light weight, focus on squeeze." }
      ]},
      { label: "Cardio", focus: "Conditioning", notes: "Maintain conditioning.", exercises: [
        { name: "Rowing Machine", sets: "1", reps: "20min steady", instructions: "Consistent pace, 500m splits." },
        { name: "Bike Sprints", sets: "8", reps: "30s / 90s rest", instructions: "All-out sprints, easy recovery." }
      ]}
    ]}
  },
  {
    slug: "tactical-assassin", name: "Tactical Assassin", type: "hero",
    difficulty: "Advanced", avatarEmoji: "\u2694\ufe0f", equipment: "Full Gym", isPro: false,
    archetype: "Balanced", tagline: "Combat conditioning + tactical strength.",
    stats: { str: 8, spd: 8, end: 9 },
    description: "Prepared for any mission.",
    program: { days: [
      { label: "Upper", focus: "Strength", notes: "Upper body strength for combat.", exercises: [
        { name: "Weighted Pull-Up", sets: "5", reps: "3-5", rest: "150s", instructions: "Heavy load, full range." },
        { name: "Barbell Overhead Press", sets: "4", reps: "5-6", rest: "120s", instructions: "Strict press, no leg drive." },
        { name: "Dumbbell Row", sets: "3", reps: "8-10", rest: "90s", instructions: "One arm, full stretch." },
        { name: "Dip", sets: "3", reps: "10-12", rest: "90s", instructions: "Lean forward for chest." }
      ]},
      { label: "Legs", focus: "Strength", notes: "Functional leg power.", exercises: [
        { name: "Front Squat", sets: "5", reps: "3-5", rest: "150s", instructions: "Elbows high, upright torso." },
        { name: "Romanian Deadlift", sets: "4", reps: "6-8", rest: "120s", instructions: "Hinge at hips, feel hamstrings." },
        { name: "Reverse Lunge", sets: "3", reps: "8/leg", rest: "90s", instructions: "Step back, control descent." },
        { name: "Sled Push", sets: "4", reps: "30m", rest: "90s", instructions: "Low handles, drive hard." }
      ]},
      { label: "Combat", focus: "Conditioning", notes: "Work capacity under fatigue.", exercises: [
        { name: "Burpee", sets: "5", reps: "10", instructions: "Circuit x5: Full burpee with jump." },
        { name: "Kettlebell Swing", sets: "5", reps: "15", instructions: "Circuit x5: Hip hinge, snap forward." },
        { name: "Box Jump", sets: "5", reps: "8", instructions: "Circuit x5: Explosive jump, step down." }
      ]}
    ]}
  },
  // ---- VILLAIN WORKOUTS ----
  {
    slug: "gamma-juggernaut", name: "Gamma Juggernaut", type: "villain",
    difficulty: "Elite Level", avatarEmoji: "\ud83d\udcaa", equipment: "Full Gym", isPro: true,
    archetype: "Power", tagline: "Maximum strength + raw power.",
    stats: { str: 10, spd: 5, end: 7 },
    description: "Become an unstoppable force of nature.",
    program: { days: [
      { label: "Legs", focus: "Strength", notes: "Absolute leg strength.", exercises: [
        { name: "Back Squat", sets: "5", reps: "3-5", rest: "180s", instructions: "Below parallel, brace core." },
        { name: "Conventional Deadlift", sets: "5", reps: "3-5", rest: "180s", instructions: "Hips and shoulders rise together." },
        { name: "Front Squat", sets: "3", reps: "6-8", rest: "120s", instructions: "Elbows high, upright." },
        { name: "Good Morning", sets: "3", reps: "8-10", rest: "90s", instructions: "Barbell on back, hinge." }
      ]},
      { label: "Push", focus: "Strength", notes: "Max pressing power.", exercises: [
        { name: "Bench Press", sets: "5", reps: "3-5", rest: "150s", instructions: "Arch back, retract scapulae." },
        { name: "Log Press", sets: "4", reps: "5-6", rest: "150s", instructions: "Clean to rack, press overhead." },
        { name: "Close-Grip Bench", sets: "3", reps: "6-8", rest: "120s", instructions: "Shoulder-width, tricep focus." },
        { name: "Weighted Dip", sets: "3", reps: "8-10", rest: "90s", instructions: "Add weight via belt." }
      ]},
      { label: "Pull", focus: "Strength", notes: "Grip + back thickness.", exercises: [
        { name: "Barbell Row", sets: "5", reps: "5-6", rest: "120s", instructions: "Heavy rows, controlled." },
        { name: "Farmer Carry", sets: "4", reps: "40-60m", rest: "90s", instructions: "Heavy handles, walk straight." },
        { name: "Pull-Up", sets: "4", reps: "AMRAP", rest: "120s", instructions: "Dead hang, chin over bar." },
        { name: "Shrug", sets: "4", reps: "10-12", rest: "90s", instructions: "Heavy, pause at top." }
      ]}
    ]}
  },
  {
    slug: "mercenary-regen", name: "Mercenary Regen", type: "villain",
    difficulty: "Advanced", avatarEmoji: "\ud83d\udde1\ufe0f", equipment: "Full Gym", isPro: true,
    archetype: "Endurance", tagline: "High-volume chaos + metabolic mayhem.",
    stats: { str: 7, spd: 8, end: 10 },
    description: "Pain is just information.",
    program: { days: [
      { label: "Chaos", focus: "Conditioning", notes: "Unpredictable high-intensity.", exercises: [
        { name: "Assault Bike", sets: "1", reps: "30 cal", instructions: "All-out effort." },
        { name: "Burpee Box Jump", sets: "1", reps: "20", instructions: "Burpee into box jump." },
        { name: "KB Swing", sets: "1", reps: "30", instructions: "Russian or American." },
        { name: "Row Machine", sets: "1", reps: "500m", instructions: "Sprint row." },
        { name: "Devil Press", sets: "1", reps: "15", instructions: "Burpee + dumbbell snatch." },
        { name: "Wall Ball", sets: "1", reps: "30", instructions: "Full squat, throw to target." }
      ]},
      { label: "Upper", focus: "Hypertrophy", notes: "Volume pushing + pulling.", exercises: [
        { name: "DB Bench Press", sets: "4", reps: "12-15", rest: "30s", instructions: "Superset: Go straight to rows." },
        { name: "DB Row", sets: "4", reps: "12-15", rest: "90s", instructions: "Complete pair, then rest." },
        { name: "Push-Up", sets: "3", reps: "AMRAP", instructions: "Max reps to failure." },
        { name: "Pull-Up", sets: "3", reps: "AMRAP", instructions: "Max reps to failure." }
      ]},
      { label: "Engine", focus: "Conditioning", notes: "Sustained anaerobic output.", exercises: [
        { name: "Thruster", sets: "20", reps: "10", instructions: "EMOM: Every minute on the minute." },
        { name: "Burpee", sets: "20", reps: "8", instructions: "EMOM: Alternate with thrusters." },
        { name: "Double Under", sets: "20", reps: "30", instructions: "If no rope, tuck jumps." }
      ]}
    ]}
  },
  {
    slug: "chaos-agent", name: "Chaos Agent", type: "villain",
    difficulty: "Advanced", avatarEmoji: "\ud83c\udccf", equipment: "Minimal", isPro: true,
    archetype: "Endurance", tagline: "Mental toughness + endurance under stress.",
    stats: { str: 6, spd: 7, end: 10 },
    description: "Embrace the chaos.",
    program: { days: [
      { label: "Chaos", focus: "Conditioning", notes: "Adapt on the fly.", exercises: [
        { name: "Run 400m", sets: "5", reps: "1", rest: "90-180s", instructions: "Vary rest randomly each round." },
        { name: "Burpee", sets: "5", reps: "15-25", instructions: "Roll a die for rep count." },
        { name: "Jump Rope", sets: "5", reps: "100-200", instructions: "Different count each round." }
      ]},
      { label: "Grind", focus: "Conditioning", notes: "Sustained effort under discomfort.", exercises: [
        { name: "Kettlebell Swing", sets: "4", reps: "30", instructions: "Hip hinge, bell to eye level." },
        { name: "Box Step-Up", sets: "4", reps: "20/leg", instructions: "Alternate legs each rep." },
        { name: "Battle Rope", sets: "4", reps: "45s", instructions: "Double wave pattern." }
      ]},
      { label: "Core", focus: "Conditioning", notes: "Mental fortitude through core fatigue.", exercises: [
        { name: "Ab Wheel Rollout", sets: "4", reps: "10-12", instructions: "Full extension if possible." },
        { name: "Plank Hold", sets: "4", reps: "60-90s", instructions: "Forearm plank, squeeze everything." },
        { name: "Russian Twist", sets: "4", reps: "30", instructions: "Weighted, feet elevated." }
      ]}
    ]}
  },
  {
    slug: "apex-predator", name: "Apex Predator", type: "villain",
    difficulty: "Elite Level", avatarEmoji: "\ud83d\udc7e", equipment: "Full Gym", isPro: true,
    archetype: "Power", tagline: "Explosive animalistic power + plyometrics.",
    stats: { str: 9, spd: 8, end: 7 },
    description: "Hunt like a predator.",
    program: { days: [
      { label: "Legs", focus: "Strength", notes: "Explosive lower body power.", exercises: [
        { name: "Box Squat", sets: "5", reps: "3-5", rest: "150s", instructions: "Sit on box, explode up." },
        { name: "Trap Bar Deadlift", sets: "5", reps: "3-5", rest: "150s", instructions: "Drive through floor." },
        { name: "Depth Jump", sets: "4", reps: "5", rest: "120s", instructions: "Step off, jump max height." },
        { name: "Broad Jump", sets: "4", reps: "5", rest: "90s", instructions: "Swing arms, jump for distance." }
      ]},
      { label: "Upper", focus: "Hypertrophy", notes: "Upper body mass + power.", exercises: [
        { name: "Weighted Dip", sets: "4", reps: "6-8", rest: "120s", instructions: "Add weight, full depth." },
        { name: "Barbell Row", sets: "4", reps: "6-8", rest: "120s", instructions: "Explosive pull, controlled lower." },
        { name: "Close-Grip Bench", sets: "3", reps: "8-10", rest: "90s", instructions: "Tricep emphasis." },
        { name: "Pull-Up", sets: "3", reps: "AMRAP", rest: "90s", instructions: "Max reps each set." }
      ]},
      { label: "Animal", focus: "Conditioning", notes: "Movement quality + conditioning.", exercises: [
        { name: "Bear Crawl", sets: "4", reps: "30m", instructions: "Keep hips low and level." },
        { name: "Crab Walk", sets: "4", reps: "30m", instructions: "Belly up, hips high." },
        { name: "Frog Jump", sets: "4", reps: "20m", instructions: "Deep squat, jump forward." }
      ]}
    ]}
  },
  {
    slug: "shadow-league-master", name: "Shadow League Master", type: "villain",
    difficulty: "Advanced", avatarEmoji: "\ud83e\udd4b", equipment: "Bodyweight", isPro: true,
    archetype: "Balanced", tagline: "Martial conditioning + longevity training.",
    stats: { str: 8, spd: 8, end: 9 },
    description: "Master of all disciplines.",
    program: { days: [
      { label: "Upper", focus: "Hypertrophy", notes: "Bodyweight push + pull mastery.", exercises: [
        { name: "Push-Up Variation Circuit", sets: "4", reps: "15 each", instructions: "Wide / diamond / decline per set." },
        { name: "Pull-Up Variation Circuit", sets: "4", reps: "10 each", instructions: "Wide / neutral / chin per set." },
        { name: "Pike Push-Up", sets: "3", reps: "12-15", instructions: "Elevated feet for shoulder focus." },
        { name: "Inverted Row", sets: "3", reps: "12-15", instructions: "Under a bar or rings." }
      ]},
      { label: "Legs", focus: "Strength", notes: "Single-leg strength + mobility.", exercises: [
        { name: "Pistol Squat", sets: "4", reps: "6-8/leg", rest: "90s", instructions: "Control the descent." },
        { name: "Single-Leg RDL", sets: "4", reps: "8-10/leg", rest: "90s", instructions: "Hinge on one leg." },
        { name: "Cossack Squat", sets: "3", reps: "10/leg", instructions: "Deep lateral squat." },
        { name: "Calf Raise", sets: "3", reps: "15", instructions: "Full range, single or double." }
      ]},
      { label: "Martial", focus: "Conditioning", notes: "Combat endurance + footwork.", exercises: [
        { name: "Heavy Bag Rounds", sets: "6", reps: "3min / 1min rest", instructions: "Mix punches, kicks, knees." },
        { name: "Shadow Boxing", sets: "3", reps: "2min", instructions: "Visualize opponent, work combos." },
        { name: "Jump Rope", sets: "1", reps: "10min steady", instructions: "Stay light, consistent rhythm." }
      ]}
    ]}
  }
];

// ============================================
// Router
// ============================================
let currentRoute = '';
let routeParams = {};

function navigate(path) { history.pushState(null, '', path); handleRoute(); }

function handleRoute() {
  const path = location.pathname || '/';
  const workoutMatch = path.match(/^\/workout\/(.+)$/);
  if (workoutMatch) { routeParams = { slug: workoutMatch[1] }; currentRoute = 'workout'; }
  else {
    const user = Auth.getUser();
    if (!user) currentRoute = 'landing';
    else if (!Roster.isOnboarded()) currentRoute = 'onboarding';
    else currentRoute = 'home';
  }
  render();
}

window.addEventListener('popstate', handleRoute);

// ============================================
// Render
// ============================================
function render() {
  const app = document.getElementById('app');
  switch (currentRoute) {
    case 'landing': app.innerHTML = renderLanding(); break;
    case 'onboarding': app.innerHTML = renderOnboarding(); break;
    case 'home': app.innerHTML = renderHome(); break;
    case 'workout': app.innerHTML = renderWorkout(); break;
    default: app.innerHTML = renderLanding();
  }
}

// ============================================
// Landing
// ============================================
function renderLanding() {
  return `
    <div class="landing">
      <div class="landing-bg">
        <div class="landing-blob landing-blob-1"></div>
        <div class="landing-blob landing-blob-2"></div>
        <div class="landing-blob landing-blob-3"></div>
      </div>
      <header class="landing-header">
        <div class="logo"><span class="logo-hero">Hero</span><span class="logo-split">Split</span></div>
        <button class="btn btn-ghost" onclick="showAuthModal()">Sign In</button>
      </header>
      <div class="landing-content">
        <div class="landing-tagline">The #1 Character-Inspired Workout App</div>
        <h1 class="landing-title">Train Like a<br><span class="gradient">Champion.</span></h1>
        <p class="landing-subtitle">Character-inspired workout programs that transform generic routines into personalized epic quests. Track progress, level up, and build your roster.</p>
        <div class="landing-actions">
          <button class="btn btn-orange btn-lg" onclick="showAuthModal()">Start Training</button>
          <button class="btn btn-ghost btn-lg" onclick="showAuthModal()">View Roster</button>
        </div>
      </div>
      <div class="landing-features">
        <div class="landing-feature">
          <span class="landing-feature-icon">\ud83c\udccf</span>
          <h3>Collect Characters</h3>
          <p>Draft your roster from hero and villain archetypes. Each has unique workout splits.</p>
        </div>
        <div class="landing-feature">
          <span class="landing-feature-icon">\ud83d\udcca</span>
          <h3>Track Everything</h3>
          <p>Log sets, reps, and weight. Watch your stats grow with every session.</p>
        </div>
        <div class="landing-feature">
          <span class="landing-feature-icon">\u26a1</span>
          <h3>Level Up</h3>
          <p>Earn XP, unlock achievements, and progress through training levels.</p>
        </div>
      </div>
    </div>
    <div id="auth-modal" class="modal-overlay hidden" onclick="if(event.target===this)closeAuthModal()">
      <div class="modal">
        <h2>Welcome, Hero.</h2>
        <p>Enter your name to begin your origin story.</p>
        <form class="modal-form" onsubmit="handleLogin(event)">
          <input class="modal-input" id="auth-input" type="text" placeholder="Your hero name..." maxlength="30" required />
          <button class="btn btn-orange btn-lg" type="submit" style="width:100%">Begin Training</button>
        </form>
        <div class="modal-footer">Your data is stored locally on this device.</div>
      </div>
    </div>`;
}

function showAuthModal() { document.getElementById('auth-modal').classList.remove('hidden'); setTimeout(() => document.getElementById('auth-input')?.focus(), 100); }
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }
function handleLogin(e) {
  e.preventDefault();
  const val = document.getElementById('auth-input').value.trim();
  if (!val) return;
  Auth.login(val);
  currentRoute = Roster.isOnboarded() ? 'home' : 'onboarding';
  render();
  showToast(`Welcome, ${val}!`, 'success');
}

// ============================================
// Onboarding
// ============================================
let onboardingStep = 1;
let draftSelections = [];
let revealIndex = 0;

function renderOnboarding() {
  if (onboardingStep === 1) return renderDraftStep();
  if (onboardingStep === 2) return renderRevealStep();
  return '';
}

function renderDraftStep() {
  const allChars = WORKOUTS.filter(w => !w.isPro);
  return `
    <div class="onboarding">
      <header class="landing-header">
        <div class="logo"><span class="logo-hero">Hero</span><span class="logo-split">Split</span></div>
        <div></div>
      </header>
      <div class="onboarding-step">
        <h1>Draft Your Roster</h1>
        <p>Choose 5 characters to build your initial training roster. Each archetype brings a unique workout style.</p>
        <div class="draft-grid">
          ${allChars.map(w => `
            <div class="draft-card ${draftSelections.includes(w.slug) ? 'selected' : ''}" onclick="toggleDraft('${w.slug}')">
              <div class="draft-card-avatar">${w.avatarEmoji}</div>
              <div class="draft-card-name">${esc(w.name)}</div>
              <div class="draft-card-type">${w.archetype}</div>
              <div class="draft-card-stats">
                <span class="draft-stat str">STR ${w.stats.str}</span>
                <span class="draft-stat spd">SPD ${w.stats.spd}</span>
                <span class="draft-stat end">END ${w.stats.end}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="draft-counter"><span>${draftSelections.length}</span> / 5 Selected</div>
        <button class="btn btn-orange btn-lg" style="margin-top:16px" ${draftSelections.length < 5 ? 'disabled style="margin-top:16px;opacity:0.4;cursor:not-allowed"' : ''} onclick="startReveal()">Confirm Roster</button>
      </div>
    </div>`;
}

function toggleDraft(slug) {
  if (draftSelections.includes(slug)) draftSelections = draftSelections.filter(s => s !== slug);
  else if (draftSelections.length < 5) draftSelections.push(slug);
  render();
}

function startReveal() {
  if (draftSelections.length !== 5) return;
  onboardingStep = 2; revealIndex = 0; render();
}

function renderRevealStep() {
  const w = WORKOUTS.find(x => x.slug === draftSelections[revealIndex]);
  const isLast = revealIndex === draftSelections.length - 1;
  return `
    <div class="onboarding">
      <header class="landing-header">
        <div class="logo"><span class="logo-hero">Hero</span><span class="logo-split">Split</span></div>
        <div class="text-muted" style="font-size:13px">Card ${revealIndex + 1} of ${draftSelections.length}</div>
      </header>
      <div class="onboarding-step">
        <h1>Character Unlocked!</h1>
        <div class="reveal-container">
          <div class="reveal-card" key="${revealIndex}">
            <div class="reveal-card-inner">
              <div class="reveal-card-avatar">${w.avatarEmoji}</div>
              <div class="reveal-card-name">${esc(w.name)}</div>
              <div class="reveal-card-archetype">${w.archetype}</div>
              <div class="reveal-stats-bar">
                <div class="reveal-stat-row"><span class="reveal-stat-label text-orange">STR</span><div class="reveal-stat-track"><div class="reveal-stat-fill str" style="width:${w.stats.str * 10}%"></div></div></div>
                <div class="reveal-stat-row"><span class="reveal-stat-label text-hero">SPD</span><div class="reveal-stat-track"><div class="reveal-stat-fill spd" style="width:${w.stats.spd * 10}%"></div></div></div>
                <div class="reveal-stat-row"><span class="reveal-stat-label" style="color:var(--green)">END</span><div class="reveal-stat-track"><div class="reveal-stat-fill end" style="width:${w.stats.end * 10}%"></div></div></div>
              </div>
              <div style="font-size:12px;color:var(--fg-muted);margin-top:6px;font-style:italic">${esc(w.tagline)}</div>
            </div>
          </div>
        </div>
        <button class="btn btn-orange btn-lg" style="margin-top:24px" onclick="${isLast ? 'finishOnboarding()' : 'nextReveal()'}">${isLast ? 'Enter HeroSplit' : 'Next Card \u2192'}</button>
      </div>
    </div>`;
}

function nextReveal() { revealIndex++; render(); }

function finishOnboarding() {
  draftSelections.forEach(slug => Roster.add(slug));
  Roster.setOnboarded();
  Achievements.checkAll();
  onboardingStep = 1; draftSelections = [];
  currentRoute = 'home'; activeTab = 'heroes';
  render();
  showToast('Your roster is ready! Time to train.', 'success');
}

// ============================================
// Home
// ============================================
let activeTab = 'heroes';

function renderHome() {
  const user = Auth.getUser();
  if (!user) { currentRoute = 'landing'; return renderLanding(); }
  const settings = Progress.getSettings();
  const roster = Roster.getAll();
  const initial = user.username.charAt(0).toUpperCase();
  const heroWorkouts = WORKOUTS.filter(w => w.type === 'hero' && roster.includes(w.slug));
  const villainWorkouts = WORKOUTS.filter(w => w.type === 'villain');

  return `
    <header class="app-header">
      <div class="logo"><span class="logo-hero">Hero</span><span class="logo-split">Split</span></div>
      <div class="app-header-user">
        <div style="text-align:right">
          <div class="app-header-name">${esc(user.username)}</div>
          <div class="app-header-level">LVL ${settings.level}</div>
        </div>
        <div class="app-header-avatar">${initial}</div>
        <button class="btn btn-ghost btn-sm" onclick="Auth.logout()">Logout</button>
      </div>
    </header>
    <div class="container">
      <div class="tabs">
        <button class="tab ${activeTab === 'heroes' ? 'active' : ''}" onclick="switchTab('heroes')">\ud83d\udee1\ufe0f My Roster</button>
        <button class="tab ${activeTab === 'villains' ? 'active' : ''}" onclick="switchTab('villains')">\ud83d\udc7f Villains</button>
        <button class="tab ${activeTab === 'progress' ? 'active' : ''}" onclick="switchTab('progress')">\ud83d\udcca Progress</button>
        <button class="tab ${activeTab === 'achievements' ? 'active' : ''}" onclick="switchTab('achievements')">\ud83c\udfc6 Achievements</button>
      </div>
      <div id="tab-content">
        ${activeTab === 'heroes' ? renderHeroesTab(heroWorkouts, roster) : ''}
        ${activeTab === 'villains' ? renderVillainsTab(villainWorkouts, settings.isPro) : ''}
        ${activeTab === 'progress' ? renderProgressTab(settings) : ''}
        ${activeTab === 'achievements' ? renderAchievementsTab() : ''}
      </div>
    </div>
    <div id="paywall-modal" class="modal-overlay hidden" onclick="if(event.target===this)closePaywall()">
      <div class="modal">
        <div class="paywall-header">
          <div class="paywall-icon">\ud83d\udc51</div>
          <h2>Unlock Villain Mode</h2>
          <div class="paywall-price" style="margin-top:8px">$10<span class="paywall-price-old">$12</span><span style="font-size:14px;color:var(--fg-muted);font-family:var(--font-body)">/month</span></div>
        </div>
        <ul class="paywall-features">
          <li>Access all Villain Tier workouts</li>
          <li>Unlimited character roster</li>
          <li>Advanced analytics & tracking</li>
          <li>All future content updates</li>
        </ul>
        <button class="btn btn-orange btn-lg" style="width:100%" onclick="handleTogglePro()">Get Started</button>
        <div class="paywall-disclaimer">Demo only. No payment processed.</div>
      </div>
    </div>`;
}

function renderHeroesTab(workouts, roster) {
  return `
    <div class="roster-bar">
      <span class="roster-label">Roster:</span>
      ${roster.map(slug => { const w = WORKOUTS.find(x => x.slug === slug); return w ? `<div class="roster-slot filled" title="${esc(w.name)}">${w.avatarEmoji}</div>` : ''; }).join('')}
      ${Array(Math.max(0, 5 - roster.length)).fill(0).map(() => '<div class="roster-slot">?</div>').join('')}
    </div>
    <div class="section-header">
      <h2>My Characters</h2>
      <p>Your collected hero roster \u2014 tap to train</p>
    </div>
    <div class="workout-grid">
      ${workouts.map(w => renderWorkoutCard(w, false)).join('')}
    </div>
    ${workouts.length === 0 ? '<div class="log-empty">No characters in your roster yet.</div>' : ''}`;
}

function renderVillainsTab(workouts, isPro) {
  return `
    ${!isPro ? `
      <div class="villain-promo">
        <div class="villain-promo-icon">\ud83d\udc51</div>
        <h3>Villain Mode</h3>
        <p>Unlock brutal villain-tier programs designed to push you beyond your limits.</p>
        <button class="btn btn-villain btn-lg" onclick="showPaywall()" style="position:relative">Unlock Pro Access</button>
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
  const isV = workout.type === 'villain';
  const totalEx = workout.program.days.reduce((s, d) => s + d.exercises.length, 0);
  const hasDays = workout.program.days.length > 1;
  return `
    <div class="workout-card ${isV ? 'villain-card' : ''} ${locked ? 'locked-card' : ''}" ${locked ? '' : `onclick="navigate('/workout/${workout.slug}')"`}>
      <div class="card-avatar">${workout.avatarEmoji}</div>
      <div class="card-badges">
        <span class="badge badge-${isV ? 'villain' : 'orange'}">${workout.difficulty}</span>
        <span class="badge">${workout.equipment}</span>
        ${locked ? '<span class="badge">\ud83d\udd12</span>' : ''}
      </div>
      <div class="card-title">${esc(workout.name)}</div>
      <div class="card-desc">${esc(workout.description)}</div>
      <div class="card-stats">
        <div class="card-stat-item"><span style="color:var(--orange)">STR</span><div class="card-stat-mini"><div class="card-stat-mini-fill" style="width:${workout.stats.str*10}%;background:var(--orange)"></div></div></div>
        <div class="card-stat-item"><span style="color:var(--hero)">SPD</span><div class="card-stat-mini"><div class="card-stat-mini-fill" style="width:${workout.stats.spd*10}%;background:var(--hero)"></div></div></div>
        <div class="card-stat-item"><span style="color:var(--green)">END</span><div class="card-stat-mini"><div class="card-stat-mini-fill" style="width:${workout.stats.end*10}%;background:var(--green)"></div></div></div>
      </div>
      ${hasDays ? `<div class="day-selector">${workout.program.days.map(d => `<span class="day-btn">${d.label}</span>`).join('')}</div>` : ''}
      <div class="card-meta">
        <span>\u23f1 ${hasDays ? workout.program.days.length + ' days' : '~45 min'}</span>
        <span>\ud83c\udfcb\ufe0f ${totalEx} exercises</span>
      </div>
      <div class="card-actions">
        ${locked
          ? `<button class="btn btn-villain" style="width:100%" onclick="event.stopPropagation();showPaywall()">\ud83d\udd12 Unlock Pro</button>`
          : `<button class="btn btn-orange" style="width:100%" onclick="event.stopPropagation();navigate('/workout/${workout.slug}')">Start Workout \u2192</button>`}
      </div>
    </div>`;
}

function renderProgressTab(settings) {
  const logs = Progress.getLogs();
  const last7 = getLast7DaysChart(logs);
  const recentLogs = logs.slice(0, 5);
  const uniqueDays = new Set(logs.map(l => l.date)).size;
  const lvlProgress = XP.progressInLevel(settings.xp, settings.level);
  const xpInLevel = settings.xp - XP.xpForLevel(settings.level);
  const xpNeeded = XP.xpForNextLevel(settings.level) - XP.xpForLevel(settings.level);
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - lvlProgress);

  return `
    <div class="level-card">
      <div class="level-ring-container">
        <svg class="level-ring" width="100" height="100" viewBox="0 0 100 100">
          <circle class="level-ring-bg" cx="50" cy="50" r="42" />
          <circle class="level-ring-fill" cx="50" cy="50" r="42"
            stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" />
        </svg>
        <div class="level-ring-text">
          <div class="level-ring-number">${settings.level}</div>
          <div class="level-ring-label">Level</div>
        </div>
      </div>
      <div class="level-info">
        <h3>Training Level ${settings.level}</h3>
        <div class="level-info-xp">${settings.xp.toLocaleString()} XP total</div>
        <div class="level-info-bar"><div class="level-info-bar-fill" style="width:${lvlProgress * 100}%"></div></div>
        <div class="level-info-next">${xpInLevel} / ${xpNeeded} XP to Level ${settings.level + 1}</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">\ud83d\udd25</div><div class="stat-value">${settings.currentStreak}</div><div class="stat-label">Streak</div></div>
      <div class="stat-card"><div class="stat-icon">\ud83c\udfc6</div><div class="stat-value">${settings.longestStreak}</div><div class="stat-label">Best Streak</div></div>
      <div class="stat-card"><div class="stat-icon">\ud83d\udcaa</div><div class="stat-value">${settings.totalWorkouts}</div><div class="stat-label">Workouts</div></div>
      <div class="stat-card"><div class="stat-icon">\ud83d\udcc5</div><div class="stat-value">${uniqueDays}</div><div class="stat-label">Active Days</div></div>
    </div>
    <div class="chart-container">
      <div class="chart-title">Last 7 Days</div>
      <div class="chart-bars">
        ${last7.map(d => {
          const maxMin = Math.max(...last7.map(x => x.minutes), 1);
          const h = d.minutes ? Math.max(8, (d.minutes / maxMin) * 100) : 2;
          return `<div class="chart-bar-col">${d.minutes ? `<div class="chart-bar-value">${d.minutes}m</div>` : ''}<div class="chart-bar" style="height:${h}%"></div><div class="chart-bar-label">${d.label}</div></div>`;
        }).join('')}
      </div>
    </div>
    <div class="recent-logs">
      <h3>Recent Workouts</h3>
      ${recentLogs.length === 0 ? '<div class="log-empty">No workouts yet. Start your first one!</div>' : ''}
      ${recentLogs.map(l => `
        <div class="log-item">
          <div><span class="log-item-name">${esc(l.workoutName)}</span></div>
          <div class="log-item-meta">
            ${l.setsCompleted ? `<span class="log-item-xp">${l.setsCompleted} sets</span>` : ''}
            <span>${l.duration}min</span>
            <span>${formatDate(l.completedAt)}</span>
          </div>
        </div>`).join('')}
    </div>
    ${settings.isPro ? `<div style="text-align:center;padding-bottom:40px"><button class="btn btn-ghost btn-sm" onclick="handleTogglePro()">Downgrade from Pro</button></div>` : ''}`;
}

function renderAchievementsTab() {
  const unlocked = Achievements.getUnlocked();
  return `
    <div class="section-header">
      <h2>Achievements</h2>
      <p>${unlocked.length} / ${ACHIEVEMENTS.length} unlocked</p>
    </div>
    <div class="achievements-grid">
      ${ACHIEVEMENTS.map(a => {
        const got = unlocked.includes(a.id);
        return `
          <div class="achievement-card ${got ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${got ? a.icon : '\ud83d\udd12'}</div>
            <div class="achievement-name">${a.name}</div>
            <div class="achievement-desc">${a.desc}</div>
          </div>`;
      }).join('')}
    </div>`;
}

// ============================================
// Workout View
// ============================================
let ws = { started: false, completed: false, ex: 0, day: 0, seconds: 0, timer: null, setLogs: {} };

function renderWorkout() {
  const workout = WORKOUTS.find(w => w.slug === routeParams.slug);
  if (!workout) return `<div class="workout-view"><div class="workout-prestart"><h2>Workout not found</h2><button class="btn btn-orange" onclick="navigate('/')">Back Home</button></div></div>`;

  const settings = Progress.getSettings();
  if (workout.isPro && !settings.isPro) {
    return `<div class="workout-view"><div class="workout-prestart">
      <div class="prestart-avatar">\ud83d\udd12</div>
      <h2 class="prestart-title text-villain">Pro Only</h2>
      <p class="prestart-desc">This workout requires Pro access.</p>
      <button class="btn btn-orange" onclick="navigate('/')">Back Home</button>
    </div></div>`;
  }

  const day = workout.program.days[ws.day];
  const exercises = day.exercises;
  const isV = workout.type === 'villain';
  const hasDays = workout.program.days.length > 1;

  if (ws.completed) {
    const mins = Math.floor(ws.seconds / 60);
    const secs = ws.seconds % 60;
    const totalSets = Object.values(ws.setLogs).reduce((s, arr) => s + arr.filter(x => x.done).length, 0);
    const xpEarned = 100 + (totalSets * 10) + (Progress.getSettings().currentStreak * 5);
    return `
      <div class="workout-view">
        <div class="workout-complete">
          <div class="complete-icon">\ud83c\udfc6</div>
          <div class="complete-title">Workout Complete!</div>
          <div class="complete-time">${mins}:${secs.toString().padStart(2, '0')}</div>
          <div class="complete-xp">+${xpEarned} XP</div>
          <div style="color:var(--fg-muted);font-size:13px">${totalSets} sets logged</div>
          <button class="btn btn-orange btn-lg" onclick="finishAndGoHome()" style="margin-top:16px">Back to Dashboard</button>
        </div>
        <div id="confetti-container" class="confetti-container"></div>
      </div>`;
  }

  if (!ws.started) {
    return `
      <div class="workout-view">
        <header class="workout-header">
          <button class="btn btn-ghost btn-sm" onclick="navigate('/')">\u2190 Back</button>
          <div></div><div></div>
        </header>
        <div class="workout-prestart">
          <div class="prestart-avatar">${workout.avatarEmoji}</div>
          <span class="badge badge-${isV ? 'villain' : 'orange'}">${workout.difficulty}</span>
          <h1 class="prestart-title">${esc(workout.name)}</h1>
          <p class="prestart-desc">${esc(workout.tagline)}</p>
          ${hasDays ? `<div class="day-selector">${workout.program.days.map((d, i) => `<button class="day-btn ${ws.day === i ? 'active' : ''}" onclick="selectDay(${i})">${d.label} \u2014 ${d.focus}</button>`).join('')}</div>` : ''}
          ${day.notes ? `<p class="text-muted" style="font-size:13px;font-style:italic">${day.notes}</p>` : ''}
          <div class="prestart-info">
            <div class="prestart-info-card"><div class="prestart-info-val">${exercises.length}</div><div class="prestart-info-label">Exercises</div></div>
            <div class="prestart-info-card"><div class="prestart-info-val">~${Math.max(15, exercises.length * 5)}</div><div class="prestart-info-label">Minutes</div></div>
          </div>
          <button class="btn btn-orange btn-lg" onclick="startWorkout()" style="margin-top:8px">Start Workout</button>
        </div>
      </div>`;
  }

  // Active workout with set logging
  const ex = exercises[ws.ex];
  const progress = ((ws.ex + 1) / exercises.length) * 100;
  const mins = Math.floor(ws.seconds / 60);
  const secs = ws.seconds % 60;
  const isLast = ws.ex === exercises.length - 1;
  const isFirst = ws.ex === 0;
  const numSets = parseInt(ex.sets) || 3;
  const setKey = `${routeParams.slug}_${ws.day}_${ws.ex}`;
  const setData = ws.setLogs[setKey] || Array.from({ length: numSets }, () => ({ reps: '', weight: '', done: false }));

  return `
    <div class="workout-view">
      <header class="workout-header">
        <button class="btn btn-ghost btn-sm" onclick="confirmQuit()">\u2190 Quit</button>
        <div class="workout-timer">${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}</div>
        <div></div>
      </header>
      <div class="workout-progress-bar"><div class="workout-progress-fill" style="width:${progress}%"></div></div>
      <div class="exercise-area">
        <div class="exercise-bg-number">${ws.ex + 1}</div>
        <div class="exercise-counter">Exercise ${ws.ex + 1} of ${exercises.length}</div>
        <div class="exercise-name">${esc(ex.name)}</div>
        <div class="exercise-details">
          ${ex.sets ? `<span class="badge badge-orange">${ex.sets} sets</span>` : ''}
          ${ex.reps ? `<span class="badge badge-orange">${ex.reps}</span>` : ''}
          ${ex.rest ? `<span class="badge">Rest: ${ex.rest}</span>` : ''}
        </div>
        ${ex.instructions ? `<div class="exercise-instructions">${esc(ex.instructions)}</div>` : ''}
        <table class="set-log-table">
          <thead><tr><th>Set</th><th>Reps</th><th>Weight</th><th></th></tr></thead>
          <tbody>
            ${setData.map((s, i) => `
              <tr>
                <td class="set-num">${i + 1}</td>
                <td><input class="set-input" type="text" inputmode="numeric" placeholder="${ex.reps || '-'}" value="${s.reps}" onchange="updateSet('${setKey}',${i},'reps',this.value)" /></td>
                <td><input class="set-input" type="text" inputmode="numeric" placeholder="lbs" value="${s.weight}" onchange="updateSet('${setKey}',${i},'weight',this.value)" /></td>
                <td><button class="set-check ${s.done ? 'checked' : ''}" onclick="toggleSet('${setKey}',${i})">\u2713</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="workout-footer">
        <button class="btn btn-ghost" ${isFirst ? 'disabled style="opacity:0.3;pointer-events:none"' : ''} onclick="prevExercise()">\u2190 Prev</button>
        <div style="flex:1;display:flex;justify-content:center">
          ${isLast
            ? `<button class="btn btn-green btn-lg" onclick="completeWorkout()">\u2713 Finish</button>`
            : `<button class="btn btn-orange" onclick="nextExercise()">Next \u2192</button>`}
        </div>
        <div style="min-width:80px"></div>
      </div>
    </div>`;
}

function updateSet(key, idx, field, val) {
  if (!ws.setLogs[key]) {
    const ex = getCurrentExercise();
    const n = parseInt(ex?.sets) || 3;
    ws.setLogs[key] = Array.from({ length: n }, () => ({ reps: '', weight: '', done: false }));
  }
  ws.setLogs[key][idx][field] = val;
}

function toggleSet(key, idx) {
  if (!ws.setLogs[key]) {
    const ex = getCurrentExercise();
    const n = parseInt(ex?.sets) || 3;
    ws.setLogs[key] = Array.from({ length: n }, () => ({ reps: '', weight: '', done: false }));
  }
  ws.setLogs[key][idx].done = !ws.setLogs[key][idx].done;
  render();
}

function getCurrentExercise() {
  const workout = WORKOUTS.find(w => w.slug === routeParams.slug);
  if (!workout) return null;
  return workout.program.days[ws.day]?.exercises[ws.ex];
}

function selectDay(i) { ws.day = i; ws.ex = 0; render(); }

function startWorkout() {
  ws.started = true; ws.completed = false; ws.ex = 0; ws.seconds = 0; ws.setLogs = {};
  ws.timer = setInterval(() => {
    ws.seconds++;
    const t = document.querySelector('.workout-timer');
    if (t) { const m = Math.floor(ws.seconds / 60); const s = ws.seconds % 60; t.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }
  }, 1000);
  render();
}

function nextExercise() {
  const workout = WORKOUTS.find(w => w.slug === routeParams.slug);
  if (ws.ex < workout.program.days[ws.day].exercises.length - 1) { ws.ex++; render(); }
}
function prevExercise() { if (ws.ex > 0) { ws.ex--; render(); } }

function completeWorkout() {
  clearInterval(ws.timer);
  const workout = WORKOUTS.find(w => w.slug === routeParams.slug);
  const totalSets = Object.values(ws.setLogs).reduce((s, arr) => s + arr.filter(x => x.done).length, 0);
  for (const [key, sets] of Object.entries(ws.setLogs)) {
    Progress.saveExerciseLog(key, sets.filter(s => s.done));
  }
  Progress.logWorkout(workout.name, ws.seconds, totalSets);
  ws.completed = true;
  render();
  spawnConfetti(workout.type === 'villain' ? 'villain' : 'hero');
}

function confirmQuit() {
  if (confirm('Quit this workout? Progress won\'t be saved.')) {
    clearInterval(ws.timer);
    ws = { started: false, completed: false, ex: 0, day: 0, seconds: 0, timer: null, setLogs: {} };
    navigate('/');
  }
}

function finishAndGoHome() {
  ws = { started: false, completed: false, ex: 0, day: 0, seconds: 0, timer: null, setLogs: {} };
  navigate('/');
}

// ============================================
// Paywall / Tabs / Confetti / Toast / Helpers
// ============================================
function showPaywall() { document.getElementById('paywall-modal').classList.remove('hidden'); }
function closePaywall() { document.getElementById('paywall-modal').classList.add('hidden'); }
function handleTogglePro() {
  const isPro = Progress.togglePro();
  closePaywall(); render();
  showToast(isPro ? 'Villain Mode unlocked!' : 'Pro downgraded.', 'success');
}

function switchTab(t) { activeTab = t; render(); }

function spawnConfetti(type) {
  const c = document.getElementById('confetti-container');
  if (!c) return;
  const colors = type === 'villain'
    ? ['#a855f7', '#c084fc', '#d946ef', '#7c3aed']
    : ['#ff6b2b', '#f59e0b', '#22d3ee', '#22c55e'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    p.style.animationDelay = Math.random() * 0.8 + 's';
    p.style.width = (6 + Math.random() * 6) + 'px';
    p.style.height = (6 + Math.random() * 6) + 'px';
    c.appendChild(p);
  }
  setTimeout(() => c.innerHTML = '', 4000);
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function formatDate(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function getLast7DaysChart(logs) {
  const days = []; const dn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const ds = d.toISOString().slice(0, 10);
    const tot = logs.filter(l => l.date === ds).reduce((s, l) => s + l.duration, 0);
    days.push({ label: dn[d.getDay()], minutes: tot });
  }
  return days;
}

// Init
handleRoute();
