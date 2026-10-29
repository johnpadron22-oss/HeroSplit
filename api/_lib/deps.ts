import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class ConfigError extends Error {}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new ConfigError(`Missing env var ${name}`);
  return value;
}

let admin: SupabaseClient | null = null;
let stripe: Stripe | null = null;

// Service-role client. Server-only: bypasses RLS, so every caller must scope
// queries to the user id taken from a verified JWT.
export function getAdmin(): SupabaseClient {
  admin ??= createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}

export function getStripe(): Stripe {
  if (!stripe) {
    const key = requireEnv("STRIPE_SECRET_KEY");
    // Preview/dev deployments must never charge real cards or touch live customers.
    if (process.env.VERCEL_ENV !== "production" && key.startsWith("sk_live_")) {
      throw new ConfigError("Live Stripe key used outside production");
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

export function frontendUrl(): string {
  return requireEnv("FRONTEND_URL").replace(/\/+$/, "");
}
