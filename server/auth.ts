import { createClient } from "@supabase/supabase-js";
import type { RequestHandler } from "express";
import { storage } from "./storage";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Sync user into our local DB on every authenticated request
  await storage.upsertUser({
    id: user.id,
    email: user.email ?? null,
    firstName: user.user_metadata?.first_name ?? null,
    lastName: user.user_metadata?.last_name ?? null,
    profileImageUrl: user.user_metadata?.avatar_url ?? null,
  });

  req.user = user;
  next();
};
