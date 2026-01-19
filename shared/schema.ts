import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import Auth Models
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

// Workouts (Heroes and Villains)
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // e.g. "one-punch-man"
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'hero', 'villain', 'custom'
  difficulty: text("difficulty").notNull(), // 'Beginner', 'Intermediate', 'Advanced', 'Elite Level'
  program: jsonb("program").notNull(), // The full workout plan
  imageUrl: text("image_url"),
  avatarEmoji: text("avatar_emoji"), // Added for character avatar
  isPro: boolean("is_pro").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Logs (History)
export const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // references users.id (which is varchar in auth schema)
  workoutId: integer("workout_id"), // Optional, could be a custom one not in DB
  workoutName: text("workout_name").notNull(), // Snapshot of name
  date: text("date").notNull(), // YYYY-MM-DD for streak tracking
  duration: integer("duration").notNull(), // in minutes
  completedAt: timestamp("completed_at").defaultNow(),
});

// User Achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementId: text("achievement_id").notNull(), // e.g. 'streak-7'
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// User Stats / Settings (Extension of Auth User)
export const userSettings = pgTable("user_settings", {
  userId: text("user_id").primaryKey(), // references users.id
  isPro: boolean("is_pro").default(false),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalWorkouts: integer("total_workouts").default(0),
});

// === RELATIONS ===
export const workoutsRelations = relations(workouts, ({ many }) => ({
  logs: many(workoutLogs),
}));

export const logsRelations = relations(workoutLogs, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutLogs.workoutId],
    references: [workouts.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertWorkoutSchema = createInsertSchema(workouts).omit({ id: true, createdAt: true });
export const insertLogSchema = createInsertSchema(workoutLogs).omit({ id: true, completedAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, unlockedAt: true });
export const insertUserSettingsSchema = createInsertSchema(userSettings);

// === EXPLICIT TYPES ===
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type InsertWorkoutLog = z.infer<typeof insertLogSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserSettings = typeof userSettings.$inferSelect;

// Request/Response Types
export type CreateLogRequest = InsertWorkoutLog;
export type UpdateSettingsRequest = Partial<InsertUserSettingsSchema>;

export interface UserProgressResponse {
  stats: UserSettings;
  logs: WorkoutLog[];
  achievements: Achievement[];
}
