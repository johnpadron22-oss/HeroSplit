import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  workouts, workoutLogs, achievements, userSettings,
  type Workout, type InsertWorkout,
  type WorkoutLog, type InsertWorkoutLog,
  type Achievement, type InsertAchievement,
  type UserSettings, type UpdateSettingsRequest
} from "@shared/schema";
import { users, type User } from "@shared/models/auth";

export interface IStorage {
  // Workouts
  getWorkouts(type?: string): Promise<Workout[]>;
  getWorkout(slug: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Logs
  getLogs(userId: string): Promise<WorkoutLog[]>;
  createLog(log: InsertWorkoutLog): Promise<WorkoutLog>;
  
  // User Settings / Stats
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  initializeUserSettings(userId: string): Promise<UserSettings>;
  updateUserSettings(userId: string, settings: UpdateSettingsRequest): Promise<UserSettings>;
  
  // Achievements
  getAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

export class DatabaseStorage implements IStorage {
  // Workouts
  async getWorkouts(type?: string): Promise<Workout[]> {
    if (type) {
      return await db.select().from(workouts).where(eq(workouts.type, type));
    }
    return await db.select().from(workouts);
  }

  async getWorkout(slug: string): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.slug, slug));
    return workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts).values(workout).returning();
    return newWorkout;
  }

  // Logs
  async getLogs(userId: string): Promise<WorkoutLog[]> {
    return await db.select()
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.completedAt));
  }

  async createLog(log: InsertWorkoutLog): Promise<WorkoutLog> {
    const [newLog] = await db.insert(workoutLogs).values(log).returning();
    return newLog;
  }

  // User Settings
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async initializeUserSettings(userId: string): Promise<UserSettings> {
    const [settings] = await db.insert(userSettings).values({ userId }).returning();
    return settings;
  }

  async updateUserSettings(userId: string, settings: UpdateSettingsRequest): Promise<UserSettings> {
    const [updated] = await db.update(userSettings)
      .set(settings)
      .where(eq(userSettings.userId, userId))
      .returning();
    return updated;
  }

  // Achievements
  async getAchievements(userId: string): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.userId, userId));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }
}

export const storage = new DatabaseStorage();
