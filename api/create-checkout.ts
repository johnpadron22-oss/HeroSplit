import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, email, plan = "monthly" } = req.body as {
    userId: string;
    email?: string;
    plan?: "monthly" | "annual";
  };

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const priceId =
    plan === "annual"
      ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID!
      : process.env.STRIPE_PRO_PRICE_ID!;

  if (!priceId) {
    return res.status(500).json({ error: `Missing price ID for plan: ${plan}` });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
      metadata: { userId },
      ...(email ? { customer_email: email } : {}),
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err?.message ?? err);
    return res.status(500).json({
      error: err?.message ?? "Failed to create checkout session",
    });
  }
}
