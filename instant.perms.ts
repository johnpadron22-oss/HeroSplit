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

  // Profiles: users can only read/write their own record.
  // isPro and stripeCustomerId are authoritative from the Stripe webhook
  // (uses admin SDK which bypasses these rules entirely).
  // InstantDB CEL does not support `prev`, so field-level locking is enforced
  // server-side only — the Stripe webhook is the sole writer of isPro.
  userProfiles: {
    allow: {
      view: "data.userId == auth.id",
      create: "auth.id != null && data.userId == auth.id",
      update: "data.userId == auth.id",
      delete: "false",
    },
  },
};
