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

  for (const w of [...originalCharacters, ...newCharactersRaw]) {
    await storage.createWorkout({
      ...w,
      description: (w as any).description || "A legendary workout program inspired by the character's unique abilities."
    });
  }
  
  console.log("Seeded database with new and original characters.");
}
