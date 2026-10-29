import type { VercelRequest, VercelResponse } from "./_lib/vercel.js";
import { z } from "zod";
import { getAdmin, getStripe } from "./_lib/deps.js";
import { applyCors, clientIp, parseBody, requireMethod, sendError } from "./_lib/http.js";
import { requireUser } from "./_lib/auth.js";
import { enforceRateLimit } from "./_lib/rateLimit.js";

// The literal string guards against accidental calls.
const Body = z.object({ confirm: z.literal("DELETE MY ACCOUNT") }).strict();

/**
 * GDPR/CCPA erasure: cancels billing, deletes every row the user owns, then
 * deletes the Supabase Auth user. The user id comes only from the verified JWT.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, ["POST"])) return;
  try {
    requireMethod(req, ["POST"]);
    await enforceRateLimit("delete-ip", clientIp(req), 5, 3600);
    const user = await requireUser(req);
    await enforceRateLimit("delete-user", user.id, 3, 3600);
    parseBody(req, Body);

    const admin = getAdmin();
    const { data: sub, error: subError } = await admin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (subError) throw subError;

    // Deleting the Stripe customer cancels its subscriptions immediately.
    // Stripe keeps invoices it is legally required to retain.
    if (sub?.stripe_customer_id) {
      try {
        await getStripe().customers.del(sub.stripe_customer_id);
      } catch (err) {
        if ((err as { code?: string }).code !== "resource_missing") throw err;
      }
    }

    const { error: dataError } = await admin.rpc("delete_user_data", { p_user_id: user.id });
    if (dataError) throw dataError;

    const { error: authError } = await admin.auth.admin.deleteUser(user.id);
    if (authError) throw authError;

    return res.status(200).json({ deleted: true });
  } catch (err) {
    return sendError(res, "delete-account", err);
  }
}
