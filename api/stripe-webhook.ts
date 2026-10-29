import type { VercelRequest, VercelResponse } from "./_lib/vercel.js";
import type Stripe from "stripe";
import { getAdmin, getStripe, ConfigError } from "./_lib/deps.js";
import { HttpError, sendError } from "./_lib/http.js";

export const config = { api: { bodyParser: false } };

const MAX_BODY_BYTES = 512 * 1024;
const PRO_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "Payload too large");
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

function customerIdOf(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function setPro(filter: { userId?: string; customerId?: string }, isPro: boolean, extra: Record<string, unknown> = {}) {
  const admin = getAdmin();
  const now = Date.now();
  if (filter.userId) {
    const { error } = await admin.from("user_subscriptions").upsert(
      { user_id: filter.userId, is_pro: isPro, ...(isPro ? { subscribed_at: now, cancelled_at: null } : { cancelled_at: now }), ...extra },
      { onConflict: "user_id" },
    );
    if (error) throw error;
    const mirror = { is_pro: isPro, ...("stripe_customer_id" in extra ? { stripe_customer_id: extra.stripe_customer_id } : {}) };
    await admin.from("user_profiles").update(mirror).eq("user_id", filter.userId);
    return;
  }
  if (filter.customerId) {
    const { error } = await admin
      .from("user_subscriptions")
      .update({ is_pro: isPro, ...(isPro ? { cancelled_at: null } : { cancelled_at: now }) })
      .eq("stripe_customer_id", filter.customerId);
    if (error) throw error;
    await admin.from("user_profiles").update({ is_pro: isPro }).eq("stripe_customer_id", filter.customerId);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");

    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string" || !signature) throw new HttpError(400, "Missing signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new ConfigError("Missing STRIPE_WEBHOOK_SECRET");

    const raw = await readRawBody(req);
    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(raw, signature, secret);
    } catch (err) {
      if (err instanceof ConfigError) throw err;
      throw new HttpError(400, "Invalid signature");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // userId was set server-side from a verified JWT in /api/create-checkout.
        const userId = session.client_reference_id ?? session.metadata?.userId;
        const customerId = customerIdOf(session.customer as string | Stripe.Customer | null);
        if (session.mode !== "subscription" || !userId || !customerId) break;
        if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") break;
        const plan = session.metadata?.plan === "annual" ? "annual" : "monthly";
        await setPro({ userId }, true, { stripe_customer_id: customerId, plan });
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await setPro({ customerId: customerIdOf(sub.customer as string | Stripe.Customer) ?? undefined }, PRO_STATUSES.has(sub.status));
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await setPro({ customerId: customerIdOf(sub.customer as string | Stripe.Customer) ?? undefined }, false);
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    // Non-2xx makes Stripe retry, which is what we want for DB failures.
    return sendError(res, "stripe-webhook", err);
  }
}
