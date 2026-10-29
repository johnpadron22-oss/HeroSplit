import { createHash } from "node:crypto";
import { getAdmin } from "./deps.js";
import { HttpError } from "./http.js";

const memory = new Map<string, { start: number; hits: number }>();

function memoryHit(key: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now - entry.start > windowSeconds * 1000) {
    memory.set(key, { start: now, hits: 1 });
    return true;
  }
  entry.hits += 1;
  return entry.hits <= limit;
}

/**
 * Durable, cross-instance rate limit backed by public.hit_rate_limit
 * (service_role only). Falls back to a per-instance limiter if the database
 * call fails, so a DB hiccup never disables limiting entirely.
 * Keys are hashed so raw IPs are not stored.
 */
export async function enforceRateLimit(scope: string, subject: string, limit: number, windowSeconds: number): Promise<void> {
  const key = `${scope}:${createHash("sha256").update(subject).digest("hex").slice(0, 32)}`;
  let allowed: boolean;
  try {
    const { data, error } = await getAdmin().rpc("hit_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error || typeof data !== "boolean") throw error ?? new Error("bad rate limit response");
    allowed = data;
  } catch {
    allowed = memoryHit(key, limit, windowSeconds);
  }
  if (!allowed) throw new HttpError(429, "Too many requests. Please wait a moment.");
}
