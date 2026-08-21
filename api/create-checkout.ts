import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { checkRateLimit, getClientIp } from "./_rateLimit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

const VALID_PLANS = new Set(["monthly", "annual"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Rate limit: 5 checkout attempts per IP per minute ───────────────────────
  const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  const { allowed, remaining } = checkRateLimit(ip, 5, 60_000);
  res.setHeader("X-RateLimit-Remaining", remaining);
  if (!allowed) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  }

  // ── Input validation ─────────────────────────────────────────────────────────
  const { userId, email, plan = "monthly" } = req.body as {
    userId?: unknown;
    email?: unknown;
    plan?: unknown;
  };

  if (!userId || typeof userId !== "string" || userId.trim().length === 0 || userId.length > 128) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  if (!VALID_PLANS.has(plan as string)) {
    return res.status(400).json({ error: "Invalid plan. Must be 'monthly' or 'annual'." });
  }
  if (email !== undefined && (typeof email !== "string" || email.length > 254)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // ── Env guards ───────────────────────────────────────────────────────────────
  const priceId =
    plan === "annual"
      ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return res.status(500).json({ error: `Missing price ID for plan: ${plan}` });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  // ── Create checkout ──────────────────────────────────────────────────────────
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
      metadata: { userId: userId.trim() },
      ...(email ? { customer_email: (email as string).trim().toLowerCase() } : {}),
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err?.message ?? err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
