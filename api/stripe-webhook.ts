import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

// Service role client — bypasses RLS entirely.
// This is the ONLY place SUPABASE_SERVICE_ROLE_KEY should be used.
const adminSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Stripe webhooks are server-to-server — reject non-POST immediately.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Verify Stripe signature ──────────────────────────────────────────────────
  const sig = req.headers["stripe-signature"] as string;
  const rawBody = await getRawBody(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  // ── checkout.session.completed → mark user as Pro ───────────────────────────
  if (event.type === "checkout.session.completed") {
    const session   = event.data.object as Stripe.Checkout.Session;
    const userId    = session.metadata?.userId;
    if (!userId) return res.json({ received: true });

    const customerId = session.customer as string;
    const plan       = (session.metadata?.plan as "monthly" | "annual") ?? "monthly";
    const now        = Date.now();

    // Upsert into user_subscriptions (authoritative — service role bypasses RLS).
    // Clients have NO write policy on this table, so this is the only path.
    const { error: subError } = await adminSupabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id:           userId,
          is_pro:            true,
          stripe_customer_id: customerId,
          plan,
          subscribed_at:     now,
          cancelled_at:      null,
        },
        { onConflict: "user_id" }
      );

    if (subError) {
      console.error("stripe-webhook: user_subscriptions upsert failed", subError);
      return res.status(500).json({ error: "DB write failed" });
    }

    // Mirror is_pro + stripe_customer_id to user_profiles for display purposes.
    // (user_profiles.is_pro is NOT authoritative — never use it for access gating)
    await adminSupabase
      .from("user_profiles")
      .update({ is_pro: true, stripe_customer_id: customerId })
      .eq("user_id", userId);
  }

  // ── customer.subscription.deleted → revoke Pro ──────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId   = subscription.customer as string;

    // Revoke Pro in user_subscriptions
    const { error: subError } = await adminSupabase
      .from("user_subscriptions")
      .update({ is_pro: false, cancelled_at: Date.now() })
      .eq("stripe_customer_id", customerId);

    if (subError) {
      console.error("stripe-webhook: user_subscriptions revoke failed", subError);
    }

    // Mirror on user_profiles for display
    await adminSupabase
      .from("user_profiles")
      .update({ is_pro: false })
      .eq("stripe_customer_id", customerId);
  }

  return res.json({ received: true });
}
