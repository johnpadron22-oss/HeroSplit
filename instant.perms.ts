export default {
  // Workouts are public read — anyone can browse even unauthenticated
  workouts: {
    allow: {
      view: "true",
      create: "false",  // only admin seed script can write
      update: "false",
      delete: "false",
    },
  },

  // Logs are fully private — users can only touch their own
  workoutLogs: {
    allow: {
      view: "data.userId == auth.id",
      create: "auth.id != null && data.userId == auth.id",
      update: "data.userId == auth.id",
      delete: "data.userId == auth.id",
    },
  },

  // Achievements: users can only view/create their own, never delete
  achievements: {
    allow: {
      view: "data.userId == auth.id",
      create: "auth.id != null && data.userId == auth.id",
      update: "data.userId == auth.id",
      delete: "false",
    },
  },

  // Profiles: users can update their own BUT cannot change isPro or
  // stripeCustomerId — those are set server-side via the Stripe webhook
  // (admin SDK bypasses these rules so the webhook still works)
  userProfiles: {
    allow: {
      view: "data.userId == auth.id",
      create: "auth.id != null && data.userId == auth.id",
      update: "data.userId == auth.id && data.isPro == prev.isPro && data.stripeCustomerId == prev.stripeCustomerId",
      delete: "false",
    },
  },
};
