import { z } from 'zod';
import { insertWorkoutSchema, insertLogSchema, insertUserSettingsSchema, workouts, workoutLogs, achievements, userSettings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  workouts: {
    list: {
      method: 'GET' as const,
      path: '/api/workouts',
      input: z.object({
        type: z.enum(['hero', 'villain', 'custom']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof workouts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/workouts/:slug',
      responses: {
        200: z.custom<typeof workouts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Seed/Admin use
    create: {
      method: 'POST' as const,
      path: '/api/workouts',
      input: insertWorkoutSchema,
      responses: {
        201: z.custom<typeof workouts.$inferSelect>(),
      },
    }
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof workoutLogs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertLogSchema,
      responses: {
        201: z.custom<typeof workoutLogs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  user: {
    progress: {
      method: 'GET' as const,
      path: '/api/user/progress',
      responses: {
        200: z.object({
          stats: z.custom<typeof userSettings.$inferSelect>(),
          logs: z.array(z.custom<typeof workoutLogs.$inferSelect>()),
          achievements: z.array(z.custom<typeof achievements.$inferSelect>()),
        }),
      },
    },
    togglePro: {
      method: 'POST' as const,
      path: '/api/user/pro', // Mock upgrade endpoint
      input: z.object({ isPro: z.boolean() }),
      responses: {
        200: z.custom<typeof userSettings.$inferSelect>(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
