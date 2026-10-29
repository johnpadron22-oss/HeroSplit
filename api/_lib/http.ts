import type { VercelRequest, VercelResponse } from "./vercel.js";
import type { ZodTypeAny, z } from "zod";
import { ConfigError, frontendUrl } from "./deps.js";

export class HttpError extends Error {
  constructor(public status: number, public publicMessage: string) {
    super(publicMessage);
  }
}

const MAX_BODY_BYTES = 8 * 1024;

function allowedOrigin(): string | null {
  try {
    return new URL(frontendUrl()).origin;
  } catch {
    return null;
  }
}

/**
 * CORS for browser routes: only the exact HeroSplit origin is ever echoed back.
 * Same-origin requests (the normal case) need no CORS at all.
 * Returns true when the request was a preflight and has been answered.
 */
export function applyCors(req: VercelRequest, res: VercelResponse, methods: string[]): boolean {
  const origin = req.headers.origin;
  const allowed = allowedOrigin();
  res.setHeader("Vary", "Origin");
  if (origin && allowed && origin === allowed) {
    res.setHeader("Access-Control-Allow-Origin", allowed);
    res.setHeader("Access-Control-Allow-Methods", [...methods, "OPTIONS"].join(", "));
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Max-Age", "600");
  }
  if (req.method === "OPTIONS") {
    res.status(origin && origin === allowed ? 204 : 403).end();
    return true;
  }
  return false;
}

export function requireMethod(req: VercelRequest, methods: string[]): void {
  if (!req.method || !methods.includes(req.method)) {
    throw new HttpError(405, "Method not allowed");
  }
}

/** Parses the JSON body with a strict zod schema; unknown fields are rejected. */
export function parseBody<S extends ZodTypeAny>(req: VercelRequest, schema: S): z.infer<S> {
  const length = Number(req.headers["content-length"] ?? 0);
  if (length > MAX_BODY_BYTES) throw new HttpError(413, "Request too large");
  const ctype = String(req.headers["content-type"] ?? "");
  if (!ctype.startsWith("application/json")) throw new HttpError(415, "Content-Type must be application/json");
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) throw new HttpError(400, "Invalid request");
  return result.data;
}

export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return first?.split(",")[0].trim() || "unknown";
}

/**
 * Sends a safe error. Only HttpError messages reach the client; everything
 * else becomes a generic 500. Logs carry the error class/code only — never
 * request bodies, tokens or secrets.
 */
export function sendError(res: VercelResponse, route: string, err: unknown): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.publicMessage });
    return;
  }
  const kind = err instanceof ConfigError ? "config" : (err as { type?: string; code?: string })?.type ?? (err as { code?: string })?.code ?? "unknown";
  console.error(`[${route}] failed (${kind})`);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
