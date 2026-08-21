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

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return res.json({ received: true });

    // Find the user's profile in InstantDB
    const result = await db.query({
      userProfiles: { $: { where: { userId } } },
    });

    const profile = result.userProfiles?.[0] as { id: string } | undefined;

    if (profile) {
      await db.transact([
        tx.userProfiles[profile.id].update({
          isPro: true,
          stripeCustomerId: session.customer as string,
        }),
      ]);
    } else {
      // Create profile with isPro if it doesn't exist yet
      await db.transact([
        tx.userProfiles[id()].update({
          userId,
          isPro: true,
          currentStreak: 0,
          longestStreak: 0,
          totalWorkouts: 0,
          stripeCustomerId: session.customer as string,
        }),
      ]);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const result = await db.query({
      userProfiles: { $: { where: { stripeCustomerId: customerId } } },
    });

    const profile = result.userProfiles?.[0] as { id: string } | undefined;
    if (profile) {
      await db.transact([tx.userProfiles[profile.id].update({ isPro: false })]);
    }
  }

  return res.json({ received: true });
}
