/**
 * Simple in-memory rate limiter for Vercel serverless functions.
 * Limits requests per IP within a sliding window.
 * Note: resets on cold starts — good enough for basic abuse prevention
 * without requiring external infrastructure (Redis/Upstash).
 */

interface Entry {
  count: number;
  windowStart: number;
}

const store = new Map<string, Entry>();

// Clean up stale entries every 5 minutes to avoid memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > 60_000) store.delete(key);
  }
}, 5 * 60_000);

/**
 * Returns true if the request is within the allowed rate.
 * @param ip       The client IP address
 * @param limit    Max requests allowed per window (default 10)
 * @param windowMs Time window in milliseconds (default 60s)
 */
export function checkRateLimit(
  ip: string,
  limit = 10,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining };
}

/** Extract best-guess client IP from Vercel request headers */
export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return first.split(",")[0].trim();
  }
  return "unknown";
}
