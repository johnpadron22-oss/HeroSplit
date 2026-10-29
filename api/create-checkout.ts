import type { VercelRequest, VercelResponse } from "./_lib/vercel.js";
import { z } from "zod";
import { frontendUrl, getAdmin, getStripe, ConfigError } from "./_lib/deps.js";
import { applyCors, clientIp, HttpError, parseBody, requireMethod, sendError } from "./_lib/http.js";
import { requireUser } from "./_lib/auth.js";
import { enforceRateLimit } from "./_lib/rateLimit.js";

const Body = z.object({ plan: z.enum(["monthly", "annual"]) }).strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, ["POST"])) return;
  try {
    requireMethod(req, ["POST"]);
    await enforceRateLimit("checkout-ip", clientIp(req), 10, 60);
    const user = await requireUser(req);
    await enforceRateLimit("checkout-user", user.id, 5, 60);
    const { plan } = parseBody(req, Body);

    const priceId = plan === "annual" ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) throw new ConfigError(`Missing price for ${plan}`);

    // Ownership and Pro state come from the database, never from the request.
    const { data: sub, error } = await getAdmin()
      .from("user_subscriptions")
      .select("is_pro, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (sub?.is_pro) throw new HttpError(409, "You already have Pro");

    const base = frontendUrl();
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/?checkout=success`,
      cancel_url: `${base}/`,
      client_reference_id: user.id,
      metadata: { userId: user.id, plan },
      subscription_data: { metadata: { userId: user.id, plan } },
      ...(sub?.stripe_customer_id
        ? { customer: sub.stripe_customer_id }
        : user.email ? { customer_email: user.email } : {}),
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return sendError(res, "create-checkout", err);
  }
}
