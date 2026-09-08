import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { init, id, tx } from "@instantdb/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia",
});

const db = init({
  appId: process.env.INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
});

export const config = {
  api: { bodyParser: false },
};

const ALLOWED_ORIGIN = process.env.FRONTEND_URL ?? "https://herosplit.vercel.app";

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
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return res.json({ received: true });

    const customerId = session.customer as string;
    const plan = (session.metadata?.plan as "monthly" | "annual") ?? "monthly";
    const now = Date.now();

    // ── Write to userSubscriptions (the authoritative, client-locked entity) ──
    const subResult = await db.query({
      userSubscriptions: { $: { where: { userId } } },
    });
    const existingSub = (subResult.userSubscriptions as { id: string }[] | undefined)?.[0];

    if (existingSub) {
      await db.transact([
        tx.userSubscriptions[existingSub.id].update({
          isPro: true,
          stripeCustomerId: customerId,
          plan,
          subscribedAt: now,
          cancelledAt: undefined,
        }),
      ]);
    } else {
      await db.transact([
        tx.userSubscriptions[id()].update({
          userId,
          isPro: true,
          stripeCustomerId: customerId,
          plan,
          subscribedAt: now,
        }),
      ]);
    }

    // ── Also update userProfile for legacy/display purposes ──────────────────
    // (userProfiles.isPro is NOT used for access gating — userSubscriptions is)
    const profileResult = await db.query({
      userProfiles: { $: { where: { userId } } },
    });
    const profile = (profileResult.userProfiles as { id: string }[] | undefined)?.[0];
    if (profile) {
      await db.transact([
        tx.userProfiles[profile.id].update({
          isPro: true,
          stripeCustomerId: customerId,
        }),
      ]);
    }
  }

  // ── customer.subscription.deleted → revoke Pro ──────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // Revoke via userSubscriptions
    const subResult = await db.query({
      userSubscriptions: { $: { where: { stripeCustomerId: customerId } } },
    });
    const existingSub = (subResult.userSubscriptions as { id: string }[] | undefined)?.[0];
    if (existingSub) {
      await db.transact([
        tx.userSubscriptions[existingSub.id].update({
          isPro: false,
          cancelledAt: Date.now(),
        }),
      ]);
    }

    // Mirror on userProfile for display
    const profileResult = await db.query({
      userProfiles: { $: { where: { stripeCustomerId: customerId } } },
    });
    const profile = (profileResult.userProfiles as { id: string }[] | undefined)?.[0];
    if (profile) {
      await db.transact([
        tx.userProfiles[profile.id].update({ isPro: false }),
      ]);
    }
  }

  return res.json({ received: true });
}
