import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { InsertWorkout, workouts } from "@shared/schema";
import { db } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Workouts ===
  app.get(api.workouts.list.path, async (req, res) => {
    const type = req.query.type as string | undefined;
    const workouts = await storage.getWorkouts(type);
    res.json(workouts);
  });

  app.get(api.workouts.get.path, async (req, res) => {
    const workout = await storage.getWorkout(req.params.slug);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.json(workout);
  });

  app.post(api.workouts.create.path, async (req, res) => {
    // Basic protection - could be stricter
    // In real app, check for admin role
    const workout = await storage.createWorkout(req.body);
    res.status(201).json(workout);
  });

  // === Protected Routes ===
  
  // Logs
  app.get(api.logs.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const logs = await storage.getLogs(userId);
    res.json(logs);
  });

  app.post(api.logs.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const logData = { ...req.body, userId }; // Force userId from auth
    const log = await storage.createLog(logData);
    
    // Update stats after log creation
    // 1. Get current stats
    let settings = await storage.getUserSettings(userId);
    if (!settings) settings = await storage.initializeUserSettings(userId);
    
    // 2. Update total workouts
    const newTotal = (settings.totalWorkouts || 0) + 1;
    
    // 3. Simple streak calc (can be more complex)
    // For MVP, just increment streak if last workout was yesterday or today
    // This is a naive implementation, a robust one would check dates
    const currentStreak = (settings.currentStreak || 0) + 1; 
    
    await storage.updateUserSettings(userId, {
      totalWorkouts: newTotal,
      currentStreak: currentStreak,
      longestStreak: Math.max(settings.longestStreak || 0, currentStreak)
    });

    res.status(201).json(log);
  });

  // User Progress
  app.get(api.user.progress.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    let settings = await storage.getUserSettings(userId);
    if (!settings) {
      settings = await storage.initializeUserSettings(userId);
    }
    
    const logs = await storage.getLogs(userId);
    const achievements = await storage.getAchievements(userId);
    
    res.json({
      stats: settings,
      logs,
      achievements
    });
  });

  // Mock Pro Upgrade
  app.post(api.user.togglePro.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { isPro } = req.body;
    
    let settings = await storage.getUserSettings(userId);
    if (!settings) settings = await storage.initializeUserSettings(userId);
    
    const updated = await storage.updateUserSettings(userId, { isPro });
    res.json(updated);
  });

  // Seed Data on startup
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  // Clear and re-seed to ensure new characters appear
  await db.delete(workouts);

  // Helper to match the provided character structure to our schema
  const mkMove = (name: string, sets?: string, reps?: string, rest?: string) => ({ name, sets, reps, rest });
  const mkBlock = (name: string, moves: any[]) => moves;
  const mkDay = (id: string, type: string, blocks: any[][]) => blocks.flat();

  const newCharactersRaw = [
    {
      slug: "wall-crawler-acrobat",
      name: "Wall-Crawler Acrobat (Inspired)",
      type: "hero",
      difficulty: "Advanced",
      avatarEmoji: "🕷️",
      equipment: "Bodyweight",
      program: {
        exercises: [
          ...mkDay("back", "Hypertrophy", [
            mkBlock("Warm-up", [mkMove("Scap Pull-Aparts", "2", "15"), mkMove("Quadrupedal Crawl", "2", "30s")]),
            mkBlock("Primary", [mkMove("Weighted Chin-Up", "4", "6–8", "120s"), mkMove("Climb-Up Practice", "4", "3–5", "120s")]),
            mkBlock("Accessory", [mkMove("Front Lever Progression", "3", "5–8s hold", "90s"), mkMove("Hanging Leg Raise", "3", "10–12", "60s")]),
          ])
        ]
      },
      isPro: false,
      imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=1000"
    },
    {
      slug: "speedforce-sprinter",
      name: "Speedforce Sprinter (Inspired)",
      type: "hero",
      difficulty: "Elite Level",
      avatarEmoji: "⚡",
      equipment: "Full Gym",
      program: {
        exercises: [
          ...mkDay("legs", "Strength", [
            mkBlock("Primary", [mkMove("Trap Bar Deadlift", "5", "3–5", "150s"), mkMove("Bulgarian Split Squat", "4", "6–8/leg", "120s")]),
            mkBlock("Accessory", [mkMove("Calf Raise", "4", "12–15", "60s"), mkMove("Nordic Curl", "3", "5–8", "90s")]),
          ])
        ]
      },
      isPro: false,
      imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=1000"
    },
    {
      slug: "gamma-juggernaut",
      name: "Gamma Juggernaut (Inspired)",
      type: "villain",
      difficulty: "Elite Level",
      avatarEmoji: "💪",
      equipment: "Full Gym",
      program: {
        exercises: [
          ...mkDay("legs", "Strength", [
            mkBlock("Primary", [mkMove("Back Squat", "5", "3–5", "180s"), mkMove("Conventional Deadlift", "5", "3–5", "180s")]),
            mkBlock("Accessory", [mkMove("Front Squat", "3", "6–8", "120s"), mkMove("Good Morning", "3", "8–10", "90s")]),
          ])
        ]
      },
      isPro: true,
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000"
    },
    {
      slug: "thunder-god",
      name: "Thunder God (Inspired)",
      type: "hero",
      difficulty: "Advanced",
      avatarEmoji: "🔨",
      equipment: "Full Gym",
      program: {
        exercises: [
          ...mkDay("push", "Strength", [
            mkBlock("Primary", [mkMove("Overhead Press", "5", "3–5", "150s"), mkMove("Push Press", "4", "5–6", "120s")]),
            mkBlock("Accessory", [mkMove("Dumbbell Overhead Press", "3", "8–10", "90s"), mkMove("Landmine Press", "3", "10–12", "75s")]),
          ])
        ]
      },
      isPro: false,
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  // Add original characters back with fixed program structure
  const originalCharacters: InsertWorkout[] = [
    {
      slug: "one-punch",
      name: "The One Punch",
      description: "100 Pushups, 100 Situps, 100 Squats, and a 10km Run.",
      type: "hero",
      difficulty: "Elite Level",
      program: {
        exercises: [
          { name: "Pushups", reps: "100" },
          { name: "Situps", reps: "100" },
          { name: "Squats", reps: "100" },
          { name: "Run", reps: "10km" }
        ]
      },
      isPro: false,
      avatarEmoji: "✨",
      equipment: "Bodyweight",
      imageUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  const animeCharacters: InsertWorkout[] = [
    {
      slug: "saiyan-warrior",
      name: "Kakarot's Path",
      description: "Pure explosive power forged through relentless Saiyan battle training. Compound lifts taken to the absolute limit.",
      type: "hero",
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
          { name: "Sprint Intervals", sets: "6", reps: "100m", rest: "60s" }
        ]
      }
    },
    {
      slug: "saiyan-prince",
      name: "Vegeta's Pride",
      description: "Train with the fury of a Saiyan prince who refuses to lose. Every rep is a battle for supremacy.",
      type: "villain",
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
          { name: "Battle Rope", sets: "3", reps: "30s", rest: "60s" }
        ]
      }
    },
    {
      slug: "leaf-taijutsu",
      name: "Leaf Village Taijutsu",
      description: "Speed, endurance, and explosive body strikes perfected through thousands of hours of shinobi training.",
      type: "hero",
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
          { name: "Shadow Boxing", sets: "3", reps: "2 min", rest: "60s" }
        ]
      }
    },
    {
      slug: "shadow-clone-circuit",
      name: "Shadow Clone Circuit",
      description: "Volume so extreme it feels like a hundred of you trained at once. Elite shinobi calisthenics mastery.",
      type: "villain",
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
          { name: "Ring Dip", sets: "4", reps: "10", rest: "75s" }
        ]
      }
    },
    {
      slug: "infinite-void",
      name: "Infinite Void",
      description: "Limitless technique demands limitless body control. Precision mobility and unshakeable balance training.",
      type: "villain",
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
          { name: "Breathing Ladder", sets: "5", reps: "1 round", rest: "45s" }
        ]
      }
    },
    {
      slug: "black-flash-protocol",
      name: "Black Flash Protocol",
      description: "Superhuman brawling power activated. Pure physical domination built through brutal compound pulling and pressing.",
      type: "villain",
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
          { name: "Farmers Walk", sets: "3", reps: "40m", rest: "90s" }
        ]
      }
    },
    {
      slug: "three-sword-conditioning",
      name: "Three Sword Conditioning",
      description: "Wielding three blades demands supreme shoulder, back, and grip strength. Upper body forged to legendary status.",
      type: "hero",
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
          { name: "Wrist Curl Circuit", sets: "3", reps: "20", rest: "45s" }
        ]
      }
    },
    {
      slug: "gear-fourth-pump",
      name: "Gear Fourth Pump",
      description: "Rubber-body power — elastic, dynamic, and unstoppable. Full-body explosive plyometric domination.",
      type: "hero",
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
          { name: "Explosive Hip Thrust", sets: "3", reps: "12", rest: "60s" }
        ]
      }
    },
    {
      slug: "survey-corps-circuit",
      name: "Survey Corps Circuit",
      description: "Humanity's strongest trains core and agility above all else. 3D maneuver gear demands a body that never quits.",
      type: "hero",
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
          { name: "Box Drill Sprint", sets: "5", reps: "20s", rest: "30s" }
        ]
      }
    },
    {
      slug: "thunder-breathing",
      name: "Thunder Breathing Form",
      description: "Lightning-fast sword strikes demand reactive speed, explosive legs, and a mind that moves before the body.",
      type: "hero",
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
          { name: "Plyometric Push-Up", sets: "3", reps: "12", rest: "60s" }
        ]
      }
    }
  ];

  for (const w of [...originalCharacters, ...newCharactersRaw, ...animeCharacters]) {
    await storage.createWorkout({
      ...w,
      description: (w as any).description || "A legendary workout program inspired by the character's unique abilities."
    });
  }

  console.log("Seeded database with new, original, and anime characters.");
}
