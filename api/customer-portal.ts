import type { VercelRequest, VercelResponse } from "./_lib/vercel.js";
import { z } from "zod";
import { frontendUrl, getAdmin, getStripe } from "./_lib/deps.js";
import { applyCors, clientIp, HttpError, parseBody, requireMethod, sendError } from "./_lib/http.js";
import { requireUser } from "./_lib/auth.js";
import { enforceRateLimit } from "./_lib/rateLimit.js";

// No fields accepted: the Stripe customer is looked up from the signed-in user.
const Body = z.object({}).strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, ["POST"])) return;
  try {
    requireMethod(req, ["POST"]);
    await enforceRateLimit("portal-ip", clientIp(req), 20, 60);
    const user = await requireUser(req);
    await enforceRateLimit("portal-user", user.id, 10, 60);
    parseBody(req, Body);

    const { data: sub, error } = await getAdmin()
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!sub?.stripe_customer_id) throw new HttpError(404, "No billing account found");

    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${frontendUrl()}/`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return sendError(res, "customer-portal", err);
  }
}
