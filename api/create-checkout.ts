import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, email } = req.body as { userId: string; email?: string };

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/?checkout=success`,
    cancel_url: `${process.env.FRONTEND_URL}/`,
    metadata: { userId },
    ...(email ? { customer_email: email } : {}),
  });

  return res.json({ url: session.url });
}
