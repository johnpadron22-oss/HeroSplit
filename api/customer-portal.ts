import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { customerId } = req.body as { customerId: string };

  if (!customerId) {
    return res.status(400).json({ error: "customerId is required" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.FRONTEND_URL ?? "https://herosplit.vercel.app",
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe portal error:", err?.message ?? err);
    return res.status(500).json({
      error: err?.message ?? "Failed to create billing portal session",
    });
  }
}
