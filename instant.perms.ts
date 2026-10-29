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

  // Feedback: users can submit and view their own, never edit or delete
  feedback: {
    allow: {
      view: "data.userId == auth.id",
      create: "auth.id != null && data.userId == auth.id",
      update: "false",
      delete: "false",
    },
  },

  // Profiles: users can read/write their own non-sensitive fields (alias,
  // archetype, path, experienceLevel, streak stats).
  // NOTE: isPro is no longer stored here for access-control purposes.
  // The authoritative Pro gate is userSubscriptions (below), which is
  // write-locked to the admin SDK (Stripe webhook) only.
  userProfiles: {
    allow: {
      view: "data.userId == auth.id",
      create: "auth.id != null && data.userId == auth.id",
      update: "data.userId == auth.id",
      delete: "false",
    },
  },

  // Subscription status — THE authoritative source for Pro access gating.
  // Clients can read their own record but CANNOT create or update it.
  // Only the Stripe webhook (admin SDK, bypasses these rules) writes here.
  // This prevents any client from self-granting Pro by writing to InstantDB.
  userSubscriptions: {
    allow: {
      view: "data.userId == auth.id",
      create: "false",
      update: "false",
      delete: "false",
    },
  },
};
