import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (googleClientId && googleClientSecret) {
    const appUrl = process.env.APP_URL || "http://localhost:5000";

    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: `${appUrl}/api/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const user = await authStorage.upsertUser({
              id: profile.id,
              email: profile.emails?.[0]?.value,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              profileImageUrl: profile.photos?.[0]?.value,
            });
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  } else {
    console.warn("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — auth disabled, running in guest mode");
  }

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await authStorage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  if (!process.env.GOOGLE_CLIENT_ID) return next(); // guest mode — no auth configured
  res.status(401).json({ message: "Unauthorized" });
};
