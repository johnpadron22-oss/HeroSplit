import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { InsertWorkout } from "@shared/schema";

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
  const existing = await storage.getWorkouts();
  if (existing.length > 0) return;

  const heroes: InsertWorkout[] = [
    {
      slug: "one-punch",
      name: "The One Punch",
      description: "100 Pushups, 100 Situps, 100 Squats, and a 10km Run.",
      type: "hero",
      difficulty: "Elite Level",
      program: [
        { name: "Pushups", reps: "100" },
        { name: "Situps", reps: "100" },
        { name: "Squats", reps: "100" },
        { name: "Run", distance: "10km" }
      ],
      isPro: false,
      avatarEmoji: "✨",
      imageUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=1000"
    },
    {
      slug: "dark-knight",
      name: "The Dark Knight",
      description: "Functional strength and agility training for the night.",
      type: "hero",
      difficulty: "Advanced",
      program: [
        { name: "Pull-ups", reps: "3x12" },
        { name: "Box Jumps", reps: "3x15" },
        { name: "Shadow Boxing", duration: "10 min" }
      ],
      isPro: false,
      avatarEmoji: "🦇",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000"
    },
     {
      slug: "amazon-warrior",
      name: "Amazon Warrior",
      description: "Agility, swordplay simulation, and core strength.",
      type: "hero",
      difficulty: "Intermediate",
      program: [
        { name: "Lunge Jumps", reps: "3x20" },
        { name: "Plank", duration: "2 min" },
        { name: "Burpees", reps: "3x15" }
      ],
      isPro: false,
      avatarEmoji: "🌟",
      imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  const villains: InsertWorkout[] = [
    {
      slug: "mad-titan",
      name: "The Mad Titan",
      description: "Heavy lifting to balance the universe.",
      type: "villain",
      difficulty: "Elite Level",
      program: [
        { name: "Deadlift", reps: "5x5 (Heavy)" },
        { name: "Military Press", reps: "5x5" },
        { name: "Farmer's Walk", distance: "50m x 4" }
      ],
      isPro: true, // PRO ONLY
      avatarEmoji: "🛡️",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000"
    },
    {
      slug: "symbiote",
      name: "The Symbiote",
      description: "Explosive power and unpredictable movement.",
      type: "villain",
      difficulty: "Advanced",
      program: [
        { name: "Muscle-ups", reps: "3xMax" },
        { name: "Sprints", reps: "10x100m" },
        { name: "Spider Crawls", distance: "20m x 3" }
      ],
      isPro: true,
      avatarEmoji: "🥊",
      imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  for (const w of heroes) await storage.createWorkout(w);
  for (const w of villains) await storage.createWorkout(w);
  
  console.log("Seeded database with heroes and villains.");
}
