export default {
  workouts: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },
  workoutLogs: {
    allow: {
      view: "data.userId == auth.id",
      create: "auth.id != null && data.userId == auth.id",
      update: "data.userId == auth.id",
      delete: "data.userId == auth.id",
    },
  },
  achievements: {
    allow: {
      view: "data.userId == auth.id",
      create: "auth.id != null && data.userId == auth.id",
      update: "data.userId == auth.id",
      delete: "false",
    },
  },
  userProfiles: {
    allow: {
      view: "data.userId == auth.id",
      create: "auth.id != null && data.userId == auth.id",
      update: "data.userId == auth.id",
      delete: "false",
    },
  },
};
