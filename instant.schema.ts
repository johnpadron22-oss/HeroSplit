import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    workouts: i.entity({
      slug: i.string().indexed(),
      name: i.string(),
      description: i.string(),
      type: i.string().indexed(), // 'hero' | 'villain' | 'anime' | 'custom'
      difficulty: i.string(),
      program: i.json(),
      imageUrl: i.string().optional(),
      avatarEmoji: i.string().optional(),
      equipment: i.string().optional(),
      series: i.string().optional(),
      workoutStyle: i.string().optional(),
      isPro: i.boolean(),
    }),
    workoutLogs: i.entity({
      userId: i.string().indexed(),
      workoutId: i.string().optional(),
      workoutName: i.string(),
      date: i.string().indexed(), // YYYY-MM-DD
      duration: i.number(), // minutes
      completedAt: i.number(), // epoch ms
    }),
    achievements: i.entity({
      userId: i.string().indexed(),
      achievementId: i.string(),
      unlockedAt: i.number(),
    }),
    userProfiles: i.entity({
      userId: i.string().unique().indexed(),
      isPro: i.boolean(),
      currentStreak: i.number(),
      longestStreak: i.number(),
      totalWorkouts: i.number(),
      stripeCustomerId: i.string().optional(),
      // Onboarding / RPG identity
      path: i.string().optional(),             // "hero" | "villain"
      archetype: i.string().optional(),        // e.g. "dark-vigilante"
      alias: i.string().optional(),            // user's chosen name
      experienceLevel: i.string().optional(),  // "beginner" | "intermediate" | "advanced" | "veteran"
    }),
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
