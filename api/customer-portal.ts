import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { checkRateLimit, getClientIp } from "./_rateLimit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Rate limit: 10 portal requests per IP per minute ────────────────────────
  const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  const { allowed, remaining } = checkRateLimit(ip, 10, 60_000);
  res.setHeader("X-RateLimit-Remaining", remaining);
  if (!allowed) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  }

  // ── Input validation ─────────────────────────────────────────────────────────
  const { customerId } = req.body as { customerId?: unknown };

  if (
    !customerId ||
    typeof customerId !== "string" ||
    !customerId.startsWith("cus_") ||
    customerId.length > 64
  ) {
    return res.status(400).json({ error: "Invalid customerId" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  // ── Create portal session ────────────────────────────────────────────────────
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.FRONTEND_URL ?? "https://herosplit.vercel.app",
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe portal error:", err?.message ?? err);
    return res.status(500).json({ error: "Failed to create billing portal session" });
  }
}
